import { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class AppErrorBoundary extends Component<Props, State> {
  state: State = {
    hasError: false,
  };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: unknown) {
    console.error("Application error boundary caught an error:", error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
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
              border: "1px solid rgba(255,255,255,0.08)",
              backdropFilter: "blur(20px)",
            }}
          >
            <h1
              style={{
                fontFamily: "Cinzel Decorative, serif",
                fontSize: "30px",
                fontWeight: "700",
                background: "linear-gradient(135deg, #fbbf24, #c084fc)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                marginBottom: "12px",
              }}
            >
              Something went wrong
            </h1>
            <p
              style={{
                fontFamily: "Rajdhani, sans-serif",
                color: "rgba(255,255,255,0.68)",
                lineHeight: 1.6,
                marginBottom: "24px",
              }}
            >
              The page hit an unexpected error. Please reload the page and try again.
            </p>
            <button
              onClick={this.handleReload}
              className="px-5 py-3 rounded-xl transition-colors"
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
              Reload page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
