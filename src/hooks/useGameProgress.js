import { useContext, useEffect, useRef } from 'react';
import { RoundContext } from '@/components/game/ProMiniGameShell';

/**
 * useGameProgress — hook untuk mode component report progress ke shell.
 * 
 * Usage dalam mode:
 *   const { reportProgress } = useGameProgress();
 *   reportProgress({ current: 3, total: 5, isComplete: false });
 * 
 * Bila isComplete=true, shell akan enable butang "Seterusnya" dan
 * kira betul-betul untuk score akhir.
 */
export default function useGameProgress() {
  const ctx = useContext(RoundContext);
  const lastReportRef = useRef(null);

  const reportProgress = ({ current = 0, total = 1, isComplete = false }) => {
    // Avoid spam — only report when changed
    const key = `${current}/${total}/${isComplete}`;
    if (lastReportRef.current === key) return;
    lastReportRef.current = key;
    ctx?.onProgress?.({ current, total, isComplete });
  };

  // Reset cache on unmount (new round)
  useEffect(() => () => { lastReportRef.current = null; }, []);

  return { reportProgress, roundData: ctx?.roundData, roundIdx: ctx?.roundIdx ?? 0 };
}