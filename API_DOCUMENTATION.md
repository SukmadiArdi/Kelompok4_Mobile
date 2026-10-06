# DOKUMENTASI KONTRAK DATA API - LOKALTRIP MOBILE

Dokumen ini membagi tugas integrasi API menjadi dua bagian yang jelas:
1. **Tugas Anda (Data & API Service Layer)**: Menyediakan definisi endpoint, tipe TypeScript, dan fungsi pemanggil API.
2. **Tugas Rekan Anda (UI Consumer Layer)**: Mengambil data menggunakan service/hook dan menampilkannya di komponen/layar UI.

---

## 1. Konfigurasi Environment Variable (`.env`)

Tambahkan alamat REST API backend ke file `.env` (atau `.env.local`):

```env
EXPO_PUBLIC_API_BASE_URL=https://api.lokaltrip.id
```

> **Catatan:** Jika backend belum siap atau `EXPO_PUBLIC_API_BASE_URL` kosong/offline, aplikasi secara otomatis menggunakan data mock lokal sehingga pengembangan UI rekan Anda tidak terhambat.

---

## 2. Daftar Spesifikasi Endpoint API (Tugas Anda)

File implementasi: [`src/services/apiService.ts`](file:///c:/Users/user/My%20Project/Mobile/Kelompok4_Mobile/src/services/apiService.ts)  
Tipe TypeScript: [`src/types/index.ts`](file:///c:/Users/user/My%20Project/Mobile/Kelompok4_Mobile/src/types/index.ts)

### A. Wisata & Workshop Budaya (`/experiences`)
| Method | Endpoint | Fungsi di Service | Tipe Kembalian |
| :--- | :--- | :--- | :--- |
| `GET` | `/experiences` | `getExperiences()` | `Experience[]` |
| `GET` | `/experiences/:id` | `getExperienceById(id)` | `Experience` |

**Format Response JSON:**
```json
{
  "id": "exp-1",
  "title": "Workshop Membatik Tulis Tradisional",
  "category": "Workshop Seni",
  "location": "Desa Giriloyo, Imogiri",
  "city": "Bantul",
  "province": "D.I. Yogyakarta",
  "price": 185000,
  "duration": "3.5 Jam",
  "rating": 4.9,
  "reviewCount": 128,
  "image": "https://images.unsplash.com/...",
  "guide": {
    "name": "Ibu Mursinah",
    "avatar": "https://images.unsplash.com/...",
    "badge": "Master Canting",
    "rating": 4.9
  },
  "highlights": ["Pewarnaan alami daun indigo", "Bawa pulang kain batik"]
}
```

---

### B. Destinasi Hidden Gems (`/gems`)
| Method | Endpoint | Fungsi di Service | Tipe Kembalian |
| :--- | :--- | :--- | :--- |
| `GET` | `/gems` | `getHiddenGems()` | `HiddenGem[]` |
| `GET` | `/gems/:id` | `getHiddenGemById(id)` | `HiddenGem` |

**Format Response JSON:**
```json
{
  "id": "gem-1",
  "name": "Air Terjun Kapas Biru",
  "category": "Air Terjun",
  "region": "Jawa",
  "location": "Pronojiwo, Lumajang",
  "difficulty": "Sedang",
  "bestTime": "Pukul 07.00 - 10.00 WIB",
  "image": "https://images.unsplash.com/...",
  "rating": 4.9,
  "reviewsCount": 84,
  "mapCoords": { "lat": -8.215, "lng": 112.924 }
}
```

---

### C. Katalog Toko Kerajinan UMKM (`/products`)
| Method | Endpoint | Fungsi di Service | Tipe Kembalian |
| :--- | :--- | :--- | :--- |
| `GET` | `/products` | `getArtisanProducts()` | `ArtisanProduct[]` |
| `GET` | `/products/:id` | `getArtisanProductById(id)` | `ArtisanProduct` |

---

### D. Pemesanan / Booking (`/bookings`)
| Method | Endpoint | Fungsi di Service | Payload |
| :--- | :--- | :--- | :--- |
| `GET` | `/bookings?userId=` | `getBookings(userId)` | Query string |
| `POST` | `/bookings` | `createBooking(payload)` | `{ experienceId, date, timeSlot, guestsCount }` |

---

## 3. Panduan untuk Rekan Anda: Menampilkan Data di UI

Rekan Anda dapat memanfaatkan hook yang sudah disediakan di [`src/hooks/useApi.ts`](file:///c:/Users/user/My%20Project/Mobile/Kelompok4_Mobile/src/hooks/useApi.ts):

### Contoh 1: Menggunakan Hook (Paling Mudah & Rapi)
```tsx
import React from 'react';
import { View, Text, FlatList, ActivityIndicator, Button } from 'react-native';
import { useExperiences } from '@/src/hooks/useApi';
import { ExperienceCard } from '@/src/components/experiences/ExperienceCard';

export default function ExperienceScreen() {
  const { data: experiences, loading, error, refresh } = useExperiences();

  // 1. Tampilkan Indikator Loading
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#FF6B00" />
        <Text style={{ marginTop: 8 }}>Memuat pengalaman budaya...</Text>
      </View>
    );
  }

  // 2. Tampilkan Error Jika Gagal
  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Text style={{ color: 'red', marginBottom: 12 }}>{error}</Text>
        <Button title="Coba Lagi" onPress={refresh} />
      </View>
    );
  }

  // 3. Tampilkan Data Menggunakan FlatList
  return (
    <FlatList
      data={experiences}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <ExperienceCard experience={item} />}
      contentContainerStyle={{ padding: 16 }}
    />
  );
}
```

### Contoh 2: Memanggil Service Langsung
```tsx
import { getExperiences } from '@/src/services/apiService';

useEffect(() => {
  getExperiences()
    .then((result) => setExperiences(result))
    .catch((err) => console.error(err));
}, []);
```
