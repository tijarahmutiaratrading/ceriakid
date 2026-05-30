import React from 'react';

/**
 * Loading spinner untuk React.lazy() suspense fallback.
 * Match dengan tema CeriaKid (purple + bounce emoji).
 */
export default function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="text-6xl animate-bounce mb-4">🎓</div>
        <div className="w-8 h-8 border-4 border-game-purple border-t-transparent rounded-full animate-spin mx-auto"></div>
      </div>
    </div>
  );
}