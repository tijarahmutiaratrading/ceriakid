import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { useAgeGroup } from '@/lib/AgeGroupContext';
import { useLang } from '@/lib/LanguageContext';
import { t } from '@/lib/i18n';

import AppHeader from '@/components/AppHeader';
import CategoryGrid from '@/components/home/CategoryGrid';
import DailyChallenge from '@/components/home/DailyChallenge';
import { getDefaultAvatar } from '@/lib/avatarGenerator';

export default function Home() {
  const { isAuthenticated, user } = useAuth();
  const { ageGroup, toggleAgeGroup } = useAgeGroup() || {};
  const { lang } = useLang();
  const safeAgeGroup = ageGroup || 'prasekolah';
  const safeToggle = toggleAgeGroup || (() => {});

  return (
    <div className="min-h-screen bg-amber-50">
      <AppHeader />
      <div className="max-w-lg mx-auto px-4 py-8 pb-32 pt-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-2">
            <span className="text-3xl">🎓</span>
            <h1 className="text-2xl font-black text-gray-800">Jom Belajar</h1>
          </div>
          {!isAuthenticated && (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => { import('@/api/base44Client').then(m => m.base44.auth.redirectToLogin(window.location.href)); }}
              className="px-4 py-2 backdrop-blur-xl text-white rounded-full text-sm font-bold transition-all border border-white/30"
            >
              {t('backToMenu', lang)}
            </motion.button>
          )}
        </div>

        {/* Welcome */}
        {isAuthenticated && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-3 mb-10 p-5 bg-white/40 backdrop-blur-xl rounded-2xl shadow-lg border-2 border-white/30"
          >
            <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-2xl">
              🐱
            </div>
            <div>
              <p className="text-xs text-gray-500 font-semibold">{lang === 'bm' ? 'Selamat datang!' : lang === 'en' ? 'Welcome!' : lang === 'zh' ? '欢迎!' : 'வரவேற்கிறோம்!'}</p>
              <p className="text-lg font-black text-game-purple">{user?.full_name || 'Teman'}</p>
            </div>
          </motion.div>
        )}

        {/* Age Group Toggle */}
        <div className="mb-8 sm:mb-12 pb-4 sm:pb-8 border-b-2 border-amber-200">
          <p className="text-xs sm:text-sm font-black text-gray-900 uppercase mb-3 sm:mb-4">{lang === 'bm' ? '🎯 Pilih Umur Anak' : lang === 'en' ? "🎯 Child's Age" : lang === 'zh' ? '🎯 儿童年龄' : '🎯 குழந்தையின் வயது'}</p>
          <div className="grid grid-cols-2 gap-2 sm:gap-4">
            {[
              { key: 'prasekolah', label: t('prasekolah', lang), emoji: '🎨' },
              { key: 'sekolah_rendah', label: t('sekolahRendah', lang), emoji: '📚' }
            ].map((age) => (
              <motion.button
                key={age.key}
                onClick={() => safeToggle(age.key)}
                whileTap={{ scale: 0.95 }}
                whileHover={{ y: -4 }}
                className={`px-3 sm:px-6 py-2 sm:py-4 rounded-2xl sm:rounded-3xl font-black text-xs sm:text-base transition-all border-2 flex flex-col items-center gap-1 sm:gap-2 ${
                  safeAgeGroup === age.key
                    ? 'bg-gradient-to-br from-game-orange to-orange-500 text-white border-orange-600 shadow-xl'
                    : 'bg-white text-gray-800 border-amber-200 hover:border-orange-300 shadow-md'
                }`}
              >
                <span className="text-2xl sm:text-3xl">{age.emoji}</span>
                <span>{age.label}</span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Drawing Studio Shortcut */}
        <Link to="/drawing">
          <motion.div
           whileHover={{ scale: 1.03 }}
           whileTap={{ scale: 0.97 }}
           className="mb-12 bg-gradient-to-r from-pink-400/70 to-purple-400/70 backdrop-blur-xl rounded-2xl p-6 flex items-center gap-4 text-white shadow-xl border border-white/30 cursor-pointer"
          >
            <span className="text-4xl">🎨</span>
            <div>
              <p className="font-black text-lg">{lang === 'bm' ? 'Studio Lukisan' : lang === 'en' ? 'Drawing Studio' : lang === 'zh' ? '绘画工作室' : 'வரைதல் ஸ்டுடியோ'}</p>
              <p className="text-sm opacity-90">{lang === 'bm' ? 'Lukis bebas atau buat tracing huruf & bentuk!' : lang === 'en' ? 'Draw freely or trace letters & shapes!' : lang === 'zh' ? '自由绘画或跟踪字母和形状!' : 'சுதந்திரமாக வரையவும் அல்லது எழுத்து மற்றும் வடிவங்களை ट्रेस செய்யவும்!'}</p>
            </div>
            <span className="ml-auto text-2xl">→</span>
          </motion.div>
        </Link>

        {/* Daily Challenge */}
        {isAuthenticated && (
          <div className="mb-12">
            <DailyChallenge ageGroup={safeAgeGroup} />
          </div>
        )}

        {/* Category Grid */}
        <h2 className="text-2xl font-black text-gray-800 mb-8">{lang === 'bm' ? 'Pilih Subjek' : lang === 'en' ? 'Choose Subject' : lang === 'zh' ? '选择主题' : 'विषय चुनें'}</h2>
        <CategoryGrid />

        {/* CTA Section */}
        {!isAuthenticated && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-12 bg-gradient-to-br from-game-orange/70 to-orange-400/70 backdrop-blur-xl rounded-3xl p-8 text-center text-white shadow-xl border border-white/30"
          >
            <p className="text-4xl mb-3">🎮</p>
             <p className="text-xl font-black mb-3">{lang === 'bm' ? 'Belum Mendaftar?' : lang === 'en' ? 'Not Registered Yet?' : lang === 'zh' ? '还没有注册?' : 'இன்னும் பதிவு செய்யவில்லையா?'}</p>
             <p className="text-sm mb-6 opacity-95">
               {lang === 'bm' ? 'Daftarlah sekarang untuk akses 200+ permainan edukatif!' : lang === 'en' ? 'Sign up now to access 200+ educational games!' : lang === 'zh' ? '立即注册以访问 200+ 教育游戏!' : '200+ கல்வி விளையாட்டுகளை அணுக இப்போது பதிவு செய்யுங்கள்!'}
             </p>
            <Link to="/landing">
              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-3 bg-white text-game-orange rounded-full font-black shadow-lg hover:shadow-xl transition-all"
                >
                 {lang === 'bm' ? 'Lihat Paket Sekarang' : lang === 'en' ? 'View Packages Now' : lang === 'zh' ? '现在查看套餐' : 'இப்போது தொகுப்புகளைப் பார்க்கவும்'}
                </motion.button>
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  );
}