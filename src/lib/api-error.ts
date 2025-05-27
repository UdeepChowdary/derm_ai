import { AppError } from "@/src/types";

export class ApiError extends Error {
  status: number;
  code?: string;
  context?: Record<string, unknown>;

  constructor(error: AppError & { status?: number }) {
    super(error.message);
    this.name = 'ApiError';
    this.status = error.status || 500;
    this.code = error.code;
    this.context = error.context;
    
    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }
  }

  static fromError(error: unknown): ApiError {
    if (error instanceof ApiError) return error;
    
    if (error instanceof Error) {
      return new ApiError({
        id: 'unexpected-error',
        timestamp: Date.now(),
        message: error.message,
        stack: error.stack,
      });
    }

    return new ApiError({
      id: 'unknown-error',
      timestamp: Date.now(),
      message: 'An unknown error occurred',
    });
  }
}

export const handleApiError = (error: unknown): { message: string; code?: string } => {
  const apiError = ApiError.fromError(error);
  
  // Log the error for debugging
  console.error('API Error:', {
    message: apiError.message,
    code: apiError.code,
    status: apiError.status,
    context: apiError.context,
    stack: apiError.stack,
  });

  // Return user-friendly error messages
  if (apiError.status >= 500) {
    return { 
      message: 'A server error occurred. Please try again later.',
      code: 'server_error'
    };
  }

  if (apiError.status === 429) {
    return {
      message: 'Too many requests. Please wait before trying again.',
      code: 'rate_limit_exceeded'
    };
  }

  if (apiError.status === 401 || apiError.status === 403) {
    return {
      message: 'You are not authorized to perform this action.',
      code: 'unauthorized'
    };
  }

  // Return the original error message for client errors (4xx)
  return {
    message: apiError.message || 'An error occurred',
    code: apiError.code
  };
};
