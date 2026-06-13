import React from 'react';
import { Outlet } from 'react-router-dom';
import UserTopHeader from '@/components/UserTopHeader';
import PageTransition from '@/components/ui/PageTransition';
import { useUITheme } from '@/lib/UIThemeContext';

/**
 * App layout with a floating top header (desktop) on every authenticated page.
 * Mobile keeps the existing AppHeader rendered by individual pages.
 *
 * Background bertukar ikut tema pilihan user:
 *  - ps5     : latar gelap sinematik dengan glow radial merah (default)
 *  - classic : latar lembut cerah berwarna (tema lama sebelum PS5)
 *
 * Note: We use a position:fixed background <div> instead of background-attachment:fixed
 * because the latter is buggy on iOS Safari/Chrome (background detaches/jumps on scroll).
 */
export default function AppLayout() {
  const { isClassic } = useUITheme();

  return (
    <>
      {isClassic ? (
        // Tema LAMA — latar cerah lembut + corak warna (bg-pattern)
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 -z-10 bg-pattern"
          style={{
            background:
              'radial-gradient(circle at 20% 80%, hsla(340, 80%, 65%, 0.18) 0%, transparent 50%),' +
              'radial-gradient(circle at 80% 20%, hsla(200, 85%, 58%, 0.18) 0%, transparent 50%),' +
              'radial-gradient(circle at 50% 50%, hsla(45, 95%, 55%, 0.12) 0%, transparent 50%),' +
              'hsl(270, 60%, 97%)',
          }}
        />
      ) : (
        // Tema PS5 — latar gelap dengan glow radial merah
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
      )}
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