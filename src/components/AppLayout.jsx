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
            'radial-gradient(900px circle at 20% 15%, rgba(239,68,68,0.22), transparent 55%),' +
            'radial-gradient(800px circle at 85% 80%, rgba(220,38,38,0.18), transparent 55%),' +
            'radial-gradient(700px circle at 50% 50%, rgba(127,29,29,0.12), transparent 60%),' +
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