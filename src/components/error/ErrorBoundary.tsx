import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Button from '@/components/ui/Button';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  featureName?: string;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ error, errorInfo });
    this.props.onError?.(error, errorInfo);
    console.error(`[ErrorBoundary${this.props.featureName ? ` - ${this.props.featureName}` : ''}]`, error, errorInfo);
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center p-6 min-h-[300px] bg-system-background rounded-xl border border-system-border">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="w-16 h-16 rounded-full bg-system-red/10 flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-system-red" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-system-foreground">
                {this.props.featureName ? `${this.props.featureName} unavailable` : 'Something went wrong'}
              </h3>
              <p className="text-system-muted-foreground text-sm mt-1">
                {this.state.error?.message || 'An unexpected error occurred. Please try again.'}
              </p>
            </div>
            <div className="flex gap-3 mt-2">
              <Button onClick={this.handleRetry} variant="primary">
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
              <Button onClick={() => window.location.href = '/'} variant="tertiary">
                <Home className="w-4 h-4 mr-2" />
                Go Home
              </Button>
            </div>
            {import.meta.env.DEV && this.state.error && (
              <details className="mt-4 w-full max-w-md text-left">
                <summary className="cursor-pointer text-xs text-system-muted-foreground">
                  Error Details (Development)
                </summary>
                <pre className="mt-2 p-3 bg-system-muted rounded text-xs overflow-auto text-system-foreground">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export function withErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  featureName: string
): React.FC<P> {
  return function WithErrorBoundary(props: P) {
    return (
      <ErrorBoundary featureName={featureName}>
        <WrappedComponent {...props} />
      </ErrorBoundary>
    );
  };
}