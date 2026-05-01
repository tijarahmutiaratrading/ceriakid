import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { X, Send, Loader2 } from 'lucide-react';

export default function GameManagerAI({ onClose }) {
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    initializeConversation();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const initializeConversation = async () => {
    try {
      const conv = await base44.agents.createConversation({
        agent_name: 'gameManager',
        metadata: {
          name: 'Game Manager Chat',
          description: 'Admin managing games',
        },
      });
      setConversation(conv);
      setMessages(conv.messages || []);
      setInitialized(true);

      // Subscribe to updates
      const unsubscribe = base44.agents.subscribeToConversation(conv.id, (data) => {
        setMessages(data.messages);
      });

      return unsubscribe;
    } catch (err) {
      console.error('Failed to initialize conversation:', err);
      setInitialized(true);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || !conversation || loading) return;

    const userMessage = input.trim();
    setInput('');
    setLoading(true);

    try {
      await base44.agents.addMessage(conversation, {
        role: 'user',
        content: userMessage,
      });
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 400 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 400 }}
      className="fixed bottom-20 right-4 w-96 h-[600px] bg-white rounded-3xl shadow-2xl border-2 border-gray-100 z-50 flex flex-col"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white p-4 rounded-t-3xl flex items-center justify-between">
        <div>
          <h3 className="font-bold text-lg">🤖 Game Manager AI</h3>
          <p className="text-xs text-indigo-100">Manage games dengan mudah</p>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-indigo-400 rounded-lg transition-all"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {!initialized ? (
          <div className="h-full flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center text-gray-500">
            <div className="text-4xl mb-2">🎮</div>
            <p className="text-sm font-semibold">Salam admin!</p>
            <p className="text-xs">Tanya saya untuk manage games</p>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs rounded-2xl px-4 py-2 text-sm ${
                  msg.role === 'user'
                    ? 'bg-indigo-500 text-white'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {msg.content}
              </div>
            </motion.div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSendMessage} className="border-t border-gray-200 p-4 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Tanya saya..."
          disabled={loading}
          className="flex-1 p-2 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none text-sm disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white p-2 rounded-xl transition-all"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </button>
      </form>
    </motion.div>
  );
}