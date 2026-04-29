import React from 'react';
import { motion } from 'framer-motion';

export default function LoadingSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-pattern flex items-center justify-center"
    >
      <div className="max-w-lg mx-auto px-4 w-full space-y-6 py-8">
        {/* Header skeleton */}
        <div className="flex gap-3">
          <div className="w-12 h-12 bg-white rounded-full animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-white rounded-full w-2/3 animate-pulse" />
            <div className="h-3 bg-white rounded-full w-1/2 animate-pulse" />
          </div>
        </div>

        {/* Main card skeleton */}
        <div className="clay rounded-3xl p-6 space-y-4">
          <div className="h-20 bg-white rounded-lg animate-pulse" />
          <div className="h-12 bg-white rounded-lg animate-pulse" />
          <div className="h-12 bg-white rounded-lg animate-pulse" />
        </div>

        {/* Options skeleton */}
        <div className="grid grid-cols-2 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-20 bg-white rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    </motion.div>
  );
}