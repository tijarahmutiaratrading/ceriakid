import React from 'react';
import { Outlet } from 'react-router-dom';
import UserTopHeader from '@/components/UserTopHeader';
import PageTransition from '@/components/ui/PageTransition';
import BottomNavigation from '@/components/BottomNavigation';

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
        <main className="w-full overflow-x-hidden pt-16 sm:pt-20 pb-20 sm:pb-0">
          <PageTransition>
            <Outlet />
          </PageTransition>
        </main>
        <BottomNavigation />

        {/* WhatsApp floating support button */}
        <a
          href="https://wa.me/60112345678?text=Salam%2C%20saya%20ada%20soalan%20tentang%20CeriaKid"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:flex fixed bottom-6 right-6 z-50 items-center gap-2 px-4 py-3 rounded-full bg-green-500 hover:bg-green-400 text-white font-black text-sm shadow-2xl shadow-green-500/30 transition-all hover:scale-105 active:scale-95"
          aria-label="Hubungi kami via WhatsApp"
        >
          💬 <span>Bantuan</span>
        </a>
      </div>
    </>
  );
}