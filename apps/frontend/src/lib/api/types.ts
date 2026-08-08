 
export type ApiResponse<T = unknown, TError = never> =
  | { success: true; data?: T; message?: string }
  | { success: false; code?: string; message?: string; data?: TError }