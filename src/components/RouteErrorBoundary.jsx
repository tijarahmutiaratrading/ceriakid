import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Per-route error boundary — isolate crash supaya tak runtuhkan seluruh app.
 * Berbeza dengan global ErrorBoundary — ini lebih local & cuba navigate balik.
 */
export default class RouteErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    // eslint-disable-next-line no-console
    console.error('Route ErrorBoundary:', error, info?.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[60vh] flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-xl text-center">
            <div className="text-5xl mb-3">😅</div>
            <h2 className="text-xl font-black text-slate-900 mb-2">Maaf, halaman ini ada masalah</h2>
            <p className="text-slate-600 text-sm mb-5">Cuba muat semula atau kembali ke halaman utama.</p>
            <div className="flex gap-2 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="px-5 py-2.5 bg-game-purple text-white rounded-2xl font-black shadow hover:opacity-90"
              >
                Muat Semula
              </button>
              <Link
                to="/dashboard"
                className="px-5 py-2.5 bg-slate-100 text-slate-900 rounded-2xl font-black shadow hover:bg-slate-200"
              >
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}