import { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class AppErrorBoundary extends Component<Props, State> {
  state: State = {
    hasError: false,
    error: null,
  };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: unknown) {
    console.error(
      "Application error boundary caught an error:",
      error,
      errorInfo,
    );
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.assign("/");
  };

  render() {
    if (this.state.hasError) {
      const msg = this.state.error?.message;
      return (
        <div
          className="min-h-screen flex items-center justify-center px-6"
          style={{
            background:
              "linear-gradient(160deg, #060b15 0%, #0a0f20 40%, #090d1e 70%, #06090f 100%)",
          }}
        >
          <div
            className="max-w-lg w-full rounded-2xl p-8 text-center"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(239,68,68,0.25)",
              backdropFilter: "blur(20px)",
            }}
          >
            {/* Icon */}
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
              style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.3)" }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>

            <h1
              style={{
                fontFamily: "Cinzel Decorative, serif",
                fontSize: "22px",
                fontWeight: "700",
                color: "#f87171",
                marginBottom: "10px",
              }}
            >
              Unexpected Error
            </h1>

            <p
              style={{
                fontFamily: "Rajdhani, sans-serif",
                color: "rgba(255,255,255,0.55)",
                lineHeight: 1.6,
                marginBottom: msg ? "12px" : "24px",
              }}
            >
              The application hit an unexpected error. You can reload the page
              or go back to the home screen.
            </p>

            {/* Error details — collapsed by default */}
            {msg && (
              <details
                className="text-left mb-6 rounded-lg overflow-hidden"
                style={{ border: "1px solid rgba(255,255,255,0.08)" }}
              >
                <summary
                  className="cursor-pointer px-4 py-2 text-xs uppercase tracking-wider select-none"
                  style={{
                    fontFamily: "Rajdhani, sans-serif",
                    color: "rgba(255,255,255,0.35)",
                    background: "rgba(255,255,255,0.03)",
                  }}
                >
                  Error details
                </summary>
                <pre
                  className="px-4 py-3 text-xs overflow-x-auto"
                  style={{
                    fontFamily: "monospace",
                    color: "#f87171",
                    background: "rgba(239,68,68,0.05)",
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                  }}
                >
                  {msg}
                </pre>
              </details>
            )}

            <div className="flex gap-3 justify-center">
              <button
                onClick={this.handleGoHome}
                className="px-5 py-2.5 rounded-xl transition-colors"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  color: "rgba(255,255,255,0.7)",
                  fontFamily: "Rajdhani, sans-serif",
                  fontWeight: "700",
                  letterSpacing: "1px",
                  textTransform: "uppercase",
                }}
              >
                Go Home
              </button>
              <button
                onClick={this.handleReload}
                className="px-5 py-2.5 rounded-xl transition-colors"
                style={{
                  background: "rgba(251,191,36,0.12)",
                  border: "1px solid rgba(251,191,36,0.3)",
                  color: "#fbbf24",
                  fontFamily: "Rajdhani, sans-serif",
                  fontWeight: "700",
                  letterSpacing: "1px",
                  textTransform: "uppercase",
                }}
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
