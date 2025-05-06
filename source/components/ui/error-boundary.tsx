import React, { Component, ReactNode, ErrorInfo } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from "lucide-react";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log the error to an error reporting service
    console.error('ErrorBoundary caught an error', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  handleReload = (): void => {
    window.location.reload();
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-gray-900 to-purple-900 text-white p-6">
          <div className="max-w-md w-full bg-gray-800/80 backdrop-blur-sm p-8 rounded-lg shadow-lg border border-purple-500/30">
            <div className="flex items-center justify-center mb-6">
              <AlertTriangle className="h-12 w-12 text-red-400" />
            </div>
            <h2 className="text-xl font-bold text-center mb-4">Something went wrong</h2>
            <div className="bg-gray-900/60 p-4 rounded mb-6 overflow-auto max-h-40">
              <p className="font-mono text-sm text-red-300 mb-2">
                {this.state.error?.toString()}
              </p>
              {this.state.errorInfo && (
                <details className="mt-2">
                  <summary className="text-sm cursor-pointer text-gray-400 hover:text-white">
                    View stack trace
                  </summary>
                  <pre className="mt-2 whitespace-pre-wrap text-xs text-gray-400 overflow-auto max-h-32">
                    {this.state.errorInfo.componentStack}
                  </pre>
                </details>
              )}
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button onClick={this.handleReset} className="flex-1 bg-purple-700 hover:bg-purple-600">
                Try to recover
              </Button>
              <Button onClick={this.handleReload} className="flex-1 bg-gray-700 hover:bg-gray-600">
                Reload page
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export { ErrorBoundary }; 