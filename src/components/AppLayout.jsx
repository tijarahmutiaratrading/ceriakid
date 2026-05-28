import React from 'react';
import { Outlet } from 'react-router-dom';
import UserTopHeader from '@/components/UserTopHeader';

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
      {/* Default premium dark background for authenticated pages.
          Home (dashboard) renders its own image on top of this. */}
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
          background:
            'radial-gradient(ellipse at top left, rgba(124, 58, 237, 0.35), transparent 55%),' +
            'radial-gradient(ellipse at bottom right, rgba(219, 39, 119, 0.28), transparent 55%),' +
            'linear-gradient(160deg, #0b1020 0%, #1a0b2e 40%, #2a0f3d 70%, #1f0a2b 100%)',
        }}
      />
      <div className="min-h-screen w-full relative">
        <UserTopHeader />
        <main className="w-full overflow-x-hidden md:pt-14">
          <Outlet />
        </main>
      </div>
    </>
  );
}