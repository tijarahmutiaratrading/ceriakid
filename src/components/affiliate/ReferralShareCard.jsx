import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Download, MessageCircle, Loader2, Sparkles, ImageIcon } from 'lucide-react';
import html2canvas from 'html2canvas';
import { toast } from '@/components/ui/use-toast';

/**
 * Generate a beautiful shareable image with the user's referral code.
 * User boleh download atau direct share ke WhatsApp — viral potential tinggi.
 *
 * Uses html2canvas to convert a hidden DOM card to PNG.
 */
export default function ReferralShareCard({ affiliate, referralLink, userName }) {
  const cardRef = useRef(null);
  const [generating, setGenerating] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);

  const generateImage = async () => {
    if (!cardRef.current) return null;
    setGenerating(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
      });
      const dataUrl = canvas.toDataURL('image/png');
      setImageUrl(dataUrl);
      return dataUrl;
    } catch (err) {
      console.error('html2canvas error:', err);
      toast({ title: 'Gagal jana gambar', description: 'Cuba lagi.', variant: 'destructive' });
      return null;
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = async () => {
    const url = imageUrl || await generateImage();
    if (!url) return;
    const link = document.createElement('a');
    link.href = url;
    link.download = `ceriakid-referral-${affiliate.referralCode}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({ title: '📥 Gambar dimuat turun!', description: 'Kongsi dengan kawan-kawan anda.' });
  };

  const handleWhatsAppShare = async () => {
    const message = `🎓 Anak saya belajar dengan CeriaKid! 200+ permainan edukatif ikut KSPK/KSSR.\n\n🎁 Pakai kod saya untuk dapat diskaun:\n${referralLink}\n\nCuba 2 minit je untuk setup! 🚀`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');

    // Generate image untuk user save juga
    if (!imageUrl) await generateImage();
  };

  // Auto-generate sekali masa mount supaya preview ready
  useEffect(() => {
    const timer = setTimeout(generateImage, 800);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="rounded-3xl bg-white/95 backdrop-blur-sm border border-white/60 shadow-xl p-5 sm:p-6 mt-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg">
          <ImageIcon className="w-5 h-5 text-white" strokeWidth={2.5} />
        </div>
        <div>
          <p className="text-slate-900 font-black text-base leading-tight">Share Card untuk WhatsApp</p>
          <p className="text-slate-500 text-xs font-semibold">Gambar siap untuk kongsi ke kawan-kawan</p>
        </div>
      </div>

      {/* Preview area */}
      <div className="relative rounded-2xl overflow-hidden bg-slate-100 aspect-[4/5] max-w-xs mx-auto mb-4 shadow-inner">
        {imageUrl ? (
          <img src={imageUrl} alt="Referral share card" className="w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-purple-600 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-600">Sedang jana gambar...</p>
            </div>
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="grid grid-cols-2 gap-2.5">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleDownload}
          disabled={generating}
          className="py-3 rounded-2xl bg-slate-900 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg hover:bg-slate-800 transition-all disabled:opacity-60"
        >
          <Download className="w-4 h-4" /> Download
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleWhatsAppShare}
          className="py-3 rounded-2xl bg-[#25D366] text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg hover:bg-[#1ebe57] transition-all"
        >
          <MessageCircle className="w-4 h-4" /> WhatsApp
        </motion.button>
      </div>

      {/* Hidden card — rendered off-screen, captured by html2canvas */}
      <div
        style={{ position: 'absolute', left: '-9999px', top: 0, pointerEvents: 'none' }}
        aria-hidden="true"
      >
        <div
          ref={cardRef}
          style={{
            width: '480px',
            height: '600px',
            background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 50%, #f97316 100%)',
            padding: '40px',
            fontFamily: 'Nunito, sans-serif',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Decorative orbs */}
          <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(255,255,255,0.15)', filter: 'blur(20px)' }} />
          <div style={{ position: 'absolute', bottom: '-80px', left: '-80px', width: '250px', height: '250px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', filter: 'blur(30px)' }} />

          {/* Top section */}
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'inline-block', padding: '8px 16px', borderRadius: '999px', background: 'rgba(255,255,255,0.25)', color: 'white', fontSize: '12px', fontWeight: 900, letterSpacing: '0.15em', marginBottom: '20px' }}>
              🎓 CERIAKID
            </div>
            <h1 style={{ color: 'white', fontSize: '38px', fontWeight: 900, lineHeight: 1.1, margin: 0, textShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>
              Anak saya<br />belajar di<br />
              <span style={{ background: '#fde047', color: '#7c2d12', padding: '2px 12px', borderRadius: '8px', display: 'inline-block', marginTop: '6px' }}>CeriaKid! 🌟</span>
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.95)', fontSize: '15px', fontWeight: 700, marginTop: '16px', lineHeight: 1.5 }}>
              200+ permainan edukatif KSPK/KSSR<br />
              📚 Bahasa • Math • Sains • Jawi
            </p>
          </div>

          {/* Middle section — code badge */}
          <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: '20px', background: 'rgba(255,255,255,0.95)', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
            <p style={{ color: '#64748b', fontSize: '11px', fontWeight: 900, letterSpacing: '0.2em', margin: 0, marginBottom: '6px' }}>
              KOD RUJUKAN
            </p>
            <p style={{ color: '#7c3aed', fontSize: '40px', fontWeight: 900, margin: 0, letterSpacing: '0.1em', fontFamily: 'monospace' }}>
              {affiliate.referralCode}
            </p>
            {userName && (
              <p style={{ color: '#64748b', fontSize: '12px', fontWeight: 700, margin: 0, marginTop: '8px' }}>
                — {userName}
              </p>
            )}
          </div>

          {/* Bottom section */}
          <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
            <p style={{ color: 'white', fontSize: '14px', fontWeight: 800, margin: 0, marginBottom: '4px' }}>
              👇 Daftar di
            </p>
            <p style={{ color: '#fde047', fontSize: '18px', fontWeight: 900, margin: 0, textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
              ceriakid.com
            </p>
            <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '11px', fontWeight: 700, margin: 0, marginTop: '8px' }}>
              ✅ Tanpa iklan • ✅ Mesra anak • ✅ KSPK + KSSR
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}