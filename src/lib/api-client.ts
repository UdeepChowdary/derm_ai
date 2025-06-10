import { ApiResponse } from '@/src/types';
import { handleApiError, ApiError } from './api-error';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

type RequestMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface RequestOptions extends RequestInit {
  token?: string;
  headers?: Record<string, string>;
}

export async function apiRequest<T = any>(
  endpoint: string,
  method: RequestMethod = 'GET',
  data: any = null,
  options: RequestOptions = {}
): Promise<ApiResponse<T>> {
  const { token, headers: customHeaders, ...fetchOptions } = options;
  
  // Configure headers
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...customHeaders,
  };

  // Build request config
  const config: RequestInit = {
    method,
    headers,
    ...fetchOptions,
  };

  // Add body for non-GET requests
  if (method !== 'GET' && data) {
    config.body = JSON.stringify(data);
  } else if (method === 'GET' && data) {
    // For GET requests, append data as query params
    const params = new URLSearchParams();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, String(value));
      }
    });
    endpoint += `?${params.toString()}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const responseData: ApiResponse<T> = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new ApiError({
        id: 'api-error',
        timestamp: Date.now(),
        message: responseData.error?.message || 'An error occurred',
        code: responseData.error?.code || `http_${response.status}`,
        status: response.status,
      });
    }

    return responseData;
  } catch (error) {
    const apiError = ApiError.fromError(error);
    const { message, code } = handleApiError(apiError);
    
    // Re-throw with handled error
    throw new ApiError({
      id: 'api-request-failed',
      timestamp: Date.now(),
      message,
      code,
      status: apiError.status,
      context: {
        endpoint,
        method,
        originalError: apiError.message,
      },
    });
  }
}

// Helper methods for common HTTP methods
export const api = {
  get: <T = any>(endpoint: string, params?: any, options?: RequestOptions) =>
    apiRequest<T>(endpoint, 'GET', params, options),
    
  post: <T = any>(endpoint: string, data?: any, options?: RequestOptions) =>
    apiRequest<T>(endpoint, 'POST', data, options),
    
  put: <T = any>(endpoint: string, data?: any, options?: RequestOptions) =>
    apiRequest<T>(endpoint, 'PUT', data, options),
    
  patch: <T = any>(endpoint: string, data?: any, options?: RequestOptions) =>
    apiRequest<T>(endpoint, 'PATCH', data, options),
    
  delete: <T = any>(endpoint: string, data?: any, options?: RequestOptions) =>
    apiRequest<T>(endpoint, 'DELETE', data, options),
};
