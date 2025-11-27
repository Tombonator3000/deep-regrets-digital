import { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error for debugging (could be sent to error reporting service)
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    this.props.onReset?.();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex min-h-[400px] flex-col items-center justify-center gap-6 rounded-xl border border-destructive/30 bg-destructive/5 p-8">
          <div className="flex items-center gap-3 text-destructive">
            <AlertTriangle className="h-8 w-8" />
            <h2 className="text-xl font-semibold">Noe gikk galt</h2>
          </div>

          <p className="max-w-md text-center text-muted-foreground">
            En uventet feil oppstod. Du kan prøve å laste inn på nytt eller gå tilbake til startskjermen.
          </p>

          {process.env.NODE_ENV === 'development' && this.state.error && (
            <details className="max-w-md rounded border border-border bg-background/50 p-4 text-xs">
              <summary className="cursor-pointer font-medium">Tekniske detaljer</summary>
              <pre className="mt-2 overflow-auto whitespace-pre-wrap text-muted-foreground">
                {this.state.error.message}
                {'\n\n'}
                {this.state.error.stack}
              </pre>
            </details>
          )}

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Last inn på nytt
            </Button>
            <Button
              onClick={this.handleReset}
              className="btn-ocean"
            >
              Prøv igjen
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
