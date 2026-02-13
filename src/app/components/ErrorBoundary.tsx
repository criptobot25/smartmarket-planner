import { Component, ErrorInfo, ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * ErrorBoundary Component
 * 
 * Catches React errors and displays fallback UI
 * Prevents entire app from crashing due to component errors
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
    console.error('ErrorBoundary caught error:', error, errorInfo);
  }

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
            Something went wrong
          </h1>
          
          <p style={{
            fontSize: '1.125rem',
            color: '#6b7280',
            marginBottom: '2rem',
            maxWidth: '500px'
          }}>
            We encountered an error while rendering this page.
            Don't worry, your data is safe.
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
          
          <div style={{ display: 'flex', gap: '1rem' }}>
            <Link 
              to="/app"
              style={{
                padding: '0.875rem 1.5rem',
                background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '0.75rem',
                fontWeight: '600',
                boxShadow: '0 4px 12px rgba(79, 70, 229, 0.25)'
              }}
            >
              🏠 Go to Planner
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
                cursor: 'pointer'
              }}
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
