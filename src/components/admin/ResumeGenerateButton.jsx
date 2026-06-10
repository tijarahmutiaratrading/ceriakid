import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { PlayCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

// Butang untuk trigger backgroundLaunchGenerator secara manual —
// sambung jana games dari bucket terakhir yang belum cukup.
// Boleh tekan berulang kali; setiap tekan jana sehingga 3 games.
export default function ResumeGenerateButton() {
  const [running, setRunning] = useState(false);
  const { toast } = useToast();

  const handleResume = async () => {
    setRunning(true);
    try {
      const res = await base44.functions.invoke('backgroundLaunchGenerator', {});
      const data = res?.data;
      if (data?.allComplete) {
        toast({ title: '🎉 Semua siap!', description: 'Semua bucket KSSR + KAFA dah lengkap.' });
      } else if (data?.success) {
        const b = data.bucket;
        const where = b ? `${b.darjah || 'pra'} / ${b.category}` : 'bucket seterusnya';
        toast({
          title: `✅ +${data.generated || 0} games dijana`,
          description: `${where} (${b ? b.count + (data.generated || 0) : '?'} setakat ini). Tekan lagi untuk sambung.`,
        });
      } else {
        toast({ title: 'ℹ️ Tiada apa dijana', description: data?.reason || 'Cuba lagi.', variant: 'destructive' });
      }
    } catch (err) {
      const msg = err?.response?.data?.error || err.message || '';
      const isRate = msg.toLowerCase().includes('rate limit') || msg.includes('429');
      toast({
        title: isRate ? '⏳ Rate limit' : '❌ Error',
        description: isRate ? 'Server sibuk sekejap. Tunggu seminit, tekan lagi.' : msg,
        variant: 'destructive',
      });
    } finally {
      setRunning(false);
    }
  };

  return (
    <Button
      onClick={handleResume}
      disabled={running}
      className="bg-violet-600 hover:bg-violet-500 text-white font-black"
    >
      {running ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <PlayCircle className="w-4 h-4 mr-2" />}
      {running ? 'Menjana...' : 'Resume Generate'}
    </Button>
  );
}