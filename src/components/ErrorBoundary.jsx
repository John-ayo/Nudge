import React from "react";
import { StandaloneErrorDisplay } from "./StandaloneErrorDisplay";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("[Nudge] Uncaught render error:", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return <StandaloneErrorDisplay />;
    }
    return this.props.children;
  }
}

export default ErrorBoundary;