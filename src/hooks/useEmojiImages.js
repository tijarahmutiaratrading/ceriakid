import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';

// Cache module-level supaya kamus emoji→imageUrl hanya di-fetch sekali per sesi.
let cache = null;
let inflight = null;

async function loadMap() {
  if (cache) return cache;
  if (inflight) return inflight;
  inflight = base44.entities.EmojiImage.filter({ status: 'done' }, '-created_date', 2000)
    .then(records => {
      const map = {};
      records.forEach(r => { if (r.emoji && r.imageUrl) map[r.emoji] = r.imageUrl; });
      cache = map;
      return map;
    })
    .catch(() => ({}))
    .finally(() => { inflight = null; });
  return inflight;
}

// Return { map, ready } — map: { '🚗': 'https://...' }
export default function useEmojiImages() {
  const [map, setMap] = useState(cache || {});
  const [ready, setReady] = useState(!!cache);

  useEffect(() => {
    let active = true;
    loadMap().then(m => {
      if (active) { setMap(m); setReady(true); }
    });
    return () => { active = false; };
  }, []);

  return { map, ready };
}