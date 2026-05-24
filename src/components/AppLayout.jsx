import React from 'react';
import { Outlet } from 'react-router-dom';
import UserSidebar from '@/components/UserSidebar';

/**
 * App layout that injects the desktop UserSidebar on every authenticated
 * (non-landing, non-fullscreen-game) page.
 *
 * Design:
 *   - Sidebar is FIXED at the top-left so it stays visible while scrolling.
 *   - We DO NOT add any padding/wrapper around <Outlet /> — that previously
 *     created a 2-colour split because the page's gradient only covered the
 *     padded area, leaving the area BEHIND the sidebar a different colour.
 *   - Each page is responsible for its own background (full-bleed) and for
 *     reserving space on the left so its content doesn't sit under the
 *     sidebar (e.g. md:pl-[17rem] on the page's inner content container).
 */
export default function AppLayout() {
  return (
    <div
      className="flex min-h-screen w-full gap-4 md:gap-6 px-2 md:px-4 py-2 md:py-3"
      style={{
        background: 'url(https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/37dda3450_generated_image.png)',
        backgroundSize: 'cover',
        backgroundAttachment: 'fixed',
        backgroundPosition: 'center top',
      }}
    >
      <UserSidebar />
      <main className="flex-1 w-full overflow-x-hidden">
        <Outlet />
      </main>
    </div>
  );
}