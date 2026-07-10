
export type ApiResponse<T> = {
  success: boolean
  message?: string
  token?: string
  data?: T
}