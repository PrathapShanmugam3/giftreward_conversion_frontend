import { Component } from 'react';

// Wraps only the page content (the <Outlet /> inside each layout), not the
// sidebar/header — so an unhandled error in one page can't unmount the
// whole layout and make navigation (sidebar) disappear, which otherwise
// happens by default: React unmounts the entire tree up to the nearest
// boundary on an uncaught render/effect error.
export default class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('Page crashed:', error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="rounded-admin bg-white p-6 text-center shadow-admin-card">
          <p className="mb-3 text-sm font-semibold text-admin-danger">Something went wrong loading this page.</p>
          <p className="mb-4 text-xs text-admin-gray">{this.state.error.message}</p>
          <button
            type="button"
            onClick={() => this.setState({ error: null })}
            className="rounded-lg bg-admin-primary px-4 py-2 text-sm font-semibold text-white hover:bg-admin-primary-dark"
          >
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
