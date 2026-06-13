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
      {/* Tema official CeriaKid — latar gelap dengan glow radial merah */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          background:
            'radial-gradient(900px circle at 20% 15%, rgba(239,68,68,0.55), transparent 58%),' +
            'radial-gradient(850px circle at 85% 80%, rgba(220,38,38,0.5), transparent 58%),' +
            'radial-gradient(750px circle at 50% 45%, rgba(185,28,28,0.32), transparent 62%),' +
            '#0a0a12',
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