import React, { useState, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Modal,
  TextInput,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, Feather } from '@expo/vector-icons';
import { Colors } from '@/src/constants/Theme';
import { useApp } from '@/src/context/AppContext';
import { Header } from '@/src/components/common/Header';
import { SearchBar } from '@/src/components/common/SearchBar';
import { CategoryPills } from '@/src/components/common/CategoryPills';
import { InteractiveMap } from '@/src/components/map/InteractiveMap';
import { LokaltripMapView } from '@/components/LokaltripMapView';
import { GemCard } from '@/src/components/map/GemCard';
import { LocationInfoCard } from '@/components/LocationInfoCard';
import { useLokaltripLocation } from '@/hooks/useLokaltripLocation';
import { HiddenGem, GemCategory, GemDifficulty } from '@/src/types';

export type GemSortOption = 'popular' | 'rating' | 'name';
export type MapViewMode = 'map' | 'geofence' | 'list';

const REGION_COORDINATES: Record<string, { lat: number; lng: number }> = {
  Sumatera: { lat: 0.5, lng: 101.5 },
  'Bali & Lombok': { lat: -8.5, lng: 115.5 },
  'Nusa Tenggara': { lat: -9.6, lng: 120.0 },
  Sulawesi: { lat: -3.2, lng: 120.0 },
  Jawa: { lat: -7.5, lng: 110.5 },
};

function getDefaultRegionCoordinates(region: string): { lat: number; lng: number } {
  return REGION_COORDINATES[region] ?? { lat: -7.5, lng: 110.5 };
}

function matchesGemQuery(gem: HiddenGem, query: string): boolean {
  if (!query) return true;
  const q = query.toLowerCase();
  const searchFields = [gem.name, gem.location, gem.city, gem.province, gem.category];
  return searchFields.some((field) => (field || '').toLowerCase().includes(q));
}

function filterGems(
  gems: HiddenGem[],
  category: string,
  region: string,
  difficulty: string,
  search: string
): HiddenGem[] {
  const q = search.trim();
  return gems.filter((gem) => {
    if (category !== 'Semua' && gem.category !== category) return false;
    if (region !== 'Semua' && gem.region !== region) return false;
    if (difficulty !== 'Semua' && gem.difficulty !== difficulty) return false;
    return matchesGemQuery(gem, q);
  });
}

function sortGems(gems: HiddenGem[], sortBy: GemSortOption): HiddenGem[] {
  const list = [...gems];
  if (sortBy === 'rating') {
    return list.sort((a, b) => b.rating - a.rating);
  }
  if (sortBy === 'name') {
    return list.sort((a, b) => a.name.localeCompare(b.name));
  }
  return list.sort((a, b) => (b.reviewsCount + b.likesCount) - (a.reviewsCount + a.likesCount));
}

export default function MapScreen() {
  const { gems, addHiddenGem, isLoading, isOnline, refreshApiData } = useApp();
  const { location: gpsCoords } = useLokaltripLocation();
  const scrollRef = useRef<React.ComponentRef<typeof ScrollView> | null>(null);

  const [viewMode, setViewMode] = useState<MapViewMode>('map');
  const [scrollEnabled, setScrollEnabled] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [selectedRegion, setSelectedRegion] = useState<string>('Semua');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('Semua');
  const [sortBy, setSortBy] = useState<GemSortOption>('popular');
  const [selectedGemId, setSelectedGemId] = useState<string | null>(gems[0]?.id || null);

  // Filter Modal state
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [tempCategory, setTempCategory] = useState('Semua');
  const [tempRegion, setTempRegion] = useState('Semua');
  const [tempDifficulty, setTempDifficulty] = useState('Semua');
  const [tempSort, setTempSort] = useState<GemSortOption>('popular');

  // Form states for contribution
  const [showContributeModal, setShowContributeModal] = useState(false);
  const [contributeSuccess, setContributeSuccess] = useState(false);
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

  const regions = [
    'Semua',
    'Jawa',
    'Bali & Lombok',
    'Sumatera',
    'Nusa Tenggara',
    'Sulawesi',
  ];

  const difficulties: { label: string; value: string; hint: string; color: string }[] = [
    { label: 'Semua Tingkat', value: 'Semua', hint: 'Semua jalur akses', color: Colors.textSecondary },
    { label: 'Mudah', value: 'Mudah', hint: 'Jalur santai & ramah pemula', color: '#10B981' },
    { label: 'Sedang', value: 'Sedang', hint: 'Trekking ringan 30-60 menit', color: '#F59E0B' },
    { label: 'Menantang', value: 'Menantang', hint: 'Jalur curam / stamina prima', color: Colors.primary },
  ];

  const sortOptions: { label: string; value: GemSortOption; icon: string }[] = [
    { label: 'Paling Populer', value: 'popular', icon: 'flame' },
    { label: 'Rating Tertinggi', value: 'rating', icon: 'star' },
    { label: 'Nama (A - Z)', value: 'name', icon: 'text' },
  ];

  const filteredGems = useMemo(() => {
    const list = filterGems(gems, selectedCategory, selectedRegion, selectedDifficulty, search);
    return sortGems(list, sortBy);
  }, [gems, selectedCategory, selectedRegion, selectedDifficulty, search, sortBy]);

  // Hitung jumlah spot yang cocok untuk live preview di dalam modal
  const tempFilteredCount = useMemo(() => {
    return filterGems(gems, tempCategory, tempRegion, tempDifficulty, search).length;
  }, [gems, tempCategory, tempRegion, tempDifficulty, search]);

  const activeFiltersCount = useMemo(() => {
    return [
      selectedRegion !== 'Semua',
      selectedDifficulty !== 'Semua',
      sortBy !== 'popular',
      selectedCategory !== 'Semua',
    ].filter(Boolean).length;
  }, [selectedRegion, selectedDifficulty, sortBy, selectedCategory]);

  const handleOpenFilterModal = () => {
    setTempCategory(selectedCategory);
    setTempRegion(selectedRegion);
    setTempDifficulty(selectedDifficulty);
    setTempSort(sortBy);
    setShowFilterModal(true);
  };

  const handleApplyFilterModal = () => {
    setSelectedCategory(tempCategory);
    setSelectedRegion(tempRegion);
    setSelectedDifficulty(tempDifficulty);
    setSortBy(tempSort);
    setShowFilterModal(false);
  };

  const handleResetAllFilters = () => {
    setSelectedCategory('Semua');
    setSelectedRegion('Semua');
    setSelectedDifficulty('Semua');
    setSortBy('popular');
    setSearch('');
  };

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
    if (!isOnline) {
      Alert.alert(
        'Perangkat Offline',
        'Koneksi internet diperlukan untuk memproses kontribusi Hidden Gem baru. Silakan hubungkan kembali internet Anda.'
      );
      return;
    }

    if (!newSpotName.trim()) {
      return;
    }

    // Default GPS Coordinates berdasarkan region
    const defaultCoords = getDefaultRegionCoordinates(newSpotRegion);

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
        lat: defaultCoords.lat,
        lng: defaultCoords.lng,
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

  const getSectionTitle = () => {
    if (viewMode === 'geofence') {
      return 'Area Geofence Wisata (Radius 500m)';
    }
    if (viewMode === 'map') {
      return 'Daftar Destinasi Terpilih';
    }
    return 'Semua Hidden Gems';
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
          <View style={styles.headerTopRow}>
            <View style={styles.badge}>
              <Ionicons name="sparkles" size={12} color={Colors.secondary} />
              <Text style={styles.badgeText}>Eksplorasi Komunitas</Text>
            </View>
            <View style={styles.spotCountPill}>
              <Ionicons name="compass-outline" size={13} color={Colors.primary} />
              <Text style={styles.spotCountPillText}>
                {gems.length} Spot Terdaftar
              </Text>
            </View>
          </View>

          <Text style={styles.pageTitle}>Hidden Gems Map</Text>
          <Text style={styles.pageSubtitle}>
            Temukan lokasi rahasia nusantara dengan review, koordinat GPS akurat, dan rute navigasi Google Maps.
          </Text>

          {/* Dedicated Full-Width Responsive Segmented Control */}
          <View style={styles.segmentedControl}>
            <Pressable
              onPress={() => setViewMode('map')}
              style={[
                styles.segmentBtn,
                viewMode === 'map' && styles.segmentBtnActive,
              ]}>
              <Ionicons
                name="map"
                size={14}
                color={viewMode === 'map' ? Colors.primary : Colors.textSecondary}
              />
              <Text
                style={[
                  styles.segmentText,
                  viewMode === 'map' && styles.segmentTextActive,
                ]}>
                Peta
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setViewMode('geofence')}
              style={[
                styles.segmentBtn,
                viewMode === 'geofence' && styles.segmentBtnActive,
              ]}>
              <Ionicons
                name="navigate"
                size={14}
                color={viewMode === 'geofence' ? Colors.primary : Colors.textSecondary}
              />
              <Text
                style={[
                  styles.segmentText,
                  viewMode === 'geofence' && styles.segmentTextActive,
                ]}>
                Geofence
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setViewMode('list')}
              style={[
                styles.segmentBtn,
                viewMode === 'list' && styles.segmentBtnActive,
              ]}>
              <Ionicons
                name="grid"
                size={14}
                color={viewMode === 'list' ? Colors.primary : Colors.textSecondary}
              />
              <Text
                style={[
                  styles.segmentText,
                  viewMode === 'list' && styles.segmentTextActive,
                ]}>
                Daftar
              </Text>
            </Pressable>
          </View>
        </View>

        {/* GPS Geocoding Info Card (Branch: feat/gps-geocoding) */}
        <LocationInfoCard />

        {/* Search Bar with Filter Button and Active Badge */}
        <SearchBar
          value={search}
          onChangeText={setSearch}
          placeholder="Cari air terjun, pulau karang, kampung adat..."
          onFilterPress={handleOpenFilterModal}
          filterBadgeCount={activeFiltersCount}
        />

        {/* Category Horizontal Pills */}
        <CategoryPills
          categories={categories}
          activeCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />

        {/* Active Filter Chips Strip */}
        {activeFiltersCount > 0 && (
          <View style={styles.activeFiltersBar}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.activeFiltersScroll}>
              <View style={styles.filterCountIndicator}>
                <Ionicons name="funnel" size={11} color={Colors.primary} />
                <Text style={styles.filterCountIndicatorText}>
                  {filteredGems.length} Spot Cocok
                </Text>
              </View>

              {selectedRegion !== 'Semua' && (
                <Pressable
                  onPress={() => setSelectedRegion('Semua')}
                  style={styles.activeFilterChip}>
                  <Text style={styles.activeFilterChipText}>📍 {selectedRegion}</Text>
                  <Feather name="x" size={12} color={Colors.primary} />
                </Pressable>
              )}

              {selectedDifficulty !== 'Semua' && (
                <Pressable
                  onPress={() => setSelectedDifficulty('Semua')}
                  style={styles.activeFilterChip}>
                  <Text style={styles.activeFilterChipText}>🥾 {selectedDifficulty}</Text>
                  <Feather name="x" size={12} color={Colors.primary} />
                </Pressable>
              )}

              {sortBy !== 'popular' && (
                <Pressable
                  onPress={() => setSortBy('popular')}
                  style={styles.activeFilterChip}>
                  <Text style={styles.activeFilterChipText}>
                    {sortBy === 'rating' ? '⭐ Rating Tertinggi' : '🔤 Nama A-Z'}
                  </Text>
                  <Feather name="x" size={12} color={Colors.primary} />
                </Pressable>
              )}

              {selectedCategory !== 'Semua' && (
                <Pressable
                  onPress={() => setSelectedCategory('Semua')}
                  style={styles.activeFilterChip}>
                  <Text style={styles.activeFilterChipText}>🏷️ {selectedCategory}</Text>
                  <Feather name="x" size={12} color={Colors.primary} />
                </Pressable>
              )}

              <Pressable
                onPress={handleResetAllFilters}
                style={styles.clearAllBtn}>
                <Text style={styles.clearAllBtnText}>Reset Semua</Text>
              </Pressable>
            </ScrollView>
          </View>
        )}

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

        {/* Geofence Map View Mode (Task 02 & Task 03B) */}
        {viewMode === 'geofence' && (
          <View style={styles.geofenceContainer}>
            <LokaltripMapView
              userLatitude={gpsCoords?.latitude ?? null}
              userLongitude={gpsCoords?.longitude ?? null}
              onEnterGeofence={(zone) => {
                console.log('[Geofence] Pengguna MASUK ke area wisata:', zone.name);
              }}
              onExitGeofence={(zone) => {
                console.log('[Geofence] Pengguna KELUAR dari area wisata:', zone.name);
              }}
            />
          </View>
        )}

        {/* List View Mode or Bottom Cards */}
        <View style={styles.listSection}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleWrapper}>
              <Text style={styles.sectionTitle} numberOfLines={1}>
                {getSectionTitle()}
              </Text>
              <Text style={styles.sectionCount}>
                Menampilkan {filteredGems.length} dari {gems.length} destinasi
              </Text>
            </View>

            <Pressable
              onPress={handleOpenFilterModal}
              style={[
                styles.filterQuickTrigger,
                activeFiltersCount > 0 && styles.filterQuickTriggerActive,
              ]}>
              <Ionicons
                name="options-outline"
                size={14}
                color={activeFiltersCount > 0 ? '#FFF' : Colors.textSecondary}
              />
              <Text
                style={[
                  styles.filterQuickTriggerText,
                  activeFiltersCount > 0 && styles.filterQuickTriggerTextActive,
                ]}>
                Filter {activeFiltersCount > 0 ? `(${activeFiltersCount})` : ''}
              </Text>
            </Pressable>
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
              <View style={styles.emptyIconCircle}>
                <Ionicons name="search-outline" size={30} color={Colors.primary} />
              </View>
              <Text style={styles.emptyTitle}>Tidak ada destinasi ditemukan</Text>
              <Text style={styles.emptySubtitle}>
                Tidak ditemukan spot dengan kriteria filter saat ini. Coba sesuaikan wilayah atau atur ulang filter.
              </Text>
              <Pressable
                onPress={handleResetAllFilters}
                style={styles.emptyResetBtn}>
                <Ionicons name="refresh" size={13} color="#FFF" />
                <Text style={styles.emptyResetBtnText}>Reset Semua Filter</Text>
              </Pressable>
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
                    style={[
                      styles.submitContributeBtn,
                      !isOnline && styles.submitContributeBtnDisabled,
                    ]}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Ionicons
                        name={isOnline ? 'earth' : 'cloud-offline-outline'}
                        size={16}
                        color="#FFF"
                      />
                      <Text style={styles.submitContributeText}>
                        {isOnline ? 'Semayamkan di Peta' : 'Offline - Butuh Koneksi Internet'}
                      </Text>
                    </View>
                  </Pressable>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* Dedicated Filter Bottom Sheet / Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showFilterModal}
        onRequestClose={() => setShowFilterModal(false)}>
        <View style={styles.filterModalOverlay}>
          <Pressable
            style={styles.filterModalBackdropDismiss}
            onPress={() => setShowFilterModal(false)}
          />
          <View style={styles.filterModalSheet}>
            {/* Modal Drag Handle */}
            <View style={styles.filterModalHandle} />

            {/* Modal Header */}
            <View style={styles.filterModalHeader}>
              <View>
                <Text style={styles.filterModalTitle}>Filter Hidden Gems</Text>
                <Text style={styles.filterModalSubtitle}>
                  Sesuaikan preferensi penjelajahan destinasi
                </Text>
              </View>
              <Pressable
                onPress={() => setShowFilterModal(false)}
                hitSlop={8}
                style={styles.filterModalCloseBtn}>
                <Feather name="x" size={18} color={Colors.textSecondary} />
              </Pressable>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.filterModalScrollContent}>
              {/* Section 1: Wilayah / Pulau */}
              <View style={styles.filterSection}>
                <View style={styles.filterSectionHeader}>
                  <Ionicons name="earth" size={16} color={Colors.primary} />
                  <Text style={styles.filterSectionTitle}>Wilayah / Pulau</Text>
                </View>
                <View style={styles.filterPillsRow}>
                  {regions.map((reg) => {
                    const isSel = tempRegion === reg;
                    return (
                      <Pressable
                        key={reg}
                        onPress={() => setTempRegion(reg)}
                        style={[
                          styles.filterOptionPill,
                          isSel && styles.filterOptionPillActive,
                        ]}>
                        <Text
                          style={[
                            styles.filterOptionText,
                            isSel && styles.filterOptionTextActive,
                          ]}>
                          {reg}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              {/* Section 2: Tingkat Akses / Trekking */}
              <View style={styles.filterSection}>
                <View style={styles.filterSectionHeader}>
                  <Ionicons name="trail-sign" size={16} color={Colors.primary} />
                  <Text style={styles.filterSectionTitle}>Tingkat Akses & Jalur</Text>
                </View>
                <View style={styles.difficultyGrid}>
                  {difficulties.map((diff) => {
                    const isSel = tempDifficulty === diff.value;
                    return (
                      <Pressable
                        key={diff.value}
                        onPress={() => setTempDifficulty(diff.value)}
                        style={[
                          styles.difficultyCard,
                          isSel && styles.difficultyCardActive,
                        ]}>
                        <View style={styles.difficultyCardTop}>
                          <View
                            style={[
                              styles.diffDot,
                              { backgroundColor: diff.color },
                            ]}
                          />
                          <Text
                            style={[
                              styles.difficultyCardTitle,
                              isSel && styles.difficultyCardTitleActive,
                            ]}>
                            {diff.label}
                          </Text>
                        </View>
                        <Text
                          style={[
                            styles.difficultyCardHint,
                            isSel && styles.difficultyCardHintActive,
                          ]}>
                          {diff.hint}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              {/* Section 3: Kategori Destinasi */}
              <View style={styles.filterSection}>
                <View style={styles.filterSectionHeader}>
                  <Ionicons name="grid" size={16} color={Colors.primary} />
                  <Text style={styles.filterSectionTitle}>Kategori Wisata</Text>
                </View>
                <View style={styles.filterPillsRow}>
                  {categories.map((cat) => {
                    const isSel = tempCategory === cat;
                    return (
                      <Pressable
                        key={cat}
                        onPress={() => setTempCategory(cat)}
                        style={[
                          styles.filterOptionPill,
                          isSel && styles.filterOptionPillActive,
                        ]}>
                        <Text
                          style={[
                            styles.filterOptionText,
                            isSel && styles.filterOptionTextActive,
                          ]}>
                          {cat}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              {/* Section 4: Urutkan Hasil */}
              <View style={styles.filterSection}>
                <View style={styles.filterSectionHeader}>
                  <Ionicons name="swap-vertical" size={16} color={Colors.primary} />
                  <Text style={styles.filterSectionTitle}>Urutkan Berdasarkan</Text>
                </View>
                <View style={styles.filterPillsRow}>
                  {sortOptions.map((s) => {
                    const isSel = tempSort === s.value;
                    return (
                      <Pressable
                        key={s.value}
                        onPress={() => setTempSort(s.value)}
                        style={[
                          styles.filterOptionPill,
                          isSel && styles.filterOptionPillActive,
                        ]}>
                        <Ionicons
                          name={s.icon as any}
                          size={13}
                          color={isSel ? '#FFF' : Colors.textSecondary}
                        />
                        <Text
                          style={[
                            styles.filterOptionText,
                            isSel && styles.filterOptionTextActive,
                          ]}>
                          {s.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            </ScrollView>

            {/* Modal Bottom Action Bar */}
            <View style={styles.filterModalFooter}>
              <Pressable
                onPress={() => {
                  setTempCategory('Semua');
                  setTempRegion('Semua');
                  setTempDifficulty('Semua');
                  setTempSort('popular');
                }}
                style={styles.filterResetBtn}>
                <Text style={styles.filterResetBtnText}>Reset</Text>
              </Pressable>

              <Pressable
                onPress={handleApplyFilterModal}
                style={styles.filterApplyBtn}>
                <Text style={styles.filterApplyBtnText}>
                  Terapkan Filter ({tempFilteredCount} Spot)
                </Text>
              </Pressable>
            </View>
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
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.secondaryLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    color: Colors.secondary,
    fontSize: 11,
    fontWeight: '700',
  },
  spotCountPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  spotCountPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1D4ED8',
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text,
    letterSpacing: -0.5,
  },
  pageSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 4,
    lineHeight: 18,
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 3,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  segmentBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 8,
    borderRadius: 9,
  },
  segmentBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  segmentText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  segmentTextActive: {
    color: Colors.primary,
    fontWeight: '700',
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
  sectionTitleWrapper: {
    flex: 1,
    marginRight: 10,
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
    marginBottom: 24,
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
  submitContributeBtnDisabled: {
    backgroundColor: '#9CA3AF',
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

  // Active Filter Strip
  activeFiltersBar: {
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  activeFiltersScroll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  filterCountIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 14,
    backgroundColor: Colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterCountIndicatorText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.text,
  },
  activeFilterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  activeFilterChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
  },
  clearAllBtn: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 14,
    backgroundColor: Colors.surfaceSubtle,
  },
  clearAllBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
  },

  // Section Header Quick Trigger
  filterQuickTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    backgroundColor: Colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterQuickTriggerActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterQuickTriggerText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  filterQuickTriggerTextActive: {
    color: '#FFF',
  },

  // Empty State
  emptyIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  emptyResetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 14,
    backgroundColor: Colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  emptyResetBtnText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },

  // Filter Sheet Modal
  filterModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end',
  },
  filterModalBackdropDismiss: {
    flex: 1,
  },
  filterModalSheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    paddingTop: 10,
    paddingBottom: 24,
    paddingHorizontal: 20,
    maxHeight: '82%',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  filterModalHandle: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    alignSelf: 'center',
    marginBottom: 12,
  },
  filterModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  filterModalTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.text,
  },
  filterModalSubtitle: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  filterModalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterModalScrollContent: {
    paddingBottom: 16,
    gap: 18,
  },
  filterSection: {
    gap: 8,
  },
  filterSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  filterSectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.text,
  },
  filterPillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
  },
  filterOptionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: Colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterOptionPillActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterOptionText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  filterOptionTextActive: {
    color: '#FFF',
    fontWeight: '700',
  },
  difficultyGrid: {
    gap: 6,
  },
  difficultyCard: {
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 12,
    backgroundColor: Colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  difficultyCardActive: {
    backgroundColor: '#FEF2F2',
    borderColor: Colors.primary,
  },
  difficultyCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  diffDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  difficultyCardTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.text,
  },
  difficultyCardTitleActive: {
    color: Colors.primary,
  },
  difficultyCardHint: {
    fontSize: 10,
    color: Colors.textSecondary,
    marginLeft: 16,
  },
  difficultyCardHintActive: {
    color: Colors.text,
  },
  filterModalFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  filterResetBtn: {
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 12,
    backgroundColor: Colors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterResetBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  filterApplyBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
  },
  filterApplyBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFF',
  },
  geofenceContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
});
