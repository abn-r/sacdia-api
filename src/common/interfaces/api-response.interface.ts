/**
 * Standard API Response interfaces for consistent response format across the application
 */

export interface ApiResponseMeta {
  total?: number;
  page?: number;
  limit?: number;
  nextCursor?: string | number;
}

export interface ApiResponse<T = any> {
  status: boolean;
  data?: T;
  message?: string;
  meta?: ApiResponseMeta;
}

export interface PaginatedResponse<T> extends Omit<ApiResponse<T[]>, 'data'> {
  data: T[];
  total: number;
  nextCursor?: string | number;
  meta?: ApiResponseMeta;
}

export interface CreateResponse<T = any> extends ApiResponse<T> {
  message: string;
}

export interface UpdateResponse<T = any> extends ApiResponse<T> {
  message: string;
}

export interface DeleteResponse extends Omit<ApiResponse, 'data'> {
  message: string;
}

// Helper type for service method returns
export type ServiceResponse<T> = Promise<ApiResponse<T>>;
export type ServicePaginatedResponse<T> = Promise<PaginatedResponse<T>>;
