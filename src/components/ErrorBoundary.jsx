import { Component } from 'react';

/**
 * Error Boundary — catches rendering errors in the component tree
 * and displays a friendly recovery UI instead of a white screen.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // In production, you could send this to an error reporting service
    console.error('[ErrorBoundary]', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  handleClearAndReset = () => {
    try {
      localStorage.removeItem('raju-roadmap-v1');
    } catch {
      // ignore
    }
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          role="alert"
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            backgroundColor: '#0f1117',
            color: '#e2e8f0',
            fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
          }}
        >
          <div style={{ maxWidth: '480px', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              Something went wrong
            </h1>
            <p style={{ fontSize: '0.875rem', color: '#94a3b8', marginBottom: '1.5rem', lineHeight: 1.6 }}>
              The app encountered an unexpected error. Your data is safe in localStorage.
              Try refreshing, or reset if the issue persists.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={this.handleReset}
                style={{
                  padding: '0.625rem 1.25rem',
                  borderRadius: '0.5rem',
                  border: '1px solid rgba(34,211,238,0.3)',
                  backgroundColor: 'rgba(34,211,238,0.1)',
                  color: '#22d3ee',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Try Again
              </button>
              <button
                onClick={this.handleClearAndReset}
                style={{
                  padding: '0.625rem 1.25rem',
                  borderRadius: '0.5rem',
                  border: '1px solid rgba(239,68,68,0.3)',
                  backgroundColor: 'rgba(239,68,68,0.1)',
                  color: '#ef4444',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Clear Data & Reload
              </button>
            </div>
            {this.state.error && (
              <details style={{ marginTop: '1.5rem', textAlign: 'left' }}>
                <summary style={{ fontSize: '0.75rem', color: '#64748b', cursor: 'pointer' }}>
                  Technical details
                </summary>
                <pre
                  style={{
                    marginTop: '0.5rem',
                    padding: '0.75rem',
                    borderRadius: '0.5rem',
                    backgroundColor: '#1e2433',
                    fontSize: '0.7rem',
                    color: '#94a3b8',
                    overflow: 'auto',
                    maxHeight: '120px',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                  }}
                >
                  {this.state.error.toString()}
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
