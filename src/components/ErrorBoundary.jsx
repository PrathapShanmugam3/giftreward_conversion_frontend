import { Component } from 'react';

function isChunkLoadError(error) {
  return /dynamically imported module|importing a module script failed|loading chunk/i.test(error?.message || '');
}

// Wraps only the page content (the <Outlet /> inside each layout), not the
// sidebar/header — so an unhandled error in one page can't unmount the
// whole layout and make navigation (sidebar) disappear, which otherwise
// happens by default: React unmounts the entire tree up to the nearest
// boundary on an uncaught render/effect error.
export default class ErrorBoundary extends Component {
  state = { error: null };

  reloadForChunkError = () => {
    window.location.reload();
  };

  retry = () => {
    if (isChunkLoadError(this.state.error)) {
      this.reloadForChunkError();
      return;
    }
    this.setState({ error: null });
  };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('Page crashed:', error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="mx-auto max-w-md rounded-3xl bg-white p-8 text-center shadow-card ring-1 ring-line">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-xl text-rose-500">!</div>
          <p className="text-base font-bold text-ink-900">Something went wrong loading this page.</p>
          <p className="mt-1 mb-5 text-sm break-words text-ink-500">
            {isChunkLoadError(this.state.error)
              ? 'This page may be out of date. Reload the app to get the latest version.'
              : this.state.error.message}
          </p>
          <button
            type="button"
            onClick={this.retry}
            className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-glow hover:bg-brand-700"
          >
            {isChunkLoadError(this.state.error) ? 'Reload app' : 'Try again'}
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
