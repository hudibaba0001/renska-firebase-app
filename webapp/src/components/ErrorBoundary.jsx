import React from 'react';
import { Alert, Card, Button } from 'flowbite-react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError() {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to console for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      // Fallback UI
      return (
        <Card className="border-red-200">
          <Alert color="failure">
            <div className="flex items-center gap-3">
              <ExclamationTriangleIcon className="w-5 h-5" />
              <div>
                <h5 className="font-medium">Something went wrong</h5>
                <p className="text-sm mt-1">
                  {this.props.fallbackMessage || 'An error occurred while rendering this component.'}
                </p>
              </div>
            </div>
          </Alert>
          
          {import.meta.env.DEV && (
            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <h6 className="font-medium text-gray-900 dark:text-white mb-2">Error Details:</h6>
              <pre className="text-xs text-gray-600 dark:text-gray-400 overflow-auto">
                {this.state.error && this.state.error.toString()}
                {this.state.errorInfo.componentStack}
              </pre>
            </div>
          )}
          
          <div className="mt-4">
            <Button 
              size="sm" 
              color="gray"
              onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })}
            >
              Try Again
            </Button>
          </div>
        </Card>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
