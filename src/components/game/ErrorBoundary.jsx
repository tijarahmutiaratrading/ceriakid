import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Game error:', error, errorInfo);
    if (window.fbq) {
      window.fbq('track', 'Error', { error: error.message });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-pattern flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="clay rounded-3xl p-8 max-w-sm w-full text-center"
          >
            <AlertCircle className="w-16 h-16 text-game-red mx-auto mb-4" />
            <h2 className="text-2xl font-black text-gray-800 mb-3">Oops! Ada Masalah</h2>
            <p className="text-gray-600 mb-6 text-sm">{this.state.error?.message || 'Permainan mengalami error'}</p>
            <Link to="/">
              <button className="w-full bg-game-purple text-white rounded-full py-3 font-bold">
                ← Balik ke Rumah
              </button>
            </Link>
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}