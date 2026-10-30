import { Request, Response, NextFunction } from 'express';
import { User } from '../users/user.model.js';
import { Business } from '../businesses/business.model.js';
import { RefreshToken } from './refreshToken.model.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../../utils/jwt.js';
import { AppError } from '../../utils/appError.js';
import { sendSuccess } from '../../utils/response.js';
import { AuditService } from '../audit-logs/audit.service.js';
import { AuthenticatedRequest } from '../../types/index.js';

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { businessName, businessType, fullName, email, password, phone, currency } = req.body;

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        throw new AppError('An account with this email already exists.', 400);
      }

      // Create new business tenant
      const business = await Business.create({
        name: businessName,
        businessType: businessType || 'SUPERMARKET',
        email,
        phone: phone || '',
        currency: currency || 'USD',
      });

      // Create initial OWNER_ADMIN user
      const user = await User.create({
        businessId: business._id,
        fullName,
        email,
        password,
        role: 'OWNER_ADMIN',
        phone,
      });

      const authUser = {
        userId: user._id.toString(),
        businessId: business._id.toString(),
        email: user.email,
        role: user.role,
        fullName: user.fullName,
      };

      const accessToken = generateAccessToken(authUser);
      const refreshToken = generateRefreshToken({ userId: authUser.userId });

      // Save refresh token
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);
      await RefreshToken.create({
        userId: user._id,
        token: refreshToken,
        expiresAt,
      });

      await AuditService.log({
        user: authUser,
        action: 'BUSINESS_REGISTERED',
        entityType: 'BUSINESS',
        entityId: business._id,
        details: { businessName, businessType },
        ipAddress: req.ip,
      });

      return sendSuccess(
        res,
        {
          user: {
            id: user._id,
            fullName: user.fullName,
            email: user.email,
            role: user.role,
          },
          business: {
            id: business._id,
            name: business.name,
            currency: business.currency,
            businessType: business.businessType,
          },
          tokens: {
            accessToken,
            refreshToken,
          },
        },
        'Registration successful',
        201
      );
    } catch (error) {
      next(error);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({ email });
      if (!user) {
        throw new AppError('Invalid credentials.', 401);
      }

      if (!user.isActive) {
        throw new AppError('Your account has been deactivated.', 403);
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        throw new AppError('Invalid credentials.', 401);
      }

      const business = await Business.findById(user.businessId);
      if (!business || !business.isActive) {
        throw new AppError('Associated business is inactive or not found.', 403);
      }

      user.lastLoginAt = new Date();
      await user.save();

      const authUser = {
        userId: user._id.toString(),
        businessId: user.businessId.toString(),
        email: user.email,
        role: user.role,
        fullName: user.fullName,
      };

      const accessToken = generateAccessToken(authUser);
      const refreshToken = generateRefreshToken({ userId: authUser.userId });

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);
      await RefreshToken.create({
        userId: user._id,
        token: refreshToken,
        expiresAt,
      });

      await AuditService.log({
        user: authUser,
        action: 'USER_LOGIN',
        entityType: 'USER',
        entityId: user._id,
        ipAddress: req.ip,
      });

      return sendSuccess(
        res,
        {
          user: {
            id: user._id,
            fullName: user.fullName,
            email: user.email,
            role: user.role,
          },
          business: {
            id: business._id,
            name: business.name,
            currency: business.currency,
            businessType: business.businessType,
            defaultTaxRate: business.defaultTaxRate,
          },
          tokens: {
            accessToken,
            refreshToken,
          },
        },
        'Login successful'
      );
    } catch (error) {
      next(error);
    }
  }

  static async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;
      const decoded = verifyRefreshToken(refreshToken);

      const existingTokenDoc = await RefreshToken.findOne({
        token: refreshToken,
        userId: decoded.userId,
        revoked: false,
      });

      if (!existingTokenDoc || existingTokenDoc.expiresAt < new Date()) {
        throw new AppError('Invalid or expired refresh token. Please sign in again.', 401);
      }

      // Invalidate existing refresh token (rotation)
      existingTokenDoc.revoked = true;
      await existingTokenDoc.save();

      const user = await User.findById(decoded.userId);
      if (!user || !user.isActive) {
        throw new AppError('User not found or account deactivated.', 401);
      }

      const authUser = {
        userId: user._id.toString(),
        businessId: user.businessId.toString(),
        email: user.email,
        role: user.role,
        fullName: user.fullName,
      };

      const newAccessToken = generateAccessToken(authUser);
      const newRefreshToken = generateRefreshToken({ userId: authUser.userId });

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);
      await RefreshToken.create({
        userId: user._id,
        token: newRefreshToken,
        expiresAt,
      });

      return sendSuccess(
        res,
        {
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
        },
        'Token refreshed successfully'
      );
    } catch (error) {
      next(error);
    }
  }

  static async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;
      if (refreshToken) {
        await RefreshToken.updateOne({ token: refreshToken }, { $set: { revoked: true } });
      }
      return sendSuccess(res, null, 'Logged out successfully');
    } catch (error) {
      next(error);
    }
  }

  static async me(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError('Unauthorized', 401);
      }
      const user = await User.findById(req.user.userId).select('-password');
      const business = await Business.findById(req.user.businessId);

      return sendSuccess(res, { user, business });
    } catch (error) {
      next(error);
    }
  }
}
