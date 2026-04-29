import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { CheckCircle2, Users, TrendingUp, Zap, Mail, BarChart3 } from 'lucide-react';

export default function B2BLanding() {
  const features = [
    { icon: Users, title: 'Student Management', desc: 'Track 100+ students in one dashboard' },
    { icon: BarChart3, title: 'Class Analytics', desc: 'Real-time performance tracking' },
    { icon: Mail, title: 'Parent Reports', desc: 'Auto-send weekly progress to parents' },
    { icon: Zap, title: 'Gamified Learning', desc: '200+ games aligned to curriculum' },
    { icon: TrendingUp, title: 'Engagement Metrics', desc: 'Monitor class participation' },
    { icon: CheckCircle2, title: 'Compliance Ready', desc: 'KSSR aligned content' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-game-purple/5 to-white">
      {/* Navigation */}
      <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
        <Link to="/">
          <h1 className="text-2xl font-black text-game-purple">🎓 Jom Belajar</h1>
        </Link>
        <Link to="/parent-dashboard">
          <button className="px-6 py-2 bg-game-purple text-white rounded-full font-bold">
            Parent Login
          </button>
        </Link>
      </div>

      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto px-4 text-center py-20"
      >
        <h1 className="text-5xl font-black text-gray-900 mb-6">
          Transform Your Classroom 🚀
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Gamified learning platform trusted by 100+ schools in Malaysia. Proven to increase engagement by 40%.
        </p>
        <div className="flex gap-4 justify-center mb-16">
          <a href="mailto:schools@jombelajar.app?subject=Demo%20Request">
            <motion.button
              whileHover={{ scale: 1.05 }}
              className="px-8 py-4 bg-game-purple text-white rounded-full font-black text-lg shadow-lg"
            >
              Schedule Demo
            </motion.button>
          </a>
          <Link to="/landing">
            <motion.button
              whileHover={{ scale: 1.05 }}
              className="px-8 py-4 border-2 border-game-purple text-game-purple rounded-full font-black text-lg"
            >
              View Pricing
            </motion.button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-6 mb-20">
          <div className="bg-white rounded-2xl p-6 shadow-md">
            <p className="text-3xl font-black text-game-green">100+</p>
            <p className="text-gray-600 font-bold">Schools</p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-md">
            <p className="text-3xl font-black text-game-blue">50K+</p>
            <p className="text-gray-600 font-bold">Students</p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-md">
            <p className="text-3xl font-black text-game-orange">40%</p>
            <p className="text-gray-600 font-bold">Engagement ↑</p>
          </div>
        </div>
      </motion.div>

      {/* Features */}
      <div className="max-w-6xl mx-auto px-4 py-20">
        <h2 className="text-4xl font-black text-center mb-16">Features for Schools</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-2xl p-6 border-2 border-amber-200 shadow-md hover:shadow-lg"
              >
                <Icon className="w-10 h-10 text-game-purple mb-4" />
                <h3 className="text-xl font-black mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Pricing */}
      <div className="bg-game-purple/5 py-20">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-4xl font-black text-center mb-16">School Pricing</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: 'Starter', price: 'RM 499', students: 'Up to 50' },
              { name: 'Professional', price: 'RM 999', students: 'Up to 200', highlighted: true },
              { name: 'Enterprise', price: 'Custom', students: '500+' },
            ].map((plan, i) => (
              <a key={i} href="mailto:schools@jombelajar.app?subject=School%20Plan">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className={`rounded-2xl p-8 text-center cursor-pointer ${
                    plan.highlighted
                      ? 'bg-game-purple text-white border-4 border-game-purple transform scale-105'
                      : 'bg-white border-2 border-amber-200'
                  }`}
                >
                  <h3 className="text-2xl font-black mb-4">{plan.name}</h3>
                  <p className="text-4xl font-black mb-2">{plan.price}</p>
                  <p className={`font-bold mb-6 ${plan.highlighted ? 'text-white/80' : 'text-gray-600'}`}>{plan.students}</p>
                  <button className={`w-full py-3 rounded-full font-black ${
                    plan.highlighted
                      ? 'bg-white text-game-purple'
                      : 'bg-game-purple text-white'
                  }`}>
                    Get Started
                  </button>
                </motion.div>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-900 text-white py-12 text-center">
        <p className="mb-4">📧 schools@jombelajar.app | 📞 +60-3-XXXX-XXXX</p>
        <p className="text-gray-400">© 2026 Jom Belajar - Transforming Education in Malaysia</p>
      </div>
    </div>
  );
}