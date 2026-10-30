import jwt, { SignOptions } from 'jsonwebtoken';
import { config } from '../config/env.js';
import { IAuthUser } from '../types/index.js';

export const generateAccessToken = (payload: IAuthUser): string => {
  const options: SignOptions = {
    expiresIn: config.jwt.accessExpiresIn as jwt.SignOptions['expiresIn'],
  };
  return jwt.sign(payload, config.jwt.accessSecret, options);
};

export const generateRefreshToken = (payload: { userId: string }): string => {
  const options: SignOptions = {
    expiresIn: config.jwt.refreshExpiresIn as jwt.SignOptions['expiresIn'],
  };
  return jwt.sign(payload, config.jwt.refreshSecret, options);
};

export const verifyAccessToken = (token: string): IAuthUser => {
  return jwt.verify(token, config.jwt.accessSecret) as IAuthUser;
};

export const verifyRefreshToken = (token: string): { userId: string } => {
  return jwt.verify(token, config.jwt.refreshSecret) as { userId: string };
};
