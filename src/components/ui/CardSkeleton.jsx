import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * Skeleton untuk full page yang ada header card + list cards (CeriaKid layout).
 * Lebih premium berbanding spinner — match dengan structure actual content.
 *
 * Props:
 * - rows: berapa list skeleton (default 3)
 */
export default function CardSkeleton({ rows = 3 }) {
  return (
    <div
      className="min-h-screen w-full font-nunito relative -mt-16 sm:-mt-20 pt-16 sm:pt-20"
      style={{ background: 'linear-gradient(135deg, #fef3c7 0%, #fbcfe8 50%, #c7d2fe 100%)' }}
    >
      <div className="relative w-full max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 pb-32 pt-8 space-y-5">
        {/* Header card skeleton */}
        <div className="p-5 rounded-3xl bg-white/80 shadow-xl border border-white/60 flex items-center gap-4">
          <Skeleton className="w-14 h-14 rounded-2xl bg-purple-200/50" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-32 bg-purple-200/50" />
            <Skeleton className="h-3 w-24 bg-purple-200/40" />
          </div>
        </div>

        {/* List skeleton cards */}
        <div className="rounded-3xl p-5 bg-white/80 shadow-xl border border-white/60 space-y-3">
          <Skeleton className="h-3 w-28 bg-purple-200/40 mb-3" />
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="rounded-2xl p-4 bg-white/70 border border-white/60 flex items-center gap-3">
              <Skeleton className="w-10 h-10 rounded-xl bg-purple-200/40" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3 w-3/4 bg-purple-200/40" />
                <Skeleton className="h-2 w-1/2 bg-purple-200/30" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}