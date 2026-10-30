import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/index.js';
import { verifyAccessToken } from '../utils/jwt.js';
import { AppError } from '../utils/appError.js';
import { User } from '../modules/users/user.model.js';

export const authenticate = async (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Authentication required. Missing Bearer token.', 401);
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new AppError('Authentication token missing.', 401);
    }

    const decoded = verifyAccessToken(token);

    // Verify user is still active in database
    const user = await User.findById(decoded.userId);
    if (!user || !user.isActive) {
      throw new AppError('User account not found or deactivated.', 401);
    }

    req.user = {
      userId: user._id.toString(),
      businessId: user.businessId.toString(),
      email: user.email,
      role: user.role,
      fullName: user.fullName,
    };

    next();
  } catch (error) {
    next(error);
  }
};
