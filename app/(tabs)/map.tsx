import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Modal,
  TextInput,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, Feather } from '@expo/vector-icons';
import { Colors } from '@/src/constants/Theme';
import { useApp } from '@/src/context/AppContext';
import { Header } from '@/src/components/common/Header';
import { SearchBar } from '@/src/components/common/SearchBar';
import { CategoryPills } from '@/src/components/common/CategoryPills';
import { InteractiveMap } from '@/src/components/map/InteractiveMap';
import { GemCard } from '@/src/components/map/GemCard';
import { HiddenGem, GemCategory, GemDifficulty } from '@/src/types';

export default function MapScreen() {
  const { gems, addHiddenGem, isLoading, refreshApiData } = useApp();
  const scrollRef = useRef<ScrollView | null>(null);

  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [scrollEnabled, setScrollEnabled] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [selectedGemId, setSelectedGemId] = useState<string | null>(gems[0]?.id || null);
  const [showContributeModal, setShowContributeModal] = useState(false);
  const [contributeSuccess, setContributeSuccess] = useState(false);

  // Sinkronisasi selectedGemId saat gems dinamis selesai dimuat dari API
  useEffect(() => {
    if (!selectedGemId && gems && gems.length > 0) {
      setSelectedGemId(gems[0].id);
    }
  }, [gems, selectedGemId]);

  // Form states for contribution
  const [newSpotName, setNewSpotName] = useState('');
  const [newSpotCategory, setNewSpotCategory] = useState<GemCategory>('Air Terjun');
  const [newSpotRegion, setNewSpotRegion] = useState<'Jawa' | 'Bali & Lombok' | 'Nusa Tenggara' | 'Sumatera' | 'Sulawesi'>('Jawa');
  const [newSpotLocation, setNewSpotLocation] = useState('');
  const [newSpotCity, setNewSpotCity] = useState('');
  const [newSpotProvince, setNewSpotProvince] = useState('');
  const [newSpotDifficulty, setNewSpotDifficulty] = useState<GemDifficulty>('Sedang');
  const [newSpotTips, setNewSpotTips] = useState('');

  const categories = [
    'Semua',
    'Air Terjun',
    'Tebing & Sunrise',
    'Kampung Adat',
    'Pantai Sunyi',
    'Hutan & Lembah',
  ];

  const filteredGems = (gems || []).filter((gem) => {
    if (!gem) return false;
    const matchesCategory =
      selectedCategory === 'Semua' || gem.category === selectedCategory;
    const matchesSearch =
      (gem.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (gem.location || '').toLowerCase().includes(search.toLowerCase()) ||
      (gem.city || '').toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Gem aktif yang terpilih: bila ada yang cocok di list filtered, gunakan itu, jika tidak fallback ke item pertama
  const activeGem =
    filteredGems.find((g) => g.id === selectedGemId) ||
    filteredGems[0] ||
    null;

  const handleSelectGemAndScroll = (gem: HiddenGem) => {
    setSelectedGemId(gem.id);
    setViewMode('map');
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  };

  const handleContributeSubmit = () => {
    if (!newSpotName.trim()) {
      return;
    }

    // Default GPS Coordinates berdasarkan region
    let defaultLat = -7.5;
    let defaultLng = 110.5;
    if (newSpotRegion === 'Sumatera') {
      defaultLat = 0.5;
      defaultLng = 101.5;
    } else if (newSpotRegion === 'Bali & Lombok') {
      defaultLat = -8.5;
      defaultLng = 115.5;
    } else if (newSpotRegion === 'Nusa Tenggara') {
      defaultLat = -9.6;
      defaultLng = 120.0;
    } else if (newSpotRegion === 'Sulawesi') {
      defaultLat = -3.2;
      defaultLng = 120.0;
    }

    const createdGem = addHiddenGem({
      name: newSpotName.trim(),
      category: newSpotCategory === 'Semua' ? 'Air Terjun' : newSpotCategory,
      region: newSpotRegion,
      location: newSpotLocation.trim() || 'Lokasi Tersembunyi',
      city: newSpotCity.trim() || 'Nusantara',
      province: newSpotProvince.trim() || 'Indonesia',
      difficulty: newSpotDifficulty,
      bestTime: 'Pagi hari (07:00 - 10:00 WITA)',
      tips: [
        newSpotTips.trim() || 'Gunakan pakaian dan alas kaki yang nyaman.',
        'Selalu bawa kembali sampah Anda ke kota.',
      ],
      etiquette: [
        'Hormati warga desa dan adat istiadat setempat.',
        'Jaga keasrian flora dan fauna sekitar.',
      ],
      mapCoords: {
        lat: defaultLat,
        lng: defaultLng,
        xPercent: 50,
        yPercent: 50,
      },
      image:
        'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=80',
      gallery: [
        'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=80',
      ],
      contributor: {
        name: 'Penjelajah LokalTrip',
        avatar:
          'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
        badge: 'Kontributor Komunitas',
        date: 'Hari ini',
      },
      description: `Destinasi indah nan tersembunyi di ${newSpotLocation.trim() || 'Indonesia'}. Rekomendasi otentik dari penjelajah komunitas LokalTrip.`,
    });

    setContributeSuccess(true);
    setTimeout(() => {
      setContributeSuccess(false);
      setShowContributeModal(false);
      setNewSpotName('');
      setNewSpotLocation('');
      setNewSpotCity('');
      setNewSpotProvince('');
      setNewSpotTips('');
      setSelectedGemId(createdGem.id);
      setViewMode('map');
      scrollRef.current?.scrollTo({ y: 0, animated: true });
    }, 1200);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header />

      <ScrollView
        ref={scrollRef}
        scrollEnabled={scrollEnabled}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refreshApiData}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
          />
        }
        contentContainerStyle={styles.scrollContent}>
        {/* Title & Badge */}
        <View style={styles.titleSection}>
          <View style={styles.badge}>
            <Ionicons name="sparkles" size={12} color={Colors.secondary} />
            <Text style={styles.badgeText}>Fitur 2: Eksplorasi Komunitas</Text>
          </View>
          <View style={styles.titleRow}>
            <Text style={styles.pageTitle}>Hidden Gems Map</Text>

            {/* View Mode Switcher */}
            <View style={styles.toggleContainer}>
              <Pressable
                onPress={() => setViewMode('map')}
                style={[
                  styles.toggleBtn,
                  viewMode === 'map' && styles.toggleBtnActive,
                ]}>
                <Ionicons
                  name="map"
                  size={14}
                  color={viewMode === 'map' ? '#FFF' : Colors.textSecondary}
                />
                <Text
                  style={[
                    styles.toggleText,
                    viewMode === 'map' && styles.toggleTextActive,
                  ]}>
                  Peta
                </Text>
              </Pressable>

              <Pressable
                onPress={() => setViewMode('list')}
                style={[
                  styles.toggleBtn,
                  viewMode === 'list' && styles.toggleBtnActive,
                ]}>
                <Ionicons
                  name="grid"
                  size={14}
                  color={viewMode === 'list' ? '#FFF' : Colors.textSecondary}
                />
                <Text
                  style={[
                    styles.toggleText,
                    viewMode === 'list' && styles.toggleTextActive,
                  ]}>
                  Daftar
                </Text>
              </Pressable>
            </View>
          </View>

          <Text style={styles.pageSubtitle}>
            Temukan lokasi rahasia nusantara dengan review, koordinat GPS akurat, dan rute navigasi Google Maps.
          </Text>
        </View>

        {/* Search */}
        <SearchBar
          value={search}
          onChangeText={setSearch}
          placeholder="Cari air terjun, pulau karang, kampung adat..."
        />

        {/* Category Pills */}
        <CategoryPills
          categories={categories}
          activeCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />

        {/* Map View Mode */}
        {viewMode === 'map' && (
          <InteractiveMap
            gems={filteredGems}
            selectedGem={activeGem}
            onSelectGem={(gem) => setSelectedGemId(gem.id)}
            onTouchStart={() => setScrollEnabled(false)}
            onTouchEnd={() => setScrollEnabled(true)}
          />
        )}

        {/* List View Mode or Bottom Cards */}
        <View style={styles.listSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {viewMode === 'map'
                ? 'Daftar Destinasi Terpilih'
                : 'Semua Hidden Gems'}
            </Text>
            <Text style={styles.sectionCount}>
              {filteredGems.length} Tempat Ditemukan
            </Text>
          </View>

          {filteredGems.length > 0 ? (
            filteredGems.map((gem) => (
              <GemCard
                key={gem.id}
                gem={gem}
                onViewOnMap={() => handleSelectGemAndScroll(gem)}
              />
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="search-outline" size={44} color={Colors.textMuted} />
              <Text style={styles.emptyTitle}>Tidak ada destinasi ditemukan</Text>
              <Text style={styles.emptySubtitle}>
                Coba gunakan kata kunci pencarian lain atau pilih kategori Semua.
              </Text>
            </View>
          )}
        </View>

        {/* Community Contribution Card */}
        <View style={styles.contributeCard}>
          <View style={styles.contributeIconCircle}>
            <Ionicons name="camera" size={28} color="#FFF" />
          </View>
          <View style={styles.contributeTextCol}>
            <Text style={styles.contributeTitle}>
              Punya Rekomendasi Spot Rahasia?
            </Text>
            <Text style={styles.contributeDesc}>
              Bagikan destinasi tersembunyi yang Anda temukan untuk langsung disematkan di peta komunitas penjelajah.
            </Text>
            <Pressable
              onPress={() => setShowContributeModal(true)}
              style={({ pressed }) => [
                styles.contributeBtn,
                pressed && styles.btnPressed,
              ]}>
              <Feather name="plus" size={14} color="#FFF" />
              <Text style={styles.contributeBtnText}>Bagikan Hidden Gem</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>

      {/* Contribution Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showContributeModal}
        onRequestClose={() => setShowContributeModal(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Bagikan Hidden Gem</Text>
              <Pressable
                onPress={() => setShowContributeModal(false)}
                hitSlop={8}>
                <Feather name="x" size={20} color={Colors.textSecondary} />
              </Pressable>
            </View>

            {contributeSuccess ? (
              <View style={styles.modalSuccessBox}>
                <Ionicons
                  name="checkmark-circle"
                  size={54}
                  color={Colors.success}
                />
                <Text style={styles.modalSuccessTitle}>
                  Berhasil Ditambahkan!
                </Text>
                <Text style={styles.modalSuccessDesc}>
                  Destinasi rahasia Anda kini langsung aktif di peta dan dapat dijelajahi oleh komunitas LokalTrip.
                </Text>
              </View>
            ) : (
              <ScrollView showsVerticalScrollIndicator={false} style={styles.modalScroll}>
                <View style={styles.modalForm}>
                  <Text style={styles.inputLabel}>Nama Destinasi Rahasia *</Text>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="Contoh: Danau Toska Lembah Napu"
                    value={newSpotName}
                    onChangeText={setNewSpotName}
                  />

                  <Text style={styles.inputLabel}>Kategori</Text>
                  <View style={styles.chipRow}>
                    {(['Air Terjun', 'Tebing & Sunrise', 'Kampung Adat', 'Pantai Sunyi', 'Hutan & Lembah'] as GemCategory[]).map((cat) => (
                      <Pressable
                        key={cat}
                        onPress={() => setNewSpotCategory(cat)}
                        style={[
                          styles.chip,
                          newSpotCategory === cat && styles.chipActive,
                        ]}>
                        <Text
                          style={[
                            styles.chipText,
                            newSpotCategory === cat && styles.chipTextActive,
                          ]}>
                          {cat}
                        </Text>
                      </Pressable>
                    ))}
                  </View>

                  <Text style={styles.inputLabel}>Wilayah Kepulauan</Text>
                  <View style={styles.chipRow}>
                    {(['Jawa', 'Sumatera', 'Bali & Lombok', 'Nusa Tenggara', 'Sulawesi'] as const).map((reg) => (
                      <Pressable
                        key={reg}
                        onPress={() => setNewSpotRegion(reg)}
                        style={[
                          styles.chip,
                          newSpotRegion === reg && styles.chipActive,
                        ]}>
                        <Text
                          style={[
                            styles.chipText,
                            newSpotRegion === reg && styles.chipTextActive,
                          ]}>
                          {reg}
                        </Text>
                      </Pressable>
                    ))}
                  </View>

                  <Text style={styles.inputLabel}>Lokasi (Kecamatan / Tempat)</Text>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="Contoh: Desa Tanggedu, Kanatang"
                    value={newSpotLocation}
                    onChangeText={setNewSpotLocation}
                  />

                  <View style={styles.modalRowInputs}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.inputLabel}>Kabupaten / Kota</Text>
                      <TextInput
                        style={styles.modalInput}
                        placeholder="Contoh: Sumba Timur"
                        value={newSpotCity}
                        onChangeText={setNewSpotCity}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.inputLabel}>Provinsi</Text>
                      <TextInput
                        style={styles.modalInput}
                        placeholder="Contoh: NTT"
                        value={newSpotProvince}
                        onChangeText={setNewSpotProvince}
                      />
                    </View>
                  </View>

                  <Text style={styles.inputLabel}>Tingkat Kesulitan Trek</Text>
                  <View style={styles.chipRow}>
                    {(['Mudah', 'Sedang', 'Menantang'] as GemDifficulty[]).map((diff) => (
                      <Pressable
                        key={diff}
                        onPress={() => setNewSpotDifficulty(diff)}
                        style={[
                          styles.chip,
                          newSpotDifficulty === diff && styles.chipActive,
                        ]}>
                        <Text
                          style={[
                            styles.chipText,
                            newSpotDifficulty === diff && styles.chipTextActive,
                          ]}>
                          {diff}
                        </Text>
                      </Pressable>
                    ))}
                  </View>

                  <Text style={styles.inputLabel}>Tips & Waktu Terbaik Berkunjung</Text>
                  <TextInput
                    style={[styles.modalInput, styles.modalInputArea]}
                    placeholder="Contoh: Datang saat musim kemarau jam 7 pagi..."
                    multiline
                    numberOfLines={3}
                    value={newSpotTips}
                    onChangeText={setNewSpotTips}
                  />

                  <Pressable
                    onPress={handleContributeSubmit}
                    style={styles.submitContributeBtn}>
                    <Text style={styles.submitContributeText}>
                      Semayamkan di Peta
                    </Text>
                  </Pressable>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  titleSection: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.secondaryLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  badgeText: {
    color: Colors.secondary,
    fontSize: 11,
    fontWeight: '700',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text,
    letterSpacing: -0.5,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 3,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  toggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 9,
  },
  toggleBtnActive: {
    backgroundColor: Colors.primary,
  },
  toggleText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  toggleTextActive: {
    color: '#FFF',
  },
  pageSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 6,
    lineHeight: 18,
  },
  listSection: {
    marginTop: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.text,
  },
  sectionCount: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 36,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
    marginTop: 10,
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  contributeCard: {
    marginHorizontal: 20,
    marginTop: 14,
    backgroundColor: Colors.secondary,
    borderRadius: 18,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  contributeIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contributeTextCol: {
    flex: 1,
  },
  contributeTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFF',
    marginBottom: 4,
  },
  contributeDesc: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.85)',
    lineHeight: 16,
    marginBottom: 10,
  },
  contributeBtn: {
    backgroundColor: Colors.accent,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  btnPressed: {
    opacity: 0.8,
  },
  contributeBtnText: {
    color: Colors.text,
    fontSize: 12,
    fontWeight: '700',
  },

  // Modal
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    padding: 18,
  },
  modalCard: {
    backgroundColor: Colors.surface,
    borderRadius: 22,
    padding: 18,
    maxHeight: '85%',
  },
  modalScroll: {
    maxHeight: 460,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.text,
  },
  modalForm: {
    gap: 10,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.text,
    marginTop: 2,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 13,
    color: Colors.text,
    backgroundColor: Colors.surfaceSubtle,
  },
  modalRowInputs: {
    flexDirection: 'row',
    gap: 10,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  chip: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: Colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipText: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  chipTextActive: {
    color: '#FFF',
    fontWeight: '700',
  },
  modalInputArea: {
    height: 65,
    textAlignVertical: 'top',
  },
  submitContributeBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  submitContributeText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
  modalSuccessBox: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  modalSuccessTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text,
    marginTop: 12,
    marginBottom: 6,
  },
  modalSuccessDesc: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
});
