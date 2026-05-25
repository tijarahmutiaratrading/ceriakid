import React from 'react';
import { Outlet } from 'react-router-dom';

/**
 * App layout for authenticated pages.
 * Sidebar dah dibuang — navigasi sepenuhnya melalui AppHeader pill nav.
 * Render full-bleed background + Outlet sahaja.
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
      <Outlet />
    </div>
  );
}