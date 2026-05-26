import React from 'react';
import { Outlet } from 'react-router-dom';
import UserTopHeader from '@/components/UserTopHeader';

/**
 * App layout with a floating top header (desktop) on every authenticated page.
 * Mobile keeps the existing AppHeader rendered by individual pages.
 */
export default function AppLayout() {
  return (
    <div
      className="min-h-screen w-full relative"
      style={{
        backgroundImage: 'url(https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/3f4216218_generated_image.png)',
        backgroundSize: 'cover',
        backgroundAttachment: 'fixed',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* Dark overlay supaya white text readable atas background image yang light/colorful (WCAG AA) */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(180deg, rgba(20,10,50,0.65) 0%, rgba(40,15,70,0.55) 50%, rgba(70,25,90,0.65) 100%)',
          zIndex: 1,
        }}
      />
      <div className="relative" style={{ zIndex: 2 }}>
        <UserTopHeader />
        <main className="w-full overflow-x-hidden md:pt-20">
          <Outlet />
        </main>
      </div>
    </div>
  );
}