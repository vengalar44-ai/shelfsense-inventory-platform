export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;
  public errors?: Record<string, any>;

  constructor(message: string, statusCode = 400, errors?: Record<string, any>) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    this.errors = errors;
    Error.captureStackTrace(this, this.constructor);
  }
}
