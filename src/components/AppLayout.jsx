import React from 'react';
import { Outlet } from 'react-router-dom';
import UserTopHeader from '@/components/UserTopHeader';
import PageTransition from '@/components/ui/PageTransition';

/**
 * App layout with a floating top header (desktop) on every authenticated page.
 * Mobile keeps the existing AppHeader rendered by individual pages.
 *
 * Note: We use a position:fixed background <div> instead of background-attachment:fixed
 * because the latter is buggy on iOS Safari/Chrome (background detaches/jumps on scroll).
 */
export default function AppLayout() {
  return (
    <>
      {/* Latar gelap sinematik gaya PS5 — gradient + glow ambient biru/ungu */}
      <div
        aria-hidden="true"
        className="pointer-events-none"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: -2,
          background: [
            'radial-gradient(120% 90% at 75% -10%, rgba(37,99,235,0.30) 0%, transparent 55%)',
            'radial-gradient(90% 70% at -10% 30%, rgba(124,58,237,0.25) 0%, transparent 55%)',
            'radial-gradient(80% 60% at 50% 110%, rgba(6,182,212,0.12) 0%, transparent 60%)',
            'linear-gradient(180deg, #0d1430 0%, #0a0f22 50%, #070b18 100%)',
          ].join(', '),
        }}
      />
      <div className="min-h-screen w-full relative">
        <UserTopHeader />
        <main className="w-full overflow-x-hidden pt-16 sm:pt-20">
          <PageTransition>
            <Outlet />
          </PageTransition>
        </main>


      </div>
    </>
  );
}