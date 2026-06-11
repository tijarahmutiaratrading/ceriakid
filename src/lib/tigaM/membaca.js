// 📖 MEMBACA — disusun ikut Konstruk LINUS Literasi BM rasmi (Konstruk 1–8).
// Fokus kemahiran MEMBACA: kenal huruf → suku kata terbuka → perkataan terbuka →
// suku kata tertutup → perkataan tertutup → 'ng' → diftong → vokal berganding.
// Guna pelbagai mekanik mini-game (MiniGameModeRenderer).
import { makeRounds } from '../miniGames/_helpers.js';

export const membacaGames = [
  // ── KONSTRUK 1: Membaca huruf vokal & konsonan ──
  {
    id: 'baca-k1-huruf',
    title: 'Konstruk 1: Kenal Huruf',
    emoji: '🔤',
    mode: 'hidden_object',
    objective: 'Cari huruf vokal & konsonan yang betul.',
    reward: 'Huruf badge',
    rounds: makeRounds([
      { target: 'A', items: [{text:'A',value:'a'},{text:'B',value:'b'},{text:'C',value:'c'}] },
      { target: 'E', items: [{text:'E',value:'e'},{text:'F',value:'f'},{text:'I',value:'i'}] },
      { target: 'I', items: [{text:'I',value:'i'},{text:'J',value:'j'},{text:'K',value:'k'},{text:'L',value:'l'}] },
      { target: 'O', items: [{text:'O',value:'o'},{text:'P',value:'p'},{text:'Q',value:'q'},{text:'U',value:'u'}] },
      { target: 'U', items: [{text:'U',value:'u'},{text:'V',value:'v'},{text:'W',value:'w'},{text:'O',value:'o'},{text:'A',value:'a'}] },
      { target: 'M', items: [{text:'M',value:'m'},{text:'N',value:'n'},{text:'W',value:'w'},{text:'V',value:'v'},{text:'U',value:'u'}] },
      { target: 'S', items: [{text:'S',value:'s'},{text:'Z',value:'z'},{text:'C',value:'c'},{text:'G',value:'g'},{text:'O',value:'o'},{text:'Q',value:'q'}] },
      { target: 'B', items: [{text:'B',value:'b'},{text:'D',value:'d'},{text:'P',value:'p'},{text:'R',value:'r'},{text:'F',value:'f'},{text:'E',value:'e'}] },
      { target: 'D', items: [{text:'D',value:'d'},{text:'B',value:'b'},{text:'P',value:'p'},{text:'O',value:'o'},{text:'Q',value:'q'},{text:'G',value:'g'},{text:'C',value:'c'}] },
      { target: 'K', items: [{text:'K',value:'k'},{text:'X',value:'x'},{text:'H',value:'h'},{text:'R',value:'r'},{text:'N',value:'n'},{text:'M',value:'m'},{text:'A',value:'a'},{text:'V',value:'v'}] },
    ]),
  },
  // ── KONSTRUK 2: Membaca suku kata TERBUKA (KV) ──
  {
    id: 'baca-k2-suku-terbuka',
    title: 'Konstruk 2: Suku Kata Terbuka',
    emoji: '🅰️',
    mode: 'tilematch',
    objective: 'Padankan suku kata terbuka (KV) yang sama.',
    reward: 'Suku terbuka',
    rounds: makeRounds([
      { tiles: ['BA', 'BA', 'BI', 'BI'] },
      { tiles: ['BU', 'BU', 'BO', 'BO'] },
      { tiles: ['MA', 'MA', 'MI', 'MI', 'MU', 'MU'] },
      { tiles: ['KA', 'KA', 'KI', 'KI', 'KU', 'KU'] },
      { tiles: ['SA', 'SA', 'SI', 'SI', 'SU', 'SU', 'SE', 'SE'] },
      { tiles: ['LA', 'LA', 'LI', 'LI', 'LU', 'LU', 'LO', 'LO'] },
      { tiles: ['TA', 'TA', 'TI', 'TI', 'TU', 'TU', 'TE', 'TE'] },
      { tiles: ['NA', 'NA', 'NI', 'NI', 'NU', 'NU', 'NE', 'NE', 'NO', 'NO'] },
      { tiles: ['PA', 'PA', 'PI', 'PI', 'PU', 'PU', 'PE', 'PE', 'PO', 'PO'] },
      { tiles: ['GA', 'GA', 'GI', 'GI', 'GU', 'GU', 'GE', 'GE', 'GO', 'GO', 'JA', 'JA'] },
    ]),
  },
  // ── KONSTRUK 3: Membaca perkataan suku kata TERBUKA (KV+KV) ──
  {
    id: 'baca-k3-perkataan-terbuka',
    title: 'Konstruk 3: Perkataan Suku Terbuka',
    emoji: '🧩',
    mode: 'wordbuilder',
    objective: 'Bina perkataan suku kata terbuka (cth: BA+TU).',
    reward: 'Word terbuka',
    rounds: makeRounds([
      { target: 'BABA', letters: ['BA','BA'] },
      { target: 'MAMA', letters: ['MA','MA'] },
      { target: 'BATU', letters: ['BA','TU'] },
      { target: 'BUKU', letters: ['BU','KU'] },
      { target: 'DADU', letters: ['DA','DU'] },
      { target: 'SAPU', letters: ['SA','PU'] },
      { target: 'KUDA', letters: ['KU','DA'] },
      { target: 'MEJA', letters: ['ME','JA'] },
      { target: 'KELAPA', letters: ['KE','LA','PA'] },
      { target: 'KERETA', letters: ['KE','RE','TA'] },
    ]),
  },
  // ── KONSTRUK 4 & 5: Suku kata & perkataan suku kata TERTUTUP (KVK) ──
  {
    id: 'baca-k5-perkataan-tertutup',
    title: 'Konstruk 4–5: Suku Kata Tertutup',
    emoji: '🔡',
    mode: 'wordbuilder',
    objective: 'Bina perkataan suku kata tertutup (KVK).',
    reward: 'Word tertutup',
    rounds: makeRounds([
      { target: 'BAS', letters: ['BAS'] },
      { target: 'CAT', letters: ['CAT'] },
      { target: 'BOLA', letters: ['BO','LA'] },
      { target: 'KASUT', letters: ['KA','SUT'] },
      { target: 'BASKET', letters: ['BAS','KET'] },
      { target: 'KAMBING', letters: ['KAM','BING'] },
      { target: 'TEMPAT', letters: ['TEM','PAT'] },
      { target: 'LAMPU', letters: ['LAM','PU'] },
      { target: 'PENSEL', letters: ['PEN','SEL'] },
      { target: 'KOMPUTER', letters: ['KOM','PU','TER'] },
    ]),
  },
  // ── KONSTRUK 6: Perkataan dengan suku kata tertutup 'ng' ──
  {
    id: 'baca-k6-ng',
    title: 'Konstruk 6: Bunyi "ng"',
    emoji: '🎵',
    mode: 'hidden_object',
    objective: 'Cari perkataan yang ada bunyi "ng".',
    reward: 'NG badge',
    rounds: makeRounds([
      { target: 'BUNGA', items: [{text:'BUNGA'},{text:'BUKU'},{text:'BATU'}] },
      { target: 'TANGAN', items: [{text:'TANGAN'},{text:'TALAM'},{text:'TASIK'}] },
      { target: 'BINTANG', items: [{text:'BINTANG'},{text:'BISKUT'},{text:'BOLA'},{text:'BATAS'}] },
      { target: 'KANGKUNG', items: [{text:'KANGKUNG'},{text:'KASUT'},{text:'KAMERA'},{text:'KATIL'}] },
      { target: 'LADANG', items: [{text:'LADANG'},{text:'LAMPU'},{text:'LARI'},{text:'LAUK'},{text:'LABU'}] },
      { target: 'TONGKAT', items: [{text:'TONGKAT'},{text:'TOPI'},{text:'TIKAR'},{text:'TALI'},{text:'TUDUNG'}] },
      { target: 'JAGUNG', items: [{text:'JAGUNG'},{text:'JALAN'},{text:'JARI'},{text:'JAM'},{text:'JALA'},{text:'JAGA'}] },
      { target: 'GUNUNG', items: [{text:'GUNUNG'},{text:'GIGI'},{text:'GARAM'},{text:'GULA'},{text:'GARPU'},{text:'GETAH'}] },
      { target: 'BURUNG', items: [{text:'BURUNG'},{text:'BANTAL'},{text:'BUKIT'},{text:'BAJU'},{text:'BATU'},{text:'BOLA'},{text:'BAKUL'}] },
      { target: 'PAYUNG', items: [{text:'PAYUNG'},{text:'PINTU'},{text:'PASU'},{text:'POKOK'},{text:'PAGAR'},{text:'PANTUN'},{text:'PISAU'},{text:'PAKU'}] },
    ]),
  },
  // ── KONSTRUK 7 & 8: Diftong (ai, au, oi) & vokal berganding ──
  {
    id: 'baca-k7-diftong',
    title: 'Konstruk 7–8: Diftong (ai, au, oi)',
    emoji: '🖼️',
    mode: 'tilematch',
    objective: 'Padankan perkataan diftong dengan gambar.',
    reward: 'Diftong star',
    rounds: makeRounds([
      { tiles: ['Harimau', '🐯', 'Kerbau', '🐃'] },
      { tiles: ['Pisau', '🔪', 'Pulau', '🏝️'] },
      { tiles: ['Kedai', '🏪', 'Limau', '🍊', 'Sungai', '🏞️'] },
      { tiles: ['Pantai', '🏖️', 'Tupai', '🐿️', 'Kuih', '🧁'] },
      { tiles: ['Harimau', '🐯', 'Pisau', '🔪', 'Limau', '🍊', 'Pulau', '🏝️'] },
      { tiles: ['Pantai', '🏖️', 'Sungai', '🏞️', 'Tupai', '🐿️', 'Kedai', '🏪'] },
      { tiles: ['Kerbau', '🐃', 'Buaya', '🐊', 'Kuih', '🧁', 'Air', '💧', 'Daun', '🍃'] },
      { tiles: ['Pisau', '🔪', 'Limau', '🍊', 'Pantai', '🏖️', 'Tupai', '🐿️', 'Pulau', '🏝️'] },
      { tiles: ['Harimau', '🐯', 'Kerbau', '🐃', 'Buaya', '🐊', 'Kedai', '🏪', 'Sungai', '🏞️', 'Laut', '🌊'] },
      { tiles: ['Pantai', '🏖️', 'Pisau', '🔪', 'Limau', '🍊', 'Tupai', '🐿️', 'Kuih', '🧁', 'Daun', '🍃', 'Air', '💧'] },
    ]),
  },
];