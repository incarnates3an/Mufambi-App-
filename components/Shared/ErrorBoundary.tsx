import React, { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#050505] flex items-center justify-center p-8">
          <div className="max-w-lg w-full bg-[#0f0f12] border border-white/5 rounded-[3rem] p-12 shadow-2xl text-center space-y-8">
            <div className="w-20 h-20 bg-red-600/10 rounded-2xl mx-auto flex items-center justify-center">
              <AlertTriangle className="w-10 h-10 text-red-500" />
            </div>

            <div className="space-y-4">
              <h1 className="text-3xl font-black text-white uppercase italic tracking-tighter">
                Neural Network Error
              </h1>
              <p className="text-sm text-gray-500 font-bold uppercase tracking-widest">
                The neural interface encountered an unexpected anomaly
              </p>
            </div>

            {this.state.error && (
              <div className="bg-black/40 border border-white/5 rounded-2xl p-6 text-left">
                <p className="text-xs font-mono text-red-400 break-all">
                  {this.state.error.toString()}
                </p>
                {this.state.errorInfo && (
                  <details className="mt-4">
                    <summary className="text-xs font-black text-gray-500 uppercase tracking-widest cursor-pointer hover:text-gray-400">
                      Stack Trace
                    </summary>
                    <pre className="mt-2 text-[10px] text-gray-600 overflow-auto max-h-48 font-mono">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </details>
                )}
              </div>
            )}

            <div className="flex gap-4">
              <button
                onClick={this.handleReset}
                className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-indigo-500/20 hover:bg-indigo-500 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Reset Neural Link
              </button>
              <button
                onClick={() => window.location.reload()}
                className="flex-1 py-4 bg-white/5 border border-white/5 text-gray-400 rounded-2xl font-black uppercase tracking-widest text-xs hover:text-white hover:border-white/10 transition-all"
              >
                Full Reload
              </button>
            </div>

            <p className="text-[10px] text-gray-600 font-black uppercase tracking-widest">
              Error ID: {Date.now().toString(36).toUpperCase()}
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
