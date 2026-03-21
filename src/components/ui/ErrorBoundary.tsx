"use client";

import { Component, ReactNode } from "react";
import { AlertTriangle } from "lucide-react";

interface Props {
  children: ReactNode;
  label?: string;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error(`[ErrorBoundary:${this.props.label ?? "unknown"}]`, error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center gap-3 p-8 text-center text-muted-foreground">
          <AlertTriangle className="h-8 w-8 text-destructive/60" />
          <p className="text-sm font-medium">
            {this.props.label ? `${this.props.label} failed to load.` : "Something went wrong."}
          </p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="text-xs underline hover:text-foreground"
          >
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
