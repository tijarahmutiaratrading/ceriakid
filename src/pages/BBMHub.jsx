import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Lock, Search, BookOpen, FileText, Star } from 'lucide-react';

import { Link } from 'react-router-dom';
import AppHeader from '@/components/AppHeader';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import BBMFilterBar from '@/components/bbm/BBMFilterBar';
import BBMCard from '@/components/bbm/BBMCard';
import BBMEmptyState from '@/components/bbm/BBMEmptyState';

const SAMPLE_BBM = [
  { id: 's1', title: 'Kad Imbasan Abjad A-Z', subject: 'bahasa_melayu', level: 'prasekolah', type: 'kad_imbasan', emoji: '🔤', tier: 'free', downloadCount: 342, description: 'Set kad imbasan huruf besar dan kecil dengan gambar menarik', isPublished: true },
  { id: 's2', title: 'Lembaran Kerja Nombor 1-10', subject: 'mathematics', level: 'prasekolah', type: 'lembaran_kerja', emoji: '🔢', tier: 'free', downloadCount: 289, description: 'Latihan menulis dan mengira nombor 1 hingga 10', isPublished: true },
  { id: 's3', title: 'Carta Jadual Sifir 1-12', subject: 'mathematics', level: 'darjah_3', type: 'carta', emoji: '📊', tier: 'free', downloadCount: 512, description: 'Carta warna-warni jadual sifir untuk ditampal di kelas', isPublished: true },
  { id: 's4', title: 'Slaid PPT: Sistem Suria', subject: 'science', level: 'darjah_4', type: 'slaid_powerpoint', emoji: '🚀', tier: 'premium', downloadCount: 198, description: 'Slaid PowerPoint interaktif tentang sistem suria dan planet', isPublished: true },
  { id: 's5', title: 'RPH Penulisan Karangan Darjah 5', subject: 'bahasa_melayu', level: 'darjah_5', type: 'rancangan_pengajaran', emoji: '📝', tier: 'premium', downloadCount: 156, description: 'Rancangan Pengajaran Harian lengkap untuk topik karangan', isPublished: true },
  { id: 's6', title: 'Lembaran Kerja English Vocabulary', subject: 'english', level: 'darjah_1', type: 'lembaran_kerja', emoji: '🇬🇧', tier: 'free', downloadCount: 445, description: 'Latihan kosa kata asas Bahasa Inggeris dengan gambar', isPublished: true },
  { id: 's7', title: 'Kad Imbasan Jawi Alif-Ya', subject: 'jawi', level: 'darjah_2', type: 'kad_imbasan', emoji: '🕌', tier: 'free', downloadCount: 267, description: 'Kad imbasan huruf jawi lengkap dengan cara sebutan', isPublished: true },
  { id: 's8', title: 'Modul Sains: Haiwan & Habitatnya', subject: 'science', level: 'darjah_3', type: 'modul', emoji: '🦁', tier: 'premium', downloadCount: 134, description: 'Modul lengkap tentang haiwan dan habitat mereka', isPublished: true },
  { id: 's9', title: 'Permainan: Siapa Cepat Dia Dapat (BM)', subject: 'bahasa_melayu', level: 'darjah_2', type: 'permainan_bilik_darjah', emoji: '🎯', tier: 'free', downloadCount: 378, description: 'Aktiviti permainan kumpulan untuk latih ejaan dan kosa kata', isPublished: true },
  { id: 's10', title: 'Kuiz Matematik Darjah 6 UPSR', subject: 'mathematics', level: 'darjah_6', type: 'kuiz', emoji: '🏆', tier: 'premium', downloadCount: 223, description: 'Soalan kuiz format UPSR dengan jawapan lengkap', isPublished: true },
  { id: 's11', title: 'Carta Buah-buahan Malaysia', subject: 'bahasa_melayu', level: 'prasekolah', type: 'carta', emoji: '🍎', tier: 'free', downloadCount: 401, description: 'Carta warna-warni buah-buahan tempatan dengan nama BM & English', isPublished: true },
  { id: 's12', title: 'RPH English: My Family Darjah 1', subject: 'english', level: 'darjah_1', type: 'rancangan_pengajaran', emoji: '👨‍👩‍👧', tier: 'premium', downloadCount: 189, description: 'Rancangan Pengajaran Harian topik keluarga untuk Year 1', isPublished: true },
];

export default function BBMHub() {
  const { user, isAuthenticated } = useAuth();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [userTier, setUserTier] = useState('free');

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    try {
      // Load user tier
      if (user) {
        const subs = await base44.entities.UserSubscription.filter({ email: user.email });
        if (subs.length > 0 && subs[0].status === 'active') {
          setUserTier(subs[0].tier || 'free');
        }
      }
      // Load BBM from DB, fall back to sample
      try {
        const dbResources = await base44.entities.BBMResource.list('-created_date', 100);
        const published = dbResources.filter(r => r.isPublished !== false);
        setResources(published.length > 0 ? published : SAMPLE_BBM);
      } catch {
        setResources(SAMPLE_BBM);
      }
    } catch {
      setResources(SAMPLE_BBM);
    } finally {
      setLoading(false);
    }
  };

  const filtered = resources.filter(r => {
    const matchSearch = !search || r.title.toLowerCase().includes(search.toLowerCase()) || r.description?.toLowerCase().includes(search.toLowerCase());
    const matchLevel = selectedLevel === 'all' || r.level === selectedLevel;
    const matchSubject = selectedSubject === 'all' || r.subject === selectedSubject;
    const matchType = selectedType === 'all' || r.type === selectedType;
    return matchSearch && matchLevel && matchSubject && matchType;
  });

  const isPremiumUser = ['premium', 'pro', 'keluarga', 'standard', 'asas'].includes(userTier);

  const generatePDF = async (resource) => {
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF();
    const pageW = doc.internal.pageSize.getWidth();

    // Header background
    doc.setFillColor(109, 40, 217);
    doc.rect(0, 0, pageW, 40, 'F');

    // Title
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    const title = `${resource.title}`;
    doc.text(title, pageW / 2, 20, { align: 'center', maxWidth: pageW - 20 });

    // Subtitle
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('CeriaKid Educational Platform | Malaysia', pageW / 2, 32, { align: 'center' });

    // Meta info
    doc.setTextColor(80, 80, 80);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Maklumat BBM', 14, 55);

    doc.setDrawColor(109, 40, 217);
    doc.line(14, 57, pageW - 14, 57);

    const levelMap = { prasekolah: 'Prasekolah', darjah_1: 'Darjah 1', darjah_2: 'Darjah 2', darjah_3: 'Darjah 3', darjah_4: 'Darjah 4', darjah_5: 'Darjah 5', darjah_6: 'Darjah 6' };
    const subjectMap = { bahasa_melayu: 'Bahasa Melayu', english: 'English', mathematics: 'Matematik', science: 'Sains', jawi: 'Jawi', bahasa_tamil: 'Bahasa Tamil', bahasa_mandarin: 'Bahasa Mandarin' };
    const typeMap = { lembaran_kerja: 'Lembaran Kerja', kad_imbasan: 'Kad Imbasan', carta: 'Carta', slaid_powerpoint: 'Slaid PowerPoint', rancangan_pengajaran: 'Rancangan Pengajaran', modul: 'Modul', kuiz: 'Kuiz', aktiviti: 'Aktiviti', permainan_bilik_darjah: 'Permainan Bilik Darjah' };

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    const meta = [
      ['Tahap', levelMap[resource.level] || resource.level || '-'],
      ['Subjek', subjectMap[resource.subject] || resource.subject || '-'],
      ['Jenis BBM', typeMap[resource.type] || resource.type || '-'],
      ['Tier', resource.tier === 'premium' ? 'Premium' : 'Percuma'],
    ];
    meta.forEach(([label, value], i) => {
      const y = 66 + i * 9;
      doc.setFont('helvetica', 'bold');
      doc.text(`${label}:`, 14, y);
      doc.setFont('helvetica', 'normal');
      doc.text(value, 55, y);
    });

    // Description
    if (resource.description) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(80, 80, 80);
      doc.text('Penerangan', 14, 108);
      doc.line(14, 110, pageW - 14, 110);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(60, 60, 60);
      const descLines = doc.splitTextToSize(resource.description, pageW - 28);
      doc.text(descLines, 14, 118);
    }

    // Content area placeholder
    const contentY = resource.description ? 140 : 108;
    doc.setFillColor(245, 240, 255);
    doc.roundedRect(14, contentY, pageW - 28, 100, 5, 5, 'F');
    doc.setDrawColor(109, 40, 217);
    doc.setLineWidth(0.5);
    doc.roundedRect(14, contentY, pageW - 28, 100, 5, 5, 'S');

    doc.setTextColor(109, 40, 217);
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text('Ruang Aktiviti / Latihan', pageW / 2, contentY + 20, { align: 'center' });
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(150, 120, 200);
    doc.text('Bahan ini dijana oleh CeriaKid. Boleh diedit dan digunakan untuk pengajaran.', pageW / 2, contentY + 32, { align: 'center' });

    // Lines for writing space
    doc.setDrawColor(200, 180, 240);
    doc.setLineWidth(0.3);
    for (let i = 0; i < 6; i++) {
      const ly = contentY + 45 + i * 12;
      doc.line(25, ly, pageW - 25, ly);
    }

    // Footer
    doc.setFillColor(109, 40, 217);
    doc.rect(0, 282, pageW, 15, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.text('© CeriaKid | ceriakid.com | Bahan Bantu Mengajar Malaysia', pageW / 2, 291, { align: 'center' });

    doc.save(`${resource.title}.pdf`);
  };

  const handleDownload = async (resource) => {
    if (resource.tier === 'premium' && !isPremiumUser) return;

    if (resource.fileUrl) {
      // Direct file download
      const a = document.createElement('a');
      a.href = resource.fileUrl;
      a.download = `${resource.title}.pdf`;
      a.target = '_blank';
      a.click();
    } else {
      // Generate PDF
      await generatePDF(resource);
    }

    // Increment download count silently
    try {
      if (resource.id && !resource.id.startsWith('s')) {
        await base44.entities.BBMResource.update(resource.id, {
          downloadCount: (resource.downloadCount || 0) + 1,
        });
      }
    } catch {}
  };

  const stats = {
    total: resources.length,
    free: resources.filter(r => r.tier === 'free').length,
    premium: resources.filter(r => r.tier === 'premium').length,
  };

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #667eea 0%, #f093fb 50%, #f5a623 100%)' }}>
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" />
        <div className="absolute top-1/3 -left-20 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <AppHeader showBack={true} backTo="/dashboard" />

      <div className="relative max-w-lg mx-auto px-4 pb-32 pt-28">

        {/* Header Card */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-5 p-5 rounded-3xl"
          style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.4)' }}
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-white/30 flex items-center justify-center text-3xl shadow-inner flex-shrink-0">📚</div>
            <div>
              <h1 className="text-2xl font-black text-white leading-tight">Bahan Bantu Mengajar</h1>
              <p className="text-white/70 text-xs font-semibold mt-0.5">Untuk Cikgu & Ibu Bapa • Prasekolah hingga Darjah 6</p>
            </div>
          </div>
          {/* Stats */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'Jumlah BBM', value: stats.total, icon: '📁' },
              { label: 'Percuma', value: stats.free, icon: '🎁' },
              { label: 'Premium', value: stats.premium, icon: '⭐' },
            ].map((s, i) => (
              <div key={i} className="bg-white/20 rounded-2xl p-2.5 text-center">
                <div className="text-lg">{s.icon}</div>
                <div className="text-white font-black text-lg leading-tight">{s.value}</div>
                <div className="text-white/70 text-xs">{s.label}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="mb-4 relative"
        >
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60" />
          <input
            type="text"
            placeholder="Cari BBM..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white/20 text-white placeholder-white/50 font-semibold text-sm outline-none border border-white/30 focus:border-white/60 backdrop-blur-sm"
          />
        </motion.div>

        {/* Filter Bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-5"
        >
          <BBMFilterBar
            selectedLevel={selectedLevel}
            setSelectedLevel={setSelectedLevel}
            selectedSubject={selectedSubject}
            setSelectedSubject={setSelectedSubject}
            selectedType={selectedType}
            setSelectedType={setSelectedType}
          />
        </motion.div>

        {/* Results count */}
        <div className="flex items-center justify-between mb-3 px-1">
          <p className="text-white/80 text-xs font-bold">{filtered.length} bahan dijumpai</p>
          {!isPremiumUser && (
            <Link to="/landing">
              <span className="text-xs font-black text-yellow-300 flex items-center gap-1">
                <Star className="w-3 h-3" /> Naik taraf untuk semua
              </span>
            </Link>
          )}
        </div>

        {/* Resources List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <BBMEmptyState onReset={() => { setSearch(''); setSelectedLevel('all'); setSelectedSubject('all'); setSelectedType('all'); }} />
        ) : (
          <div className="space-y-3">
            {filtered.map((resource, i) => (
              <BBMCard
                key={resource.id || i}
                resource={resource}
                locked={resource.tier === 'premium' && !isPremiumUser}
                onDownload={() => handleDownload(resource)}
                idx={i}
              />
            ))}
          </div>
        )}

        {/* CTA for teachers */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 p-5 rounded-3xl text-center"
          style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.3)' }}
        >
          <p className="text-2xl mb-2">🎓</p>
          <p className="text-white font-black text-sm mb-1">Anda seorang Cikgu?</p>
          <p className="text-white/70 text-xs mb-3">Dapatkan akses penuh ke semua BBM premium — RPH, modul, kuiz & lebih lagi!</p>
          <Link to="/">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="px-6 py-2.5 bg-white text-purple-600 rounded-full font-black text-sm shadow-lg"
            >
              Lihat Pelan Premium →
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}