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
      {/* Clean Apple-style white background for authenticated pages.
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
            'radial-gradient(ellipse at top right, rgba(168, 85, 247, 0.06), transparent 60%),' +
            'radial-gradient(ellipse at bottom left, rgba(236, 72, 153, 0.05), transparent 60%),' +
            'linear-gradient(180deg, #ffffff 0%, #fafafa 50%, #f5f5f7 100%)',
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