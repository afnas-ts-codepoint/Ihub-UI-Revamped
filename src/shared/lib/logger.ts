type ErrorContext = Readonly<Record<string, unknown>>;

export const logger = {
  error(message: string, error: unknown, context?: ErrorContext) {
    if (import.meta.env.DEV) {
      console.error(message, error, context);
    }
  },
};

type ReactRootErrorInfo = {
  componentStack?: string | null;
};

export const rootErrorHandlers = {
  onCaughtError(error: unknown, errorInfo: ReactRootErrorInfo) {
    logger.error('React caught error', error, {
      componentStack: errorInfo.componentStack,
    });
  },
  onUncaughtError(error: unknown, errorInfo: ReactRootErrorInfo) {
    logger.error('React uncaught error', error, {
      componentStack: errorInfo.componentStack,
    });
  },
};
