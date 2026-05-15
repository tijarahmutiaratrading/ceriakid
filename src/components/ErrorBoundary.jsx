import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // eslint-disable-next-line no-console
    console.error('App ErrorBoundary caught:', error, info?.componentStack);
  }

  handleReload = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
          <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-2xl text-center">
            <div className="text-5xl mb-4">😅</div>
            <h1 className="text-2xl font-black text-slate-900 mb-2">Maaf, ada masalah teknikal</h1>
            <p className="text-slate-600 text-sm mb-6">App jumpa ralat yang tidak dijangka. Sila muat semula halaman.</p>
            <button
              onClick={this.handleReload}
              className="px-6 py-3 bg-game-purple text-white rounded-2xl font-black shadow-lg hover:opacity-90"
            >
              Muat Semula
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}