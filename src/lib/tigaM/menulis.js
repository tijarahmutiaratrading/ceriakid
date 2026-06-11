// ✍️ MENULIS — disusun ikut Konstruk LINUS Literasi BM rasmi (fokus MENULIS).
// Surih huruf → susun urutan abjad → tulis suku kata → bina perkataan terbuka →
// bina perkataan tertutup → tulis perkataan berimbuhan (Konstruk 10) → ayat mudah (Konstruk 11).
// Guna pelbagai mekanik mini-game (MiniGameModeRenderer).
import { makeRounds } from '../miniGames/_helpers.js';

export const menulisGames = [
  // ── KONSTRUK 1: Menulis huruf (surih) ──
  {
    id: 'tulis-k1-surih-huruf',
    title: 'Konstruk 1: Surih Huruf',
    emoji: '🅰️',
    mode: 'tracing',
    objective: 'Surih huruf vokal & konsonan ikut titik.',
    reward: 'Tracing star',
    rounds: makeRounds([
      { letters: ['A'] }, { letters: ['E'] }, { letters: ['I'] }, { letters: ['O'] }, { letters: ['U'] },
      { letters: ['B'] }, { letters: ['M'] }, { letters: ['S'] }, { letters: ['K'] }, { letters: ['R'] },
    ]),
  },
  // ── KONSTRUK 1: Susun urutan abjad (kemahiran tulis berurutan) ──
  {
    id: 'tulis-k1-urutan-abjad',
    title: 'Konstruk 1: Susun Abjad',
    emoji: '🔤',
    mode: 'sequence',
    objective: 'Susun huruf ikut urutan abjad sebelum menulis.',
    reward: 'ABC order',
    rounds: makeRounds([
      { items: ['A','B','C'], answer: ['A','B','C'] },
      { items: ['D','E','F'], answer: ['D','E','F'] },
      { items: ['A','B','C','D'], answer: ['A','B','C','D'] },
      { items: ['E','F','G','H'], answer: ['E','F','G','H'] },
      { items: ['A','B','C','D','E'], answer: ['A','B','C','D','E'] },
      { items: ['F','G','H','I','J'], answer: ['F','G','H','I','J'] },
      { items: ['A','B','C','D','E','F'], answer: ['A','B','C','D','E','F'] },
      { items: ['K','L','M','N','O','P'], answer: ['K','L','M','N','O','P'] },
      { items: ['A','B','C','D','E','F','G'], answer: ['A','B','C','D','E','F','G'] },
      { items: ['Q','R','S','T','U','V','W'], answer: ['Q','R','S','T','U','V','W'] },
    ]),
  },
  // ── KONSTRUK 2–3: Menulis suku kata & perkataan TERBUKA ──
  {
    id: 'tulis-k3-perkataan-terbuka',
    title: 'Konstruk 2–3: Tulis Perkataan Terbuka',
    emoji: '⌨️',
    mode: 'typing_challenge',
    objective: 'Taip perkataan suku kata terbuka (KV+KV).',
    reward: 'Typing terbuka',
    rounds: makeRounds([
      { prompt: 'Taip: BATU', target: 'batu' },
      { prompt: 'Taip: BUKU', target: 'buku' },
      { prompt: 'Taip: DADU', target: 'dadu' },
      { prompt: 'Taip: KUDA', target: 'kuda' },
      { prompt: 'Taip: MEJA', target: 'meja' },
      { prompt: 'Taip: SAPU', target: 'sapu' },
      { prompt: 'Taip: BOLA', target: 'bola' },
      { prompt: 'Taip: BAJU', target: 'baju' },
      { prompt: 'Taip: KELAPA', target: 'kelapa' },
      { prompt: 'Taip: KERETA', target: 'kereta' },
    ]),
  },
  // ── KONSTRUK 4–5: Menulis perkataan suku kata TERTUTUP (KVK) ──
  {
    id: 'tulis-k5-perkataan-tertutup',
    title: 'Konstruk 4–5: Tulis Perkataan Tertutup',
    emoji: '🧩',
    mode: 'wordbuilder',
    objective: 'Susun huruf jadi perkataan suku kata tertutup.',
    reward: 'Word tertutup',
    rounds: makeRounds([
      { target: 'BAS', letters: ['B','A','S'] },
      { target: 'CAT', letters: ['C','A','T'] },
      { target: 'KASUT', letters: ['K','A','S','U','T'] },
      { target: 'RUMAH', letters: ['R','U','M','A','H'] },
      { target: 'POKOK', letters: ['P','O','K','O','K'] },
      { target: 'LAMPU', letters: ['L','A','M','P','U'] },
      { target: 'PENSEL', letters: ['P','E','N','S','E','L'] },
      { target: 'TEMPAT', letters: ['T','E','M','P','A','T'] },
      { target: 'BASKET', letters: ['B','A','S','K','E','T'] },
      { target: 'KOMPUTER', letters: ['K','O','M','P','U','T','E','R'] },
    ]),
  },
  // ── KONSTRUK 10: Menulis perkataan berimbuhan awalan & akhiran ──
  {
    id: 'tulis-k10-imbuhan',
    title: 'Konstruk 10: Perkataan Berimbuhan',
    emoji: '🔗',
    mode: 'wordbuilder',
    objective: 'Cantum imbuhan untuk bina perkataan (cth: ber+main).',
    reward: 'Imbuhan badge',
    rounds: makeRounds([
      { target: 'BERMAIN', letters: ['BER','MAIN'] },
      { target: 'MEMBACA', letters: ['MEM','BACA'] },
      { target: 'MAKANAN', letters: ['MAKAN','AN'] },
      { target: 'BERLARI', letters: ['BER','LARI'] },
      { target: 'MELUKIS', letters: ['ME','LUKIS'] },
      { target: 'PERMAINAN', letters: ['PER','MAIN','AN'] },
      { target: 'PELAJARAN', letters: ['PE','LAJAR','AN'] },
      { target: 'MENULIS', letters: ['ME','NULIS'] },
      { target: 'KEBERSIHAN', letters: ['KE','BERSIH','AN'] },
      { target: 'MEMBERSIHKAN', letters: ['MEM','BERSIH','KAN'] },
    ]),
  },
  // ── KONSTRUK 11: Menulis ayat mudah (susun perkataan jadi ayat) ──
  {
    id: 'tulis-k11-ayat-mudah',
    title: 'Konstruk 11: Susun Ayat Mudah',
    emoji: '📝',
    mode: 'sequence',
    objective: 'Susun perkataan ikut urutan jadi ayat yang betul.',
    reward: 'Ayat badge',
    rounds: makeRounds([
      { items: ['Saya','makan','nasi'], answer: ['Saya','makan','nasi'] },
      { items: ['Ali','bermain','bola'], answer: ['Ali','bermain','bola'] },
      { items: ['Ibu','memasak','di','dapur'], answer: ['Ibu','memasak','di','dapur'] },
      { items: ['Adik','membaca','buku','cerita'], answer: ['Adik','membaca','buku','cerita'] },
      { items: ['Kucing','itu','minum','susu'], answer: ['Kucing','itu','minum','susu'] },
      { items: ['Saya','pergi','ke','sekolah'], answer: ['Saya','pergi','ke','sekolah'] },
      { items: ['Bapa','membaca','surat','khabar','pagi'], answer: ['Bapa','membaca','surat','khabar','pagi'] },
      { items: ['Burung','itu','terbang','tinggi','sekali'], answer: ['Burung','itu','terbang','tinggi','sekali'] },
      { items: ['Kami','suka','bermain','di','taman'], answer: ['Kami','suka','bermain','di','taman'] },
      { items: ['Pelajar','itu','menulis','karangan','dengan','tekun'], answer: ['Pelajar','itu','menulis','karangan','dengan','tekun'] },
    ]),
  },
];