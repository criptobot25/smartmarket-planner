import { Component, ErrorInfo, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { captureAppError } from '../../core/monitoring/errorMonitoring';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * PASSO 34: Enhanced ErrorBoundary Component
 * 
 * Catches React errors and displays friendly fallback UI with recovery options.
 * Prevents entire app from crashing due to component errors.
 * 
 * Features:
 * - Friendly error messaging (no technical jargon)
 * - Clear recovery actions (Return to Planner, Reload)
 * - Collapsible error details for debugging
 * - Data safety reassurance
 * 
 * Source: React Error Boundaries
 * https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log to console for debugging
    console.error('ErrorBoundary caught error:', error, errorInfo);
    captureAppError(error, { componentStack: errorInfo.componentStack });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          textAlign: 'center',
          background: '#f9fafb'
        }}>
          <div style={{
            fontSize: '4rem',
            marginBottom: '1rem'
          }}>
            ⚠️
          </div>
          
          <h1 style={{
            fontSize: '2rem',
            fontWeight: '700',
            color: '#111827',
            margin: '0 0 1rem 0'
          }}>
            Oops! Something went wrong
          </h1>
          
          <p style={{
            fontSize: '1.125rem',
            color: '#6b7280',
            marginBottom: '0.5rem',
            maxWidth: '500px'
          }}>
            We encountered an unexpected error while loading this page.
          </p>
          
          <p style={{
            fontSize: '1rem',
            color: '#9ca3af',
            marginBottom: '2rem',
            maxWidth: '500px'
          }}>
            Don't worry - your meal plans and data are safe. Try returning to the planner or reloading the page.
          </p>
          
          {this.state.error && (
            <details style={{
              marginBottom: '2rem',
              padding: '1rem',
              background: '#fee2e2',
              borderRadius: '0.5rem',
              maxWidth: '600px',
              textAlign: 'left'
            }}>
              <summary style={{
                cursor: 'pointer',
                fontWeight: '600',
                color: '#991b1b'
              }}>
                Error details
              </summary>
              <pre style={{
                marginTop: '1rem',
                fontSize: '0.875rem',
                color: '#7f1d1d',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word'
              }}>
                {this.state.error.toString()}
              </pre>
            </details>
          )}
          
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link 
              to="/app"
              onClick={this.handleReset}
              style={{
                padding: '0.875rem 1.5rem',
                background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '0.75rem',
                fontWeight: '600',
                boxShadow: '0 4px 12px rgba(79, 70, 229, 0.25)',
                transition: 'transform 0.2s ease',
                display: 'inline-block'
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              🏠 Return to Planner
            </Link>
            
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: '0.875rem 1.5rem',
                background: 'white',
                color: '#4f46e5',
                border: '2px solid #e5e7eb',
                borderRadius: '0.75rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'border-color 0.2s ease'
              }}
              onMouseOver={(e) => e.currentTarget.style.borderColor = '#4f46e5'}
              onMouseOut={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}
            >
              🔄 Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
