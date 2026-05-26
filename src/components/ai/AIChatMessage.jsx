import React from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { User } from 'lucide-react';

const CIKGU_AVATAR = 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/fc07612a5_generated_image.png';

export default function AIChatMessage({ role, content, timestamp }) {
  const isUser = role === 'user';
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      {isUser ? (
        <div className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center bg-gradient-to-br from-game-pink to-game-purple">
          <User className="w-4 h-4 text-white" />
        </div>
      ) : (
        <img
          src={CIKGU_AVATAR}
          alt="Cikgu Firdaus"
          className="flex-shrink-0 w-9 h-9 rounded-full object-cover ring-2 ring-amber-300/70 shadow-md"
        />
      )}
      <div className={`max-w-[85%] ${isUser ? 'items-end' : 'items-start'} flex flex-col`}>
        <div className={`rounded-2xl px-4 py-2.5 ${isUser ? 'bg-game-purple text-white rounded-tr-sm' : 'bg-white text-gray-900 rounded-tl-sm shadow-md'}`}>
          {isUser ? (
            <p className="text-sm font-semibold leading-relaxed whitespace-pre-wrap">{content}</p>
          ) : (
            <div className="text-sm leading-relaxed prose prose-sm max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
              <ReactMarkdown>{content}</ReactMarkdown>
            </div>
          )}
        </div>
        {timestamp && <p className="text-[10px] text-white/50 mt-1 px-2">{timestamp}</p>}
      </div>
    </motion.div>
  );
}