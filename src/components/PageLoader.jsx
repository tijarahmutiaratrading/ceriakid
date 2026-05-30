import React from 'react';
import GameLoadingScreen from '@/components/game/GameLoadingScreen';

/**
 * Loading screen untuk React.lazy() suspense fallback.
 * Guna GameLoadingScreen yang sama supaya consistent across the app.
 */
export default function PageLoader() {
  return <GameLoadingScreen message="Memuatkan halaman..." />;
}