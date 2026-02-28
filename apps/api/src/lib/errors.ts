export type AppErrorCode =
  | 'VALIDATION_ERROR'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'INTERNAL_ERROR'
  | 'EMAIL_ALREADY_EXISTS';

export class AppError extends Error {
  public readonly code: AppErrorCode;
  public readonly statusCode: number;

  constructor(code: AppErrorCode, message: string, statusCode: number) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
  }
}
