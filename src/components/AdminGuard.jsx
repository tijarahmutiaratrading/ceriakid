import React from 'react';
import { useAuth } from '@/lib/AuthContext';
import { Link } from 'react-router-dom';

export default function AdminGuard({ children }) {
  const { user, isAuthenticated, isLoadingAuth } = useAuth();

  if (isLoadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-6xl animate-bounce">🔐</div>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center p-8 max-w-sm">
          <div className="text-6xl mb-4">🚫</div>
          <h1 className="text-2xl font-black text-gray-800 mb-2">Akses Ditolak</h1>
          <p className="text-gray-500 mb-6">Halaman ini hanya untuk pentadbir sistem sahaja.</p>
          <Link to="/dashboard">
            <button className="px-6 py-3 bg-game-purple text-white rounded-full font-bold shadow-lg">
              Kembali ke Dashboard
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return children;
}