// Game library - minimum 10 games per kategori
export const gameLibrary = {
  prasekolah: {
    bahasa_melayu: [
      {
        title: 'Huruf ABC - A hingga F',
        type: 'letter_match',
        emoji: '🔤',
        difficulty: 'easy',
        gameData: {
          questions: [
            { letter: 'A', emoji: '🍎', word: 'Epal', options: ['A', 'B', 'C', 'D'], answer: 0 },
            { letter: 'B', emoji: '🐦', word: 'Burung', options: ['A', 'B', 'C', 'D'], answer: 1 },
            { letter: 'C', emoji: '🐱', word: 'Kucing', options: ['A', 'B', 'C', 'D'], answer: 2 },
            { letter: 'D', emoji: '🐕', word: 'Anjing', options: ['A', 'B', 'C', 'D'], answer: 3 },
            { letter: 'E', emoji: '🐘', word: 'Gajah', options: ['D', 'E', 'F', 'G'], answer: 1 },
            { letter: 'F', emoji: '🐟', word: 'Ikan', options: ['D', 'E', 'F', 'G'], answer: 2 },
            { letter: 'G', emoji: '🍇', word: 'Anggur', options: ['E', 'F', 'G', 'H'], answer: 2 },
            { letter: 'H', emoji: '🏠', word: 'Rumah', options: ['F', 'G', 'H', 'I'], answer: 2 },
          ],
        },
      },
      {
        title: 'Huruf Vokal A, E, I, O, U',
        type: 'letter_match',
        emoji: '🅰️',
        difficulty: 'easy',
        gameData: {
          questions: [
            { letter: 'A', emoji: '🍎', word: 'Epal', options: ['A', 'E', 'I', 'O'], answer: 0 },
            { letter: 'E', emoji: '🥚', word: 'Telur', options: ['A', 'E', 'I', 'O'], answer: 1 },
            { letter: 'I', emoji: '🍦', word: 'Ais Krim', options: ['A', 'E', 'I', 'O'], answer: 2 },
            { letter: 'O', emoji: '🍊', word: 'Oren', options: ['A', 'E', 'I', 'O'], answer: 3 },
            { letter: 'U', emoji: '☂️', word: 'Payung', options: ['I', 'U', 'E', 'O'], answer: 1 },
            { letter: 'A', emoji: '🐊', word: 'Buaya', options: ['U', 'A', 'I', 'O'], answer: 1 },
            { letter: 'E', emoji: '🦅', word: 'Helang', options: ['A', 'E', 'U', 'I'], answer: 1 },
            { letter: 'I', emoji: '🐟', word: 'Ikan', options: ['U', 'O', 'I', 'A'], answer: 2 },
          ],
        },
      },
      {
        title: 'Nama Haiwan',
        type: 'picture_quiz',
        emoji: '🐾',
        difficulty: 'easy',
        gameData: {
          questions: [
            { image: '🐱', options: ['Kucing', 'Anjing', 'Kelinci'], answer: 0 },
            { image: '🐶', options: ['Kucing', 'Anjing', 'Burung'], answer: 1 },
            { image: '🦁', options: ['Singa', 'Harimau', 'Beruang'], answer: 0 },
            { image: '🐘', options: ['Gajah', 'Kuda', 'Zebra'], answer: 0 },
            { image: '🐧', options: ['Penguin', 'Ayam', 'Itik'], answer: 0 },
            { image: '🦒', options: ['Jerapah', 'Rusa', 'Kuda'], answer: 0 },
            { image: '🐻', options: ['Beruang', 'Serigala', 'Singa'], answer: 0 },
            { image: '🦓', options: ['Zebra', 'Kuda', 'Kijang'], answer: 0 },
          ],
        },
      },
      {
        title: 'Suara Haiwan',
        type: 'sound_match',
        emoji: '🔊',
        difficulty: 'easy',
        gameData: {
          questions: [
            { image: '🐱', options: ['Meow', 'Woof', 'Moo', 'Baa'], answer: 0 },
            { image: '🐶', options: ['Meow', 'Woof', 'Moo', 'Baa'], answer: 1 },
            { image: '🐄', options: ['Meow', 'Woof', 'Moo', 'Baa'], answer: 2 },
            { image: '🐑', options: ['Meow', 'Woof', 'Moo', 'Baa'], answer: 3 },
            { image: '🦆', options: ['Quack', 'Hiss', 'Chirp', 'Roar'], answer: 0 },
            { image: '🐍', options: ['Quack', 'Hiss', 'Chirp', 'Roar'], answer: 1 },
            { image: '🐦', options: ['Quack', 'Hiss', 'Chirp', 'Roar'], answer: 2 },
            { image: '🦁', options: ['Quack', 'Hiss', 'Chirp', 'Roar'], answer: 3 },
          ],
        },
      },
      {
        title: 'Nama Buah-Buahan',
        type: 'picture_quiz',
        emoji: '🍓',
        difficulty: 'easy',
        gameData: {
          questions: [
            { image: '🍎', options: ['Epal', 'Oren', 'Pisang'], answer: 0 },
            { image: '🍊', options: ['Epal', 'Oren', 'Mangga'], answer: 1 },
            { image: '🍌', options: ['Pisang', 'Betik', 'Ciku'], answer: 0 },
            { image: '🍇', options: ['Anggur', 'Strawberi', 'Ceri'], answer: 0 },
            { image: '🍓', options: ['Anggur', 'Strawberi', 'Epal'], answer: 1 },
            { image: '🍉', options: ['Tembikai', 'Betik', 'Mangga'], answer: 0 },
            { image: '🥭', options: ['Betik', 'Mangga', 'Durian'], answer: 1 },
            { image: '🍋', options: ['Limau', 'Oren', 'Lemon'], answer: 2 },
          ],
        },
      },
      {
        title: 'Nama Warna',
        type: 'picture_quiz',
        emoji: '🎨',
        difficulty: 'easy',
        gameData: {
          questions: [
            { image: '🔴', options: ['Merah', 'Biru', 'Hijau'], answer: 0 },
            { image: '🔵', options: ['Merah', 'Biru', 'Kuning'], answer: 1 },
            { image: '🟢', options: ['Ungu', 'Hijau', 'Oren'], answer: 1 },
            { image: '🟡', options: ['Kuning', 'Oren', 'Putih'], answer: 0 },
            { image: '🟠', options: ['Kuning', 'Oren', 'Merah'], answer: 1 },
            { image: '💜', options: ['Ungu', 'Merah Jambu', 'Biru'], answer: 0 },
            { image: '🤎', options: ['Hitam', 'Coklat', 'Kelabu'], answer: 1 },
            { image: '⚪', options: ['Putih', 'Hitam', 'Kelabu'], answer: 0 },
          ],
        },
      },
      {
        title: 'Nama Sayur-Sayuran',
        type: 'picture_quiz',
        emoji: '🥦',
        difficulty: 'easy',
        gameData: {
          questions: [
            { image: '🥕', options: ['Lobak Merah', 'Tomato', 'Bawang'], answer: 0 },
            { image: '🍅', options: ['Lobak', 'Tomato', 'Betik'], answer: 1 },
            { image: '🥦', options: ['Brokoli', 'Kobis', 'Bayam'], answer: 0 },
            { image: '🌽', options: ['Jagung', 'Timun', 'Labu'], answer: 0 },
            { image: '🥒', options: ['Timun', 'Lobak', 'Labu'], answer: 0 },
            { image: '🧅', options: ['Bawang', 'Kentang', 'Halia'], answer: 0 },
            { image: '🥔', options: ['Ubi', 'Kentang', 'Lobak'], answer: 1 },
            { image: '🌶️', options: ['Cili', 'Tomato', 'Lobak'], answer: 0 },
          ],
        },
      },
      {
        title: 'Bentuk Anggota Keluarga',
        type: 'picture_quiz',
        emoji: '👨‍👩‍👧‍👦',
        difficulty: 'easy',
        gameData: {
          questions: [
            { image: '👨', options: ['Ayah', 'Ibu', 'Abang'], answer: 0 },
            { image: '👩', options: ['Ayah', 'Ibu', 'Kakak'], answer: 1 },
            { image: '👦', options: ['Abang', 'Adik Lelaki', 'Datuk'], answer: 1 },
            { image: '👧', options: ['Kakak', 'Nenek', 'Ibu'], answer: 0 },
            { image: '👴', options: ['Ayah', 'Datuk', 'Abang'], answer: 1 },
            { image: '👵', options: ['Ibu', 'Nenek', 'Kakak'], answer: 1 },
            { image: '👶', options: ['Bayi', 'Adik', 'Budak'], answer: 0 },
            { image: '👨‍👩‍👧', options: ['Keluarga', 'Kawan', 'Jiran'], answer: 0 },
          ],
        },
      },
      {
        title: 'Huruf I hingga N',
        type: 'letter_match',
        emoji: '🔡',
        difficulty: 'easy',
        gameData: {
          questions: [
            { letter: 'I', emoji: '🐟', word: 'Ikan', options: ['I', 'J', 'K', 'L'], answer: 0 },
            { letter: 'J', emoji: '🌉', word: 'Jambatan', options: ['I', 'J', 'K', 'L'], answer: 1 },
            { letter: 'K', emoji: '🐴', word: 'Kuda', options: ['I', 'J', 'K', 'L'], answer: 2 },
            { letter: 'L', emoji: '🌊', word: 'Laut', options: ['I', 'J', 'K', 'L'], answer: 3 },
            { letter: 'M', emoji: '🌙', word: 'Malam', options: ['M', 'N', 'O', 'P'], answer: 0 },
            { letter: 'N', emoji: '🌰', word: 'Nangka', options: ['M', 'N', 'O', 'P'], answer: 1 },
            { letter: 'O', emoji: '🐙', word: 'Octopus', options: ['M', 'N', 'O', 'P'], answer: 2 },
            { letter: 'P', emoji: '🦚', word: 'Merak', options: ['M', 'N', 'O', 'P'], answer: 3 },
          ],
        },
      },
      {
        title: 'Perkataan Pertama Saya',
        type: 'picture_quiz',
        emoji: '💬',
        difficulty: 'easy',
        gameData: {
          questions: [
            { image: '🏠', options: ['Rumah', 'Sekolah', 'Kedai'], answer: 0 },
            { image: '🚗', options: ['Bas', 'Kereta', 'Lori'], answer: 1 },
            { image: '📚', options: ['Buku', 'Pensil', 'Kertas'], answer: 0 },
            { image: '🎒', options: ['Beg', 'Buku', 'Kotak'], answer: 0 },
            { image: '✏️', options: ['Pen', 'Pensil', 'Pensel'], answer: 1 },
            { image: '🍽️', options: ['Pinggan', 'Mangkuk', 'Cawan'], answer: 0 },
            { image: '🛏️', options: ['Katil', 'Kerusi', 'Meja'], answer: 0 },
            { image: '🪑', options: ['Meja', 'Kerusi', 'Almari'], answer: 1 },
          ],
        },
      },
    ],

    english: [
      {
        title: 'ABC Letters - A to H',
        type: 'letter_match',
        emoji: '🔤',
        difficulty: 'easy',
        gameData: {
          questions: [
            { letter: 'A', emoji: '🍎', word: 'Apple', options: ['A', 'B', 'C', 'D'], answer: 0 },
            { letter: 'B', emoji: '🐦', word: 'Bird', options: ['A', 'B', 'C', 'D'], answer: 1 },
            { letter: 'C', emoji: '🐱', word: 'Cat', options: ['A', 'B', 'C', 'D'], answer: 2 },
            { letter: 'D', emoji: '🐕', word: 'Dog', options: ['A', 'B', 'C', 'D'], answer: 3 },
            { letter: 'E', emoji: '🐘', word: 'Elephant', options: ['D', 'E', 'F', 'G'], answer: 1 },
            { letter: 'F', emoji: '🐟', word: 'Fish', options: ['D', 'E', 'F', 'G'], answer: 2 },
            { letter: 'G', emoji: '🦒', word: 'Giraffe', options: ['E', 'F', 'G', 'H'], answer: 2 },
            { letter: 'H', emoji: '🐎', word: 'Horse', options: ['F', 'G', 'H', 'I'], answer: 2 },
          ],
        },
      },
      {
        title: 'Vowels A, E, I, O, U',
        type: 'letter_match',
        emoji: '🅰️',
        difficulty: 'easy',
        gameData: {
          questions: [
            { letter: 'A', emoji: '🍎', word: 'Apple', options: ['A', 'E', 'I', 'O'], answer: 0 },
            { letter: 'E', emoji: '🥚', word: 'Egg', options: ['A', 'E', 'I', 'O'], answer: 1 },
            { letter: 'I', emoji: '🍦', word: 'Ice Cream', options: ['A', 'E', 'I', 'O'], answer: 2 },
            { letter: 'O', emoji: '🍊', word: 'Orange', options: ['A', 'E', 'I', 'O'], answer: 3 },
            { letter: 'U', emoji: '☂️', word: 'Umbrella', options: ['I', 'U', 'E', 'O'], answer: 1 },
            { letter: 'A', emoji: '🐊', word: 'Alligator', options: ['U', 'A', 'I', 'O'], answer: 1 },
            { letter: 'E', emoji: '🦅', word: 'Eagle', options: ['A', 'E', 'U', 'I'], answer: 1 },
            { letter: 'I', emoji: '🐛', word: 'Insect', options: ['U', 'O', 'I', 'A'], answer: 2 },
          ],
        },
      },
      {
        title: 'Animal Names',
        type: 'picture_quiz',
        emoji: '🐾',
        difficulty: 'easy',
        gameData: {
          questions: [
            { image: '🐱', options: ['Cat', 'Dog', 'Rabbit'], answer: 0 },
            { image: '🐶', options: ['Cat', 'Dog', 'Bird'], answer: 1 },
            { image: '🦁', options: ['Lion', 'Tiger', 'Bear'], answer: 0 },
            { image: '🐘', options: ['Elephant', 'Horse', 'Zebra'], answer: 0 },
            { image: '🐧', options: ['Penguin', 'Chicken', 'Duck'], answer: 0 },
            { image: '🦒', options: ['Giraffe', 'Deer', 'Horse'], answer: 0 },
            { image: '🐻', options: ['Bear', 'Wolf', 'Lion'], answer: 0 },
            { image: '🦓', options: ['Zebra', 'Horse', 'Donkey'], answer: 0 },
          ],
        },
      },
      {
        title: 'Fruit Names',
        type: 'picture_quiz',
        emoji: '🍓',
        difficulty: 'easy',
        gameData: {
          questions: [
            { image: '🍎', options: ['Apple', 'Orange', 'Banana'], answer: 0 },
            { image: '🍊', options: ['Apple', 'Orange', 'Mango'], answer: 1 },
            { image: '🍌', options: ['Banana', 'Papaya', 'Mango'], answer: 0 },
            { image: '🍇', options: ['Grapes', 'Strawberry', 'Cherry'], answer: 0 },
            { image: '🍓', options: ['Grapes', 'Strawberry', 'Apple'], answer: 1 },
            { image: '🍉', options: ['Watermelon', 'Papaya', 'Mango'], answer: 0 },
            { image: '🥭', options: ['Papaya', 'Mango', 'Durian'], answer: 1 },
            { image: '🍋', options: ['Lime', 'Orange', 'Lemon'], answer: 2 },
          ],
        },
      },
      {
        title: 'Color Names',
        type: 'picture_quiz',
        emoji: '🌈',
        difficulty: 'easy',
        gameData: {
          questions: [
            { image: '🔴', options: ['Red', 'Blue', 'Green'], answer: 0 },
            { image: '🔵', options: ['Red', 'Blue', 'Yellow'], answer: 1 },
            { image: '🟢', options: ['Purple', 'Green', 'Orange'], answer: 1 },
            { image: '🟡', options: ['Yellow', 'Orange', 'White'], answer: 0 },
            { image: '🟠', options: ['Yellow', 'Orange', 'Red'], answer: 1 },
            { image: '💜', options: ['Purple', 'Pink', 'Blue'], answer: 0 },
            { image: '🤎', options: ['Black', 'Brown', 'Grey'], answer: 1 },
            { image: '⚪', options: ['White', 'Black', 'Grey'], answer: 0 },
          ],
        },
      },
      {
        title: 'Body Parts',
        type: 'picture_quiz',
        emoji: '🧒',
        difficulty: 'easy',
        gameData: {
          questions: [
            { image: '👁️', options: ['Eye', 'Nose', 'Ear'], answer: 0 },
            { image: '👃', options: ['Eye', 'Nose', 'Mouth'], answer: 1 },
            { image: '👂', options: ['Eye', 'Nose', 'Ear'], answer: 2 },
            { image: '👄', options: ['Mouth', 'Nose', 'Lip'], answer: 0 },
            { image: '✋', options: ['Foot', 'Hand', 'Leg'], answer: 1 },
            { image: '🦶', options: ['Foot', 'Hand', 'Arm'], answer: 0 },
            { image: '🦵', options: ['Arm', 'Leg', 'Hand'], answer: 1 },
            { image: '🧠', options: ['Heart', 'Brain', 'Lung'], answer: 1 },
          ],
        },
      },
      {
        title: 'Letters I to P',
        type: 'letter_match',
        emoji: '🔡',
        difficulty: 'easy',
        gameData: {
          questions: [
            { letter: 'I', emoji: '🐛', word: 'Insect', options: ['I', 'J', 'K', 'L'], answer: 0 },
            { letter: 'J', emoji: '🤹', word: 'Juggler', options: ['I', 'J', 'K', 'L'], answer: 1 },
            { letter: 'K', emoji: '🪀', word: 'Kite', options: ['I', 'J', 'K', 'L'], answer: 2 },
            { letter: 'L', emoji: '🦁', word: 'Lion', options: ['I', 'J', 'K', 'L'], answer: 3 },
            { letter: 'M', emoji: '🌙', word: 'Moon', options: ['M', 'N', 'O', 'P'], answer: 0 },
            { letter: 'N', emoji: '🥜', word: 'Nut', options: ['M', 'N', 'O', 'P'], answer: 1 },
            { letter: 'O', emoji: '🦉', word: 'Owl', options: ['M', 'N', 'O', 'P'], answer: 2 },
            { letter: 'P', emoji: '🐼', word: 'Panda', options: ['M', 'N', 'O', 'P'], answer: 3 },
          ],
        },
      },
      {
        title: 'Letters Q to Z',
        type: 'letter_match',
        emoji: '🔠',
        difficulty: 'easy',
        gameData: {
          questions: [
            { letter: 'Q', emoji: '👸', word: 'Queen', options: ['Q', 'R', 'S', 'T'], answer: 0 },
            { letter: 'R', emoji: '🌹', word: 'Rose', options: ['Q', 'R', 'S', 'T'], answer: 1 },
            { letter: 'S', emoji: '⭐', word: 'Star', options: ['Q', 'R', 'S', 'T'], answer: 2 },
            { letter: 'T', emoji: '🐯', word: 'Tiger', options: ['Q', 'R', 'S', 'T'], answer: 3 },
            { letter: 'U', emoji: '☂️', word: 'Umbrella', options: ['U', 'V', 'W', 'X'], answer: 0 },
            { letter: 'V', emoji: '🎻', word: 'Violin', options: ['U', 'V', 'W', 'X'], answer: 1 },
            { letter: 'W', emoji: '🐋', word: 'Whale', options: ['U', 'V', 'W', 'X'], answer: 2 },
            { letter: 'Y', emoji: '🪀', word: 'Yo-yo', options: ['W', 'X', 'Y', 'Z'], answer: 2 },
          ],
        },
      },
      {
        title: 'Simple Words - Things',
        type: 'picture_quiz',
        emoji: '🧸',
        difficulty: 'easy',
        gameData: {
          questions: [
            { image: '🏠', options: ['House', 'School', 'Shop'], answer: 0 },
            { image: '🚗', options: ['Bus', 'Car', 'Truck'], answer: 1 },
            { image: '📚', options: ['Book', 'Pencil', 'Paper'], answer: 0 },
            { image: '🎒', options: ['Bag', 'Book', 'Box'], answer: 0 },
            { image: '✏️', options: ['Pen', 'Pencil', 'Ruler'], answer: 1 },
            { image: '🍽️', options: ['Plate', 'Bowl', 'Cup'], answer: 0 },
            { image: '🛏️', options: ['Bed', 'Chair', 'Table'], answer: 0 },
            { image: '🪑', options: ['Table', 'Chair', 'Cupboard'], answer: 1 },
          ],
        },
      },
      {
        title: 'Numbers 1-10 in English',
        type: 'number_match',
        emoji: '🔢',
        difficulty: 'easy',
        gameData: {
          questions: [
            { problem: '⭐', options: ['One', 'Two', 'Three'], answer: 0 },
            { problem: '⭐⭐', options: ['One', 'Two', 'Three'], answer: 1 },
            { problem: '⭐⭐⭐', options: ['Two', 'Three', 'Four'], answer: 1 },
            { problem: '⭐⭐⭐⭐', options: ['Three', 'Four', 'Five'], answer: 1 },
            { problem: '⭐⭐⭐⭐⭐', options: ['Four', 'Five', 'Six'], answer: 1 },
            { problem: '⭐⭐⭐⭐⭐⭐', options: ['Five', 'Six', 'Seven'], answer: 1 },
            { problem: '⭐⭐⭐⭐⭐⭐⭐', options: ['Six', 'Seven', 'Eight'], answer: 1 },
            { problem: '⭐⭐⭐⭐⭐⭐⭐⭐', options: ['Seven', 'Eight', 'Nine'], answer: 1 },
          ],
        },
      },
    ],

    mathematics: [
      {
        title: 'Kira 1 hingga 5',
        type: 'counting',
        emoji: '🔢',
        difficulty: 'easy',
        gameData: {
          questions: [
            { image: '🍎', options: ['1', '2', '3'], answer: 0 },
            { image: '🍎🍎', options: ['1', '2', '3'], answer: 1 },
            { image: '🍎🍎🍎', options: ['2', '3', '4'], answer: 1 },
            { image: '🍎🍎🍎🍎', options: ['3', '4', '5'], answer: 1 },
            { image: '🍎🍎🍎🍎🍎', options: ['4', '5', '6'], answer: 1 },
            { image: '🌟🌟', options: ['1', '2', '3'], answer: 1 },
            { image: '🌟🌟🌟', options: ['2', '3', '4'], answer: 1 },
            { image: '🌟🌟🌟🌟', options: ['3', '4', '5'], answer: 1 },
          ],
        },
      },
      {
        title: 'Kira 6 hingga 10',
        type: 'counting',
        emoji: '🔟',
        difficulty: 'easy',
        gameData: {
          questions: [
            { image: '🍎🍎🍎🍎🍎🍎', options: ['5', '6', '7'], answer: 1 },
            { image: '🍎🍎🍎🍎🍎🍎🍎', options: ['6', '7', '8'], answer: 1 },
            { image: '🍎🍎🍎🍎🍎🍎🍎🍎', options: ['7', '8', '9'], answer: 1 },
            { image: '🍎🍎🍎🍎🍎🍎🍎🍎🍎', options: ['8', '9', '10'], answer: 1 },
            { image: '🍎🍎🍎🍎🍎🍎🍎🍎🍎🍎', options: ['9', '10', '11'], answer: 1 },
            { image: '⭐⭐⭐⭐⭐⭐', options: ['5', '6', '7'], answer: 1 },
            { image: '⭐⭐⭐⭐⭐⭐⭐', options: ['6', '7', '8'], answer: 1 },
            { image: '⭐⭐⭐⭐⭐⭐⭐⭐', options: ['7', '8', '9'], answer: 1 },
          ],
        },
      },
      {
        title: 'Nombor 1 hingga 10',
        type: 'number_match',
        emoji: '1️⃣',
        difficulty: 'easy',
        gameData: {
          questions: [
            { problem: '⭐', options: ['1', '2', '3'], answer: 0 },
            { problem: '⭐⭐', options: ['1', '2', '3'], answer: 1 },
            { problem: '⭐⭐⭐', options: ['1', '2', '3'], answer: 2 },
            { problem: '⭐⭐⭐⭐', options: ['3', '4', '5'], answer: 1 },
            { problem: '⭐⭐⭐⭐⭐', options: ['4', '5', '6'], answer: 1 },
            { problem: '⭐⭐⭐⭐⭐⭐', options: ['5', '6', '7'], answer: 1 },
            { problem: '⭐⭐⭐⭐⭐⭐⭐', options: ['6', '7', '8'], answer: 1 },
            { problem: '⭐⭐⭐⭐⭐⭐⭐⭐', options: ['7', '8', '9'], answer: 1 },
          ],
        },
      },
      {
        title: 'Tambah 1+1 hingga 5+5',
        type: 'math_puzzle',
        emoji: '➕',
        difficulty: 'easy',
        gameData: {
          questions: [
            { problem: '1+1', options: ['3', '2', '4', '1'], answer: 1 },
            { problem: '2+1', options: ['4', '3', '5', '2'], answer: 1 },
            { problem: '1+2', options: ['4', '3', '5', '2'], answer: 1 },
            { problem: '2+2', options: ['6', '4', '5', '3'], answer: 1 },
            { problem: '3+1', options: ['6', '4', '5', '2'], answer: 1 },
            { problem: '2+3', options: ['7', '5', '6', '4'], answer: 1 },
            { problem: '4+1', options: ['7', '5', '6', '4'], answer: 1 },
            { problem: '3+3', options: ['7', '6', '8', '5'], answer: 1 },
          ],
        },
      },
      {
        title: 'Bentuk Geometri Mudah',
        type: 'shape_sort',
        emoji: '🔵',
        difficulty: 'easy',
        gameData: {
          questions: [
            { image: '⭕', options: ['Bulatan', 'Segi Empat', 'Segi Tiga'], answer: 0 },
            { image: '⬜', options: ['Bulatan', 'Segi Empat', 'Segi Tiga'], answer: 1 },
            { image: '△', options: ['Bulatan', 'Segi Empat', 'Segi Tiga'], answer: 2 },
            { image: '▭', options: ['Segiempat Tepat', 'Segi Empat', 'Bujur'], answer: 0 },
            { image: '⭐', options: ['Bintang', 'Bulatan', 'Segi Tiga'], answer: 0 },
            { image: '🔶', options: ['Berlian', 'Heksagon', 'Segi Empat'], answer: 0 },
            { image: '🔷', options: ['Berlian', 'Bujur', 'Segi Tiga'], answer: 0 },
            { image: '🔴', options: ['Bola', 'Bulatan', 'Cakera'], answer: 1 },
          ],
        },
      },
      {
        title: 'Lebih Besar atau Lebih Kecil',
        type: 'math_puzzle',
        emoji: '📏',
        difficulty: 'easy',
        gameData: {
          questions: [
            { problem: '3 atau 5?', options: ['3 lebih besar', '5 lebih besar', 'Sama'], answer: 1 },
            { problem: '7 atau 4?', options: ['7 lebih besar', '4 lebih besar', 'Sama'], answer: 0 },
            { problem: '2 atau 2?', options: ['2 lebih besar', '2 lebih kecil', 'Sama'], answer: 2 },
            { problem: '1 atau 9?', options: ['1 lebih besar', '9 lebih besar', 'Sama'], answer: 1 },
            { problem: '6 atau 3?', options: ['6 lebih besar', '3 lebih besar', 'Sama'], answer: 0 },
            { problem: '5 atau 8?', options: ['5 lebih besar', '8 lebih besar', 'Sama'], answer: 1 },
            { problem: '4 atau 4?', options: ['4 lebih besar', '4 lebih kecil', 'Sama'], answer: 2 },
            { problem: '10 atau 7?', options: ['10 lebih besar', '7 lebih besar', 'Sama'], answer: 0 },
          ],
        },
      },
      {
        title: 'Tolak Mudah',
        type: 'math_puzzle',
        emoji: '➖',
        difficulty: 'easy',
        gameData: {
          questions: [
            { problem: '3-1', options: ['1', '2', '3', '4'], answer: 1 },
            { problem: '5-2', options: ['2', '3', '4', '5'], answer: 1 },
            { problem: '4-1', options: ['2', '3', '4', '5'], answer: 1 },
            { problem: '6-3', options: ['2', '3', '4', '5'], answer: 1 },
            { problem: '7-2', options: ['4', '5', '6', '7'], answer: 1 },
            { problem: '8-4', options: ['3', '4', '5', '6'], answer: 1 },
            { problem: '9-3', options: ['5', '6', '7', '8'], answer: 1 },
            { problem: '10-5', options: ['4', '5', '6', '7'], answer: 1 },
          ],
        },
      },
      {
        title: 'Susunan Nombor',
        type: 'number_match',
        emoji: '🔢',
        difficulty: 'easy',
        gameData: {
          questions: [
            { problem: 'Selepas 3 ialah?', options: ['2', '4', '5', '3'], answer: 1 },
            { problem: 'Selepas 6 ialah?', options: ['5', '7', '8', '6'], answer: 1 },
            { problem: 'Sebelum 5 ialah?', options: ['6', '4', '3', '5'], answer: 1 },
            { problem: 'Sebelum 9 ialah?', options: ['10', '8', '7', '9'], answer: 1 },
            { problem: 'Antara 4 dan 6?', options: ['3', '5', '7', '4'], answer: 1 },
            { problem: 'Antara 1 dan 3?', options: ['0', '2', '4', '1'], answer: 1 },
            { problem: 'Selepas 8 ialah?', options: ['7', '9', '10', '8'], answer: 1 },
            { problem: 'Sebelum 2 ialah?', options: ['3', '1', '0', '2'], answer: 1 },
          ],
        },
      },
      {
        title: 'Wang Syiling Kecil',
        type: 'counting',
        emoji: '💰',
        difficulty: 'medium',
        gameData: {
          questions: [
            { image: '🪙', options: ['10 sen', '20 sen', '50 sen'], answer: 0 },
            { image: '🪙🪙', options: ['10 sen', '20 sen', '30 sen'], answer: 1 },
            { image: '🪙🪙🪙', options: ['20 sen', '30 sen', '40 sen'], answer: 1 },
            { image: '🪙🪙🪙🪙🪙', options: ['40 sen', '50 sen', '60 sen'], answer: 1 },
            { image: '💵', options: ['RM 1', 'RM 2', 'RM 5'], answer: 0 },
            { image: '💵💵', options: ['RM 1', 'RM 2', 'RM 3'], answer: 1 },
            { image: '💵💵💵', options: ['RM 2', 'RM 3', 'RM 4'], answer: 1 },
            { image: '💵💵💵💵💵', options: ['RM 4', 'RM 5', 'RM 6'], answer: 1 },
          ],
        },
      },
      {
        title: 'Corak dan Urutan',
        type: 'pattern_fill',
        emoji: '🔷',
        difficulty: 'medium',
        gameData: {
          questions: [
            { problem: '🔴🔵🔴🔵?', options: ['🔴', '🔵', '🟢'], answer: 0 },
            { problem: '⭐🌙⭐🌙?', options: ['⭐', '🌙', '☀️'], answer: 0 },
            { problem: '1, 2, 3, ?', options: ['3', '4', '5'], answer: 1 },
            { problem: '2, 4, 6, ?', options: ['7', '8', '9'], answer: 1 },
            { problem: '🔺🔺🔵🔺🔺?', options: ['🔺', '🔵', '🔷'], answer: 1 },
            { problem: '5, 10, 15, ?', options: ['18', '20', '25'], answer: 1 },
            { problem: '🟡🟡🔴🟡🟡?', options: ['🟡', '🔴', '🔵'], answer: 1 },
            { problem: '1, 3, 5, ?', options: ['6', '7', '8'], answer: 1 },
          ],
        },
      },
    ],

    science: [
      {
        title: 'Haiwan & Tempat Tinggal',
        type: 'picture_quiz',
        emoji: '🦁',
        difficulty: 'easy',
        gameData: {
          questions: [
            { image: '🐠', options: ['Air', 'Udara', 'Tanah'], answer: 0 },
            { image: '🐦', options: ['Air', 'Udara', 'Tanah'], answer: 1 },
            { image: '🐿️', options: ['Air', 'Udara', 'Tanah'], answer: 2 },
            { image: '🦈', options: ['Air', 'Udara', 'Tanah'], answer: 0 },
            { image: '🦅', options: ['Air', 'Udara', 'Tanah'], answer: 1 },
            { image: '🐜', options: ['Air', 'Udara', 'Tanah'], answer: 2 },
            { image: '🐢', options: ['Air', 'Udara', 'Tanah'], answer: 0 },
            { image: '🦆', options: ['Air', 'Udara', 'Tanah'], answer: 1 },
          ],
        },
      },
      {
        title: 'Warna-Warni di Alam',
        type: 'color_match',
        emoji: '🌈',
        difficulty: 'easy',
        gameData: {
          questions: [
            { image: '🔴', options: ['Merah', 'Biru', 'Hijau'], answer: 0 },
            { image: '🔵', options: ['Merah', 'Biru', 'Hijau'], answer: 1 },
            { image: '🟢', options: ['Merah', 'Biru', 'Hijau'], answer: 2 },
            { image: '🟡', options: ['Kuning', 'Oren', 'Merah'], answer: 0 },
            { image: '🟠', options: ['Kuning', 'Oren', 'Merah'], answer: 1 },
            { image: '💜', options: ['Ungu', 'Merah Jambu', 'Biru'], answer: 0 },
            { image: '🤎', options: ['Coklat', 'Hitam', 'Kelabu'], answer: 0 },
            { image: '⚫', options: ['Coklat', 'Hitam', 'Kelabu'], answer: 1 },
          ],
        },
      },
      {
        title: 'Makanan Sihat',
        type: 'picture_quiz',
        emoji: '🥗',
        difficulty: 'easy',
        gameData: {
          questions: [
            { image: '🥦', options: ['Sihat', 'Tidak Sihat', 'Sederhana'], answer: 0 },
            { image: '🍕', options: ['Sihat', 'Tidak Sihat', 'Sederhana'], answer: 1 },
            { image: '🥕', options: ['Sihat', 'Tidak Sihat', 'Sederhana'], answer: 0 },
            { image: '🍩', options: ['Sihat', 'Tidak Sihat', 'Sederhana'], answer: 1 },
            { image: '🍎', options: ['Sihat', 'Tidak Sihat', 'Sederhana'], answer: 0 },
            { image: '🍔', options: ['Sihat', 'Tidak Sihat', 'Sederhana'], answer: 1 },
            { image: '🥛', options: ['Sihat', 'Tidak Sihat', 'Sederhana'], answer: 0 },
            { image: '🍬', options: ['Sihat', 'Tidak Sihat', 'Sederhana'], answer: 1 },
          ],
        },
      },
      {
        title: 'Siang dan Malam',
        type: 'picture_quiz',
        emoji: '🌙',
        difficulty: 'easy',
        gameData: {
          questions: [
            { image: '☀️', options: ['Siang', 'Malam', 'Petang'], answer: 0 },
            { image: '🌙', options: ['Siang', 'Malam', 'Pagi'], answer: 1 },
            { image: '🌅', options: ['Pagi', 'Tengahari', 'Malam'], answer: 0 },
            { image: '🌇', options: ['Pagi', 'Petang', 'Malam'], answer: 1 },
            { image: '⭐', options: ['Siang', 'Malam', 'Pagi'], answer: 1 },
            { image: '🌄', options: ['Pagi', 'Malam', 'Petang'], answer: 0 },
            { image: '🌤️', options: ['Siang', 'Malam', 'Subuh'], answer: 0 },
            { image: '🌃', options: ['Siang', 'Malam', 'Pagi'], answer: 1 },
          ],
        },
      },
      {
        title: 'Pancaindera',
        type: 'picture_quiz',
        emoji: '👁️',
        difficulty: 'easy',
        gameData: {
          questions: [
            { image: '👁️', options: ['Lihat', 'Dengar', 'Rasa'], answer: 0 },
            { image: '👂', options: ['Lihat', 'Dengar', 'Bau'], answer: 1 },
            { image: '👃', options: ['Lihat', 'Rasa', 'Bau'], answer: 2 },
            { image: '👅', options: ['Bau', 'Rasa', 'Dengar'], answer: 1 },
            { image: '✋', options: ['Lihat', 'Dengar', 'Sentuh'], answer: 2 },
            { image: '🌹', options: ['Harum', 'Berbunyi', 'Pahit'], answer: 0 },
            { image: '🍋', options: ['Manis', 'Masam', 'Masin'], answer: 1 },
            { image: '🥁', options: ['Berbunyi', 'Harum', 'Rasa'], answer: 0 },
          ],
        },
      },
      {
        title: 'Tumbuhan di Sekeliling Kita',
        type: 'picture_quiz',
        emoji: '🌱',
        difficulty: 'easy',
        gameData: {
          questions: [
            { image: '🌳', options: ['Pokok', 'Bunga', 'Rumput'], answer: 0 },
            { image: '🌸', options: ['Pokok', 'Bunga', 'Daun'], answer: 1 },
            { image: '🍀', options: ['Bunga', 'Daun', 'Biji'], answer: 1 },
            { image: '🌵', options: ['Kaktus', 'Pokok Epal', 'Pokok Kelapa'], answer: 0 },
            { image: '🌻', options: ['Ros', 'Bunga Matahari', 'Orkid'], answer: 1 },
            { image: '🍄', options: ['Cendawan', 'Bunga', 'Pokok'], answer: 0 },
            { image: '🌿', options: ['Rumput', 'Daun', 'Akar'], answer: 1 },
            { image: '🌾', options: ['Padi', 'Rumput', 'Gandum'], answer: 0 },
          ],
        },
      },
      {
        title: 'Langit dan Cuaca',
        type: 'picture_quiz',
        emoji: '⛅',
        difficulty: 'easy',
        gameData: {
          questions: [
            { image: '☀️', options: ['Panas', 'Sejuk', 'Hujan'], answer: 0 },
            { image: '🌧️', options: ['Panas', 'Sejuk', 'Hujan'], answer: 2 },
            { image: '⛅', options: ['Awan', 'Panas', 'Gelap'], answer: 0 },
            { image: '🌈', options: ['Pelangi', 'Kilat', 'Hujan'], answer: 0 },
            { image: '💨', options: ['Angin', 'Hujan', 'Panas'], answer: 0 },
            { image: '🌩️', options: ['Kilat', 'Pelangi', 'Awan'], answer: 0 },
            { image: '❄️', options: ['Ais', 'Hujan', 'Salji'], answer: 2 },
            { image: '🌫️', options: ['Kabus', 'Asap', 'Awan'], answer: 0 },
          ],
        },
      },
      {
        title: 'Haiwan Peliharaan',
        type: 'picture_quiz',
        emoji: '🐾',
        difficulty: 'easy',
        gameData: {
          questions: [
            { image: '🐱', options: ['Peliharaan', 'Liar', 'Ternakan'], answer: 0 },
            { image: '🐶', options: ['Peliharaan', 'Liar', 'Ternakan'], answer: 0 },
            { image: '🐰', options: ['Peliharaan', 'Liar', 'Ternakan'], answer: 0 },
            { image: '🦁', options: ['Peliharaan', 'Liar', 'Ternakan'], answer: 1 },
            { image: '🐄', options: ['Peliharaan', 'Liar', 'Ternakan'], answer: 2 },
            { image: '🐍', options: ['Peliharaan', 'Liar', 'Bahaya'], answer: 1 },
            { image: '🐠', options: ['Peliharaan', 'Liar', 'Ternakan'], answer: 0 },
            { image: '🐔', options: ['Peliharaan', 'Liar', 'Ternakan'], answer: 2 },
          ],
        },
      },
      {
        title: 'Benda Hidup dan Benda Mati',
        type: 'picture_quiz',
        emoji: '🌿',
        difficulty: 'easy',
        gameData: {
          questions: [
            { image: '🌳', options: ['Hidup', 'Mati', 'Tidak Pasti'], answer: 0 },
            { image: '🪑', options: ['Hidup', 'Mati', 'Tidak Pasti'], answer: 1 },
            { image: '🐶', options: ['Hidup', 'Mati', 'Tidak Pasti'], answer: 0 },
            { image: '📚', options: ['Hidup', 'Mati', 'Tidak Pasti'], answer: 1 },
            { image: '🐟', options: ['Hidup', 'Mati', 'Tidak Pasti'], answer: 0 },
            { image: '🪨', options: ['Hidup', 'Mati', 'Tidak Pasti'], answer: 1 },
            { image: '🌸', options: ['Hidup', 'Mati', 'Tidak Pasti'], answer: 0 },
            { image: '🚗', options: ['Hidup', 'Mati', 'Tidak Pasti'], answer: 1 },
          ],
        },
      },
      {
        title: 'Musim dan Perubahan Alam',
        type: 'picture_quiz',
        emoji: '🍂',
        difficulty: 'easy',
        gameData: {
          questions: [
            { image: '🌧️🌧️🌧️', options: ['Musim Hujan', 'Musim Panas', 'Musim Bunga'], answer: 0 },
            { image: '☀️☀️☀️', options: ['Musim Hujan', 'Musim Panas', 'Musim Salji'], answer: 1 },
            { image: '🍂🍁', options: ['Musim Luruh', 'Musim Bunga', 'Musim Panas'], answer: 0 },
            { image: '❄️⛄', options: ['Musim Panas', 'Musim Luruh', 'Musim Sejuk'], answer: 2 },
            { image: '🌸🌷', options: ['Musim Bunga', 'Musim Luruh', 'Musim Panas'], answer: 0 },
            { image: '🌈', options: ['Selepas Hujan', 'Semasa Panas', 'Waktu Malam'], answer: 0 },
            { image: '⛈️', options: ['Ribut Petir', 'Hari Cerah', 'Hari Berangin'], answer: 0 },
            { image: '🌬️', options: ['Angin Kencang', 'Hujan Lebat', 'Hari Panas'], answer: 0 },
          ],
        },
      },
    ],

    worksheet: [
      {
        title: 'Tracing Huruf A-E',
        type: 'tracing',
        emoji: '✏️',
        difficulty: 'easy',
        gameData: {
          questions: [
            { letter: 'A', strokes: [[{x:0.5,y:0.1},{x:0.2,y:0.9}],[{x:0.5,y:0.1},{x:0.8,y:0.9}],[{x:0.3,y:0.55},{x:0.7,y:0.55}]] },
            { letter: 'B', strokes: [[{x:0.3,y:0.1},{x:0.3,y:0.9}],[{x:0.3,y:0.1},{x:0.6,y:0.3},{x:0.3,y:0.5}],[{x:0.3,y:0.5},{x:0.65,y:0.7},{x:0.3,y:0.9}]] },
            { letter: 'C', strokes: [[{x:0.7,y:0.2},{x:0.4,y:0.1},{x:0.2,y:0.3},{x:0.2,y:0.7},{x:0.4,y:0.9},{x:0.7,y:0.8}]] },
            { letter: 'D', strokes: [[{x:0.3,y:0.1},{x:0.3,y:0.9}],[{x:0.3,y:0.1},{x:0.6,y:0.3},{x:0.7,y:0.5},{x:0.6,y:0.7},{x:0.3,y:0.9}]] },
            { letter: 'E', strokes: [[{x:0.7,y:0.1},{x:0.3,y:0.1},{x:0.3,y:0.9},{x:0.7,y:0.9}],[{x:0.3,y:0.5},{x:0.6,y:0.5}]] },
          ],
        },
      },
      {
        title: 'Tracing Huruf F-J',
        type: 'tracing',
        emoji: '✏️',
        difficulty: 'easy',
        gameData: {
          questions: [
            { letter: 'F', strokes: [[{x:0.3,y:0.1},{x:0.3,y:0.9}],[{x:0.3,y:0.1},{x:0.7,y:0.1}],[{x:0.3,y:0.5},{x:0.6,y:0.5}]] },
            { letter: 'G', strokes: [[{x:0.7,y:0.2},{x:0.4,y:0.1},{x:0.2,y:0.3},{x:0.2,y:0.7},{x:0.4,y:0.9},{x:0.7,y:0.9},{x:0.7,y:0.55},{x:0.5,y:0.55}]] },
            { letter: 'H', strokes: [[{x:0.3,y:0.1},{x:0.3,y:0.9}],[{x:0.7,y:0.1},{x:0.7,y:0.9}],[{x:0.3,y:0.5},{x:0.7,y:0.5}]] },
            { letter: 'I', strokes: [[{x:0.5,y:0.1},{x:0.5,y:0.9}],[{x:0.3,y:0.1},{x:0.7,y:0.1}],[{x:0.3,y:0.9},{x:0.7,y:0.9}]] },
            { letter: 'J', strokes: [[{x:0.6,y:0.1},{x:0.6,y:0.75},{x:0.5,y:0.9},{x:0.35,y:0.85}],[{x:0.4,y:0.1},{x:0.7,y:0.1}]] },
          ],
        },
      },
      {
        title: 'Tracing Huruf K-O',
        type: 'tracing',
        emoji: '✏️',
        difficulty: 'easy',
        gameData: {
          questions: [
            { letter: 'K', strokes: [[{x:0.3,y:0.1},{x:0.3,y:0.9}],[{x:0.7,y:0.1},{x:0.3,y:0.5}],[{x:0.3,y:0.5},{x:0.7,y:0.9}]] },
            { letter: 'L', strokes: [[{x:0.3,y:0.1},{x:0.3,y:0.9},{x:0.7,y:0.9}]] },
            { letter: 'M', strokes: [[{x:0.2,y:0.9},{x:0.2,y:0.1},{x:0.5,y:0.5},{x:0.8,y:0.1},{x:0.8,y:0.9}]] },
            { letter: 'N', strokes: [[{x:0.3,y:0.9},{x:0.3,y:0.1},{x:0.7,y:0.9},{x:0.7,y:0.1}]] },
            { letter: 'O', strokes: [[{x:0.5,y:0.1},{x:0.8,y:0.3},{x:0.85,y:0.5},{x:0.8,y:0.7},{x:0.5,y:0.9},{x:0.2,y:0.7},{x:0.15,y:0.5},{x:0.2,y:0.3},{x:0.5,y:0.1}]] },
          ],
        },
      },
      {
        title: 'Tracing Nombor 1-5',
        type: 'tracing',
        emoji: '🔢',
        difficulty: 'easy',
        gameData: {
          questions: [
            { letter: '1', strokes: [[{x:0.5,y:0.1},{x:0.5,y:0.9}]] },
            { letter: '2', strokes: [[{x:0.3,y:0.2},{x:0.6,y:0.1},{x:0.7,y:0.4},{x:0.3,y:0.7},{x:0.3,y:0.9},{x:0.7,y:0.9}]] },
            { letter: '3', strokes: [[{x:0.3,y:0.1},{x:0.7,y:0.1},{x:0.5,y:0.5},{x:0.7,y:0.9},{x:0.3,y:0.9}]] },
            { letter: '4', strokes: [[{x:0.6,y:0.1},{x:0.6,y:0.9}],[{x:0.6,y:0.1},{x:0.3,y:0.6},{x:0.7,y:0.6}]] },
            { letter: '5', strokes: [[{x:0.7,y:0.1},{x:0.3,y:0.1},{x:0.3,y:0.5},{x:0.6,y:0.5},{x:0.7,y:0.7},{x:0.5,y:0.9},{x:0.3,y:0.85}]] },
          ],
        },
      },
      {
        title: 'Tracing Nombor 6-10',
        type: 'tracing',
        emoji: '🔢',
        difficulty: 'easy',
        gameData: {
          questions: [
            { letter: '6', strokes: [[{x:0.6,y:0.1},{x:0.3,y:0.4},{x:0.25,y:0.65},{x:0.4,y:0.9},{x:0.65,y:0.9},{x:0.75,y:0.7},{x:0.65,y:0.5},{x:0.35,y:0.5}]] },
            { letter: '7', strokes: [[{x:0.3,y:0.1},{x:0.7,y:0.1},{x:0.4,y:0.9}]] },
            { letter: '8', strokes: [[{x:0.5,y:0.5},{x:0.7,y:0.3},{x:0.5,y:0.1},{x:0.3,y:0.3},{x:0.5,y:0.5},{x:0.7,y:0.7},{x:0.5,y:0.9},{x:0.3,y:0.7},{x:0.5,y:0.5}]] },
            { letter: '9', strokes: [[{x:0.5,y:0.9},{x:0.7,y:0.6},{x:0.75,y:0.35},{x:0.6,y:0.1},{x:0.35,y:0.1},{x:0.25,y:0.3},{x:0.35,y:0.5},{x:0.65,y:0.5}]] },
            { letter: '10', strokes: [[{x:0.3,y:0.1},{x:0.3,y:0.9}],[{x:0.6,y:0.1},{x:0.75,y:0.3},{x:0.75,y:0.7},{x:0.6,y:0.9},{x:0.45,y:0.7},{x:0.45,y:0.3},{x:0.6,y:0.1}]] },
          ],
        },
      },
      {
        title: 'Lukis Bentuk Mudah',
        type: 'tracing',
        emoji: '🔵',
        difficulty: 'easy',
        gameData: {
          questions: [
            { letter: '⭕', strokes: [[{x:0.5,y:0.1},{x:0.85,y:0.35},{x:0.9,y:0.5},{x:0.85,y:0.65},{x:0.5,y:0.9},{x:0.15,y:0.65},{x:0.1,y:0.5},{x:0.15,y:0.35},{x:0.5,y:0.1}]] },
            { letter: '⬜', strokes: [[{x:0.2,y:0.2},{x:0.8,y:0.2},{x:0.8,y:0.8},{x:0.2,y:0.8},{x:0.2,y:0.2}]] },
            { letter: '△', strokes: [[{x:0.5,y:0.1},{x:0.85,y:0.85},{x:0.15,y:0.85},{x:0.5,y:0.1}]] },
            { letter: '⭐', strokes: [[{x:0.5,y:0.1},{x:0.6,y:0.4},{x:0.9,y:0.4},{x:0.68,y:0.6},{x:0.78,y:0.9},{x:0.5,y:0.72},{x:0.22,y:0.9},{x:0.32,y:0.6},{x:0.1,y:0.4},{x:0.4,y:0.4},{x:0.5,y:0.1}]] },
          ],
        },
      },
      {
        title: 'Tracing Huruf P-T',
        type: 'tracing',
        emoji: '✏️',
        difficulty: 'easy',
        gameData: {
          questions: [
            { letter: 'P', strokes: [[{x:0.3,y:0.1},{x:0.3,y:0.9}],[{x:0.3,y:0.1},{x:0.65,y:0.2},{x:0.65,y:0.45},{x:0.3,y:0.5}]] },
            { letter: 'Q', strokes: [[{x:0.5,y:0.1},{x:0.8,y:0.3},{x:0.85,y:0.5},{x:0.8,y:0.7},{x:0.5,y:0.9},{x:0.2,y:0.7},{x:0.15,y:0.5},{x:0.2,y:0.3},{x:0.5,y:0.1}],[{x:0.6,y:0.7},{x:0.8,y:0.9}]] },
            { letter: 'R', strokes: [[{x:0.3,y:0.1},{x:0.3,y:0.9}],[{x:0.3,y:0.1},{x:0.65,y:0.2},{x:0.65,y:0.45},{x:0.3,y:0.5}],[{x:0.35,y:0.5},{x:0.7,y:0.9}]] },
            { letter: 'S', strokes: [[{x:0.7,y:0.15},{x:0.5,y:0.1},{x:0.3,y:0.2},{x:0.3,y:0.45},{x:0.5,y:0.5},{x:0.7,y:0.6},{x:0.7,y:0.85},{x:0.5,y:0.9},{x:0.3,y:0.85}]] },
            { letter: 'T', strokes: [[{x:0.5,y:0.1},{x:0.5,y:0.9}],[{x:0.2,y:0.1},{x:0.8,y:0.1}]] },
          ],
        },
      },
      {
        title: 'Tracing Huruf U-Z',
        type: 'tracing',
        emoji: '✏️',
        difficulty: 'easy',
        gameData: {
          questions: [
            { letter: 'U', strokes: [[{x:0.3,y:0.1},{x:0.3,y:0.75},{x:0.5,y:0.9},{x:0.7,y:0.75},{x:0.7,y:0.1}]] },
            { letter: 'V', strokes: [[{x:0.2,y:0.1},{x:0.5,y:0.9},{x:0.8,y:0.1}]] },
            { letter: 'W', strokes: [[{x:0.1,y:0.1},{x:0.3,y:0.9},{x:0.5,y:0.5},{x:0.7,y:0.9},{x:0.9,y:0.1}]] },
            { letter: 'X', strokes: [[{x:0.2,y:0.1},{x:0.8,y:0.9}],[{x:0.8,y:0.1},{x:0.2,y:0.9}]] },
            { letter: 'Y', strokes: [[{x:0.2,y:0.1},{x:0.5,y:0.5}],[{x:0.8,y:0.1},{x:0.5,y:0.5},{x:0.5,y:0.9}]] },
          ],
        },
      },
      {
        title: 'Tracing Bentuk Lanjutan',
        type: 'tracing',
        emoji: '📐',
        difficulty: 'medium',
        gameData: {
          questions: [
            { letter: '🔷', strokes: [[{x:0.5,y:0.1},{x:0.9,y:0.5},{x:0.5,y:0.9},{x:0.1,y:0.5},{x:0.5,y:0.1}]] },
            { letter: '⬡', strokes: [[{x:0.5,y:0.1},{x:0.85,y:0.3},{x:0.85,y:0.7},{x:0.5,y:0.9},{x:0.15,y:0.7},{x:0.15,y:0.3},{x:0.5,y:0.1}]] },
            { letter: '🏠', strokes: [[{x:0.2,y:0.9},{x:0.2,y:0.5},{x:0.5,y:0.1},{x:0.8,y:0.5},{x:0.8,y:0.9},{x:0.2,y:0.9}]] },
            { letter: '❤️', strokes: [[{x:0.5,y:0.9},{x:0.1,y:0.5},{x:0.1,y:0.25},{x:0.3,y:0.1},{x:0.5,y:0.3},{x:0.7,y:0.1},{x:0.9,y:0.25},{x:0.9,y:0.5},{x:0.5,y:0.9}]] },
          ],
        },
      },
      {
        title: 'Tracing Nombor Besar 11-20',
        type: 'tracing',
        emoji: '🔢',
        difficulty: 'medium',
        gameData: {
          questions: [
            { letter: '11', strokes: [[{x:0.35,y:0.1},{x:0.35,y:0.9}],[{x:0.65,y:0.1},{x:0.65,y:0.9}]] },
            { letter: '12', strokes: [[{x:0.3,y:0.1},{x:0.3,y:0.5}],[{x:0.45,y:0.2},{x:0.7,y:0.1},{x:0.75,y:0.35},{x:0.45,y:0.6},{x:0.45,y:0.9},{x:0.75,y:0.9}]] },
            { letter: '15', strokes: [[{x:0.3,y:0.1},{x:0.3,y:0.5}],[{x:0.55,y:0.1},{x:0.4,y:0.1},{x:0.4,y:0.5},{x:0.65,y:0.5},{x:0.7,y:0.7},{x:0.55,y:0.9},{x:0.4,y:0.85}]] },
            { letter: '20', strokes: [[{x:0.15,y:0.2},{x:0.3,y:0.1},{x:0.45,y:0.2},{x:0.45,y:0.45},{x:0.15,y:0.7},{x:0.15,y:0.9},{x:0.45,y:0.9}],[{x:0.6,y:0.2},{x:0.7,y:0.1},{x:0.85,y:0.2},{x:0.85,y:0.8},{x:0.7,y:0.9},{x:0.6,y:0.8},{x:0.6,y:0.2}]] },
          ],
        },
      },
    ],
  },

  sekolah_rendah: {
    bahasa_melayu: [
      {
        title: 'Huruf G-N',
        type: 'letter_match',
        emoji: '🔤',
        difficulty: 'medium',
        gameData: {
          questions: [
            { letter: 'G', emoji: '🍇', word: 'Anggur', options: ['G', 'H', 'I', 'J'], answer: 0 },
            { letter: 'H', emoji: '🏠', word: 'Rumah', options: ['G', 'H', 'I', 'J'], answer: 1 },
            { letter: 'I', emoji: '🍦', word: 'Ais Krim', options: ['G', 'H', 'I', 'J'], answer: 2 },
            { letter: 'J', emoji: '🌉', word: 'Jambatan', options: ['G', 'H', 'I', 'J'], answer: 3 },
            { letter: 'K', emoji: '🐴', word: 'Kuda', options: ['J', 'K', 'L', 'M'], answer: 1 },
            { letter: 'L', emoji: '🌊', word: 'Laut', options: ['J', 'K', 'L', 'M'], answer: 2 },
            { letter: 'M', emoji: '🌙', word: 'Bulan', options: ['J', 'K', 'L', 'M'], answer: 3 },
            { letter: 'N', emoji: '🌰', word: 'Nangka', options: ['M', 'N', 'O', 'P'], answer: 1 },
          ],
        },
      },
      {
        title: 'Ayat Senang - Baca',
        type: 'reading',
        emoji: '📖',
        difficulty: 'medium',
        gameData: {
          questions: [
            { problem: 'Saya suka bermain.', options: ['Bermain', 'Tidur', 'Makan'], answer: 0 },
            { problem: 'Kucing itu comel.', options: ['Comel', 'Besar', 'Kecil'], answer: 0 },
            { problem: 'Mak memasak nasi.', options: ['Nasi', 'Roti', 'Mee'], answer: 0 },
            { problem: 'Ayah memperbaiki kereta.', options: ['Kereta', 'Basikal', 'Bas'], answer: 0 },
            { problem: 'Adik bermain bola.', options: ['Bola', 'Wayang', 'Boneka'], answer: 0 },
            { problem: 'Sekolah ditutup hari ini.', options: ['Hari ini', 'Esok', 'Seminggu'], answer: 0 },
            { problem: 'Kami bermain di taman.', options: ['Taman', 'Rumah', 'Sekolah'], answer: 0 },
            { problem: 'Adik minum susu panas.', options: ['Susu', 'Air', 'Jus'], answer: 0 },
          ],
        },
      },
      {
        title: 'Kata-Kata Hari-Hari',
        type: 'word_builder',
        emoji: '🔠',
        difficulty: 'medium',
        gameData: {
          questions: [
            { problem: 'r-m-h', options: ['rumah', 'rokok', 'rimau'], answer: 0 },
            { problem: 's-k-l-h', options: ['sekolah', 'sakat', 'sakti'], answer: 0 },
            { problem: 'k-l-r-g-', options: ['keluarga', 'kemarau', 'kelapa'], answer: 0 },
            { problem: 'm-k-n-n', options: ['makanan', 'martabak', 'meriam'], answer: 0 },
            { problem: 'm-i-n-n', options: ['mainan', 'manisan', 'mesin'], answer: 0 },
            { problem: 'k-p-l', options: ['kapal', 'kapel', 'kopel'], answer: 0 },
            { problem: 'b-k-', options: ['buku', 'baka', 'boke'], answer: 0 },
            { problem: 'p-n-s-l', options: ['pensil', 'pental', 'pinta'], answer: 0 },
          ],
        },
      },
      {
        title: 'Tatabahasa - Kata Nama',
        type: 'multiple_choice',
        emoji: '📝',
        difficulty: 'medium',
        gameData: {
          questions: [
            { problem: 'Manakah kata nama?', options: ['berlari', 'buku', 'cantik'], answer: 1 },
            { problem: 'Manakah kata nama?', options: ['meja', 'tidur', 'merah'], answer: 0 },
            { problem: 'Manakah kata nama?', options: ['melompat', 'sekolah', 'besar'], answer: 1 },
            { problem: 'Manakah kata nama?', options: ['hijau', 'menangis', 'bunga'], answer: 2 },
            { problem: 'Manakah kata nama?', options: ['pokok', 'berlari', 'kuat'], answer: 0 },
            { problem: 'Manakah kata nama?', options: ['kecil', 'minum', 'kereta'], answer: 2 },
            { problem: 'Manakah kata nama?', options: ['terbang', 'burung', 'tinggi'], answer: 1 },
            { problem: 'Manakah kata nama?', options: ['sungai', 'berenang', 'sejuk'], answer: 0 },
          ],
        },
      },
      {
        title: 'Tatabahasa - Kata Kerja',
        type: 'multiple_choice',
        emoji: '⚡',
        difficulty: 'medium',
        gameData: {
          questions: [
            { problem: 'Manakah kata kerja?', options: ['berlari', 'buku', 'cantik'], answer: 0 },
            { problem: 'Manakah kata kerja?', options: ['meja', 'tidur', 'merah'], answer: 1 },
            { problem: 'Manakah kata kerja?', options: ['melompat', 'sekolah', 'besar'], answer: 0 },
            { problem: 'Manakah kata kerja?', options: ['hijau', 'menangis', 'bunga'], answer: 1 },
            { problem: 'Manakah kata kerja?', options: ['pokok', 'berlari', 'kuat'], answer: 1 },
            { problem: 'Manakah kata kerja?', options: ['kecil', 'minum', 'kereta'], answer: 1 },
            { problem: 'Manakah kata kerja?', options: ['terbang', 'burung', 'tinggi'], answer: 0 },
            { problem: 'Manakah kata kerja?', options: ['sungai', 'berenang', 'sejuk'], answer: 1 },
          ],
        },
      },
      {
        title: 'Ejaan Betul',
        type: 'spelling',
        emoji: '🔡',
        difficulty: 'medium',
        gameData: {
          questions: [
            { problem: 'Ejaan betul untuk "rmah"?', options: ['rumah', 'ramah', 'rimah'], answer: 0 },
            { problem: 'Ejaan betul untuk "bljar"?', options: ['belajar', 'beljar', 'blakar'], answer: 0 },
            { problem: 'Ejaan betul untuk "mkan"?', options: ['makanan', 'makan', 'mekkan'], answer: 1 },
            { problem: 'Ejaan betul untuk "kreta"?', options: ['kereta', 'kareta', 'kretas'], answer: 0 },
            { problem: 'Ejaan betul untuk "ptang"?', options: ['patang', 'petang', 'poteng'], answer: 1 },
            { problem: 'Ejaan betul untuk "skola"?', options: ['sekolah', 'sekola', 'skolar'], answer: 0 },
            { problem: 'Ejaan betul untuk "mlm"?', options: ['malam', 'malim', 'milam'], answer: 0 },
            { problem: 'Ejaan betul untuk "pgi"?', options: ['pagi', 'pige', 'poagi'], answer: 0 },
          ],
        },
      },
      {
        title: 'Antonim (Lawan Kata)',
        type: 'multiple_choice',
        emoji: '↔️',
        difficulty: 'medium',
        gameData: {
          questions: [
            { problem: 'Lawan kata "besar"?', options: ['kecil', 'sederhana', 'panjang'], answer: 0 },
            { problem: 'Lawan kata "panas"?', options: ['suam', 'sejuk', 'lembap'], answer: 1 },
            { problem: 'Lawan kata "gelap"?', options: ['redup', 'cerah', 'kusam'], answer: 1 },
            { problem: 'Lawan kata "tua"?', options: ['muda', 'dewasa', 'remaja'], answer: 0 },
            { problem: 'Lawan kata "naik"?', options: ['pergi', 'turun', 'jatuh'], answer: 1 },
            { problem: 'Lawan kata "siang"?', options: ['petang', 'malam', 'subuh'], answer: 1 },
            { problem: 'Lawan kata "keras"?', options: ['lembut', 'halus', 'licin'], answer: 0 },
            { problem: 'Lawan kata "awal"?', options: ['lewat', 'lambat', 'cepat'], answer: 1 },
          ],
        },
      },
      {
        title: 'Sinonim (Perkataan Sama Makna)',
        type: 'multiple_choice',
        emoji: '🔄',
        difficulty: 'medium',
        gameData: {
          questions: [
            { problem: 'Sinonim "cantik"?', options: ['hodoh', 'indah', 'kotor'], answer: 1 },
            { problem: 'Sinonim "gembira"?', options: ['sedih', 'marah', 'suka'], answer: 2 },
            { problem: 'Sinonim "besar"?', options: ['kecil', 'agam', 'tinggi'], answer: 1 },
            { problem: 'Sinonim "cepat"?', options: ['laju', 'lambat', 'diam'], answer: 0 },
            { problem: 'Sinonim "pintar"?', options: ['bodoh', 'bijak', 'malas'], answer: 1 },
            { problem: 'Sinonim "lapar"?', options: ['kenyang', 'haus', 'dahaga'], answer: 1 },
            { problem: 'Sinonim "bahaya"?', options: ['selamat', 'merbahaya', 'aman'], answer: 1 },
            { problem: 'Sinonim "kawan"?', options: ['musuh', 'rakan', 'lawan'], answer: 1 },
          ],
        },
      },
      {
        title: 'Peribahasa Mudah',
        type: 'multiple_choice',
        emoji: '📜',
        difficulty: 'hard',
        gameData: {
          questions: [
            { problem: '"Bersatu teguh bercerai ___"', options: ['kuat', 'roboh', 'lemah'], answer: 1 },
            { problem: '"Sediakan payung sebelum ___"', options: ['panas', 'hujan', 'ribut'], answer: 1 },
            { problem: '"Rajin pangkal ___"', options: ['kaya', 'pandai', 'muda'], answer: 0 },
            { problem: '"Sikit-sikit lama-lama jadi ___"', options: ['banyak', 'bukit', 'tinggi'], answer: 1 },
            { problem: '"Air yang tenang jangan ___"', options: ['diminum', 'dipanik', 'disangka'], answer: 2 },
            { problem: '"Berani kerana benar takut kerana ___"', options: ['salah', 'benar', 'bodoh'], answer: 0 },
            { problem: '"Melentur buluh biarlah dari ___"', options: ['atas', 'rebungnya', 'bawah'], answer: 1 },
            { problem: '"Seperti aur dengan ___"', options: ['tebing', 'sungai', 'batu'], answer: 0 },
          ],
        },
      },
      {
        title: 'Ayat Tanya dan Jawab',
        type: 'reading',
        emoji: '❓',
        difficulty: 'medium',
        gameData: {
          questions: [
            { problem: '"Siapa nama kamu?" — Apa kata ganti nama yang sesuai?', options: ['Saya', 'Dia', 'Mereka'], answer: 0 },
            { problem: '"Di mana kamu duduk?" — Apa kata tanya yang digunakan?', options: ['Siapa', 'Di mana', 'Bila'], answer: 1 },
            { problem: '"Berapa umur kamu?" — Jawab: "Saya _____ tahun"', options: ['berumur', 'ada', 'ialah'], answer: 0 },
            { problem: '"Bila kamu makan?" — Apa kata tanya yang digunakan?', options: ['Bagaimana', 'Berapa', 'Bila'], answer: 2 },
            { problem: '"Mengapa kamu menangis?" — Jawab: "Saya menangis _____ jatuh"', options: ['sebab', 'kerana', 'dengan'], answer: 1 },
            { problem: '"Bagaimana keadaan kamu?" — Jawab: "Saya _____"', options: ['baik', 'makan', 'tidur'], answer: 0 },
            { problem: '"Dengan siapa kamu pergi?" — Jawab: "Saya pergi _____ ibu"', options: ['dan', 'dengan', 'bersama'], answer: 2 },
            { problem: '"Apa yang kamu buat?" — Apa kata tanya yang digunakan?', options: ['Siapa', 'Apa', 'Bila'], answer: 1 },
          ],
        },
      },
    ],

    jawi: [
      {
        title: 'Aksara Jawi - Alif hingga Tha',
        type: 'letter_match',
        emoji: '🕌',
        difficulty: 'medium',
        gameData: {
          questions: [
            { letter: 'ا', emoji: '🍎', word: 'Alif - Epal', options: ['ا', 'ب', 'ت', 'ث'], answer: 0 },
            { letter: 'ب', emoji: '🐦', word: 'Ba - Burung', options: ['ا', 'ب', 'ت', 'ث'], answer: 1 },
            { letter: 'ت', emoji: '🐯', word: 'Ta - Harimau', options: ['ا', 'ب', 'ت', 'ث'], answer: 2 },
            { letter: 'ث', emoji: '🧊', word: 'Tha - Ais', options: ['ا', 'ب', 'ت', 'ث'], answer: 3 },
            { letter: 'ج', emoji: '🦒', word: 'Jim - Jerapah', options: ['ج', 'ح', 'خ', 'د'], answer: 0 },
            { letter: 'ح', emoji: '🌸', word: 'Ha - Bunga', options: ['ج', 'ح', 'خ', 'د'], answer: 1 },
            { letter: 'خ', emoji: '🌾', word: 'Kha - Padi', options: ['ج', 'ح', 'خ', 'د'], answer: 2 },
            { letter: 'د', emoji: '💎', word: 'Dal - Permata', options: ['ج', 'ح', 'خ', 'د'], answer: 3 },
          ],
        },
      },
      {
        title: 'Aksara Jawi - Dzal hingga Zain',
        type: 'letter_match',
        emoji: '🕌',
        difficulty: 'medium',
        gameData: {
          questions: [
            { letter: 'ذ', emoji: '🦌', word: 'Dzal - Rusa', options: ['ذ', 'ر', 'ز', 'س'], answer: 0 },
            { letter: 'ر', emoji: '🌹', word: 'Ra - Ros', options: ['ذ', 'ر', 'ز', 'س'], answer: 1 },
            { letter: 'ز', emoji: '🌺', word: 'Zain - Bunga', options: ['ذ', 'ر', 'ز', 'س'], answer: 2 },
            { letter: 'س', emoji: '⭐', word: 'Sin - Bintang', options: ['ذ', 'ر', 'ز', 'س'], answer: 3 },
            { letter: 'ش', emoji: '☀️', word: 'Shin - Matahari', options: ['ش', 'ص', 'ض', 'ط'], answer: 0 },
            { letter: 'ص', emoji: '🦅', word: 'Sad - Helang', options: ['ش', 'ص', 'ض', 'ط'], answer: 1 },
            { letter: 'ض', emoji: '🐊', word: 'Dad - Buaya', options: ['ش', 'ص', 'ض', 'ط'], answer: 2 },
            { letter: 'ط', emoji: '🦚', word: 'Ta - Merak', options: ['ش', 'ص', 'ض', 'ط'], answer: 3 },
          ],
        },
      },
      {
        title: 'Aksara Jawi - Ain hingga Ghain',
        type: 'letter_match',
        emoji: '🕌',
        difficulty: 'medium',
        gameData: {
          questions: [
            { letter: 'ظ', emoji: '🦁', word: 'Zha - Singa', options: ['ظ', 'ع', 'غ', 'ف'], answer: 0 },
            { letter: 'ع', emoji: '🍇', word: 'Ain - Anggur', options: ['ظ', 'ع', 'غ', 'ف'], answer: 1 },
            { letter: 'غ', emoji: '🦜', word: 'Ghain - Burung', options: ['ظ', 'ع', 'غ', 'ف'], answer: 2 },
            { letter: 'ف', emoji: '🦋', word: 'Fa - Kupu-kupu', options: ['ظ', 'ع', 'غ', 'ف'], answer: 3 },
            { letter: 'ق', emoji: '🐸', word: 'Qaf - Katak', options: ['ق', 'ك', 'ل', 'م'], answer: 0 },
            { letter: 'ك', emoji: '🐕', word: 'Kaf - Anjing', options: ['ق', 'ك', 'ل', 'م'], answer: 1 },
            { letter: 'ل', emoji: '🌊', word: 'Lam - Laut', options: ['ق', 'ك', 'ل', 'م'], answer: 2 },
            { letter: 'م', emoji: '🌙', word: 'Mim - Bulan', options: ['ق', 'ك', 'ل', 'م'], answer: 3 },
          ],
        },
      },
      {
        title: 'Aksara Jawi - Nun hingga Ya',
        type: 'letter_match',
        emoji: '🕌',
        difficulty: 'medium',
        gameData: {
          questions: [
            { letter: 'ن', emoji: '🌟', word: 'Nun - Bintang', options: ['ن', 'و', 'ه', 'ي'], answer: 0 },
            { letter: 'و', emoji: '🌼', word: 'Wau - Bunga', options: ['ن', 'و', 'ه', 'ي'], answer: 1 },
            { letter: 'ه', emoji: '🌬️', word: 'Ha - Angin', options: ['ن', 'و', 'ه', 'ي'], answer: 2 },
            { letter: 'ي', emoji: '🌿', word: 'Ya - Daun', options: ['ن', 'و', 'ه', 'ي'], answer: 3 },
            { letter: 'ء', emoji: '💫', word: 'Hamzah - Cahaya', options: ['ء', 'ة', 'ى', 'ئ'], answer: 0 },
            { letter: 'ة', emoji: '🌺', word: 'Ta Marbuta - Bunga', options: ['ء', 'ة', 'ى', 'ئ'], answer: 1 },
            { letter: 'ى', emoji: '🦅', word: 'Alif Maqsura', options: ['ء', 'ة', 'ى', 'ئ'], answer: 2 },
            { letter: 'ئ', emoji: '🐓', word: 'Ya dengan Hamzah', options: ['ء', 'ة', 'ى', 'ئ'], answer: 3 },
          ],
        },
      },
      {
        title: 'Perkataan Jawi Mudah',
        type: 'picture_quiz',
        emoji: '📖',
        difficulty: 'medium',
        gameData: {
          questions: [
            { image: '🏠', options: ['رومه', 'سكوله', 'كدي'], answer: 0 },
            { image: '📚', options: ['بوكو', 'قلم', 'كرتس'], answer: 0 },
            { image: '🐱', options: ['انجيڠ', 'كوچيڠ', 'برونو'], answer: 1 },
            { image: '☀️', options: ['بولن', 'ماتاهاري', 'بيماكيڠ'], answer: 1 },
            { image: '🍎', options: ['ايڤل', 'اورين', 'پيساڠ'], answer: 0 },
            { image: '🌊', options: ['لاوت', 'سوڠاي', 'تاسيق'], answer: 0 },
            { image: '🌙', options: ['ماتاهاري', 'بولن', 'بيماكيڠ'], answer: 1 },
            { image: '✏️', options: ['قلم', 'پينسيل', 'روتان'], answer: 1 },
          ],
        },
      },
      {
        title: 'Sebutan Jawi - Bunyi Huruf',
        type: 'sound_match',
        emoji: '🔊',
        difficulty: 'medium',
        gameData: {
          questions: [
            { image: 'ا', options: ['Alif', 'Ba', 'Ta'], answer: 0 },
            { image: 'ب', options: ['Alif', 'Ba', 'Ta'], answer: 1 },
            { image: 'ت', options: ['Ba', 'Ta', 'Jim'], answer: 1 },
            { image: 'ج', options: ['Ta', 'Jim', 'Kha'], answer: 1 },
            { image: 'ر', options: ['Za', 'Ra', 'Sin'], answer: 1 },
            { image: 'ك', options: ['Qaf', 'Kaf', 'Lam'], answer: 1 },
            { image: 'م', options: ['Lam', 'Mim', 'Nun'], answer: 1 },
            { image: 'ن', options: ['Mim', 'Nun', 'Wau'], answer: 1 },
          ],
        },
      },
      {
        title: 'Huruf Jawi yang Serupa',
        type: 'letter_match',
        emoji: '🔍',
        difficulty: 'hard',
        gameData: {
          questions: [
            { letter: 'ب', emoji: '📍', word: 'Ba (1 titik bawah)', options: ['ب', 'ت', 'ث', 'ن'], answer: 0 },
            { letter: 'ت', emoji: '📍📍', word: 'Ta (2 titik atas)', options: ['ب', 'ت', 'ث', 'ن'], answer: 1 },
            { letter: 'ث', emoji: '📍📍📍', word: 'Tha (3 titik atas)', options: ['ب', 'ت', 'ث', 'ن'], answer: 2 },
            { letter: 'ن', emoji: '📍', word: 'Nun (1 titik dalam)', options: ['ب', 'ت', 'ث', 'ن'], answer: 3 },
            { letter: 'ج', emoji: '📍', word: 'Jim (1 titik bawah)', options: ['ج', 'ح', 'خ', 'خ'], answer: 0 },
            { letter: 'ح', emoji: '❌', word: 'Ha (tanpa titik)', options: ['ج', 'ح', 'خ', 'خ'], answer: 1 },
            { letter: 'خ', emoji: '📍', word: 'Kha (1 titik atas)', options: ['ج', 'ح', 'خ', 'ع'], answer: 2 },
            { letter: 'د', emoji: '❌', word: 'Dal (tanpa titik)', options: ['د', 'ذ', 'ر', 'ز'], answer: 0 },
          ],
        },
      },
      {
        title: 'Ayat Jawi Pendek',
        type: 'reading',
        emoji: '📜',
        difficulty: 'hard',
        gameData: {
          questions: [
            { problem: 'ساي سوك بلاجر', options: ['Saya suka belajar', 'Saya pergi sekolah', 'Saya makan nasi'], answer: 0 },
            { problem: 'ايبو مماسق ناسي', options: ['Ibu membeli nasi', 'Ibu memasak nasi', 'Ibu memakan nasi'], answer: 1 },
            { problem: 'اياه برق كرج', options: ['Ayah balik kerja', 'Ayah pergi kerja', 'Ayah cari kerja'], answer: 1 },
            { problem: 'كامي برمين بولا', options: ['Kami beli bola', 'Kami tengok bola', 'Kami bermain bola'], answer: 2 },
            { problem: 'بوڠ ايت ميره', options: ['Bunga itu biru', 'Bunga itu merah', 'Bunga itu kuning'], answer: 1 },
            { problem: 'كوچيڠ ايت چومل', options: ['Kucing itu besar', 'Kucing itu hitam', 'Kucing itu comel'], answer: 2 },
            { problem: 'لاڠيت ايت بيرو', options: ['Langit itu merah', 'Langit itu biru', 'Langit itu hijau'], answer: 1 },
            { problem: 'ادق تيدور اوله', options: ['Adik makan sudah', 'Adik tidur sudah', 'Adik mandi sudah'], answer: 1 },
          ],
        },
      },
      {
        title: 'Kosa Kata Jawi - Alam',
        type: 'picture_quiz',
        emoji: '🌿',
        difficulty: 'medium',
        gameData: {
          questions: [
            { image: '🌳', options: ['ڤوكوق', 'بوڠ', 'داون'], answer: 0 },
            { image: '🌸', options: ['ڤوكوق', 'بوڠ', 'بويه'], answer: 1 },
            { image: '🌊', options: ['لاوت', 'سوڠاي', 'تاسيق'], answer: 0 },
            { image: '⛰️', options: ['بوكيت', 'ڬونوڠ', 'داتاران'], answer: 1 },
            { image: '🌙', options: ['ماتاهاري', 'بولن', 'بيماكيڠ'], answer: 1 },
            { image: '☀️', options: ['ماتاهاري', 'بولن', 'بيماكيڠ'], answer: 0 },
            { image: '🌧️', options: ['انيڠ', 'هوجن', 'ريبوت'], answer: 1 },
            { image: '🌈', options: ['ڤلاڠي', 'كيلت', 'ڤتير'], answer: 0 },
          ],
        },
      },
      {
        title: 'Nombor dalam Jawi',
        type: 'number_match',
        emoji: '🔢',
        difficulty: 'medium',
        gameData: {
          questions: [
            { problem: '١', options: ['Satu', 'Dua', 'Tiga'], answer: 0 },
            { problem: '٢', options: ['Satu', 'Dua', 'Tiga'], answer: 1 },
            { problem: '٣', options: ['Dua', 'Tiga', 'Empat'], answer: 1 },
            { problem: '٤', options: ['Tiga', 'Empat', 'Lima'], answer: 1 },
            { problem: '٥', options: ['Empat', 'Lima', 'Enam'], answer: 1 },
            { problem: '٦', options: ['Lima', 'Enam', 'Tujuh'], answer: 1 },
            { problem: '٧', options: ['Enam', 'Tujuh', 'Lapan'], answer: 1 },
            { problem: '١٠', options: ['Sembilan', 'Sepuluh', 'Sebelas'], answer: 1 },
          ],
        },
      },
    ],

    english: [
      {
        title: 'Consonants G-N',
        type: 'letter_match',
        emoji: '🔤',
        difficulty: 'medium',
        gameData: {
          questions: [
            { letter: 'G', emoji: '🍇', word: 'Grapes', options: ['G', 'H', 'I', 'J'], answer: 0 },
            { letter: 'H', emoji: '🏠', word: 'House', options: ['G', 'H', 'I', 'J'], answer: 1 },
            { letter: 'I', emoji: '🍦', word: 'Ice Cream', options: ['G', 'H', 'I', 'J'], answer: 2 },
            { letter: 'J', emoji: '🤹', word: 'Juggler', options: ['G', 'H', 'I', 'J'], answer: 3 },
            { letter: 'K', emoji: '🪀', word: 'Kite', options: ['J', 'K', 'L', 'M'], answer: 1 },
            { letter: 'L', emoji: '🦁', word: 'Lion', options: ['J', 'K', 'L', 'M'], answer: 2 },
            { letter: 'M', emoji: '🌙', word: 'Moon', options: ['J', 'K', 'L', 'M'], answer: 3 },
            { letter: 'N', emoji: '🥜', word: 'Nut', options: ['M', 'N', 'O', 'P'], answer: 1 },
          ],
        },
      },
      {
        title: 'Simple Sentences - Reading',
        type: 'reading',
        emoji: '📖',
        difficulty: 'medium',
        gameData: {
          questions: [
            { problem: 'I like to play.', options: ['Play', 'Sleep', 'Eat'], answer: 0 },
            { problem: 'The cat is cute.', options: ['Cute', 'Big', 'Small'], answer: 0 },
            { problem: 'Mom cooks rice.', options: ['Rice', 'Bread', 'Noodle'], answer: 0 },
            { problem: 'Dad fixes the car.', options: ['Car', 'Bike', 'Bus'], answer: 0 },
            { problem: 'Sister plays with doll.', options: ['Doll', 'Ball', 'Toy'], answer: 0 },
            { problem: 'School is closed today.', options: ['Today', 'Tomorrow', 'Next week'], answer: 0 },
            { problem: 'We play in the park.', options: ['Park', 'Home', 'School'], answer: 0 },
            { problem: 'Brother drinks hot milk.', options: ['Milk', 'Water', 'Juice'], answer: 0 },
          ],
        },
      },
      {
        title: 'Daily Vocabulary',
        type: 'word_builder',
        emoji: '🔠',
        difficulty: 'medium',
        gameData: {
          questions: [
            { problem: 'h-u-s-', options: ['house', 'horse', 'haste'], answer: 0 },
            { problem: 's-h-o-l', options: ['school', 'shall', 'shoal'], answer: 0 },
            { problem: 'f-m-l-', options: ['family', 'female', 'formal'], answer: 0 },
            { problem: 'f-o-', options: ['food', 'fool', 'foot'], answer: 0 },
            { problem: 't-y', options: ['toy', 'try', 'tray'], answer: 0 },
            { problem: 'b-o-k', options: ['book', 'brook', 'break'], answer: 0 },
            { problem: 'p-n-i-', options: ['pencil', 'penal', 'panel'], answer: 0 },
            { problem: 't-b-l-', options: ['table', 'tablet', 'taboo'], answer: 0 },
          ],
        },
      },
      {
        title: 'Grammar - Nouns',
        type: 'multiple_choice',
        emoji: '📝',
        difficulty: 'medium',
        gameData: {
          questions: [
            { problem: 'Which is a noun?', options: ['run', 'book', 'happy'], answer: 1 },
            { problem: 'Which is a noun?', options: ['table', 'sleep', 'red'], answer: 0 },
            { problem: 'Which is a noun?', options: ['jump', 'school', 'big'], answer: 1 },
            { problem: 'Which is a noun?', options: ['green', 'cry', 'flower'], answer: 2 },
            { problem: 'Which is a noun?', options: ['tree', 'run', 'strong'], answer: 0 },
            { problem: 'Which is a noun?', options: ['small', 'drink', 'car'], answer: 2 },
            { problem: 'Which is a noun?', options: ['fly', 'bird', 'tall'], answer: 1 },
            { problem: 'Which is a noun?', options: ['river', 'swim', 'cold'], answer: 0 },
          ],
        },
      },
      {
        title: 'Grammar - Verbs',
        type: 'multiple_choice',
        emoji: '⚡',
        difficulty: 'medium',
        gameData: {
          questions: [
            { problem: 'Which is a verb?', options: ['run', 'book', 'happy'], answer: 0 },
            { problem: 'Which is a verb?', options: ['table', 'sleep', 'red'], answer: 1 },
            { problem: 'Which is a verb?', options: ['jump', 'school', 'big'], answer: 0 },
            { problem: 'Which is a verb?', options: ['green', 'cry', 'flower'], answer: 1 },
            { problem: 'Which is a verb?', options: ['tree', 'run', 'strong'], answer: 1 },
            { problem: 'Which is a verb?', options: ['small', 'drink', 'car'], answer: 1 },
            { problem: 'Which is a verb?', options: ['fly', 'bird', 'tall'], answer: 0 },
            { problem: 'Which is a verb?', options: ['river', 'swim', 'cold'], answer: 1 },
          ],
        },
      },
      {
        title: 'Antonyms (Opposite Words)',
        type: 'multiple_choice',
        emoji: '↔️',
        difficulty: 'medium',
        gameData: {
          questions: [
            { problem: 'Opposite of "big"?', options: ['small', 'medium', 'long'], answer: 0 },
            { problem: 'Opposite of "hot"?', options: ['warm', 'cold', 'cool'], answer: 1 },
            { problem: 'Opposite of "dark"?', options: ['dim', 'bright', 'dull'], answer: 1 },
            { problem: 'Opposite of "old"?', options: ['young', 'adult', 'teen'], answer: 0 },
            { problem: 'Opposite of "up"?', options: ['go', 'down', 'fall'], answer: 1 },
            { problem: 'Opposite of "day"?', options: ['evening', 'night', 'dawn'], answer: 1 },
            { problem: 'Opposite of "hard"?', options: ['soft', 'fine', 'smooth'], answer: 0 },
            { problem: 'Opposite of "fast"?', options: ['late', 'slow', 'quick'], answer: 1 },
          ],
        },
      },
      {
        title: 'Spelling Practice',
        type: 'spelling',
        emoji: '🔡',
        difficulty: 'medium',
        gameData: {
          questions: [
            { problem: 'Correct spelling of "frend"?', options: ['friend', 'frend', 'friand'], answer: 0 },
            { problem: 'Correct spelling of "lern"?', options: ['lerne', 'learn', 'leern'], answer: 1 },
            { problem: 'Correct spelling of "teecher"?', options: ['teacher', 'teecher', 'techer'], answer: 0 },
            { problem: 'Correct spelling of "moter"?', options: ['motor', 'moter', 'motir'], answer: 0 },
            { problem: 'Correct spelling of "wether"?', options: ['weather', 'wether', 'wethar'], answer: 0 },
            { problem: 'Correct spelling of "bycycle"?', options: ['bicycle', 'bycycle', 'bicycal'], answer: 0 },
            { problem: 'Correct spelling of "intresting"?', options: ['intresting', 'interesting', 'intersting'], answer: 1 },
            { problem: 'Correct spelling of "libary"?', options: ['library', 'libary', 'librery'], answer: 0 },
          ],
        },
      },
      {
        title: 'Tenses - Past & Present',
        type: 'multiple_choice',
        emoji: '⏰',
        difficulty: 'medium',
        gameData: {
          questions: [
            { problem: 'Past tense of "run"?', options: ['runned', 'ran', 'runs'], answer: 1 },
            { problem: 'Past tense of "eat"?', options: ['eated', 'ate', 'eats'], answer: 1 },
            { problem: 'Past tense of "play"?', options: ['played', 'play', 'plays'], answer: 0 },
            { problem: 'Past tense of "go"?', options: ['goed', 'went', 'goes'], answer: 1 },
            { problem: 'Past tense of "see"?', options: ['seed', 'saw', 'sees'], answer: 1 },
            { problem: 'Past tense of "drink"?', options: ['drinked', 'drank', 'drinks'], answer: 1 },
            { problem: 'Present tense: "She ___ to school"', options: ['go', 'goes', 'went'], answer: 1 },
            { problem: 'Present tense: "They ___ football"', options: ['plays', 'play', 'played'], answer: 1 },
          ],
        },
      },
      {
        title: 'Phonics - Letter Sounds',
        type: 'phonics',
        emoji: '🔊',
        difficulty: 'medium',
        gameData: {
          questions: [
            { problem: 'What sound does "ch" make in "chair"?', options: ['k', 'sh', 'ch'], answer: 2 },
            { problem: 'What sound does "th" make in "the"?', options: ['t', 'th', 'd'], answer: 1 },
            { problem: 'Word with "oo" sound?', options: ['moon', 'man', 'men'], answer: 0 },
            { problem: 'Word with "ai" sound?', options: ['rain', 'run', 'Ron'], answer: 0 },
            { problem: 'What sound does "ph" make?', options: ['p', 'f', 'ph'], answer: 1 },
            { problem: 'Word that rhymes with "cat"?', options: ['cup', 'bat', 'bit'], answer: 1 },
            { problem: 'Word that rhymes with "dog"?', options: ['fog', 'dug', 'dig'], answer: 0 },
            { problem: 'Word that rhymes with "ball"?', options: ['bill', 'bell', 'tall'], answer: 2 },
          ],
        },
      },
      {
        title: 'Comprehension - Short Paragraphs',
        type: 'reading',
        emoji: '📚',
        difficulty: 'hard',
        gameData: {
          questions: [
            { problem: 'Ali has a dog. The dog is brown. What colour is the dog?', options: ['Black', 'White', 'Brown'], answer: 2 },
            { problem: 'Siti eats an apple every day. What does Siti eat?', options: ['Orange', 'Apple', 'Banana'], answer: 1 },
            { problem: 'The sun rises in the morning. When does the sun rise?', options: ['Evening', 'Morning', 'Night'], answer: 1 },
            { problem: 'Tom reads books at the library. Where does Tom read?', options: ['Home', 'School', 'Library'], answer: 2 },
            { problem: 'Birds fly in the sky. Where do birds fly?', options: ['In the sea', 'In the sky', 'On the ground'], answer: 1 },
            { problem: 'She has two cats and one dog. How many pets does she have?', options: ['Two', 'Three', 'One'], answer: 1 },
            { problem: 'The children play after school. When do they play?', options: ['Before school', 'After school', 'During school'], answer: 1 },
            { problem: 'John is taller than Ali. Who is taller?', options: ['Ali', 'John', 'Both'], answer: 1 },
          ],
        },
      },
    ],

    mathematics: [
      {
        title: 'Tambah 1-20',
        type: 'math_puzzle',
        emoji: '➕',
        difficulty: 'medium',
        gameData: {
          questions: [
            { problem: '5+3', options: ['6', '8', '9', '7'], answer: 1 },
            { problem: '7+4', options: ['9', '11', '12', '10'], answer: 1 },
            { problem: '10+5', options: ['13', '15', '16', '14'], answer: 1 },
            { problem: '6+7', options: ['11', '13', '14', '12'], answer: 1 },
            { problem: '8+5', options: ['11', '13', '14', '12'], answer: 1 },
            { problem: '9+6', options: ['13', '15', '16', '14'], answer: 1 },
            { problem: '7+8', options: ['13', '15', '16', '14'], answer: 1 },
            { problem: '11+4', options: ['13', '15', '16', '14'], answer: 1 },
          ],
        },
      },
      {
        title: 'Tolak 1-20',
        type: 'math_puzzle',
        emoji: '➖',
        difficulty: 'medium',
        gameData: {
          questions: [
            { problem: '10-3', options: ['5', '7', '8', '6'], answer: 1 },
            { problem: '15-5', options: ['8', '10', '11', '9'], answer: 1 },
            { problem: '20-8', options: ['10', '12', '13', '11'], answer: 1 },
            { problem: '18-7', options: ['9', '11', '12', '10'], answer: 1 },
            { problem: '16-4', options: ['10', '12', '13', '11'], answer: 1 },
            { problem: '14-6', options: ['6', '8', '9', '7'], answer: 1 },
            { problem: '19-9', options: ['8', '10', '11', '9'], answer: 1 },
            { problem: '17-5', options: ['10', '12', '13', '11'], answer: 1 },
          ],
        },
      },
      {
        title: 'Bentuk & Sudut',
        type: 'shape_sort',
        emoji: '📐',
        difficulty: 'medium',
        gameData: {
          questions: [
            { image: '⭕', options: ['Circle', 'Square', 'Triangle'], answer: 0 },
            { image: '⬜', options: ['Circle', 'Square', 'Triangle'], answer: 1 },
            { image: '△', options: ['Circle', 'Square', 'Triangle'], answer: 2 },
            { image: '▭', options: ['Rectangle', 'Square', 'Oval'], answer: 0 },
            { image: '⬠', options: ['Pentagon', 'Hexagon', 'Square'], answer: 0 },
            { image: '◆', options: ['Diamond', 'Square', 'Star'], answer: 0 },
            { image: '⭐', options: ['Star', 'Cross', 'Triangle'], answer: 0 },
            { image: '🔵', options: ['Oval', 'Circle', 'Egg'], answer: 1 },
          ],
        },
      },
      {
        title: 'Darab 1-5',
        type: 'math_puzzle',
        emoji: '✖️',
        difficulty: 'medium',
        gameData: {
          questions: [
            { problem: '2×3', options: ['4', '6', '8', '5'], answer: 1 },
            { problem: '3×3', options: ['6', '9', '12', '8'], answer: 1 },
            { problem: '4×2', options: ['6', '8', '10', '7'], answer: 1 },
            { problem: '5×2', options: ['8', '10', '12', '9'], answer: 1 },
            { problem: '3×4', options: ['10', '12', '14', '11'], answer: 1 },
            { problem: '5×3', options: ['13', '15', '17', '14'], answer: 1 },
            { problem: '4×4', options: ['14', '16', '18', '15'], answer: 1 },
            { problem: '5×5', options: ['23', '25', '27', '24'], answer: 1 },
          ],
        },
      },
      {
        title: 'Bahagi Mudah',
        type: 'math_puzzle',
        emoji: '➗',
        difficulty: 'medium',
        gameData: {
          questions: [
            { problem: '6÷2', options: ['2', '3', '4', '5'], answer: 1 },
            { problem: '10÷2', options: ['4', '5', '6', '7'], answer: 1 },
            { problem: '9÷3', options: ['2', '3', '4', '5'], answer: 1 },
            { problem: '12÷4', options: ['2', '3', '4', '5'], answer: 1 },
            { problem: '15÷3', options: ['4', '5', '6', '7'], answer: 1 },
            { problem: '20÷4', options: ['4', '5', '6', '7'], answer: 1 },
            { problem: '16÷2', options: ['7', '8', '9', '10'], answer: 1 },
            { problem: '25÷5', options: ['4', '5', '6', '7'], answer: 1 },
          ],
        },
      },
      {
        title: 'Tambah Tiga Nombor',
        type: 'math_puzzle',
        emoji: '➕',
        difficulty: 'hard',
        gameData: {
          questions: [
            { problem: '2+3+4', options: ['7', '9', '8', '10'], answer: 1 },
            { problem: '5+4+3', options: ['10', '12', '11', '13'], answer: 1 },
            { problem: '6+2+5', options: ['11', '13', '12', '14'], answer: 1 },
            { problem: '7+3+2', options: ['10', '12', '11', '13'], answer: 1 },
            { problem: '4+6+3', options: ['11', '13', '12', '14'], answer: 1 },
            { problem: '8+4+2', options: ['12', '14', '13', '15'], answer: 1 },
            { problem: '5+5+5', options: ['13', '15', '14', '16'], answer: 1 },
            { problem: '3+7+6', options: ['14', '16', '15', '17'], answer: 1 },
          ],
        },
      },
      {
        title: 'Nombor Bulat - Bundar',
        type: 'math_puzzle',
        emoji: '🔢',
        difficulty: 'medium',
        gameData: {
          questions: [
            { problem: 'Bundar 13 ke puluhan terdekat?', options: ['10', '20', '15'], answer: 0 },
            { problem: 'Bundar 17 ke puluhan terdekat?', options: ['10', '20', '15'], answer: 1 },
            { problem: 'Bundar 45 ke puluhan terdekat?', options: ['40', '50', '45'], answer: 0 },
            { problem: 'Bundar 56 ke puluhan terdekat?', options: ['50', '60', '55'], answer: 1 },
            { problem: 'Bundar 31 ke puluhan terdekat?', options: ['30', '40', '35'], answer: 0 },
            { problem: 'Bundar 78 ke puluhan terdekat?', options: ['70', '80', '75'], answer: 1 },
            { problem: 'Bundar 95 ke puluhan terdekat?', options: ['90', '100', '95'], answer: 1 },
            { problem: 'Bundar 24 ke puluhan terdekat?', options: ['20', '30', '25'], answer: 0 },
          ],
        },
      },
      {
        title: 'Pecahan Mudah',
        type: 'multiple_choice',
        emoji: '🍕',
        difficulty: 'medium',
        gameData: {
          questions: [
            { problem: '1/2 bermaksud?', options: ['Satu bahagian dari tiga', 'Satu bahagian dari dua', 'Dua bahagian dari satu'], answer: 1 },
            { problem: '1/4 pizza — berapa bahagian?', options: ['Satu dari empat', 'Empat dari satu', 'Dua dari empat'], answer: 0 },
            { problem: '1/2 + 1/2 = ?', options: ['1/4', '1', '2'], answer: 1 },
            { problem: 'Pecahan manakah lebih besar?', options: ['1/4', '1/2', 'Sama'], answer: 1 },
            { problem: '3/4 bermaksud berapa bahagian?', options: ['Tiga dari empat', 'Empat dari tiga', 'Tiga sahaja'], answer: 0 },
            { problem: 'Pizza dibahagi 4 sama rata. Kamu ambil 2 bahagian. Berapa pecahan?', options: ['1/4', '2/4', '3/4'], answer: 1 },
            { problem: 'Manakah bersamaan dengan 1/2?', options: ['2/4', '1/3', '3/4'], answer: 0 },
            { problem: '1/3 + 1/3 = ?', options: ['1/3', '2/3', '3/3'], answer: 1 },
          ],
        },
      },
      {
        title: 'Masa dan Waktu',
        type: 'multiple_choice',
        emoji: '⏰',
        difficulty: 'medium',
        gameData: {
          questions: [
            { problem: '1 jam = berapa minit?', options: ['30 minit', '60 minit', '100 minit'], answer: 1 },
            { problem: '1 minit = berapa saat?', options: ['60 saat', '30 saat', '100 saat'], answer: 0 },
            { problem: '1 hari = berapa jam?', options: ['12 jam', '24 jam', '48 jam'], answer: 1 },
            { problem: '1 minggu = berapa hari?', options: ['5 hari', '6 hari', '7 hari'], answer: 2 },
            { problem: '1 bulan = lebih kurang berapa hari?', options: ['20 hari', '30 hari', '40 hari'], answer: 1 },
            { problem: '1 tahun = berapa bulan?', options: ['10 bulan', '12 bulan', '14 bulan'], answer: 1 },
            { problem: 'Pukul 8:30 - pukul berapa setengah jam lagi?', options: ['8:00', '9:00', '9:30'], answer: 1 },
            { problem: 'Setengah jam = berapa minit?', options: ['20 minit', '30 minit', '45 minit'], answer: 1 },
          ],
        },
      },
      {
        title: 'Wang Malaysia',
        type: 'counting',
        emoji: '💰',
        difficulty: 'medium',
        gameData: {
          questions: [
            { image: '💵💵💵', options: ['RM 2', 'RM 3', 'RM 4'], answer: 1 },
            { image: '🪙🪙🪙🪙🪙', options: ['50 sen', '1 ringgit', '1 ringgit 50 sen'], answer: 1 },
            { image: '💵💵💵💵💵', options: ['RM 4', 'RM 5', 'RM 6'], answer: 1 },
            { image: '💵🪙🪙', options: ['RM 1.20', 'RM 1.50', 'RM 2'], answer: 0 },
            { image: 'Beli barang RM 5. Bayar RM 10. Baki?', options: ['RM 3', 'RM 5', 'RM 7'], answer: 1 },
            { image: 'Beli roti RM 2.50. Bayar RM 5. Baki?', options: ['RM 2', 'RM 2.50', 'RM 3'], answer: 1 },
            { image: '3 buku × RM 2 setiap satu = ?', options: ['RM 4', 'RM 6', 'RM 8'], answer: 1 },
            { image: 'RM 10 - RM 3.50 = ?', options: ['RM 5.50', 'RM 6.50', 'RM 7.50'], answer: 1 },
          ],
        },
      },
    ],

    science: [
      {
        title: 'Anggota Badan Manusia',
        type: 'picture_quiz',
        emoji: '🧠',
        difficulty: 'medium',
        gameData: {
          questions: [
            { image: '👁️', options: ['Mata', 'Hidung', 'Telinga'], answer: 0 },
            { image: '👃', options: ['Mata', 'Hidung', 'Telinga'], answer: 1 },
            { image: '👂', options: ['Mata', 'Hidung', 'Telinga'], answer: 2 },
            { image: '👅', options: ['Lidah', 'Gigi', 'Bibir'], answer: 0 },
            { image: '🦷', options: ['Lidah', 'Gigi', 'Bibir'], answer: 1 },
            { image: '👄', options: ['Lidah', 'Gigi', 'Bibir'], answer: 2 },
            { image: '🧠', options: ['Otak', 'Jantung', 'Paru'], answer: 0 },
            { image: '❤️', options: ['Otak', 'Jantung', 'Paru'], answer: 1 },
          ],
        },
      },
      {
        title: 'Cuaca & Musim',
        type: 'picture_quiz',
        emoji: '☀️',
        difficulty: 'medium',
        gameData: {
          questions: [
            { image: '☀️', options: ['Panas', 'Sejuk', 'Hujan'], answer: 0 },
            { image: '❄️', options: ['Panas', 'Sejuk', 'Hujan'], answer: 1 },
            { image: '🌧️', options: ['Panas', 'Sejuk', 'Hujan'], answer: 2 },
            { image: '⛅', options: ['Awan', 'Panas', 'Gelap'], answer: 0 },
            { image: '🌩️', options: ['Ribut', 'Tenang', 'Berangin'], answer: 0 },
            { image: '🌈', options: ['Pelangi', 'Matahari', 'Hujan'], answer: 0 },
            { image: '🌬️', options: ['Angin', 'Hujan', 'Panas'], answer: 0 },
            { image: '💨', options: ['Angin Kencang', 'Hujan', 'Panas'], answer: 0 },
          ],
        },
      },
      {
        title: 'Sistem Suria',
        type: 'picture_quiz',
        emoji: '🌍',
        difficulty: 'medium',
        gameData: {
          questions: [
            { image: '☀️', options: ['Bumi', 'Matahari', 'Bulan'], answer: 1 },
            { image: '🌍', options: ['Bumi', 'Marikh', 'Musytari'], answer: 0 },
            { image: '🌙', options: ['Planet', 'Bulan', 'Bintang'], answer: 1 },
            { image: '⭐', options: ['Satelit', 'Planet', 'Bintang'], answer: 2 },
            { image: '🔴', options: ['Bumi', 'Marikh', 'Zuhal'], answer: 1 },
            { image: '🪐', options: ['Bumi', 'Marikh', 'Zuhal'], answer: 2 },
            { image: '🌑', options: ['Gerhana', 'Bulan Penuh', 'Bulan Baru'], answer: 2 },
            { image: '🌕', options: ['Bulan Baru', 'Bulan Penuh', 'Bintang'], answer: 1 },
          ],
        },
      },
      {
        title: 'Proses Sains - Kitaran Air',
        type: 'picture_quiz',
        emoji: '💧',
        difficulty: 'medium',
        gameData: {
          questions: [
            { image: '☀️💧', options: ['Penyejatan', 'Pemendapan', 'Pemeluwapan'], answer: 0 },
            { image: '☁️💧', options: ['Penyejatan', 'Pemendapan', 'Pemeluwapan'], answer: 2 },
            { image: '🌧️', options: ['Penyejatan', 'Hujan/Pemendapan', 'Pemeluwapan'], answer: 1 },
            { image: '🌊➡️☁️', options: ['Penyejatan', 'Pemendapan', 'Pengaliran'], answer: 0 },
            { image: '💧🌱', options: ['Air diserap tumbuhan', 'Air menguap', 'Air mengalir'], answer: 0 },
            { image: '❄️➡️💧', options: ['Pembekuan', 'Pencairan', 'Pengewapan'], answer: 1 },
            { image: '💧➡️❄️', options: ['Pembekuan', 'Pencairan', 'Pengewapan'], answer: 0 },
            { image: '🌊🏞️', options: ['Laut', 'Sungai', 'Tasik'], answer: 1 },
          ],
        },
      },
      {
        title: 'Jenis-Jenis Haiwan',
        type: 'picture_quiz',
        emoji: '🦁',
        difficulty: 'medium',
        gameData: {
          questions: [
            { image: '🐟', options: ['Mamalia', 'Ikan', 'Reptilia'], answer: 1 },
            { image: '🐸', options: ['Amfibia', 'Ikan', 'Reptilia'], answer: 0 },
            { image: '🐍', options: ['Mamalia', 'Amfibia', 'Reptilia'], answer: 2 },
            { image: '🐦', options: ['Mamalia', 'Burung', 'Reptilia'], answer: 1 },
            { image: '🐘', options: ['Mamalia', 'Reptilia', 'Burung'], answer: 0 },
            { image: '🦋', options: ['Cacing', 'Serangga', 'Amfibia'], answer: 1 },
            { image: '🐢', options: ['Amfibia', 'Ikan', 'Reptilia'], answer: 2 },
            { image: '🦇', options: ['Mamalia', 'Burung', 'Serangga'], answer: 0 },
          ],
        },
      },
      {
        title: 'Bahan dan Sifatnya',
        type: 'multiple_choice',
        emoji: '🧪',
        difficulty: 'medium',
        gameData: {
          questions: [
            { problem: 'Besi adalah bahan yang...', options: ['Lembut', 'Keras', 'Elastik'], answer: 1 },
            { problem: 'Air adalah bahan yang...', options: ['Pepejal', 'Cecair', 'Gas'], answer: 1 },
            { problem: 'Kayu adalah bahan yang...', options: ['Logam', 'Bukan Logam', 'Cecair'], answer: 1 },
            { problem: 'Udara adalah dalam keadaan...', options: ['Pepejal', 'Cecair', 'Gas'], answer: 2 },
            { problem: 'Ais adalah keadaan...', options: ['Pepejal', 'Cecair', 'Gas'], answer: 0 },
            { problem: 'Getah boleh meregang, ini sifatnya...', options: ['Keras', 'Elastik', 'Tegar'], answer: 1 },
            { problem: 'Bahan manakah yang boleh mengalir?', options: ['Besi', 'Air', 'Batu'], answer: 1 },
            { problem: 'Bahan manakah yang boleh menyalur elektrik?', options: ['Kayu', 'Plastik', 'Tembaga'], answer: 2 },
          ],
        },
      },
      {
        title: 'Tenaga di Sekeliling Kita',
        type: 'multiple_choice',
        emoji: '⚡',
        difficulty: 'medium',
        gameData: {
          questions: [
            { problem: 'Sumber tenaga matahari dikenali sebagai?', options: ['Tenaga Angin', 'Tenaga Solar', 'Tenaga Air'], answer: 1 },
            { problem: 'Kipas angin menggunakan tenaga...', options: ['Tenaga Panas', 'Tenaga Elektrik', 'Tenaga Bunyi'], answer: 1 },
            { problem: 'Lampu menghasilkan tenaga...', options: ['Tenaga Cahaya', 'Tenaga Haba', 'Semua betul'], answer: 2 },
            { problem: 'Tayar kereta menggunakan tenaga...', options: ['Tenaga Kimia', 'Tenaga Kinetik', 'Tenaga Cahaya'], answer: 1 },
            { problem: 'Bateri menyimpan tenaga...', options: ['Tenaga Kimia', 'Tenaga Solar', 'Tenaga Angin'], answer: 0 },
            { problem: 'Matahari adalah sumber tenaga...', options: ['Tidak boleh dibaharui', 'Boleh dibaharui', 'Tidak bertenaga'], answer: 1 },
            { problem: 'Petrol adalah bahan...', options: ['Boleh dibaharui', 'Tidak boleh dibaharui', 'Tenaga bersih'], answer: 1 },
            { problem: 'Tenaga yang menghasilkan bunyi dipanggil?', options: ['Tenaga Haba', 'Tenaga Bunyi', 'Tenaga Cahaya'], answer: 1 },
          ],
        },
      },
      {
        title: 'Ekosistem & Rantai Makanan',
        type: 'multiple_choice',
        emoji: '🌿',
        difficulty: 'hard',
        gameData: {
          questions: [
            { problem: 'Tumbuhan dalam rantai makanan ialah...', options: ['Pengguna', 'Pengeluar', 'Pengurai'], answer: 1 },
            { problem: 'Harimau dalam rantai makanan ialah...', options: ['Pengeluar', 'Pengguna', 'Pengurai'], answer: 1 },
            { problem: 'Cacing dalam ekosistem berfungsi sebagai...', options: ['Pengguna', 'Pengeluar', 'Pengurai'], answer: 2 },
            { problem: 'Rantai makanan bermula dengan...', options: ['Haiwan', 'Tumbuhan', 'Kulat'], answer: 1 },
            { problem: 'Arnab memakan rumput. Arnab ialah...', options: ['Herbivor', 'Karnivor', 'Omnivor'], answer: 0 },
            { problem: 'Singa memakan daging. Singa ialah...', options: ['Herbivor', 'Karnivor', 'Omnivor'], answer: 1 },
            { problem: 'Manusia makan sayur dan daging. Manusia ialah...', options: ['Herbivor', 'Karnivor', 'Omnivor'], answer: 2 },
            { problem: 'Pokok → Ulat → Burung. Siapa pengguna pertama?', options: ['Pokok', 'Ulat', 'Burung'], answer: 1 },
          ],
        },
      },
      {
        title: 'Tubuh Badan Manusia - Sistem',
        type: 'multiple_choice',
        emoji: '🏃',
        difficulty: 'hard',
        gameData: {
          questions: [
            { problem: 'Sistem yang menggerakkan badan?', options: ['Sistem Penghadaman', 'Sistem Rangka & Otot', 'Sistem Pernafasan'], answer: 1 },
            { problem: 'Sistem yang memproses makanan?', options: ['Sistem Penghadaman', 'Sistem Saraf', 'Sistem Rangka'], answer: 0 },
            { problem: 'Paru-paru adalah sebahagian dari sistem?', options: ['Peredaran Darah', 'Pernafasan', 'Penghadaman'], answer: 1 },
            { problem: 'Jantung adalah sebahagian dari sistem?', options: ['Peredaran Darah', 'Pernafasan', 'Penghadaman'], answer: 0 },
            { problem: 'Otak adalah pusat kawalan sistem?', options: ['Penghadaman', 'Saraf', 'Peredaran Darah'], answer: 1 },
            { problem: 'Tulang melindungi organ penting. Ini fungsi sistem?', options: ['Rangka', 'Otot', 'Saraf'], answer: 0 },
            { problem: 'Kita bernafas dengan?', options: ['Jantung', 'Paru-paru', 'Hati'], answer: 1 },
            { problem: 'Darah dipam oleh?', options: ['Paru-paru', 'Jantung', 'Hati'], answer: 1 },
          ],
        },
      },
      {
        title: 'Penggunaan Teknologi dalam Sains',
        type: 'picture_quiz',
        emoji: '🔬',
        difficulty: 'medium',
        gameData: {
          questions: [
            { image: '🔬', options: ['Mikroskop - lihat benda kecil', 'Teleskop - lihat bintang', 'Kamera - ambil gambar'], answer: 0 },
            { image: '🔭', options: ['Mikroskop - lihat benda kecil', 'Teleskop - lihat benda jauh', 'Kompas - arah'], answer: 1 },
            { image: '🧲', options: ['Magnet - tarik logam', 'Wayar - alirkan elektrik', 'Cermin - pantul cahaya'], answer: 0 },
            { image: '💡', options: ['Tenaga Haba', 'Tenaga Cahaya', 'Tenaga Bunyi'], answer: 1 },
            { image: '☀️🔋', options: ['Panel Solar - simpan tenaga matahari', 'Pemanas - hasilkan haba', 'Penjana - hasilkan elektrik'], answer: 0 },
            { image: '🌡️', options: ['Termometer - ukur suhu', 'Barometer - ukur tekanan', 'Higrometer - ukur kelembapan'], answer: 0 },
            { image: '⚖️', options: ['Neraca - ukur jisim', 'Pembaris - ukur panjang', 'Jam - ukur masa'], answer: 0 },
            { image: '📡', options: ['Antena - hantar/terima isyarat', 'Teleskop - lihat bintang', 'Radar - pantau kapal terbang'], answer: 0 },
          ],
        },
      },
    ],
  },
};

// Utility functions
export function shuffleArray(arr) {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function calculateStars(score, total) {
  const pct = score / total;
  if (pct >= 0.9) return 3;
  if (pct >= 0.6) return 2;
  if (pct >= 0.3) return 1;
  return 0;
}

export function saveScore(gameType, score, total, stars) {
  const scores = JSON.parse(localStorage.getItem('kidScores') || '[]');
  scores.push({
    gameType,
    score,
    total,
    stars,
    date: new Date().toISOString(),
  });
  if (scores.length > 50) scores.splice(0, scores.length - 50);
  localStorage.setItem('kidScores', JSON.stringify(scores));
}

export function getScores() {
  return JSON.parse(localStorage.getItem('kidScores') || '[]');
}

export function clearScores() {
  localStorage.setItem('kidScores', '[]');
}

// Helper functions
export function getGamesByAgeAndCategory(ageGroup, category) {
  return gameLibrary[ageGroup]?.[category] || [];
}

export function getGamesByAge(ageGroup) {
  const games = gameLibrary[ageGroup] || {};
  if (ageGroup === 'sekolah_rendah') {
    return games;
  }
  const filtered = { ...games };
  delete filtered.jawi;
  return filtered;
}

export function getAllGamesForAge(ageGroup) {
  const games = gameLibrary[ageGroup];
  if (!games) return [];
  return Object.values(games).flat();
}