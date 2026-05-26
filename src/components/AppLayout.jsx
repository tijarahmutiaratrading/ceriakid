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
      className="min-h-screen w-full"
      style={{
        backgroundImage: 'url(https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/3f4216218_generated_image.png)',
        backgroundSize: 'cover',
        backgroundAttachment: 'fixed',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <UserTopHeader />
      <main className="w-full overflow-x-hidden">
        <Outlet />
      </main>
    </div>
  );
}