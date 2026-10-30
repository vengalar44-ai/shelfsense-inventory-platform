import { Response } from 'express';
import { ApiResponse } from '../types/index.js';

export const sendResponse = <T>(
  res: Response,
  statusCode: number,
  success: boolean,
  message?: string,
  data?: T,
  pagination?: ApiResponse['pagination']
) => {
  const response: ApiResponse<T> = {
    success,
    message,
    data,
    pagination,
  };
  return res.status(statusCode).json(response);
};

export const sendSuccess = <T>(
  res: Response,
  data?: T,
  message = 'Operation successful',
  statusCode = 200,
  pagination?: ApiResponse['pagination']
) => {
  return sendResponse(res, statusCode, true, message, data, pagination);
};
