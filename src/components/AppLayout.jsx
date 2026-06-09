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
      {/* Shared dashboard background — solid pastel gradient (sama tema Challenges), tiada gambar awan */}
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
          background: 'linear-gradient(135deg, #fef3c7 0%, #fbcfe8 50%, #c7d2fe 100%)',
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