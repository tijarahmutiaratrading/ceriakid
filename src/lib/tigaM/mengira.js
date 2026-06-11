// 🔢 MENGIRA — disusun ikut Konstruk LINUS Numerasi rasmi.
// K1 pra-nombor & kenal angka → K2 membilang → K3 nilai nombor → K4 seriasi →
// K5 mata wang → K6 waktu → K7 operasi asas (tambah/tolak) → K11 aplikasi harian.
// Guna pelbagai mekanik mini-game (MiniGameModeRenderer).
import { makeRounds } from '../miniGames/_helpers.js';

export const mengiraGames = [
  // ── KONSTRUK 1: Pra-nombor & mengenal angka ──
  {
    id: 'kira-k1-kenal-angka',
    title: 'Konstruk 1: Kenal Angka',
    emoji: '1️⃣',
    mode: 'hidden_object',
    objective: 'Cari angka yang betul (0–20).',
    reward: 'Number badge',
    rounds: makeRounds([
      { target: '1', items: [{text:'1',value:'1'},{text:'2',value:'2'},{text:'3',value:'3'}] },
      { target: '4', items: [{text:'4',value:'4'},{text:'5',value:'5'},{text:'6',value:'6'}] },
      { target: '7', items: [{text:'7',value:'7'},{text:'8',value:'8'},{text:'9',value:'9'},{text:'10',value:'10'}] },
      { target: '5', items: [{text:'5',value:'5'},{text:'2',value:'2'},{text:'8',value:'8'},{text:'6',value:'6'}] },
      { target: '9', items: [{text:'9',value:'9'},{text:'6',value:'6'},{text:'3',value:'3'},{text:'8',value:'8'},{text:'4',value:'4'}] },
      { target: '10', items: [{text:'10',value:'10'},{text:'1',value:'1'},{text:'7',value:'7'},{text:'4',value:'4'},{text:'6',value:'6'}] },
      { target: '8', items: [{text:'8',value:'8'},{text:'3',value:'3'},{text:'6',value:'6'},{text:'9',value:'9'},{text:'2',value:'2'},{text:'5',value:'5'}] },
      { target: '13', items: [{text:'13',value:'13'},{text:'31',value:'31'},{text:'12',value:'12'},{text:'30',value:'30'},{text:'3',value:'3'},{text:'11',value:'11'}] },
      { target: '15', items: [{text:'15',value:'15'},{text:'51',value:'51'},{text:'14',value:'14'},{text:'50',value:'50'},{text:'5',value:'5'},{text:'16',value:'16'},{text:'13',value:'13'}] },
      { target: '20', items: [{text:'20',value:'20'},{text:'2',value:'2'},{text:'12',value:'12'},{text:'22',value:'22'},{text:'10',value:'10'},{text:'21',value:'21'},{text:'30',value:'30'},{text:'18',value:'18'}] },
    ]),
  },
  // ── KONSTRUK 2: Membilang objek ──
  {
    id: 'kira-k2-membilang',
    title: 'Konstruk 2: Membilang',
    emoji: '🍎',
    mode: 'typing_challenge',
    objective: 'Bilang bilangan objek & taip jumlahnya.',
    reward: 'Counting star',
    rounds: makeRounds([
      { prompt: '🍎🍎 — Berapa epal?', target: '2' },
      { prompt: '⭐⭐⭐ — Berapa bintang?', target: '3' },
      { prompt: '🐟🐟🐟🐟 — Berapa ikan?', target: '4' },
      { prompt: '🎈🎈🎈🎈🎈 — Berapa belon?', target: '5' },
      { prompt: '🍌🍌🍌🍌🍌🍌 — Berapa pisang?', target: '6' },
      { prompt: '🌸🌸🌸🌸🌸🌸🌸 — Berapa bunga?', target: '7' },
      { prompt: '🚗🚗🚗🚗🚗🚗🚗🚗 — Berapa kereta?', target: '8' },
      { prompt: '🐱🐱🐱🐱🐱🐱🐱🐱🐱 — Berapa kucing?', target: '9' },
      { prompt: '🎁🎁🎁🎁🎁🎁🎁🎁🎁🎁 — Berapa hadiah?', target: '10' },
      { prompt: '⚽⚽⚽⚽⚽⚽ ➕ ⚽⚽⚽⚽⚽⚽ — Jumlah bola?', target: '12' },
    ]),
  },
  // ── KONSTRUK 3: Memahami nilai nombor (ganjil/genap, besar/kecil) ──
  {
    id: 'kira-k3-nilai-nombor',
    title: 'Konstruk 3: Nilai Nombor',
    emoji: '⚖️',
    mode: 'swipe_select',
    objective: 'Kelaskan nombor — besar atau kecil, ganjil atau genap.',
    reward: 'Compare badge',
    rounds: makeRounds([
      { groups: ['Kecil', 'Besar'], items: [
        { text: '2', group: 'Kecil' }, { text: '9', group: 'Besar' }, { text: '1', group: 'Kecil' }, { text: '8', group: 'Besar' },
      ] },
      { groups: ['Kecil', 'Besar'], items: [
        { text: '3', group: 'Kecil' }, { text: '7', group: 'Besar' }, { text: '10', group: 'Besar' }, { text: '4', group: 'Kecil' },
      ] },
      { groups: ['Kurang 5', 'Lebih 5'], items: [
        { text: '2', group: 'Kurang 5' }, { text: '8', group: 'Lebih 5' }, { text: '6', group: 'Lebih 5' }, { text: '3', group: 'Kurang 5' },
      ] },
      { groups: ['Kurang 10', 'Lebih 10'], items: [
        { text: '7', group: 'Kurang 10' }, { text: '15', group: 'Lebih 10' }, { text: '12', group: 'Lebih 10' }, { text: '4', group: 'Kurang 10' },
      ] },
      { groups: ['Genap', 'Ganjil'], items: [
        { text: '2', group: 'Genap' }, { text: '3', group: 'Ganjil' }, { text: '4', group: 'Genap' }, { text: '5', group: 'Ganjil' },
      ] },
      { groups: ['Genap', 'Ganjil'], items: [
        { text: '6', group: 'Genap' }, { text: '7', group: 'Ganjil' }, { text: '8', group: 'Genap' }, { text: '9', group: 'Ganjil' },
      ] },
      { groups: ['Genap', 'Ganjil'], items: [
        { text: '10', group: 'Genap' }, { text: '11', group: 'Ganjil' }, { text: '12', group: 'Genap' }, { text: '13', group: 'Ganjil' }, { text: '14', group: 'Genap' },
      ] },
      { groups: ['Kurang 10', 'Lebih 10'], items: [
        { text: '8', group: 'Kurang 10' }, { text: '14', group: 'Lebih 10' }, { text: '9', group: 'Kurang 10' }, { text: '20', group: 'Lebih 10' }, { text: '6', group: 'Kurang 10' }, { text: '18', group: 'Lebih 10' },
      ] },
      { groups: ['Genap', 'Ganjil'], items: [
        { text: '15', group: 'Ganjil' }, { text: '16', group: 'Genap' }, { text: '17', group: 'Ganjil' }, { text: '18', group: 'Genap' }, { text: '19', group: 'Ganjil' }, { text: '20', group: 'Genap' },
      ] },
      { groups: ['Kurang 50', 'Lebih 50'], items: [
        { text: '30', group: 'Kurang 50' }, { text: '70', group: 'Lebih 50' }, { text: '45', group: 'Kurang 50' }, { text: '80', group: 'Lebih 50' }, { text: '25', group: 'Kurang 50' }, { text: '60', group: 'Lebih 50' }, { text: '90', group: 'Lebih 50' },
      ] },
    ]),
  },
  // ── KONSTRUK 4: Seriasi (susun nombor menaik/menurun & corak) ──
  {
    id: 'kira-k4-seriasi',
    title: 'Konstruk 4: Susun Seriasi',
    emoji: '🔁',
    mode: 'sequence',
    objective: 'Susun nombor ikut urutan & corak.',
    reward: 'Pattern brain',
    rounds: makeRounds([
      { items: ['1','2','3'], answer: ['1','2','3'] },
      { items: ['2','4','6'], answer: ['2','4','6'] },
      { items: ['1','2','3','4'], answer: ['1','2','3','4'] },
      { items: ['5','10','15','20'], answer: ['5','10','15','20'] },
      { items: ['2','4','6','8','10'], answer: ['2','4','6','8','10'] },
      { items: ['10','9','8','7','6'], answer: ['10','9','8','7','6'] },
      { items: ['1','3','5','7','9'], answer: ['1','3','5','7','9'] },
      { items: ['3','6','9','12','15'], answer: ['3','6','9','12','15'] },
      { items: ['10','20','30','40','50','60'], answer: ['10','20','30','40','50','60'] },
      { items: ['100','90','80','70','60','50'], answer: ['100','90','80','70','60','50'] },
    ]),
  },
  // ── KONSTRUK 5: Mengenal mata wang Malaysia ──
  {
    id: 'kira-k5-mata-wang',
    title: 'Konstruk 5: Mata Wang Malaysia',
    emoji: '💰',
    mode: 'typing_challenge',
    objective: 'Kira nilai duit syiling & not RM.',
    reward: 'Duit badge',
    rounds: makeRounds([
      { prompt: '🪙 10 sen + 🪙 10 sen = ? sen', target: '20' },
      { prompt: '🪙 20 sen + 🪙 5 sen = ? sen', target: '25' },
      { prompt: '🪙 50 sen + 🪙 50 sen = RM ?', target: '1' },
      { prompt: '💵 RM1 + 💵 RM1 = RM ?', target: '2' },
      { prompt: '💵 RM5 + 💵 RM5 = RM ?', target: '10' },
      { prompt: '💵 RM10 + 💵 RM5 = RM ?', target: '15' },
      { prompt: '💵 RM2 + 💵 RM2 + 💵 RM1 = RM ?', target: '5' },
      { prompt: '💵 RM20 - 💵 RM5 = RM ?', target: '15' },
      { prompt: 'Beli aiskrim RM3, bayar RM5. Baki = RM ?', target: '2' },
      { prompt: 'Beli buku RM12, bayar RM20. Baki = RM ?', target: '8' },
    ]),
  },
  // ── KONSTRUK 6: Menyatakan waktu ──
  {
    id: 'kira-k6-waktu',
    title: 'Konstruk 6: Menyatakan Waktu',
    emoji: '🕐',
    mode: 'hidden_object',
    objective: 'Pilih waktu yang betul ikut jam.',
    reward: 'Jam badge',
    rounds: makeRounds([
      { target: '🕐 1:00', items: [{text:'🕐 1:00'},{text:'🕒 3:00'},{text:'🕔 5:00'}] },
      { target: '🕕 6:00', items: [{text:'🕕 6:00'},{text:'🕗 8:00'},{text:'🕙 10:00'}] },
      { target: '🕛 12:00', items: [{text:'🕛 12:00'},{text:'🕘 9:00'},{text:'🕓 4:00'},{text:'🕖 7:00'}] },
      { target: 'Pagi 🌅', items: [{text:'Pagi 🌅'},{text:'Malam 🌙'},{text:'Tengah hari ☀️'}] },
      { target: 'Malam 🌙', items: [{text:'Malam 🌙'},{text:'Pagi 🌅'},{text:'Petang 🌇'},{text:'Tengah hari ☀️'}] },
      { target: 'Sarapan 🍳', items: [{text:'Sarapan 🍳'},{text:'Makan malam 🍽️'},{text:'Tidur 😴'},{text:'Mandi 🚿'}] },
      { target: '🕞 3:30', items: [{text:'🕞 3:30'},{text:'🕒 3:00'},{text:'🕟 4:30'},{text:'🕝 2:30'},{text:'🕓 4:00'}] },
      { target: '7 hari = 1 minggu', items: [{text:'7 hari = 1 minggu'},{text:'5 hari = 1 minggu'},{text:'10 hari = 1 minggu'},{text:'30 hari = 1 minggu'}] },
      { target: '12 bulan = 1 tahun', items: [{text:'12 bulan = 1 tahun'},{text:'10 bulan = 1 tahun'},{text:'7 bulan = 1 tahun'},{text:'24 bulan = 1 tahun'},{text:'6 bulan = 1 tahun'}] },
      { target: '60 minit = 1 jam', items: [{text:'60 minit = 1 jam'},{text:'30 minit = 1 jam'},{text:'100 minit = 1 jam'},{text:'24 minit = 1 jam'},{text:'12 minit = 1 jam'}] },
    ]),
  },
  // ── KONSTRUK 7: Operasi asas — Tambah ──
  {
    id: 'kira-k7-tambah',
    title: 'Konstruk 7: Tambah',
    emoji: '➕',
    mode: 'typing_challenge',
    objective: 'Selesaikan operasi tambah.',
    reward: 'Plus master',
    rounds: makeRounds([
      { prompt: '1 + 1 = ?', target: '2' },
      { prompt: '2 + 1 = ?', target: '3' },
      { prompt: '2 + 3 = ?', target: '5' },
      { prompt: '4 + 3 = ?', target: '7' },
      { prompt: '5 + 4 = ?', target: '9' },
      { prompt: '6 + 4 = ?', target: '10' },
      { prompt: '7 + 5 = ?', target: '12' },
      { prompt: '8 + 6 = ?', target: '14' },
      { prompt: '9 + 8 = ?', target: '17' },
      { prompt: '12 + 9 = ?', target: '21' },
    ]),
  },
  // ── KONSTRUK 7: Operasi asas — Tolak ──
  {
    id: 'kira-k7-tolak',
    title: 'Konstruk 7: Tolak',
    emoji: '➖',
    mode: 'typing_challenge',
    objective: 'Selesaikan operasi tolak.',
    reward: 'Minus master',
    rounds: makeRounds([
      { prompt: '2 - 1 = ?', target: '1' },
      { prompt: '3 - 1 = ?', target: '2' },
      { prompt: '5 - 2 = ?', target: '3' },
      { prompt: '7 - 3 = ?', target: '4' },
      { prompt: '9 - 4 = ?', target: '5' },
      { prompt: '10 - 4 = ?', target: '6' },
      { prompt: '12 - 5 = ?', target: '7' },
      { prompt: '15 - 7 = ?', target: '8' },
      { prompt: '18 - 9 = ?', target: '9' },
      { prompt: '20 - 8 = ?', target: '12' },
    ]),
  },
  // ── KONSTRUK 11: Aplikasi harian (masalah perkataan, nombor bulat) ──
  {
    id: 'kira-k11-aplikasi',
    title: 'Konstruk 11: Masalah Harian',
    emoji: '🧠',
    mode: 'typing_challenge',
    objective: 'Selesaikan masalah matematik harian.',
    reward: 'Problem solver',
    rounds: makeRounds([
      { prompt: 'Ali ada 3 gula-gula, beli 2 lagi. Jumlah?', target: '5' },
      { prompt: 'Ada 6 burung, 2 terbang pergi. Tinggal?', target: '4' },
      { prompt: 'Siti ada 4 belon, kakak beri 3. Jumlah?', target: '7' },
      { prompt: '10 biji telur, pecah 3. Tinggal?', target: '7' },
      { prompt: '5 murid + 5 murid masuk kelas. Jumlah?', target: '10' },
      { prompt: 'Ada 12 epal, makan 4. Tinggal?', target: '8' },
      { prompt: '3 kotak, setiap kotak 2 bola. Jumlah bola?', target: '6' },
      { prompt: '15 pelajar, 6 perempuan. Berapa lelaki?', target: '9' },
      { prompt: 'Beli 4 pen RM2 setiap satu. Jumlah bayar RM?', target: '8' },
      { prompt: '20 kerusi, susun 5 satu baris. Berapa baris?', target: '4' },
    ]),
  },
];