// Kumpul semua emoji unik dari mini game blueprints + label BM untuk prompt AI.
// Digunakan oleh admin panel untuk hantar ke fungsi generateEmojiImages.
import { MINI_GAME_CATEGORIES } from '@/lib/miniGameBlueprints';

// Regex untuk kesan emoji (termasuk emoji ZWJ sequence seperti 👨‍⚕️)
const EMOJI_RE = /(\p{Extended_Pictographic}(\u200d\p{Extended_Pictographic})*[\uFE0F\u20E3]?)/gu;

// Label BM untuk emoji biasa — bantu AI jana gambar tepat. Emoji tak dikenali
// akan guna emoji itu sendiri sebagai subject.
const LABELS = {
  '🚗':'kereta','🚌':'bas','🚲':'basikal','🚓':'kereta polis','🚑':'ambulans','🚒':'kereta bomba',
  '✈️':'kapal terbang','🚂':'keretapi','🚢':'kapal','🚕':'teksi','🛵':'skuter','🚜':'traktor',
  '🚛':'lori','🚚':'trak','🏍️':'motosikal','🚁':'helikopter','🚀':'roket','🛶':'sampan',
  '⛵':'bot layar','🚤':'bot laju','⛴️':'feri','🚇':'lrt','🚊':'tram',
  '☀️':'matahari','🌧️':'hujan','⛅':'awan mendung','🌈':'pelangi','❄️':'kepingan salji','⛈️':'ribut petir',
  '🌤️':'cuaca cerah','🌪️':'puting beliung','🌙':'bulan','⭐':'bintang','☁️':'awan','⚡':'kilat','🌫️':'kabus','☔':'payung',
  '🌳':'pokok','🌸':'bunga','🍄':'cendawan','🌊':'ombak laut','🏔️':'gunung','🏞️':'taman','🌋':'gunung berapi',
  '🌻':'bunga matahari','🌹':'bunga ros','🌷':'bunga tulip','🌺':'bunga raya','🌲':'pokok pain','🌴':'pokok kelapa','🌵':'kaktus','🌿':'daun hijau','⛰️':'bukit',
  '⚽':'bola sepak','🏀':'bola keranjang','🎾':'bola tenis','🏸':'bulu tangkis','🏐':'bola tampar','🎳':'boling','🏑':'hoki','⛳':'golf','🥊':'sarung tinju',
  '🏊':'orang berenang','🏃':'orang berlari','🚴':'orang berbasikal','🤸':'gimnastik',
  '✏️':'pensel','📚':'buku','🎒':'beg sekolah','📏':'pembaris','✂️':'gunting','🖍️':'krayon','🖊️':'pen','📐':'set sukat','📓':'buku nota','🧮':'sempoa','📎':'klip kertas','📌':'pin',
  '🍎':'epal','🍌':'pisang','🍇':'anggur','🍓':'strawberi','🥝':'kiwi','🍊':'oren','🍉':'tembikai','🍐':'pear',
  '🐶':'anjing','🐱':'kucing','🐭':'tikus','🐹':'hamster','🐰':'arnab','🦊':'musang','🐻':'beruang','🐼':'panda','🐯':'harimau','🦁':'singa','🐮':'lembu','🐷':'babi','🐸':'katak','🐵':'monyet','🐔':'ayam','🐧':'penguin','🐦':'burung','🦆':'itik','🦉':'burung hantu','🐴':'kuda','🐝':'lebah','🦋':'rama-rama','🐌':'siput','🐢':'kura-kura','🐍':'ular','🐠':'ikan','🐬':'dolfin','🐳':'ikan paus','🦀':'ketam','🐙':'sotong kurita',
  '😊':'wajah gembira','😢':'wajah sedih','😠':'wajah marah','😴':'wajah mengantuk','😋':'wajah sedap','😨':'wajah takut','😍':'wajah suka','🤔':'wajah berfikir','😎':'wajah cool','🤗':'wajah memeluk','😭':'wajah menangis','😡':'wajah geram',
};

export function emojiLabel(emoji) {
  return LABELS[emoji] || emoji;
}

// Kumpul semua emoji unik dari semua blueprint (recursive scan setiap string).
export function collectUniqueEmojis() {
  const found = new Set();

  const scanString = (str) => {
    const matches = String(str).match(EMOJI_RE);
    if (matches) matches.forEach(m => found.add(m));
  };

  const walk = (val) => {
    if (val == null) return;
    if (typeof val === 'string') { scanString(val); return; }
    if (Array.isArray(val)) { val.forEach(walk); return; }
    if (typeof val === 'object') { Object.values(val).forEach(walk); return; }
  };

  MINI_GAME_CATEGORIES.forEach(cat => cat.games.forEach(g => g.rounds?.forEach(walk)));

  return [...found].map(emoji => ({ emoji, label: emojiLabel(emoji) }));
}