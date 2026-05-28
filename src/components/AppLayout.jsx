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
      {/* Shared dashboard background image — applied to all authenticated pages */}
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
          backgroundImage: 'url(https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/3f4216218_generated_image.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
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