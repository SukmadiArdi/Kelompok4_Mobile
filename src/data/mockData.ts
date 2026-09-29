import { Experience, HiddenGem, ArtisanProduct, Booking } from '../types';

export const MOCK_EXPERIENCES: Experience[] = [
  {
    id: 'exp-1',
    title: 'Membatik Canting Klasik & Pewarnaan Alami Sogan',
    category: 'Workshop Seni',
    location: 'Desa Wisata Giriloyo, Imogiri',
    city: 'Bantul',
    province: 'D.I. Yogyakarta',
    price: 185000,
    duration: '3.5 Jam',
    rating: 4.9,
    reviewCount: 142,
    image: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1606744824163-985d376605aa?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&auto=format&fit=crop&q=80'
    ],
    guide: {
      id: 'guide-1',
      name: 'Ibu Siti Mulyani',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80',
      badge: 'Master Canting Giriloyo',
      rating: 4.95,
      tripsCount: 320,
      languages: ['Indonesia', 'Jawa Alus', 'Inggris Dasar'],
      bio: 'Pewaris generasi ke-3 pembatik keraton Imogiri. Berpengalaman 25 tahun melestarikan motif klasik dengan pewarna kulit kayu mahoni dan tingi.',
      verified: true,
    },
    highlights: [
      'Belajar menggambar motif klasik menggunakan canting tembaga asli',
      'Proses pencelupan warna alami dari rebusan kayu mahoni & tingi',
      'Kain batik sutra ukuran 50x50 cm hasil karya dibawa pulang',
      'Minum teh poci gula batu & jajanan pasar khas desa'
    ],
    included: ['Alat canting & lilin malam', 'Kain mori premium', 'Pewarna alami', 'Snack & Teh Poci', 'Sertifikat keikutsertaan'],
    schedule: [
      { time: '09:00', activity: 'Penyambutan, perkenalan filosofi motif batik Yogyakarta' },
      { time: '09:30', activity: 'Latihan teknik memegang canting dan melukis pola di atas kain mori' },
      { time: '11:00', activity: 'Proses pewarnaan dingin alami dan proses lorot lilin' },
      { time: '12:00', activity: 'Penjemuran kain, evaluasi karya, santap kudapan tradisional' },
    ],
    availableSlots: ['09:00 WIB', '13:30 WIB'],
    description: 'Rasakan kedamaian batin lewat meditasi canting di bawah keteduhan bukit Imogiri. Bersama Ibu Siti, Anda akan diajak menyelami filosofi mendalam di balik setiap guratan motif batik Yogyakarta sambil mencium harum khas lilin malam alami.',
    maxParticipants: 8,
  },
  {
    id: 'exp-2',
    title: 'Upacara Suci & Rahasia Tari Kecak Tebing Sunset',
    category: 'Wisata Adat',
    location: 'Desa Adat Pecatu, Uluwatu',
    city: 'Badung',
    province: 'Bali',
    price: 260000,
    duration: '4 Jam',
    rating: 4.95,
    reviewCount: 218,
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=800&auto=format&fit=crop&q=80'
    ],
    guide: {
      id: 'guide-2',
      name: 'Bli Wayan Suardana',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
      badge: 'Tetua Sanggar Seni Pecatu',
      rating: 4.98,
      tripsCount: 450,
      languages: ['Indonesia', 'Bali', 'Inggris'],
      bio: 'Penari Kecak sejak usia 14 tahun dan pemandu budaya bersertifikasi kehormatan Desa Adat.',
      verified: true,
    },
    highlights: [
      'Akses VIP ke lingkaran latihan penari sebelum pentas utama',
      'Prosesi canang sari & blessing air suci oleh tetua adat',
      'Menyaksikan sunset spektakuler 70 meter di atas Samudra Hindia',
      'Sesi foto eksklusif bersama tokoh Hanoman & Rahwana'
    ],
    included: ['Tiket masuk area privat tebing', 'Selendang kamen upacara', 'Canang persembahan', 'Tempat duduk baris terdepan', 'Air kelapa muda segar'],
    schedule: [
      { time: '16:00', activity: 'Pertemuan di wantilan desa, pemakaian kamen dan pengantar makna epos Ramayana' },
      { time: '16:45', activity: 'Menyaksikan prosesi persiapan spiritual para penari' },
      { time: '17:30', activity: 'Menempati kursi VIP menyambut matahari terbenam' },
      { time: '18:00', activity: 'Pementasan Kecak & atraksi api sakral' },
      { time: '19:15', activity: 'Diskusi budaya santai dan foto bersama penari' },
    ],
    availableSlots: ['16:00 WITA'],
    description: 'Bukan sekadar menonton pertunjukan turis biasa. Bersama Bli Wayan, masuki ruang sakral persiapan doa para penari Kecak dan nikmati magisnya harmoni suara puluhan pria di bibir tebing samudera.',
    maxParticipants: 12,
  },
  {
    id: 'exp-3',
    title: 'Kelas Rahasia Rendang Warisan Bundo & Rempah Dapur',
    category: 'Kuliner Tradisi',
    location: 'Nagari Koto Nan Ampek',
    city: 'Payakumbuh',
    province: 'Sumatera Barat',
    price: 210000,
    duration: '4.5 Jam',
    rating: 4.88,
    reviewCount: 96,
    image: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=800&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80'
    ],
    guide: {
      id: 'guide-3',
      name: 'Uni Rosmawati',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
      badge: 'Pakar Masakan Minang Tradisional',
      rating: 4.92,
      tripsCount: 180,
      languages: ['Indonesia', 'Minang'],
      bio: 'Pelestari resep rendang kayu bakar khas Luhak Limopuluah dengan 16 racikan rempah murni.',
      verified: true,
    },
    highlights: [
      'Menumbuk langsung bumbu dengan batu lado tradisional',
      'Memasak gulai santan hingga menjadi kalio lalu rendang hitam pekat',
      'Menggunakan kayu bakar pohon karet untuk aroma *smoky* otentik',
      'Makan bajamba bersama keluarga di Rumah Gadang'
    ],
    included: ['Semua bahan daging segar & rempah', 'Makan siang bajamba komplit', '1 toples rendang 250gr bawa pulang', 'Buku resep rahasia bundo'],
    schedule: [
      { time: '08:30', activity: 'Belanja rempah segar dan santan peras kental di pasar nagari' },
      { time: '09:30', activity: 'Meracik bumbu lado, laos, jahe, ketumbar sangrai' },
      { time: '10:30', activity: 'Mengaduk kuali kancah di atas perapian kayu bakar' },
      { time: '12:30', activity: 'Makan bajamba khas Minangkabau di serambi Rumah Gadang' },
    ],
    availableSlots: ['08:30 WIB'],
    description: 'Ketahui rahasia mengapa rendang dinobatkan sebagai salah satu hidangan terlezat di dunia. Belajar langsung teknik mengaduk santan hingga karamelisasi sempurna tanpa membuat daging hancur.',
    maxParticipants: 6,
  },
  {
    id: 'exp-4',
    title: 'Menyusuri Lembah Harau & Panjat Tebing Karst Hijau',
    category: 'Alam & Petualangan',
    location: 'Lembah Harau, Lima Puluh Kota',
    city: 'Payakumbuh',
    province: 'Sumatera Barat',
    price: 320000,
    duration: '5 Jam',
    rating: 4.91,
    reviewCount: 84,
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&auto=format&fit=crop&q=80'
    ],
    guide: {
      id: 'guide-4',
      name: 'Uda Fajar Harau',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
      badge: 'Guide Karst Berlisensi APGI',
      rating: 4.96,
      tripsCount: 290,
      languages: ['Indonesia', 'Inggris', 'Minang'],
      bio: 'Pegiat konservasi tebing granit Harau dan pemandu alam liar dengan dedikasi keselamatan tinggi.',
      verified: true,
    },
    highlights: [
      'Trekking di antara dinding granit tegak setinggi 100-300 meter',
      'Mandi di bawah percikan air terjun tersembunyi Sarasah Aie Luluih',
      'Piknik kopi kawa daun di hamparan sawah hijau berlatar ngarai',
      'Eksplorasi gua stalaktit kelelawar alami'
    ],
    included: ['Perlengkapan keamanan trekking & helm', 'Kopi kawa daun & ketan srikaya', 'Makan siang nasi kapau', 'Dokumentasi foto aksi'],
    schedule: [
      { time: '07:30', activity: 'Briefing rute dan pemanasan di kaki bukit Harau' },
      { time: '08:15', activity: 'Trekking jalur pematang sawah menuju ngarai tersembunyi' },
      { time: '10:00', activity: 'Menikmati kesegaran air terjun Sarasah' },
      { time: '11:30', activity: 'Santap siang lokal di gubuk tepi sawah' },
    ],
    availableSlots: ['07:30 WIB'],
    description: 'Yosemite-nya Indonesia! Saksikan kemegahan monolit granit purba yang menjulang megah menembus awan dan nikmati hangatnya keramahan petani lokal.',
    maxParticipants: 10,
  },
  {
    id: 'exp-5',
    title: 'Anyaman Daun Lontar & Seduh Kopi Tradisi Rote',
    category: 'Workshop Seni',
    location: 'Desa Ba’a, Pulau Rote',
    city: 'Rote Ndao',
    province: 'Nusa Tenggara Timur',
    price: 175000,
    duration: '3 Jam',
    rating: 4.87,
    reviewCount: 52,
    image: 'https://images.unsplash.com/photo-1590402494682-cd3fb53b1f70?w=800&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1590402494682-cd3fb53b1f70?w=800&auto=format&fit=crop&q=80'
    ],
    guide: {
      id: 'guide-5',
      name: 'Mama Yustina Ndolu',
      avatar: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=200&auto=format&fit=crop&q=80',
      badge: 'Maestro Anyam Ti’i Langga',
      rating: 4.9,
      tripsCount: 110,
      languages: ['Indonesia', 'Bahasa Rote'],
      bio: 'Menjaga tradisi topi kehormatan Ti’i Langga dan keranjang lontar selama empat dekade.',
      verified: true,
    },
    highlights: [
      'Mengenal teknik mengolah pucuk daun lontar menjadi serat lentur',
      'Membuat wadah anyaman mini khas Rote karya sendiri',
      'Mencicipi tuak manis nira lontar segar langsung dari pohon',
      'Pertunjukan petikan alat musik Sasando kayu tradisional'
    ],
    included: ['Daun lontar siap anyam', 'Cemilan kue cucur & kopi Rote', 'Hasil karya anyaman dibawa pulang', 'Alunan petikan Sasando live'],
    schedule: [
      { time: '14:00', activity: 'Mencicipi nira manis penyambutan dan pengenalan pohon kehidupan Rote' },
      { time: '14:30', activity: 'Praktik pola dasar silang anyam lontar' },
      { time: '16:00', activity: 'Menyelesaikan karya sambil menikmati kopi senja dan denting Sasando' },
    ],
    availableSlots: ['14:00 WITA'],
    description: 'Bagi masyarakat Rote, pohon lontar adalah denyut kehidupan. Ikuti workshop penuh kehangatan bersama Mama Yustina dalam menganyam helai demi helai daun pohon lontar yang sarat filosofi ketabahan.',
    maxParticipants: 8,
  },
  {
    id: 'exp-6',
    title: 'Pahat Patung Kayu & Filosofi Tri Hita Karana',
    category: 'Workshop Seni',
    location: 'Desa Mas, Ubud',
    city: 'Gianyar',
    province: 'Bali',
    price: 240000,
    duration: '3.5 Jam',
    rating: 4.93,
    reviewCount: 165,
    image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800&auto=format&fit=crop&q=80'
    ],
    guide: {
      id: 'guide-6',
      name: 'Pak Ketut Gede',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80',
      badge: 'Seniman Pahat Desa Mas',
      rating: 4.94,
      tripsCount: 230,
      languages: ['Indonesia', 'Bali', 'Inggris'],
      bio: 'Seniman pahat kayu suar dan nangka yang karyanya dipajang di galeri internasional Ubud.',
      verified: true,
    },
    highlights: [
      'Belajar memegang pahat tatah dan palu kayu dengan aman',
      'Membentuk pola ornamen bunga kamboja atau topeng mini',
      'Memahami doa dan permohonan izin kepada roh kayu sebelum dipahat',
      'Finishing amplas halus dan pelapisan lilin lebah alami'
    ],
    included: ['Balok kayu suar wangi', 'Set lengkap pahat & pelindung jari', 'Patung ornamen hasil karya sendiri', 'Kopi rempah Bali'],
    schedule: [
      { time: '10:00', activity: 'Pengenalan jenis-jenis kayu sakral di Bali dan makna bentuk patung' },
      { time: '10:30', activity: 'Sketsa pola di balok kayu dan teknik mengikis dasar' },
      { time: '12:00', activity: 'Detail ukiran ornamen dan pengamplasan' },
      { time: '13:00', activity: 'Pemberian lilin pelindung dan evaluasi hasil karya' },
    ],
    availableSlots: ['10:00 WITA', '14:00 WITA'],
    description: 'Desa Mas terkenal di seantero jagat sebagai pusat seniman pahat Bali. Duduklah di bale bengong bersama Pak Ketut dan rasakan bagaimana balok kayu bertransformasi menjadi karya bernyawa di tangan Anda.',
    maxParticipants: 6,
  }
];

export const MOCK_HIDDEN_GEMS: HiddenGem[] = [
  {
    id: 'gem-1',
    name: 'Air Terjun Tanggedu: Canyon Zamrud Sumba',
    category: 'Air Terjun',
    region: 'Nusa Tenggara',
    location: 'Desa Tanggedu, Kanatang',
    city: 'Sumba Timur',
    province: 'Nusa Tenggara Timur',
    difficulty: 'Menantang',
    bestTime: '08:00 - 11:00 WITA (Air sangat jernih toska)',
    tips: [
      'Gunakan sandal gunung anti-slip karena batu tebing licin',
      'Bawa kantong tahan air (dry bag) untuk gawai & kamera',
      'Wajib membawa air minum sendiri minimal 1.5 liter'
    ],
    etiquette: [
      'Menjaga kesopanan busana saat berenang',
      'Wajib didampingi pemuda pemandu desa setempat',
      'Bawa pulang semua sampah tanpa terkecuali'
    ],
    mapCoords: {
      lat: -9.5123,
      lng: 120.0894,
      xPercent: 62,
      yPercent: 70,
    },
    image: 'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?w=800&auto=format&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&auto=format&fit=crop&q=80'
    ],
    likesCount: 528,
    reviewsCount: 67,
    rating: 4.93,
    contributor: {
      name: 'Rian Nusantara',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
      badge: 'Penjelajah Sumba Intrepid',
      date: '12 Mei 2026'
    },
    description: 'Tersembunyi di balik perbukitan savana gersang Sumba Timur, Air Terjun Tanggedu membelah formasi tebing kapur purba yang mengingatkan kita pada Grand Canyon versi mini dengan kolam air zamrud toska yang menakjubkan.',
    reviews: [
      {
        id: 'rev-1',
        user: 'Alifia Zahra',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
        rating: 5,
        comment: 'Trek jalannya lumayan bikin ngos-ngosan sekitar 45 menit melewati savana, tapi begitu lihat airnya yang sebiru safir dan celah tebingnya, semua lelah langsung hilang seketika!',
        date: '2 minggu lalu'
      },
      {
        id: 'rev-2',
        user: 'Bayu Pratama',
        avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200&auto=format&fit=crop&q=80',
        rating: 5,
        comment: 'Pemandu lokal dari desa Tanggedu sangat ramah dan sigap menolong saat menuruni tebing batu. Pengalaman tak terlupakan di Sumba!',
        date: '1 bulan lalu'
      }
    ]
  },
  {
    id: 'gem-2',
    name: 'Desa Adat Senaru & Hutan Bambu Purba Rinjani',
    category: 'Kampung Adat',
    region: 'Bali & Lombok',
    location: 'Lereng Gunung Rinjani, Bayan',
    city: 'Lombok Utara',
    province: 'Nusa Tenggara Barat',
    difficulty: 'Sedang',
    bestTime: '06:30 - 09:30 WITA (Kabut pagi sangat magis)',
    tips: [
      'Gunakan jaket hangat karena udara pagi cukup dingin',
      'Kenakan sepatu yang nyaman untuk berjalan di tanah lembap'
    ],
    etiquette: [
      'Meminta izin sebelum memotret rumah adat bumbung alang-alang',
      'Mengucapkan salam "Tabe" saat berpapasan dengan tetua kampung'
    ],
    mapCoords: {
      lat: -8.3012,
      lng: 116.4021,
      xPercent: 54,
      yPercent: 65,
    },
    image: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?w=800&auto=format&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=800&auto=format&fit=crop&q=80'
    ],
    likesCount: 390,
    reviewsCount: 45,
    rating: 4.88,
    contributor: {
      name: 'Nanda Putri',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
      badge: 'Heritage Seeker',
      date: '28 April 2026'
    },
    description: 'Sebuah permukiman tradisional suku Sasak yang mempertahankan arsitektur leluhur berbahan bambu, tanah liat, dan atap jerami alang-alang di pintu gerbang hutan pegunungan Rinjani.',
    reviews: [
      {
        id: 'rev-3',
        user: 'Hendro Saputra',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
        rating: 5,
        comment: 'Udara sangat sejuk, ketenangan yang tidak bisa ditemukan di kota besar. Warga desa menjamu kami dengan kopi khas yang disangrai di wajan tanah liat.',
        date: '3 minggu lalu'
      }
    ]
  },
  {
    id: 'gem-3',
    name: 'Tebing Karang Kasap: Raja Ampat van Pacitan',
    category: 'Tebing & Sunrise',
    region: 'Jawa',
    location: 'Desa Watukarung, Pringkuku',
    city: 'Pacitan',
    province: 'Jawa Timur',
    difficulty: 'Mudah',
    bestTime: '05:15 - 06:45 WIB untuk Sunrise emas spektakuler',
    tips: [
      'Datang subuh untuk mendapatkan momen langit ungu kejinggaan',
      'Jalan setapak telah berundak semen sehingga aman untuk keluarga'
    ],
    etiquette: [
      'Tidak memanjat pagar pengaman tebing yang menghadap jurang'
    ],
    mapCoords: {
      lat: -8.2435,
      lng: 110.9912,
      xPercent: 42,
      yPercent: 62,
    },
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80'
    ],
    likesCount: 612,
    reviewsCount: 88,
    rating: 4.91,
    contributor: {
      name: 'Dimas Setiawan',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
      badge: 'Landscape Hunter',
      date: '3 Juni 2026'
    },
    description: 'Gugusan pulau karang kecil berbalut pepohonan hijau di tengah lautan biru selatan yang menghadirkan lanskap megah mirip Raja Ampat Papua dari atas bukit rumput Pacitan.',
    reviews: [
      {
        id: 'rev-4',
        user: 'Tania Maharani',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80',
        rating: 5,
        comment: 'Sunrise terbaik di Jawa Timur bagian selatan! Angin lautnya sejuk dan pemandangan pulau karangnya luar biasa megah.',
        date: '1 minggu lalu'
      }
    ]
  },
  {
    id: 'gem-4',
    name: 'Pantai Mbawana & Tebing Batu Cincin Rahasia',
    category: 'Pantai Sunyi',
    region: 'Nusa Tenggara',
    location: 'Kecamatan Kodi',
    city: 'Sumba Barat Daya',
    province: 'Nusa Tenggara Timur',
    difficulty: 'Sedang',
    bestTime: '16:30 - 18:15 WITA (Golden Hour terbenam di balik lengkung karang)',
    tips: [
      'Perhatikan pasang surut air laut sebelum turun ke bibir pantai',
      'Kamera lensa lebar sangat direkomendasikan untuk sudut tebing'
    ],
    etiquette: [
      'Menghormati nelayan tradisional setempat yang sedang mencari gurita'
    ],
    mapCoords: {
      lat: -9.6201,
      lng: 119.0432,
      xPercent: 58,
      yPercent: 72,
    },
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80'
    ],
    likesCount: 440,
    reviewsCount: 39,
    rating: 4.86,
    contributor: {
      name: 'Yogi Pratama',
      avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200&auto=format&fit=crop&q=80',
      badge: 'Ocean Scout',
      date: '18 Mei 2026'
    },
    description: 'Pantai pasir putih tersembunyi dengan deburan ombak Samudra Hindia yang bertenaga dan formasi tebing karang melengkung menyerupai gerbang alam raksasa.',
    reviews: []
  },
  {
    id: 'gem-5',
    name: 'Lembah Ollon: Savana Swiss Versi Pegunungan Toraja',
    category: 'Hutan & Lembah',
    region: 'Sulawesi',
    location: 'Kecamatan Bonggakaradeng',
    city: 'Tana Toraja',
    province: 'Sulawesi Selatan',
    difficulty: 'Menantang',
    bestTime: '06:00 - 10:00 WITA (Kabut savana melayang indah)',
    tips: [
      'Gunakan kendaraan 4WD atau motor trail sewa karena medan berbatu',
      'Bawa tenda jika ingin bermalam dan melihat jutaan bintang Milky Way'
    ],
    etiquette: [
      'Tidak mengganggu kawanan kuda liar dan kerbau yang merumput'
    ],
    mapCoords: {
      lat: -3.1234,
      lng: 119.8211,
      xPercent: 65,
      yPercent: 46,
    },
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&auto=format&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&auto=format&fit=crop&q=80'
    ],
    likesCount: 715,
    reviewsCount: 92,
    rating: 4.96,
    contributor: {
      name: 'Grace Tandililing',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
      badge: 'Toraja Highlands Explorer',
      date: '5 Juni 2026'
    },
    description: 'Hamparan bukit savana hijau bergelombang yang dibelah oleh aliran sungai jernih dengan latar puncak pegunungan Toraja yang berkabut misterius.',
    reviews: []
  },
  {
    id: 'gem-6',
    name: 'Taman Sungai Mudal: Mata Air Sejuk Menoreh',
    category: 'Air Terjun',
    region: 'Jawa',
    location: 'Girimulyo, Perbukitan Menoreh',
    city: 'Kulon Progo',
    province: 'D.I. Yogyakarta',
    difficulty: 'Mudah',
    bestTime: '08:00 - 11:30 WIB (Air paling jernih dan tenang)',
    tips: [
      'Bawa baju ganti untuk berenang di kolam alami',
      'Cocok untuk bersantai keluarga dengan gazebo bambu rindang'
    ],
    etiquette: [
      'Gunakan sabun atau sampo biodegradable jika ingin membersihkan diri'
    ],
    mapCoords: {
      lat: -7.7654,
      lng: 110.1234,
      xPercent: 38,
      yPercent: 60,
    },
    image: 'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?w=800&auto=format&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?w=800&auto=format&fit=crop&q=80'
    ],
    likesCount: 382,
    reviewsCount: 54,
    rating: 4.84,
    contributor: {
      name: 'Rian Nusantara',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
      badge: 'Penjelajah Sumba Intrepid',
      date: '10 Juni 2026'
    },
    description: 'Kolam pemandian mata air alami bertingkat dengan warna air hijau toska segar yang mengalir di sela kebun anggrek dan rimbunnya hutan Perbukitan Menoreh.',
    reviews: []
  }
];

export const MOCK_ARTISANS: ArtisanProduct[] = [
  {
    id: 'prod-1',
    name: 'Kain Tenun Ikat Pewarna Alami Motif Kuda Sumba',
    category: 'Wastra & Batik',
    price: 850000,
    originalPrice: 1050000,
    rating: 4.97,
    salesCount: 48,
    stock: 5,
    image: 'https://images.unsplash.com/photo-1606744824163-985d376605aa?w=800&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1606744824163-985d376605aa?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800&auto=format&fit=crop&q=80'
    ],
    artisan: {
      id: 'art-1',
      name: 'Mama Maria Kahi',
      craft: 'Master Tenun Tradisi Sumba',
      village: 'Kampung Raja Prailiu',
      city: 'Sumba Timur',
      province: 'Nusa Tenggara Timur',
      story: 'Menenun bukan sekadar pekerjaan merangkai benang, melainkan doa yang dipanjatkan bagi para leluhur Marapu. Membutuhkan waktu 4 hingga 6 bulan untuk menghasilkan satu lembar kain tenun dengan pewarna akar mengkudu dan daun nila murni.',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80',
      bannerImage: 'https://images.unsplash.com/photo-1606744824163-985d376605aa?w=800&auto=format&fit=crop&q=80',
      yearsExperience: 32,
      verified: true,
      quote: '"Setiap helai benang mengikat kisah bumi dan kehormatan para leluhur."'
    },
    philosophy: 'Motif Kuda (Njara) melambangkan kejantanan, kepemimpinan, dan kebebasan jiwa ksatria Sumba. Pewarnaan merah kecokelatan didapatkan dari rebusan akar mengkudu yang diawetkan bersama minyak kemiri alami.',
    materials: ['100% Benang Katun Pintal Tangan', 'Pewarna Akar Mengkudu (Kombu)', 'Pewarna Daun Nila (Wora)', 'Minyak Kemiri'],
    dimensions: '220 cm x 95 cm',
    weight: '650 gram'
  },
  {
    id: 'prod-2',
    name: 'Teko Gerabah Terakota Bakar Sekam Kasongan',
    category: 'Gerabah & Keramik',
    price: 165000,
    rating: 4.89,
    salesCount: 132,
    stock: 14,
    image: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=800&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=800&auto=format&fit=crop&q=80'
    ],
    artisan: {
      id: 'art-2',
      name: 'Mas Joko Susilo',
      craft: 'Pematung Tanah Liat Studio Kasongan',
      village: 'Desa Wisata Kasongan',
      city: 'Bantul',
      province: 'D.I. Yogyakarta',
      story: 'Melanjutkan studio gerabah keluarga yang berdiri sejak 1978. Joko menggabungkan teknik putar manual tanah lempung sungai Opak dengan teknik pembakaran asap sekam padi untuk menghasilkan rona kehitaman alami yang rustic.',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
      bannerImage: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=800&auto=format&fit=crop&q=80',
      yearsExperience: 18,
      verified: true,
      quote: '"Tanah liat mengajarkan kerendahan hati: dari lumpur menjadi bejana kehidupan."'
    },
    philosophy: 'Bentuk teko yang membulat melambangkan kehangatan rahim pertiwi dan kelimpahan rezeki. Hasil seduhan teh poci menggunakan teko tanah liat terbukti mengeluarkan aroma tanah alami yang menenangkan.',
    materials: ['Tanah Lempung Endapan Bantul', 'Pasir Halus Silika', 'Abu Sekam Padi Alami'],
    dimensions: 'Tinggi 18 cm, Diameter 14 cm, Kapasitas 850 ml',
    weight: '900 gram'
  },
  {
    id: 'prod-3',
    name: 'Tas Ransel Etnik Anjat Anyaman Rotan Dayak Kenyah',
    category: 'Anyaman Bambu',
    price: 340000,
    originalPrice: 420000,
    rating: 4.92,
    salesCount: 75,
    stock: 8,
    image: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800&auto=format&fit=crop&q=80'
    ],
    artisan: {
      id: 'art-3',
      name: 'Ibu Liling Bua',
      craft: 'Penganyam Rotan Hutan Dayak',
      village: 'Desa Pampang',
      city: 'Kutai Barat',
      province: 'Kalimantan Timur',
      story: 'Bahan rotan diambil langsung dari pedalaman hutan Kalimantan secara berkelanjutan. Dianyam dengan ketelitian tinggi dan tali penopang dari serat kulit kayu kapur.',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
      bannerImage: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800&auto=format&fit=crop&q=80',
      yearsExperience: 24,
      verified: true,
      quote: '"Menjaga hutan adalah menjaga jemari kami tetap menganyam."'
    },
    philosophy: 'Anyaman Anjat adalah tas sakral masyarakat Dayak yang digunakan dalam penjelajahan hutan. Sangat ringan namun memiliki daya tahan puluhan tahun terhadap cuaca tropis.',
    materials: ['Rotan Sego Pilihan', 'Pewarna Daun Kalawit Hitam', 'Tali Kulit Kayu'],
    dimensions: 'Tinggi 36 cm, Diameter 22 cm',
    weight: '380 gram'
  },
  {
    id: 'prod-4',
    name: 'Patung Garudeya Kayu Cendana Wangi Bali',
    category: 'Ukiran Kayu',
    price: 680000,
    rating: 4.98,
    salesCount: 29,
    stock: 4,
    image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800&auto=format&fit=crop&q=80'
    ],
    artisan: {
      id: 'art-4',
      name: 'I Nyoman Sujana',
      craft: 'Pematung Legendaris Desa Mas',
      village: 'Desa Mas, Ubud',
      city: 'Gianyar',
      province: 'Bali',
      story: 'Keluarga Sujana telah mengukir kayu di Ubud selama 4 dekade. Mengkhususkan diri pada figur mitologi pewayangan dengan detail bulu dan anatomi yang sangat presisi.',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80',
      bannerImage: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800&auto=format&fit=crop&q=80',
      yearsExperience: 28,
      verified: true,
      quote: '"Kayu cendana menyimpan wewangian surga yang hidup selamanya."'
    },
    philosophy: 'Garuda melambangkan kesetiaan tanpa batas dan pengorbanan demi membebaskan sang ibu dari perbudakan. Membawa energi perlindungan dan keteguhan hati bagi pemiliknya.',
    materials: ['Kayu Cendana Wangi Asli NTT', 'Lilin Lebah Alami (Beeswax Polish)'],
    dimensions: 'Tinggi 24 cm, Lebar 16 cm',
    weight: '520 gram'
  },
  {
    id: 'prod-5',
    name: 'Selendang Sutra Batik Tulis Motif Parang Barong',
    category: 'Wastra & Batik',
    price: 495000,
    rating: 4.91,
    salesCount: 62,
    stock: 7,
    image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&auto=format&fit=crop&q=80'
    ],
    artisan: {
      id: 'art-5',
      name: 'Sanggar Danar Arum',
      craft: 'Kolektif Pembatik Tulis Keraton Solo',
      village: 'Kampung Batik Laweyan',
      city: 'Surakarta',
      province: 'Jawa Tengah',
      story: 'Kolektif 15 ibu pembatik Laweyan yang melestarikan pakem motif keraton klasik dengan sentuhan kain sutra crepe modern yang jatuh anggun.',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
      bannerImage: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&auto=format&fit=crop&q=80',
      yearsExperience: 20,
      verified: true,
      quote: '"Garis miring parang adalah ombak yang pantang menyerah menghantam karang."'
    },
    philosophy: 'Parang Barong adalah motif sakral lambang ketajaman budi pekerti, kewibawaan, dan kepemimpinan yang adil luhur.',
    materials: ['100% Kain Sutra Crepe Halus', 'Malam Tawon Madu', 'Pewarna Tumbuhan Sogan'],
    dimensions: '200 cm x 60 cm',
    weight: '180 gram'
  },
  {
    id: 'prod-6',
    name: 'Cangkir Keramik Glasir Abu Vulkanik Merapi',
    category: 'Gerabah & Keramik',
    price: 125000,
    rating: 4.88,
    salesCount: 189,
    stock: 22,
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80'
    ],
    artisan: {
      id: 'art-6',
      name: 'Studio Arga Merapi',
      craft: 'Pengrajin Keramik Alam Lereng Merapi',
      village: 'Pakem, Sleman',
      city: 'Sleman',
      province: 'D.I. Yogyakarta',
      story: 'Mengolah berkah endapan abu vulkanik erupsi Gunung Merapi menjadi formula glasir keramik unik bersuhu 1250 derajat Celcius dengan tekstur rintik alami.',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
      bannerImage: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80',
      yearsExperience: 12,
      verified: true,
      quote: '"Dari panas magma Merapi terlahir cangkir kopi yang meneduhkan pagi."'
    },
    philosophy: 'Menghadirkan harmoni kekuatan gunung api dan ketenangan ritual minum kopi pagi. Setiap cangkir memiliki gradasi warna unik yang tidak pernah identik.',
    materials: ['Tanah Lempung Stoneware Food-Grade', 'Glasir Alami Campuran Abu Vulkanik Merapi'],
    dimensions: 'Tinggi 8.5 cm, Diameter 8 cm, Kapasitas 260 ml',
    weight: '280 gram'
  }
];

export const INITIAL_BOOKINGS: Booking[] = [
  {
    id: 'book-101',
    experienceId: 'exp-1',
    experienceTitle: 'Membatik Canting Klasik & Pewarnaan Alami Sogan',
    experienceImage: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800&auto=format&fit=crop&q=80',
    location: 'Desa Wisata Giriloyo, Bantul',
    date: '15 Oktober 2026',
    timeSlot: '09:00 WIB',
    guestsCount: 2,
    totalPrice: 370000,
    status: 'Dikonfirmasi',
    guideName: 'Ibu Siti Mulyani',
    createdAt: '2026-09-20'
  }
];
