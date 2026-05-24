// Seed hand-crafted subject game blueprints ke DB.
// Approach: WIPE games sedia ada untuk subjek+ageGroup yang relevan, lepas itu insert blueprints baru.
// Hanya admin boleh jalankan. Returns summary of changes.

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Import blueprints inline (functions cannot import from /src)
const PRASEKOLAH_BM = [
  { id: 'pra-bm-huruf-vokal', title: 'Huruf Vokal A E I O U', emoji: '🔤', subject: 'bahasa_melayu', ageGroup: 'prasekolah', difficulty: 'easy', topic: 'Huruf Vokal', order: 1, questions: [
    { problem: 'Yang manakah huruf VOKAL?', options: ['B', 'A', 'C', 'D'], answer: 1, emoji: '🅰️' },
    { problem: 'Pilih huruf vokal:', options: ['M', 'N', 'E', 'P'], answer: 2, emoji: '🅴' },
    { problem: 'Yang manakah huruf vokal?', options: ['I', 'J', 'K', 'L'], answer: 0, emoji: '🅸' },
    { problem: 'Pilih huruf vokal:', options: ['R', 'S', 'T', 'O'], answer: 3, emoji: '🅾️' },
    { problem: 'Yang manakah huruf vokal?', options: ['V', 'U', 'W', 'X'], answer: 1, emoji: '🆄' },
    { problem: "Huruf 'B' adalah huruf...", options: ['Vokal', 'Konsonan', 'Nombor', 'Simbol'], answer: 1, emoji: '🔡' },
    { problem: 'Berapa huruf vokal dalam Bahasa Melayu?', options: ['3', '4', '5', '6'], answer: 2, emoji: '🔢' },
    { problem: "Perkataan 'IBU' bermula dengan huruf...", options: ['Konsonan', 'Vokal', 'Nombor', 'Simbol'], answer: 1, emoji: '👩' },
    { problem: "Huruf vokal dalam 'API' ialah...", options: ['A dan P', 'A dan I', 'P dan I', 'Tiada'], answer: 1, emoji: '🔥' },
    { problem: 'Pilih huruf yang BUKAN vokal:', options: ['A', 'E', 'B', 'I'], answer: 2, emoji: '❌' },
  ]},
  { id: 'pra-bm-suku-kata-kv', title: 'Suku Kata KV (Ba, Bi, Bu)', emoji: '📖', subject: 'bahasa_melayu', ageGroup: 'prasekolah', difficulty: 'easy', topic: 'Suku Kata KV', order: 2, questions: [
    { problem: 'BA + TU = ?', options: ['BATU', 'BUTA', 'BITA', 'BETA'], answer: 0, emoji: '🪨' },
    { problem: 'BU + KU = ?', options: ['BAKU', 'BUKU', 'BIKU', 'BOKU'], answer: 1, emoji: '📚' },
    { problem: 'KU + DA = ?', options: ['KEDA', 'KUDA', 'KIDA', 'KODA'], answer: 1, emoji: '🐴' },
    { problem: 'BU + LU = ?', options: ['BALU', 'BILU', 'BULU', 'BELU'], answer: 2, emoji: '🪶' },
    { problem: 'BA + JU = ?', options: ['BAJU', 'BUJU', 'BIJU', 'BEJU'], answer: 0, emoji: '👕' },
    { problem: 'PI + SU = ?', options: ['PASU', 'PISU', 'POSU', 'PUSU'], answer: 1, emoji: '🔪' },
    { problem: 'BO + LA = ?', options: ['BELA', 'BILA', 'BOLA', 'BULA'], answer: 2, emoji: '⚽' },
    { problem: 'GI + GI = ?', options: ['GAGA', 'GIGI', 'GUGU', 'GEGE'], answer: 1, emoji: '🦷' },
    { problem: 'MA + TA = ?', options: ['MATA', 'MITA', 'MUTA', 'META'], answer: 0, emoji: '👁️' },
    { problem: 'KA + KI = ?', options: ['KEKI', 'KIKI', 'KAKI', 'KUKI'], answer: 2, emoji: '🦵' },
  ]},
  { id: 'pra-bm-nama-haiwan', title: 'Nama Haiwan', emoji: '🐾', subject: 'bahasa_melayu', ageGroup: 'prasekolah', difficulty: 'easy', topic: 'Perbendaharaan Kata — Haiwan', order: 3, questions: [
    { problem: 'Haiwan apakah ini? 🐱', options: ['Kucing', 'Anjing', 'Tikus', 'Arnab'], answer: 0, emoji: '🐱' },
    { problem: 'Haiwan apakah ini? 🐶', options: ['Kucing', 'Anjing', 'Lembu', 'Ayam'], answer: 1, emoji: '🐶' },
    { problem: 'Haiwan apakah ini? 🐘', options: ['Harimau', 'Singa', 'Gajah', 'Kuda'], answer: 2, emoji: '🐘' },
    { problem: 'Haiwan apakah ini? 🐯', options: ['Kucing', 'Singa', 'Beruang', 'Harimau'], answer: 3, emoji: '🐯' },
    { problem: 'Haiwan apakah ini? 🐔', options: ['Ayam', 'Itik', 'Burung', 'Angsa'], answer: 0, emoji: '🐔' },
    { problem: 'Haiwan apakah ini? 🐟', options: ['Udang', 'Ikan', 'Ketam', 'Sotong'], answer: 1, emoji: '🐟' },
    { problem: 'Haiwan apakah ini? 🦋', options: ['Lebah', 'Lalat', 'Rama-rama', 'Nyamuk'], answer: 2, emoji: '🦋' },
    { problem: 'Haiwan apakah ini? 🐰', options: ['Tikus', 'Tupai', 'Hamster', 'Arnab'], answer: 3, emoji: '🐰' },
    { problem: 'Haiwan apakah ini? 🐄', options: ['Lembu', 'Kambing', 'Kerbau', 'Kuda'], answer: 0, emoji: '🐄' },
    { problem: 'Haiwan apakah ini? 🐍', options: ['Cacing', 'Ular', 'Belut', 'Lintah'], answer: 1, emoji: '🐍' },
  ]},
  { id: 'pra-bm-warna', title: 'Nama Warna', emoji: '🌈', subject: 'bahasa_melayu', ageGroup: 'prasekolah', difficulty: 'easy', topic: 'Perbendaharaan Kata — Warna', order: 4, questions: [
    { problem: 'Apakah warna ini? 🔴', options: ['Merah', 'Biru', 'Kuning', 'Hijau'], answer: 0, emoji: '🔴' },
    { problem: 'Apakah warna ini? 🔵', options: ['Merah', 'Biru', 'Hijau', 'Ungu'], answer: 1, emoji: '🔵' },
    { problem: 'Apakah warna ini? 🟢', options: ['Merah', 'Biru', 'Hijau', 'Kuning'], answer: 2, emoji: '🟢' },
    { problem: 'Apakah warna ini? 🟡', options: ['Merah', 'Biru', 'Hijau', 'Kuning'], answer: 3, emoji: '🟡' },
    { problem: 'Apakah warna ini? 🟣', options: ['Ungu', 'Merah', 'Hijau', 'Biru'], answer: 0, emoji: '🟣' },
    { problem: 'Apakah warna ini? 🟠', options: ['Hijau', 'Jingga', 'Kuning', 'Merah'], answer: 1, emoji: '🟠' },
    { problem: 'Apakah warna ini? ⚫', options: ['Putih', 'Kelabu', 'Hitam', 'Coklat'], answer: 2, emoji: '⚫' },
    { problem: 'Apakah warna ini? ⚪', options: ['Hitam', 'Kelabu', 'Krim', 'Putih'], answer: 3, emoji: '⚪' },
    { problem: 'Apakah warna ini? 🟤', options: ['Coklat', 'Hitam', 'Merah', 'Kelabu'], answer: 0, emoji: '🟤' },
    { problem: 'Apakah warna ini? 🩷', options: ['Merah', 'Merah Jambu', 'Ungu', 'Jingga'], answer: 1, emoji: '🩷' },
  ]},
  { id: 'pra-bm-nama-buah', title: 'Nama Buah-Buahan', emoji: '🍎', subject: 'bahasa_melayu', ageGroup: 'prasekolah', difficulty: 'easy', topic: 'Perbendaharaan Kata — Buah', order: 5, questions: [
    { problem: 'Buah apakah ini? 🍎', options: ['Epal', 'Pisang', 'Oren', 'Mangga'], answer: 0, emoji: '🍎' },
    { problem: 'Buah apakah ini? 🍌', options: ['Epal', 'Pisang', 'Oren', 'Mangga'], answer: 1, emoji: '🍌' },
    { problem: 'Buah apakah ini? 🍊', options: ['Epal', 'Pisang', 'Oren', 'Tembikai'], answer: 2, emoji: '🍊' },
    { problem: 'Buah apakah ini? 🥭', options: ['Epal', 'Oren', 'Pisang', 'Mangga'], answer: 3, emoji: '🥭' },
    { problem: 'Buah apakah ini? 🍇', options: ['Anggur', 'Strawberi', 'Ceri', 'Plum'], answer: 0, emoji: '🍇' },
    { problem: 'Buah apakah ini? 🍓', options: ['Anggur', 'Strawberi', 'Ceri', 'Raspberi'], answer: 1, emoji: '🍓' },
    { problem: 'Buah apakah ini? 🍉', options: ['Limau', 'Oren', 'Tembikai', 'Belimbing'], answer: 2, emoji: '🍉' },
    { problem: 'Buah apakah ini? 🍍', options: ['Pisang', 'Oren', 'Mangga', 'Nanas'], answer: 3, emoji: '🍍' },
    { problem: 'Buah apakah ini? 🥥', options: ['Kelapa', 'Durian', 'Manggis', 'Rambutan'], answer: 0, emoji: '🥥' },
    { problem: 'Buah apakah ini? 🫐', options: ['Anggur', 'Bluberi', 'Ceri', 'Plum'], answer: 1, emoji: '🫐' },
  ]},
  { id: 'pra-bm-anggota-badan', title: 'Anggota Badan', emoji: '👤', subject: 'bahasa_melayu', ageGroup: 'prasekolah', difficulty: 'easy', topic: 'Perbendaharaan Kata — Badan', order: 6, questions: [
    { problem: 'Yang mana digunakan untuk MELIHAT?', options: ['Telinga', 'Mata', 'Hidung', 'Mulut'], answer: 1, emoji: '👁️' },
    { problem: 'Yang mana digunakan untuk MENDENGAR?', options: ['Telinga', 'Mata', 'Mulut', 'Tangan'], answer: 0, emoji: '👂' },
    { problem: 'Yang mana digunakan untuk MENCIUM bau?', options: ['Mulut', 'Mata', 'Hidung', 'Telinga'], answer: 2, emoji: '👃' },
    { problem: 'Yang mana digunakan untuk MAKAN?', options: ['Hidung', 'Mata', 'Telinga', 'Mulut'], answer: 3, emoji: '👄' },
    { problem: 'Yang mana digunakan untuk BERJALAN?', options: ['Kaki', 'Tangan', 'Mata', 'Telinga'], answer: 0, emoji: '🦵' },
    { problem: 'Yang mana digunakan untuk MEMEGANG?', options: ['Kaki', 'Tangan', 'Hidung', 'Mata'], answer: 1, emoji: '✋' },
    { problem: 'Berapa MATA yang kita ada?', options: ['1', '2', '3', '4'], answer: 1, emoji: '👀' },
    { problem: 'Berapa HIDUNG yang kita ada?', options: ['2', '3', '1', '4'], answer: 2, emoji: '👃' },
    { problem: 'Bahagian badan untuk berfikir ialah...', options: ['Perut', 'Hati', 'Otak', 'Tangan'], answer: 2, emoji: '🧠' },
    { problem: 'Yang membantu kita BERNAFAS ialah...', options: ['Paru-paru', 'Hati', 'Jantung', 'Perut'], answer: 0, emoji: '🫁' },
  ]},
  { id: 'pra-bm-keluarga', title: 'Ahli Keluarga', emoji: '👨‍👩‍👧‍👦', subject: 'bahasa_melayu', ageGroup: 'prasekolah', difficulty: 'easy', topic: 'Keluarga', order: 7, questions: [
    { problem: 'Ibu kepada ibu saya ialah...', options: ['Nenek', 'Mak Cik', 'Kakak', 'Adik'], answer: 0, emoji: '👵' },
    { problem: 'Bapa kepada bapa saya ialah...', options: ['Pak Cik', 'Datuk', 'Abang', 'Bapa Saudara'], answer: 1, emoji: '👴' },
    { problem: 'Anak lelaki kepada ibu bapa saya ialah...', options: ['Bapa', 'Datuk', 'Abang atau adik lelaki', 'Pak Cik'], answer: 2, emoji: '👦' },
    { problem: 'Adik perempuan kepada ibu saya ialah...', options: ['Nenek', 'Kakak', 'Datuk', 'Mak Cik'], answer: 3, emoji: '👩' },
    { problem: 'Adik lelaki kepada bapa saya ialah...', options: ['Bapa Saudara / Pak Cik', 'Datuk', 'Abang', 'Sepupu'], answer: 0, emoji: '👨' },
    { problem: 'Anak kepada Pak Cik saya ialah...', options: ['Adik', 'Sepupu', 'Datuk', 'Ibu'], answer: 1, emoji: '🧒' },
    { problem: 'Yang melahirkan saya ialah...', options: ['Bapa', 'Nenek', 'Ibu', 'Kakak'], answer: 2, emoji: '🤱' },
    { problem: 'Yang menjaga rumah dan bekerja untuk keluarga ialah...', options: ['Saya', 'Adik', 'Nenek', 'Ibu Bapa'], answer: 3, emoji: '👨‍👩‍👧' },
    { problem: 'Saya panggil ibu kepada bapa saya...', options: ['Nenek', 'Mak Cik', 'Ibu', 'Sepupu'], answer: 0, emoji: '👵' },
    { problem: 'Berapa orang ahli keluarga teras (ibu, bapa, anak)?', options: ['1', '3 atau lebih', '2', '0'], answer: 1, emoji: '👨‍👩‍👧‍👦' },
  ]},
  { id: 'pra-bm-perkataan-mudah', title: 'Eja Perkataan Mudah', emoji: '✏️', subject: 'bahasa_melayu', ageGroup: 'prasekolah', difficulty: 'medium', topic: 'Ejaan Asas', order: 8, questions: [
    { problem: "Eja yang betul untuk 🐱:", options: ['Kucing', 'Kuching', 'Cucing', 'Kucink'], answer: 0, emoji: '🐱' },
    { problem: "Eja yang betul untuk 🏠:", options: ['Rumeh', 'Rumah', 'Romah', 'Rumaa'], answer: 1, emoji: '🏠' },
    { problem: "Eja yang betul untuk 🚗:", options: ['Karita', 'Kerita', 'Kereta', 'Kerete'], answer: 2, emoji: '🚗' },
    { problem: "Eja yang betul untuk 📚:", options: ['Beku', 'Boko', 'Bukoh', 'Buku'], answer: 3, emoji: '📚' },
    { problem: "Eja yang betul untuk 🍎:", options: ['Epal', 'Epel', 'Apel', 'Epol'], answer: 0, emoji: '🍎' },
    { problem: "Eja yang betul untuk 👁️:", options: ['Meta', 'Mata', 'Muta', 'Mete'], answer: 1, emoji: '👁️' },
    { problem: "Eja yang betul untuk ☀️:", options: ['Matahri', 'Mtahari', 'Matahari', 'Mataharee'], answer: 2, emoji: '☀️' },
    { problem: "Eja yang betul untuk 🌧️:", options: ['Hojan', 'Hujen', 'Hugen', 'Hujan'], answer: 3, emoji: '🌧️' },
    { problem: "Eja yang betul untuk 🐟:", options: ['Ikan', 'Ekan', 'Ican', 'Ikon'], answer: 0, emoji: '🐟' },
    { problem: "Eja yang betul untuk 👨‍👩‍👧:", options: ['Kluarga', 'Keluarga', 'Keluwarga', 'Keloarga'], answer: 1, emoji: '👨‍👩‍👧' },
  ]},
];

const PRASEKOLAH_MATH = [
  { id: 'pra-mat-kira-1-5', title: 'Kira 1 hingga 5', emoji: '🔢', subject: 'mathematics', ageGroup: 'prasekolah', difficulty: 'easy', topic: 'Membilang 1-5', order: 1, questions: [
    { problem: 'Berapa? 🍎', options: ['1', '2', '3', '4'], answer: 0, emoji: '🍎' },
    { problem: 'Berapa? 🍎🍎', options: ['1', '2', '3', '4'], answer: 1, emoji: '🍎' },
    { problem: 'Berapa? 🍎🍎🍎', options: ['1', '2', '3', '4'], answer: 2, emoji: '🍎' },
    { problem: 'Berapa? 🍎🍎🍎🍎', options: ['2', '3', '4', '5'], answer: 2, emoji: '🍎' },
    { problem: 'Berapa? 🍎🍎🍎🍎🍎', options: ['3', '4', '5', '6'], answer: 2, emoji: '🍎' },
    { problem: 'Berapa? ⭐⭐', options: ['1', '2', '3', '4'], answer: 1, emoji: '⭐' },
    { problem: 'Berapa? 🐱🐱🐱', options: ['2', '3', '4', '5'], answer: 1, emoji: '🐱' },
    { problem: 'Selepas 2 ialah...', options: ['1', '3', '4', '5'], answer: 1, emoji: '🔢' },
    { problem: 'Selepas 4 ialah...', options: ['3', '4', '5', '6'], answer: 2, emoji: '🔢' },
    { problem: 'Sebelum 3 ialah...', options: ['1', '2', '4', '5'], answer: 1, emoji: '🔢' },
  ]},
  { id: 'pra-mat-kira-6-10', title: 'Kira 6 hingga 10', emoji: '🔟', subject: 'mathematics', ageGroup: 'prasekolah', difficulty: 'easy', topic: 'Membilang 6-10', order: 2, questions: [
    { problem: 'Berapa? ⭐⭐⭐⭐⭐⭐', options: ['5', '6', '7', '8'], answer: 1, emoji: '⭐' },
    { problem: 'Berapa? ⭐⭐⭐⭐⭐⭐⭐', options: ['6', '7', '8', '9'], answer: 1, emoji: '⭐' },
    { problem: 'Berapa? ⭐⭐⭐⭐⭐⭐⭐⭐', options: ['7', '8', '9', '10'], answer: 1, emoji: '⭐' },
    { problem: 'Berapa? ⭐⭐⭐⭐⭐⭐⭐⭐⭐', options: ['8', '9', '10', '11'], answer: 1, emoji: '⭐' },
    { problem: 'Berapa? ⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐', options: ['9', '10', '11', '12'], answer: 1, emoji: '⭐' },
    { problem: 'Selepas 6 ialah...', options: ['5', '7', '8', '9'], answer: 1, emoji: '🔢' },
    { problem: 'Selepas 9 ialah...', options: ['8', '11', '10', '12'], answer: 2, emoji: '🔢' },
    { problem: 'Sebelum 8 ialah...', options: ['6', '7', '9', '10'], answer: 1, emoji: '🔢' },
    { problem: '5, 6, 7, __, 9. Yang hilang ialah...', options: ['6', '7', '8', '10'], answer: 2, emoji: '❓' },
    { problem: '6, __, 8, 9, 10. Yang hilang ialah...', options: ['5', '6', '7', '11'], answer: 2, emoji: '❓' },
  ]},
  { id: 'pra-mat-tambah-mudah', title: 'Tambah Mudah (Jumlah ≤ 10)', emoji: '➕', subject: 'mathematics', ageGroup: 'prasekolah', difficulty: 'easy', topic: 'Tambah Asas', order: 3, questions: [
    { problem: '1 + 1 = ?', options: ['1', '2', '3', '4'], answer: 1, emoji: '➕' },
    { problem: '2 + 1 = ?', options: ['2', '3', '4', '5'], answer: 1, emoji: '➕' },
    { problem: '2 + 2 = ?', options: ['3', '4', '5', '6'], answer: 1, emoji: '➕' },
    { problem: '3 + 2 = ?', options: ['4', '5', '6', '7'], answer: 1, emoji: '➕' },
    { problem: '4 + 1 = ?', options: ['4', '5', '6', '7'], answer: 1, emoji: '➕' },
    { problem: '3 + 3 = ?', options: ['5', '6', '7', '8'], answer: 1, emoji: '➕' },
    { problem: '4 + 3 = ?', options: ['6', '7', '8', '9'], answer: 1, emoji: '➕' },
    { problem: '5 + 2 = ?', options: ['6', '7', '8', '9'], answer: 1, emoji: '➕' },
    { problem: '5 + 5 = ?', options: ['8', '9', '10', '11'], answer: 2, emoji: '➕' },
    { problem: '6 + 3 = ?', options: ['7', '8', '9', '10'], answer: 2, emoji: '➕' },
  ]},
  { id: 'pra-mat-tolak-mudah', title: 'Tolak Mudah (Hasil ≥ 0)', emoji: '➖', subject: 'mathematics', ageGroup: 'prasekolah', difficulty: 'easy', topic: 'Tolak Asas', order: 4, questions: [
    { problem: '2 - 1 = ?', options: ['0', '1', '2', '3'], answer: 1, emoji: '➖' },
    { problem: '3 - 1 = ?', options: ['1', '2', '3', '4'], answer: 1, emoji: '➖' },
    { problem: '3 - 2 = ?', options: ['0', '1', '2', '3'], answer: 1, emoji: '➖' },
    { problem: '4 - 2 = ?', options: ['1', '2', '3', '4'], answer: 1, emoji: '➖' },
    { problem: '5 - 3 = ?', options: ['1', '2', '3', '4'], answer: 1, emoji: '➖' },
    { problem: '5 - 5 = ?', options: ['0', '1', '5', '10'], answer: 0, emoji: '➖' },
    { problem: '6 - 4 = ?', options: ['1', '2', '3', '4'], answer: 1, emoji: '➖' },
    { problem: '7 - 3 = ?', options: ['3', '4', '5', '6'], answer: 1, emoji: '➖' },
    { problem: '8 - 6 = ?', options: ['1', '2', '3', '4'], answer: 1, emoji: '➖' },
    { problem: '10 - 5 = ?', options: ['3', '4', '5', '6'], answer: 2, emoji: '➖' },
  ]},
  { id: 'pra-mat-bentuk', title: 'Bentuk Asas', emoji: '🔷', subject: 'mathematics', ageGroup: 'prasekolah', difficulty: 'easy', topic: 'Bentuk 2D', order: 5, questions: [
    { problem: 'Bentuk apakah ini? ⚪', options: ['Bulatan', 'Segi Empat', 'Segi Tiga', 'Bintang'], answer: 0, emoji: '⚪' },
    { problem: 'Bentuk apakah ini? 🔺', options: ['Bulatan', 'Segi Empat', 'Segi Tiga', 'Bintang'], answer: 2, emoji: '🔺' },
    { problem: 'Bentuk apakah ini? ⬜', options: ['Bulatan', 'Segi Empat Sama', 'Segi Tiga', 'Bintang'], answer: 1, emoji: '⬜' },
    { problem: 'Bentuk apakah ini? ⭐', options: ['Bulatan', 'Segi Empat', 'Segi Tiga', 'Bintang'], answer: 3, emoji: '⭐' },
    { problem: 'Bentuk apakah ini? ❤️', options: ['Hati', 'Bulatan', 'Bintang', 'Bulan'], answer: 0, emoji: '❤️' },
    { problem: 'Roda kereta berbentuk...', options: ['Segi Empat', 'Bulatan', 'Segi Tiga', 'Bintang'], answer: 1, emoji: '🚗' },
    { problem: 'Berapa sisi pada segi tiga?', options: ['2', '3', '4', '5'], answer: 1, emoji: '🔺' },
    { problem: 'Berapa sisi pada segi empat sama?', options: ['3', '4', '5', '6'], answer: 1, emoji: '⬜' },
    { problem: 'Berapa sisi pada bulatan?', options: ['Tiada sisi', '1', '4', '8'], answer: 0, emoji: '⚪' },
    { problem: 'Atap rumah biasanya berbentuk...', options: ['Bulatan', 'Bintang', 'Segi Tiga', 'Hati'], answer: 2, emoji: '🏠' },
  ]},
  { id: 'pra-mat-banding-saiz', title: 'Banding Saiz (Besar/Kecil)', emoji: '📏', subject: 'mathematics', ageGroup: 'prasekolah', difficulty: 'easy', topic: 'Banding & Ukur', order: 6, questions: [
    { problem: 'Yang mana LEBIH BESAR?', options: ['🐘', '🐭', 'Sama besar', 'Tidak tahu'], answer: 0, emoji: '⚖️' },
    { problem: 'Yang mana LEBIH KECIL?', options: ['🐘', '🐭', 'Sama kecil', 'Tidak tahu'], answer: 1, emoji: '⚖️' },
    { problem: 'Yang mana LEBIH TINGGI?', options: ['🦒', '🐱', 'Sama tinggi', 'Tidak boleh banding'], answer: 0, emoji: '📏' },
    { problem: 'Yang mana LEBIH RENDAH?', options: ['🦒', '🐢', 'Sama tinggi', 'Tidak tahu'], answer: 1, emoji: '📏' },
    { problem: 'Yang mana LEBIH PANJANG?', options: ['🐍 (ular besar)', '🐛 (ulat kecil)', 'Sama panjang', 'Tidak tahu'], answer: 0, emoji: '📏' },
    { problem: 'Yang mana LEBIH BERAT?', options: ['🪶 (bulu)', '🪨 (batu)', 'Sama berat', 'Tidak tahu'], answer: 1, emoji: '⚖️' },
    { problem: 'Yang mana LEBIH RINGAN?', options: ['🪨 (batu)', '🎈 (belon)', 'Sama berat', 'Tidak tahu'], answer: 1, emoji: '⚖️' },
    { problem: 'Antara nombor ini, mana PALING BESAR?', options: ['1', '5', '3', '2'], answer: 1, emoji: '🔢' },
    { problem: 'Antara nombor ini, mana PALING KECIL?', options: ['7', '4', '2', '9'], answer: 2, emoji: '🔢' },
    { problem: '10 adalah lebih __ daripada 5.', options: ['kecil', 'besar', 'sama', 'rendah'], answer: 1, emoji: '🔢' },
  ]},
  { id: 'pra-mat-corak', title: 'Corak & Urutan', emoji: '🎨', subject: 'mathematics', ageGroup: 'prasekolah', difficulty: 'medium', topic: 'Corak', order: 7, questions: [
    { problem: '🔴🔵🔴🔵🔴__. Selepasnya?', options: ['🔴', '🔵', '🟢', '🟡'], answer: 1, emoji: '🎨' },
    { problem: '⭐🌙⭐🌙⭐__. Selepasnya?', options: ['⭐', '🌙', '☀️', '🌟'], answer: 1, emoji: '🎨' },
    { problem: '🍎🍌🍎🍌__. Selepasnya?', options: ['🍓', '🍇', '🍎', '🍊'], answer: 2, emoji: '🎨' },
    { problem: '1, 2, 3, __, 5. Yang hilang?', options: ['2', '4', '6', '7'], answer: 1, emoji: '🔢' },
    { problem: '2, 4, 6, __, 10. Yang hilang?', options: ['7', '8', '9', '12'], answer: 1, emoji: '🔢' },
    { problem: '10, 9, 8, __, 6. Yang hilang?', options: ['5', '7', '11', '4'], answer: 1, emoji: '🔢' },
    { problem: '🔺🔺🔵🔺🔺🔵__. Selepasnya?', options: ['🔺', '🔵', '🟢', '⭐'], answer: 0, emoji: '🎨' },
    { problem: 'A, B, C, __, E. Yang hilang?', options: ['A', 'D', 'F', 'G'], answer: 1, emoji: '🔤' },
    { problem: '5, 10, 15, __, 25. Yang hilang?', options: ['18', '20', '22', '24'], answer: 1, emoji: '🔢' },
    { problem: '🐱🐶🐱🐶🐱__. Selepasnya?', options: ['🐱', '🐶', '🐭', '🐰'], answer: 1, emoji: '🎨' },
  ]},
  { id: 'pra-mat-cerita-tambah-tolak', title: 'Cerita Tambah & Tolak', emoji: '📖', subject: 'mathematics', ageGroup: 'prasekolah', difficulty: 'medium', topic: 'Penyelesaian Masalah', order: 8, questions: [
    { problem: 'Ali ada 2 epal. Mak beri 1 lagi. Berapa epal Ali sekarang?', options: ['1', '2', '3', '4'], answer: 2, emoji: '🍎' },
    { problem: 'Aini ada 5 belon. 2 belon meletup. Berapa belon tinggal?', options: ['2', '3', '4', '7'], answer: 1, emoji: '🎈' },
    { problem: 'Ada 3 ekor kucing di taman. 2 ekor datang. Berapa semua?', options: ['3', '4', '5', '6'], answer: 2, emoji: '🐱' },
    { problem: 'Saya ada 4 gula-gula. Saya beri 1 pada adik. Berapa tinggal?', options: ['1', '2', '3', '5'], answer: 2, emoji: '🍬' },
    { problem: 'Ada 6 burung di pokok. 3 burung terbang. Berapa tinggal?', options: ['2', '3', '4', '9'], answer: 1, emoji: '🐦' },
    { problem: 'Mama beli 4 oren. Papa beli 4 oren lagi. Berapa semua?', options: ['6', '7', '8', '10'], answer: 2, emoji: '🍊' },
    { problem: 'Saya ada 10 pensel. Saya hilang 3. Berapa tinggal?', options: ['5', '6', '7', '13'], answer: 2, emoji: '✏️' },
    { problem: 'Ada 2 keping kek. Setiap kek ada 2 ceri. Berapa ceri semua?', options: ['2', '3', '4', '5'], answer: 2, emoji: '🍰' },
    { problem: 'Ada 5 buah pisang. Ali makan 2. Berapa tinggal?', options: ['2', '3', '4', '7'], answer: 1, emoji: '🍌' },
    { problem: 'Saya ada 3 mainan. Datuk beri 4 lagi. Berapa semua?', options: ['5', '6', '7', '8'], answer: 2, emoji: '🧸' },
  ]},
];

const ALL_BLUEPRINTS = [...PRASEKOLAH_BM, ...PRASEKOLAH_MATH];

function buildRecord(bp) {
  return {
    title: bp.title,
    description: bp.topic ? `Topik: ${bp.topic}` : null,
    type: 'multiple_choice',
    category: bp.subject,
    ageGroup: bp.ageGroup,
    darjah: bp.darjah || null,
    difficulty: bp.difficulty || 'easy',
    tier: 'free',
    emoji: bp.emoji,
    totalQuestions: bp.questions.length,
    gameData: {
      questions: bp.questions.map(q => ({
        type: 'multiple_choice',
        problem: q.problem,
        options: q.options,
        answer: q.answer,
        emoji: q.emoji || bp.emoji,
      })),
    },
    isPublished: true,
    status: 'ready',
    order: bp.order || 0,
    monthTag: '2026-05',
  };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin only' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const dryRun = body.dryRun !== false; // default: dry run

    // Find existing games for the buckets we're seeding
    const buckets = [
      { ageGroup: 'prasekolah', category: 'bahasa_melayu' },
      { ageGroup: 'prasekolah', category: 'mathematics' },
    ];

    const existing = {};
    let totalDeleted = 0;
    for (const b of buckets) {
      const games = await base44.asServiceRole.entities.Game.filter({ ageGroup: b.ageGroup, category: b.category });
      existing[`${b.ageGroup}-${b.category}`] = games.length;
      if (!dryRun) {
        for (const g of games) {
          await base44.asServiceRole.entities.Game.delete(g.id);
          totalDeleted++;
        }
      }
    }

    let inserted = 0;
    const inserts = [];
    for (const bp of ALL_BLUEPRINTS) {
      const record = buildRecord(bp);
      inserts.push(record);
      if (!dryRun) {
        await base44.asServiceRole.entities.Game.create(record);
        inserted++;
      }
    }

    return Response.json({
      success: true,
      dryRun,
      buckets,
      existingCounts: existing,
      blueprintsCount: ALL_BLUEPRINTS.length,
      deleted: totalDeleted,
      inserted: dryRun ? ALL_BLUEPRINTS.length : inserted,
      message: dryRun
        ? `Dry run sahaja. Akan padam ${Object.values(existing).reduce((a,b)=>a+b,0)} game lama & masukkan ${ALL_BLUEPRINTS.length} hand-crafted blueprints. Jalankan dengan {"dryRun": false} untuk apply.`
        : `✅ Berjaya! Padam ${totalDeleted} game lama, masukkan ${inserted} hand-crafted blueprints.`,
      sampleInsert: inserts[0],
    });
  } catch (error) {
    console.error('Seed error:', error);
    return Response.json({ error: error.message, stack: error.stack }, { status: 500 });
  }
});