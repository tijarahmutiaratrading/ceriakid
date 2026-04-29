import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const bgColors = {
  yellow: 'from-amber-200 to-yellow-300',
  pink: 'from-pink-200 to-rose-300',
  blue: 'from-sky-200 to-blue-300',
  green: 'from-emerald-200 to-green-300',
  purple: 'from-violet-200 to-purple-300',
};

export default function GameCard({ to, emoji, title, desc, color, index }) {
  return (
    <Link to={to}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 + index * 0.1, type: 'spring', damping: 15 }}
        whileHover={{ scale: 1.03, y: -4 }}
        whileTap={{ scale: 0.97 }}
        className={`clay rounded-3xl p-6 cursor-pointer bg-gradient-to-br ${bgColors[color]} relative overflow-hidden`}
      >
        {/* Decorative blob */}
        <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-white/20 blur-xl" />

        <motion.div
          className="text-5xl mb-3"
          animate={{ rotate: [0, -5, 5, 0] }}
          transition={{ repeat: Infinity, duration: 4, delay: index * 0.5 }}
        >
          {emoji}
        </motion.div>
        <h3 className="text-xl font-extrabold mb-1">{title}</h3>
        <p className="text-sm font-semibold opacity-70">{desc}</p>
      </motion.div>
    </Link>
  );
}