// Shared error types that can be used on both client and server
export enum ErrorStatus {
  PENDING = 'pending',
  FIXED = 'fixed',
  IGNORED = 'ignored',
  AUTO_FIXED = 'auto_fixed',
}

export enum ErrorType {
  API_ERROR = 'api_error',
  DATABASE_ERROR = 'database_error',
  VALIDATION_ERROR = 'validation_error',
  NETWORK_ERROR = 'network_error',
  RUNTIME_ERROR = 'runtime_error',
  BUILD_ERROR = 'build_error',
  CACHE_ERROR = 'cache_error',
  AUTH_ERROR = 'auth_error',
  OTHER = 'other',
}

