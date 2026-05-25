import React from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { GraduationCap, User } from 'lucide-react';
import QuizChoiceCard from '@/components/ai/QuizChoiceCard';

export default function AIChatMessage({ role, content, quiz, onQuizAnswered, timestamp }) {
  const isUser = role === 'user';
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      <div className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center ${isUser ? 'bg-gradient-to-br from-game-pink to-game-purple' : 'bg-gradient-to-br from-amber-400 to-orange-500'}`}>
        {isUser ? <User className="w-4 h-4 text-white" /> : <GraduationCap className="w-4 h-4 text-white" />}
      </div>
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
        {quiz && !isUser && (
          <div className="w-full mt-2">
            <QuizChoiceCard quiz={quiz} onAnswered={onQuizAnswered} />
          </div>
        )}
        {timestamp && <p className="text-[10px] text-white/50 mt-1 px-2">{timestamp}</p>}
      </div>
    </motion.div>
  );
}