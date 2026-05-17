import React from 'react';
import { Outlet } from 'react-router-dom';
import UserSidebar from '@/components/UserSidebar';

/**
 * App layout that injects the desktop UserSidebar on every authenticated
 * (non-landing, non-fullscreen-game) page.
 *
 * Design:
 *   - Sidebar is FIXED at the top-left so it stays visible while scrolling.
 *   - We DO NOT render <AppHeader /> or a background here — each page already
 *     handles its own header + background. This keeps the layout non-intrusive.
 *   - The Outlet wrapper adds md:pl-[17rem] so the page content shifts right
 *     to make room for the fixed sidebar on desktop. Mobile is unaffected.
 */
export default function AppLayout() {
  return (
    <>
      <div className="hidden md:block fixed top-6 left-6 z-30">
        <UserSidebar />
      </div>
      <div className="md:pl-[17rem]">
        <Outlet />
      </div>
    </>
  );
}