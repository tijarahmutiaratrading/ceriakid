// Seed remaining prasekolah subjects: English, Sains, Jawi
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const PRA_ENGLISH = [
  { title: 'Alphabet A-E', emoji: '🔤', difficulty: 'easy', topic: 'Letters A-E', order: 1, questions: [
    { problem: "Which letter? 🅰️", options: ['A','B','C','D'], answer: 0, emoji: '🅰️' },
    { problem: "Which letter? 🅱️", options: ['A','B','C','D'], answer: 1, emoji: '🅱️' },
    { problem: "Apple starts with...", options: ['A','B','C','D'], answer: 0, emoji: '🍎' },
    { problem: "Ball starts with...", options: ['A','B','C','D'], answer: 1, emoji: '⚽' },
    { problem: "Cat starts with...", options: ['A','B','C','D'], answer: 2, emoji: '🐱' },
    { problem: "Dog starts with...", options: ['A','B','C','D'], answer: 3, emoji: '🐶' },
    { problem: "Egg starts with...", options: ['A','B','C','E'], answer: 3, emoji: '🥚' },
    { problem: "After A comes...", options: ['B','C','D','E'], answer: 0, emoji: '🔡' },
    { problem: "After D comes...", options: ['B','C','D','E'], answer: 3, emoji: '🔡' },
    { problem: "Before C is...", options: ['A','B','D','E'], answer: 1, emoji: '🔡' },
  ]},
  { title: 'Alphabet F-J', emoji: '🔤', difficulty: 'easy', topic: 'Letters F-J', order: 2, questions: [
    { problem: "Fish starts with...", options: ['F','G','H','I'], answer: 0, emoji: '🐟' },
    { problem: "Goat starts with...", options: ['F','G','H','I'], answer: 1, emoji: '🐐' },
    { problem: "House starts with...", options: ['F','G','H','I'], answer: 2, emoji: '🏠' },
    { problem: "Ice starts with...", options: ['F','G','H','I'], answer: 3, emoji: '🧊' },
    { problem: "Jam starts with...", options: ['F','G','H','J'], answer: 3, emoji: '🍓' },
    { problem: "After F comes...", options: ['G','H','I','J'], answer: 0, emoji: '🔡' },
    { problem: "After I comes...", options: ['G','H','I','J'], answer: 3, emoji: '🔡' },
    { problem: "Before H is...", options: ['F','G','I','J'], answer: 1, emoji: '🔡' },
    { problem: "Which letter? 🅵 (font F)", options: ['F','E','I','J'], answer: 0, emoji: '🔤' },
    { problem: "Frog starts with...", options: ['G','H','F','J'], answer: 2, emoji: '🐸' },
  ]},
  { title: 'Numbers 1-5', emoji: '🔢', difficulty: 'easy', topic: 'Numbers', order: 3, questions: [
    { problem: "How many? 🍎", options: ['1','2','3','4'], answer: 0, emoji: '🍎' },
    { problem: "How many? 🍎🍎", options: ['1','2','3','4'], answer: 1, emoji: '🍎' },
    { problem: "How many? 🍎🍎🍎", options: ['1','2','3','4'], answer: 2, emoji: '🍎' },
    { problem: "How many? 🍎🍎🍎🍎", options: ['2','3','4','5'], answer: 2, emoji: '🍎' },
    { problem: "How many? 🍎🍎🍎🍎🍎", options: ['3','4','5','6'], answer: 2, emoji: '🍎' },
    { problem: "One = ?", options: ['1','2','3','4'], answer: 0, emoji: '1️⃣' },
    { problem: "Two = ?", options: ['1','2','3','4'], answer: 1, emoji: '2️⃣' },
    { problem: "Three = ?", options: ['1','2','3','4'], answer: 2, emoji: '3️⃣' },
    { problem: "Four = ?", options: ['2','3','4','5'], answer: 2, emoji: '4️⃣' },
    { problem: "Five = ?", options: ['3','4','5','6'], answer: 2, emoji: '5️⃣' },
  ]},
  { title: 'Colors in English', emoji: '🌈', difficulty: 'easy', topic: 'Colors', order: 4, questions: [
    { problem: "What color? 🔴", options: ['Red','Blue','Green','Yellow'], answer: 0, emoji: '🔴' },
    { problem: "What color? 🔵", options: ['Red','Blue','Green','Yellow'], answer: 1, emoji: '🔵' },
    { problem: "What color? 🟢", options: ['Red','Blue','Green','Yellow'], answer: 2, emoji: '🟢' },
    { problem: "What color? 🟡", options: ['Red','Blue','Green','Yellow'], answer: 3, emoji: '🟡' },
    { problem: "What color? 🟣", options: ['Purple','Red','Green','Pink'], answer: 0, emoji: '🟣' },
    { problem: "What color? 🟠", options: ['Red','Orange','Yellow','Pink'], answer: 1, emoji: '🟠' },
    { problem: "What color? ⚫", options: ['White','Grey','Black','Brown'], answer: 2, emoji: '⚫' },
    { problem: "What color? ⚪", options: ['Black','Grey','Cream','White'], answer: 3, emoji: '⚪' },
    { problem: "What color? 🟤", options: ['Brown','Black','Red','Grey'], answer: 0, emoji: '🟤' },
    { problem: "What color? 🩷", options: ['Red','Pink','Purple','Orange'], answer: 1, emoji: '🩷' },
  ]},
  { title: 'Animal Names', emoji: '🐾', difficulty: 'easy', topic: 'Animals', order: 5, questions: [
    { problem: "What animal? 🐱", options: ['Cat','Dog','Mouse','Rabbit'], answer: 0, emoji: '🐱' },
    { problem: "What animal? 🐶", options: ['Cat','Dog','Cow','Chicken'], answer: 1, emoji: '🐶' },
    { problem: "What animal? 🐘", options: ['Tiger','Lion','Elephant','Horse'], answer: 2, emoji: '🐘' },
    { problem: "What animal? 🐯", options: ['Cat','Lion','Bear','Tiger'], answer: 3, emoji: '🐯' },
    { problem: "What animal? 🐔", options: ['Chicken','Duck','Bird','Goose'], answer: 0, emoji: '🐔' },
    { problem: "What animal? 🐟", options: ['Shrimp','Fish','Crab','Squid'], answer: 1, emoji: '🐟' },
    { problem: "What animal? 🦋", options: ['Bee','Fly','Butterfly','Mosquito'], answer: 2, emoji: '🦋' },
    { problem: "What animal? 🐰", options: ['Mouse','Squirrel','Hamster','Rabbit'], answer: 3, emoji: '🐰' },
    { problem: "What animal? 🐄", options: ['Cow','Goat','Buffalo','Horse'], answer: 0, emoji: '🐄' },
    { problem: "What animal? 🐍", options: ['Worm','Snake','Eel','Leech'], answer: 1, emoji: '🐍' },
  ]},
  { title: 'Fruits in English', emoji: '🍎', difficulty: 'easy', topic: 'Fruits', order: 6, questions: [
    { problem: "Which fruit? 🍎", options: ['Apple','Banana','Orange','Mango'], answer: 0, emoji: '🍎' },
    { problem: "Which fruit? 🍌", options: ['Apple','Banana','Orange','Mango'], answer: 1, emoji: '🍌' },
    { problem: "Which fruit? 🍊", options: ['Apple','Banana','Orange','Watermelon'], answer: 2, emoji: '🍊' },
    { problem: "Which fruit? 🥭", options: ['Apple','Orange','Banana','Mango'], answer: 3, emoji: '🥭' },
    { problem: "Which fruit? 🍇", options: ['Grapes','Strawberry','Cherry','Plum'], answer: 0, emoji: '🍇' },
    { problem: "Which fruit? 🍓", options: ['Grapes','Strawberry','Cherry','Raspberry'], answer: 1, emoji: '🍓' },
    { problem: "Which fruit? 🍉", options: ['Lemon','Orange','Watermelon','Starfruit'], answer: 2, emoji: '🍉' },
    { problem: "Which fruit? 🍍", options: ['Banana','Orange','Mango','Pineapple'], answer: 3, emoji: '🍍' },
    { problem: "Which fruit? 🥥", options: ['Coconut','Durian','Mangosteen','Rambutan'], answer: 0, emoji: '🥥' },
    { problem: "Which fruit? 🫐", options: ['Grapes','Blueberry','Cherry','Plum'], answer: 1, emoji: '🫐' },
  ]},
  { title: 'Body Parts (English)', emoji: '👤', difficulty: 'easy', topic: 'Body', order: 7, questions: [
    { problem: "Used to SEE?", options: ['Ear','Eye','Nose','Mouth'], answer: 1, emoji: '👁️' },
    { problem: "Used to HEAR?", options: ['Ear','Eye','Mouth','Hand'], answer: 0, emoji: '👂' },
    { problem: "Used to SMELL?", options: ['Mouth','Eye','Nose','Ear'], answer: 2, emoji: '👃' },
    { problem: "Used to EAT?", options: ['Nose','Eye','Ear','Mouth'], answer: 3, emoji: '👄' },
    { problem: "Used to WALK?", options: ['Legs','Hands','Eyes','Ears'], answer: 0, emoji: '🦵' },
    { problem: "Used to HOLD?", options: ['Legs','Hands','Nose','Eyes'], answer: 1, emoji: '✋' },
    { problem: "How many eyes do we have?", options: ['1','2','3','4'], answer: 1, emoji: '👀' },
    { problem: "How many noses do we have?", options: ['2','3','1','4'], answer: 2, emoji: '👃' },
    { problem: "Used to THINK?", options: ['Stomach','Heart','Brain','Hand'], answer: 2, emoji: '🧠' },
    { problem: "Used to BREATHE?", options: ['Lungs','Liver','Heart','Stomach'], answer: 0, emoji: '🫁' },
  ]},
  { title: 'Simple Greetings', emoji: '👋', difficulty: 'easy', topic: 'Greetings', order: 8, questions: [
    { problem: "Morning greeting?", options: ['Good morning','Good night','Goodbye','Hello'], answer: 0, emoji: '☀️' },
    { problem: "Night greeting?", options: ['Good morning','Good night','Hi','Bye'], answer: 1, emoji: '🌙' },
    { problem: "When leaving, say...", options: ['Hello','Hi','Goodbye','Welcome'], answer: 2, emoji: '👋' },
    { problem: "When meeting friend, say...", options: ['Bye','See you','Goodbye','Hi'], answer: 3, emoji: '😊' },
    { problem: "Saying THANK YOU when...", options: ['Someone helps you','You eat','You sleep','You play'], answer: 0, emoji: '🙏' },
    { problem: "Saying SORRY when...", options: ['You win','You make a mistake','You eat','You sing'], answer: 1, emoji: '😔' },
    { problem: "Saying PLEASE when...", options: ['Done eating','Asking politely','Sleeping','Running'], answer: 1, emoji: '🤲' },
    { problem: '"How are you?" — reply:', options: ['Goodbye','Morning','I am fine','Sleep'], answer: 2, emoji: '😊' },
    { problem: '"What is your name?" — reply:', options: ['I am fine','Goodbye','Morning','My name is...'], answer: 3, emoji: '🗣️' },
    { problem: "Welcome someone, say...", options: ['Welcome','Goodbye','Sorry','Please'], answer: 0, emoji: '🤝' },
  ]},
];

const PRA_SAINS = [
  { title: 'Pancaindera Lima', emoji: '👀', difficulty: 'easy', topic: 'Pancaindera', order: 1, questions: [
    { problem: 'Kita guna MATA untuk...', options: ['Melihat','Mendengar','Mencium','Merasa'], answer: 0, emoji: '👁️' },
    { problem: 'Kita guna TELINGA untuk...', options: ['Melihat','Mendengar','Mencium','Merasa'], answer: 1, emoji: '👂' },
    { problem: 'Kita guna HIDUNG untuk...', options: ['Melihat','Mendengar','Mencium','Merasa'], answer: 2, emoji: '👃' },
    { problem: 'Kita guna LIDAH untuk merasa makanan?', options: ['Ya','Tidak','Kadang-kadang','Tidak tahu'], answer: 0, emoji: '👅' },
    { problem: 'Kita guna KULIT untuk...', options: ['Melihat','Mendengar','Menghidu','Menyentuh'], answer: 3, emoji: '✋' },
    { problem: 'Berapa pancaindera manusia?', options: ['3','4','5','6'], answer: 2, emoji: '🖐️' },
    { problem: 'Untuk dengar muzik, kita guna...', options: ['Mata','Telinga','Hidung','Mulut'], answer: 1, emoji: '🎵' },
    { problem: 'Untuk bezakan manis dan masin, guna...', options: ['Lidah','Mata','Telinga','Hidung'], answer: 0, emoji: '🍯' },
    { problem: 'Bau bunga, kita guna...', options: ['Lidah','Mata','Hidung','Telinga'], answer: 2, emoji: '🌸' },
    { problem: 'Untuk rasa panas atau sejuk, guna...', options: ['Mata','Lidah','Telinga','Kulit'], answer: 3, emoji: '🌡️' },
  ]},
  { title: 'Haiwan & Habitat', emoji: '🦁', difficulty: 'easy', topic: 'Haiwan', order: 2, questions: [
    { problem: 'Ikan tinggal di...', options: ['Air','Pokok','Tanah','Udara'], answer: 0, emoji: '🐟' },
    { problem: 'Burung tinggal di...', options: ['Air','Sarang/Pokok','Bawah tanah','Laut'], answer: 1, emoji: '🐦' },
    { problem: 'Cacing tinggal di...', options: ['Udara','Pokok','Dalam tanah','Atas air'], answer: 2, emoji: '🪱' },
    { problem: 'Lebah tinggal di...', options: ['Laut','Pasir','Salji','Sarang lebah'], answer: 3, emoji: '🐝' },
    { problem: 'Yang TERBANG ialah...', options: ['Burung','Ikan','Ular','Ketam'], answer: 0, emoji: '🦅' },
    { problem: 'Yang BERENANG di air ialah...', options: ['Kucing','Ikan','Lembu','Anjing'], answer: 1, emoji: '🐟' },
    { problem: 'Yang MERANGKAK ialah...', options: ['Gajah','Kuda','Ular','Lembu'], answer: 2, emoji: '🐍' },
    { problem: 'Yang ada 4 kaki ialah...', options: ['Burung','Ikan','Ular','Kucing'], answer: 3, emoji: '🐱' },
    { problem: 'Apakah makanan ikan?', options: ['Cacing/serangga','Daging','Rumput','Bunga'], answer: 0, emoji: '🐠' },
    { problem: 'Apakah makanan arnab?', options: ['Daging','Sayur/lobak','Ikan','Batu'], answer: 1, emoji: '🥕' },
  ]},
  { title: 'Tumbuhan & Bahagiannya', emoji: '🌱', difficulty: 'easy', topic: 'Tumbuhan', order: 3, questions: [
    { problem: 'Bahagian pokok yang masuk ke dalam tanah?', options: ['Akar','Daun','Bunga','Buah'], answer: 0, emoji: '🌱' },
    { problem: 'Bahagian pokok yang HIJAU?', options: ['Akar','Daun','Buah','Bunga'], answer: 1, emoji: '🌿' },
    { problem: 'Bahagian pokok yang menjadi BUAH?', options: ['Akar','Batang','Bunga','Daun'], answer: 2, emoji: '🌸' },
    { problem: 'Apa yang pokok perlu untuk hidup?', options: ['Bateri','Plastik','Logam','Air & Cahaya'], answer: 3, emoji: '☀️' },
    { problem: 'Tempat menanam pokok ialah...', options: ['Tanah/Pasu','Udara','Laut','Salji'], answer: 0, emoji: '🪴' },
    { problem: 'Pokok memerlukan...', options: ['Cuka','Air','Minyak','Pasir kering'], answer: 1, emoji: '💧' },
    { problem: 'Daun pokok biasanya berwarna...', options: ['Merah','Biru','Hijau','Hitam'], answer: 2, emoji: '🍃' },
    { problem: 'Manakah BUKAN tumbuhan?', options: ['Pokok','Bunga','Rumput','Batu'], answer: 3, emoji: '🪨' },
    { problem: 'Buah datang dari...', options: ['Bunga pokok','Tanah','Awan','Batu'], answer: 0, emoji: '🍎' },
    { problem: 'Pokok bertindak balas kepada...', options: ['Cahaya matahari','Bunyi muzik','Warna lampu','Bau bunga'], answer: 0, emoji: '☀️' },
  ]},
  { title: 'Cuaca Asas', emoji: '☀️', difficulty: 'easy', topic: 'Cuaca', order: 4, questions: [
    { problem: 'Cuaca panas datang dari...', options: ['Matahari','Bulan','Bintang','Awan'], answer: 0, emoji: '☀️' },
    { problem: 'Air yang jatuh dari langit ialah...', options: ['Salji','Hujan','Wap','Asap'], answer: 1, emoji: '🌧️' },
    { problem: 'Selepas hujan kadang-kadang nampak...', options: ['Bulan','Bintang','Pelangi','Salji'], answer: 2, emoji: '🌈' },
    { problem: 'Kita perlu PAYUNG bila...', options: ['Cuaca cerah','Malam','Tidur','Hujan'], answer: 3, emoji: '☂️' },
    { problem: 'Cuaca yang ada angin kencang dipanggil...', options: ['Berangin/Ribut','Cerah','Mendung','Panas'], answer: 0, emoji: '💨' },
    { problem: 'Awan biasanya berwarna...', options: ['Hitam','Putih','Merah','Hijau'], answer: 1, emoji: '☁️' },
    { problem: 'Cuaca yang TIADA matahari, ada awan banyak ialah...', options: ['Cerah','Panas','Mendung','Salji'], answer: 2, emoji: '☁️' },
    { problem: 'Pada waktu malam kita nampak...', options: ['Matahari','Pelangi','Awan terang','Bulan & Bintang'], answer: 3, emoji: '🌙' },
    { problem: 'Cuaca paling sesuai untuk bermain di luar?', options: ['Cerah','Ribut','Hujan lebat','Salji'], answer: 0, emoji: '🌞' },
    { problem: 'Apabila hujan, tanah menjadi...', options: ['Kering','Basah','Panas','Salji'], answer: 1, emoji: '💦' },
  ]},
  { title: 'Sumber Cahaya & Bunyi', emoji: '💡', difficulty: 'medium', topic: 'Cahaya & Bunyi', order: 5, questions: [
    { problem: 'Sumber cahaya semula jadi pada waktu siang?', options: ['Matahari','Lampu','Lilin','TV'], answer: 0, emoji: '☀️' },
    { problem: 'Sumber cahaya buatan ialah...', options: ['Matahari','Lampu','Bintang','Bulan'], answer: 1, emoji: '💡' },
    { problem: 'Bulan bercahaya kerana...', options: ['Ia api','Ia matahari','Pantulan matahari','Lampu'], answer: 2, emoji: '🌕' },
    { problem: 'Tanpa cahaya, bilik menjadi...', options: ['Terang','Berwarna','Bersih','Gelap'], answer: 3, emoji: '🌑' },
    { problem: 'Bunyi dihasilkan dari...', options: ['Getaran','Cahaya','Warna','Bau'], answer: 0, emoji: '🔊' },
    { problem: 'Bunyi yang terlalu kuat boleh merosakkan...', options: ['Mata','Telinga','Hidung','Lidah'], answer: 1, emoji: '👂' },
    { problem: 'Alat untuk menyalakan bilik ialah...', options: ['Pintu','Tingkap','Lampu','Cermin'], answer: 2, emoji: '💡' },
    { problem: 'Yang BUKAN sumber cahaya?', options: ['Matahari','Lilin','Lampu','Batu'], answer: 3, emoji: '🪨' },
    { problem: 'Bunyi guruh datang selepas...', options: ['Kilat','Hujan terhenti','Matahari naik','Bulan terbit'], answer: 0, emoji: '⛈️' },
    { problem: 'Alat untuk dengar muzik halus?', options: ['Cermin mata','Telefon/headphone','Topi','Kasut'], answer: 1, emoji: '🎧' },
  ]},
  { title: 'Bahagian Tubuh', emoji: '🧒', difficulty: 'easy', topic: 'Tubuh Manusia', order: 6, questions: [
    { problem: 'Tulang dalam dada melindungi...', options: ['Jantung & paru-paru','Otak','Perut','Kaki'], answer: 0, emoji: '🫀' },
    { problem: 'Otak terletak di...', options: ['Perut','Kepala','Tangan','Kaki'], answer: 1, emoji: '🧠' },
    { problem: 'Jantung berfungsi untuk...', options: ['Berfikir','Mendengar','Mengepam darah','Bercakap'], answer: 2, emoji: '🫀' },
    { problem: 'Gigi digunakan untuk...', options: ['Melihat','Mendengar','Berfikir','Mengunyah makanan'], answer: 3, emoji: '🦷' },
    { problem: 'Berapa kaki manusia ada?', options: ['2','3','4','1'], answer: 0, emoji: '🦵' },
    { problem: 'Berapa tangan manusia ada?', options: ['1','2','3','4'], answer: 1, emoji: '🤲' },
    { problem: 'Untuk basuh tangan, kita guna...', options: ['Minyak','Pasir','Air & sabun','Cat'], answer: 2, emoji: '🧼' },
    { problem: 'Yang melindungi seluruh badan ialah...', options: ['Rambut','Kuku','Gigi','Kulit'], answer: 3, emoji: '🧴' },
    { problem: 'Rambut tumbuh di...', options: ['Kepala','Tangan dalam','Lidah','Mata'], answer: 0, emoji: '💇' },
    { problem: 'Untuk mandi, kita guna...', options: ['Susu','Air','Minyak','Pasir'], answer: 1, emoji: '🚿' },
  ]},
];

const PRA_JAWI = [
  { title: 'Kenal Huruf Jawi (ا ب ت)', emoji: '🕌', difficulty: 'easy', topic: 'Huruf Jawi Asas', order: 1, questions: [
    { problem: 'Huruf ini disebut apa? ا', options: ['Alif','Ba','Ta','Tha'], answer: 0, emoji: 'ا' },
    { problem: 'Huruf ini disebut apa? ب', options: ['Alif','Ba','Ta','Tha'], answer: 1, emoji: 'ب' },
    { problem: 'Huruf ini disebut apa? ت', options: ['Alif','Ba','Ta','Tha'], answer: 2, emoji: 'ت' },
    { problem: 'Huruf ini disebut apa? ث', options: ['Alif','Ba','Ta','Tha'], answer: 3, emoji: 'ث' },
    { problem: 'Yang mana huruf ALIF?', options: ['ا','ب','ت','ث'], answer: 0, emoji: '🔤' },
    { problem: 'Yang mana huruf BA?', options: ['ا','ب','ت','ث'], answer: 1, emoji: '🔤' },
    { problem: 'Yang mana huruf TA?', options: ['ا','ب','ت','ث'], answer: 2, emoji: '🔤' },
    { problem: 'Tulisan Jawi ditulis dari...', options: ['Kanan ke kiri','Kiri ke kanan','Atas ke bawah','Bawah ke atas'], answer: 0, emoji: '↩️' },
    { problem: 'Berapa titik pada huruf ت ?', options: ['1','2','3','4'], answer: 1, emoji: '⚫' },
    { problem: 'Berapa titik pada huruf ث ?', options: ['1','2','3','4'], answer: 2, emoji: '⚫' },
  ]},
  { title: 'Huruf Jawi (ج ح خ د)', emoji: '🕌', difficulty: 'easy', topic: 'Huruf Jawi', order: 2, questions: [
    { problem: 'Huruf ini disebut apa? ج', options: ['Jim','Ha','Kha','Dal'], answer: 0, emoji: 'ج' },
    { problem: 'Huruf ini disebut apa? ح', options: ['Jim','Ha','Kha','Dal'], answer: 1, emoji: 'ح' },
    { problem: 'Huruf ini disebut apa? خ', options: ['Jim','Ha','Kha','Dal'], answer: 2, emoji: 'خ' },
    { problem: 'Huruf ini disebut apa? د', options: ['Jim','Ha','Kha','Dal'], answer: 3, emoji: 'د' },
    { problem: 'Yang mana huruf JIM?', options: ['ج','ح','خ','د'], answer: 0, emoji: '🔤' },
    { problem: 'Yang mana huruf DAL?', options: ['ج','ح','خ','د'], answer: 3, emoji: '🔤' },
    { problem: 'Huruf yang ada titik DI ATAS ialah...', options: ['ح','د','خ','ج'], answer: 2, emoji: '⚫' },
    { problem: 'Huruf yang ada titik DI BAWAH ialah...', options: ['ح','د','خ','ج'], answer: 3, emoji: '⚫' },
    { problem: 'Yang TIADA titik...', options: ['ج','خ','ح','-'], answer: 2, emoji: '⚪' },
    { problem: 'Huruf Jawi berapa kesemuanya?', options: ['26','28','30','37'], answer: 3, emoji: '🔢' },
  ]},
  { title: 'Huruf Jawi (ر ز س ش)', emoji: '🕌', difficulty: 'easy', topic: 'Huruf Jawi', order: 3, questions: [
    { problem: 'Huruf ini disebut apa? ر', options: ['Ra','Zai','Sin','Syin'], answer: 0, emoji: 'ر' },
    { problem: 'Huruf ini disebut apa? ز', options: ['Ra','Zai','Sin','Syin'], answer: 1, emoji: 'ز' },
    { problem: 'Huruf ini disebut apa? س', options: ['Ra','Zai','Sin','Syin'], answer: 2, emoji: 'س' },
    { problem: 'Huruf ini disebut apa? ش', options: ['Ra','Zai','Sin','Syin'], answer: 3, emoji: 'ش' },
    { problem: 'Yang mana huruf RA?', options: ['ر','ز','س','ش'], answer: 0, emoji: '🔤' },
    { problem: 'Yang mana huruf SIN?', options: ['ر','ز','س','ش'], answer: 2, emoji: '🔤' },
    { problem: 'Yang ada 3 titik atas ialah...', options: ['ر','ز','س','ش'], answer: 3, emoji: '⚫' },
    { problem: 'Yang ada 1 titik atas ialah...', options: ['ر','ز','س','ش'], answer: 1, emoji: '⚫' },
    { problem: 'Huruf س ada berapa "gigi"?', options: ['1','2','3','4'], answer: 2, emoji: '🦷' },
    { problem: 'Huruf ش ada berapa "gigi"?', options: ['1','2','3','4'], answer: 2, emoji: '🦷' },
  ]},
  { title: 'Padan Jawi dengan Rumi', emoji: '🔤', difficulty: 'medium', topic: 'Padanan', order: 4, questions: [
    { problem: 'ا dalam Rumi ialah...', options: ['A','B','T','D'], answer: 0, emoji: '🅰️' },
    { problem: 'ب dalam Rumi ialah...', options: ['A','B','T','D'], answer: 1, emoji: '🅱️' },
    { problem: 'ت dalam Rumi ialah...', options: ['A','B','T','D'], answer: 2, emoji: '🆃' },
    { problem: 'د dalam Rumi ialah...', options: ['A','B','T','D'], answer: 3, emoji: '🆔' },
    { problem: 'ج dalam Rumi ialah...', options: ['J','H','K','R'], answer: 0, emoji: '🇯' },
    { problem: 'ر dalam Rumi ialah...', options: ['J','H','K','R'], answer: 3, emoji: '🇷' },
    { problem: 'س dalam Rumi ialah...', options: ['S','Z','M','N'], answer: 0, emoji: '🇸' },
    { problem: 'ز dalam Rumi ialah...', options: ['S','Z','M','N'], answer: 1, emoji: '🇿' },
    { problem: 'م dalam Rumi ialah...', options: ['S','Z','M','N'], answer: 2, emoji: '🇲' },
    { problem: 'ن dalam Rumi ialah...', options: ['S','Z','M','N'], answer: 3, emoji: '🇳' },
  ]},
  { title: 'Perkataan Jawi Mudah', emoji: '📖', difficulty: 'medium', topic: 'Perkataan', order: 5, questions: [
    { problem: 'اب dibaca sebagai...', options: ['Ab','Ba','At','Ta'], answer: 0, emoji: '📖' },
    { problem: 'با dibaca sebagai...', options: ['Ab','Ba','At','Ta'], answer: 1, emoji: '📖' },
    { problem: 'ابو bermaksud...', options: ['Bapa','Ibu','Adik','Saya'], answer: 0, emoji: '👨' },
    { problem: 'امو bermaksud (perkataan)...', options: ['Bapa','Mamu/Pakcik','Adik','Buku'], answer: 1, emoji: '👨' },
    { problem: 'Tulisan Jawi digunakan untuk Bahasa apa?', options: ['English','Bahasa Melayu','Mandarin','Tamil'], answer: 1, emoji: '🇲🇾' },
    { problem: 'Jawi sama macam tulisan...', options: ['Hindi','Arab (huruf serupa)','Cina','Inggeris'], answer: 1, emoji: '✍️' },
    { problem: 'Jawi mula belajar dari...', options: ['Belakang ke depan','Kanan ke kiri','Tengah','Bawah ke atas'], answer: 1, emoji: '↩️' },
    { problem: 'Untuk tulis "BU" dalam Jawi guna...', options: ['با','بو','بي','به'], answer: 1, emoji: '📝' },
    { problem: 'Untuk tulis "BA" dalam Jawi guna...', options: ['با','بو','بي','به'], answer: 0, emoji: '📝' },
    { problem: 'Huruf Jawi penting untuk warisan kita?', options: ['Ya','Tidak','Sama saja','Tidak tahu'], answer: 0, emoji: '🕌' },
  ]},
];

function buildRecord(bp, category) {
  return {
    title: bp.title,
    description: bp.topic ? `Topik: ${bp.topic}` : null,
    type: 'multiple_choice',
    category,
    ageGroup: 'prasekolah',
    darjah: null,
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
    const dryRun = body.dryRun !== false;

    const buckets = [
      { category: 'english', blueprints: PRA_ENGLISH },
      { category: 'science', blueprints: PRA_SAINS },
      { category: 'jawi', blueprints: PRA_JAWI },
    ];

    let totalDeleted = 0;
    let totalInserted = 0;
    const summary = {};

    for (const b of buckets) {
      const existing = await base44.asServiceRole.entities.Game.filter({ ageGroup: 'prasekolah', category: b.category });
      summary[b.category] = { existing: existing.length, blueprints: b.blueprints.length };
      if (!dryRun) {
        for (const g of existing) {
          await base44.asServiceRole.entities.Game.delete(g.id);
          totalDeleted++;
        }
        for (const bp of b.blueprints) {
          await base44.asServiceRole.entities.Game.create(buildRecord(bp, b.category));
          totalInserted++;
        }
      }
    }

    return Response.json({
      success: true,
      dryRun,
      summary,
      totalDeleted,
      totalInserted,
      message: dryRun
        ? `Dry run. Akan padam ${Object.values(summary).reduce((a,b)=>a+b.existing,0)} dan masukkan ${Object.values(summary).reduce((a,b)=>a+b.blueprints,0)} games baharu.`
        : `✅ Berjaya! Padam ${totalDeleted}, masukkan ${totalInserted}.`,
    });
  } catch (error) {
    console.error(error);
    return Response.json({ error: error.message, stack: error.stack }, { status: 500 });
  }
});