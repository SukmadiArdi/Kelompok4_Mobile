import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Modal,
  TextInput,
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
import { GemCard } from '@/src/components/map/GemCard';
import { HiddenGem } from '@/src/types';

export default function MapScreen() {
  const { gems } = useApp();
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [selectedGem, setSelectedGem] = useState<HiddenGem | null>(gems[0]);
  const [showContributeModal, setShowContributeModal] = useState(false);
  const [contributeSuccess, setContributeSuccess] = useState(false);

  // Form states for contribution
  const [newSpotName, setNewSpotName] = useState('');
  const [newSpotLocation, setNewSpotLocation] = useState('');
  const [newSpotTips, setNewSpotTips] = useState('');

  const categories = [
    'Semua',
    'Air Terjun',
    'Tebing & Sunrise',
    'Kampung Adat',
    'Pantai Sunyi',
    'Hutan & Lembah',
  ];

  const filteredGems = gems.filter((gem) => {
    const matchesCategory =
      selectedCategory === 'Semua' || gem.category === selectedCategory;
    const matchesSearch =
      gem.name.toLowerCase().includes(search.toLowerCase()) ||
      gem.location.toLowerCase().includes(search.toLowerCase()) ||
      gem.city.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleContributeSubmit = () => {
    if (!newSpotName.trim()) {
      return;
    }
    setContributeSuccess(true);
    setTimeout(() => {
      setContributeSuccess(false);
      setShowContributeModal(false);
      setNewSpotName('');
      setNewSpotLocation('');
      setNewSpotTips('');
    }, 1800);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header />

      <ScrollView
        showsVerticalScrollIndicator={false}
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
            Temukan lokasi rahasia nusantara dengan review, tingkat kesulitan jalan, dan foto asli penjelajah.
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
            selectedGem={selectedGem}
            onSelectGem={(gem) => setSelectedGem(gem)}
          />
        )}

        {/* List View Mode or Bottom Cards */}
        <View style={styles.listSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {viewMode === 'map' ? 'Daftar Destinasi Terpilih' : 'Semua Hidden Gems'}
            </Text>
            <Text style={styles.sectionCount}>
              {filteredGems.length} Tempat Ditemukan
            </Text>
          </View>

          {filteredGems.map((gem) => (
            <GemCard key={gem.id} gem={gem} />
          ))}
        </View>

        {/* Community Contribution Floating Card */}
        <View style={styles.contributeCard}>
          <View style={styles.contributeIconCircle}>
            <Ionicons name="camera" size={28} color="#FFF" />
          </View>
          <View style={styles.contributeTextCol}>
            <Text style={styles.contributeTitle}>Punya Rekomendasi Spot Rahasia?</Text>
            <Text style={styles.contributeDesc}>
              Bagikan destinasi tersembunyi yang Anda temukan untuk menginspirasi sesama penjelajah.
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
                <Ionicons name="checkmark-circle" size={54} color={Colors.success} />
                <Text style={styles.modalSuccessTitle}>Terima Kasih Penjelajah!</Text>
                <Text style={styles.modalSuccessDesc}>
                  Rekomendasi Anda sedang diverifikasi kurator LokalTrip sebelum ditampilkan di peta publik.
                </Text>
              </View>
            ) : (
              <View style={styles.modalForm}>
                <Text style={styles.inputLabel}>Nama Destinasi Rahasia</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="Contoh: Danau Toska Lembah Napu"
                  value={newSpotName}
                  onChangeText={setNewSpotName}
                />

                <Text style={styles.inputLabel}>Lokasi (Kabupaten / Provinsi)</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="Contoh: Poso, Sulawesi Tengah"
                  value={newSpotLocation}
                  onChangeText={setNewSpotLocation}
                />

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
                  <Text style={styles.submitContributeText}>Kirim Rekomendasi</Text>
                </Pressable>
              </View>
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
  contributeCard: {
    marginHorizontal: 20,
    marginTop: 10,
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
    padding: 20,
  },
  modalCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.text,
  },
  modalForm: {
    gap: 12,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.text,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: Colors.text,
    backgroundColor: Colors.surfaceSubtle,
  },
  modalInputArea: {
    height: 70,
    textAlignVertical: 'top',
  },
  submitContributeBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 13,
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
    paddingVertical: 20,
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
