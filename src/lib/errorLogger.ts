import { ErrorType } from '@/types/error';

interface ErrorLogData {
  errorType?: ErrorType;
  message: string;
  stack?: string;
  endpoint?: string;
  method?: string;
  userAgent?: string;
  userId?: string;
  sessionId?: string;
  metadata?: Record<string, any>;
}

/**
 * Log errors to the database via API
 */
export async function logError(errorData: ErrorLogData): Promise<void> {
  try {
    // Only log in production or if explicitly enabled
    if (process.env.NODE_ENV === 'development' && !process.env.ENABLE_ERROR_LOGGING) {
      console.error('Error (not logged):', errorData.message);
      return;
    }

    const response = await fetch('/api/errors/log', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...errorData,
        userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
        sessionId: typeof window !== 'undefined' ? getSessionId() : undefined,
      }),
    });

    if (!response.ok) {
      console.error('Failed to log error to server');
    }
  } catch (error) {
    // Silently fail - don't break the app if error logging fails
    console.error('Error logging failed:', error);
  }
}

/**
 * Get or create session ID
 */
function getSessionId(): string {
  if (typeof window === 'undefined') return '';
  
  let sessionId = sessionStorage.getItem('error_session_id');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('error_session_id', sessionId);
  }
  return sessionId;
}

/**
 * Log API errors
 */
export async function logAPIError(
  endpoint: string,
  method: string,
  error: Error,
  metadata?: Record<string, any>
): Promise<void> {
  await logError({
    errorType: ErrorType.API_ERROR,
    message: error.message,
    stack: error.stack,
    endpoint,
    method,
    metadata,
  });
}

/**
 * Log runtime errors
 */
export async function logRuntimeError(
  error: Error,
  metadata?: Record<string, any>
): Promise<void> {
  await logError({
    errorType: ErrorType.RUNTIME_ERROR,
    message: error.message,
    stack: error.stack,
    metadata,
  });
}

/**
 * Setup global error handlers
 */
export function setupErrorHandlers(): void {
  if (typeof window === 'undefined') return;

  // Handle unhandled errors
  window.addEventListener('error', (event) => {
    logError({
      errorType: ErrorType.RUNTIME_ERROR,
      message: event.message,
      stack: event.error?.stack,
      metadata: {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      },
    });
  });

  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    const error = event.reason instanceof Error 
      ? event.reason 
      : new Error(String(event.reason));
    
    logError({
      errorType: ErrorType.RUNTIME_ERROR,
      message: `Unhandled Promise Rejection: ${error.message}`,
      stack: error.stack,
      metadata: {
        reason: event.reason,
      },
    });
  });
}

