import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Pressable,
  Modal,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '@/src/constants/Theme';
import { useApp } from '@/src/context/AppContext';
import { Header } from '@/src/components/common/Header';

export default function CartScreen() {
  const {
    cart,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    cartSubtotal,
    cartCount,
  } = useApp();

  const [appliedPromo, setAppliedPromo] = useState(true);
  const [selectedCourier, setSelectedCourier] = useState('Kurir Desa Pengrajin');
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const shippingFee = cart.length > 0 ? 25000 : 0;
  const promoDiscount = appliedPromo && cart.length > 0 ? 20000 : 0;
  const grandTotal = Math.max(0, cartSubtotal + shippingFee - promoDiscount);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleCheckout = () => {
    setShowSuccessModal(true);
  };

  const handleFinishOrder = () => {
    clearCart();
    setShowSuccessModal(false);
    router.replace('/(tabs)/store');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="Keranjang Belanja" showBack={true} showCart={false} />

      {cart.length > 0 ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}>
          {/* Free Shipping / Direct Support Alert */}
          <View style={styles.supportBanner}>
            <MaterialCommunityIcons name="hand-heart" size={20} color={Colors.primary} />
            <Text style={styles.supportBannerText}>
              Pembelian Anda 100% mendukung keberlangsungan hidup pengrajin lokal nusantara.
            </Text>
          </View>

          {/* Cart Items List */}
          <View style={styles.itemsSection}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Produk ({cartCount})</Text>
              <Pressable onPress={clearCart} hitSlop={8}>
                <Text style={styles.clearAllText}>Hapus Semua</Text>
              </Pressable>
            </View>

            {cart.map((item) => (
              <View key={item.product.id} style={styles.cartCard}>
                <Image source={{ uri: item.product.image }} style={styles.productImage} />
                
                <View style={styles.cardInfo}>
                  <View style={styles.titleRow}>
                    <Text style={styles.productName} numberOfLines={2}>
                      {item.product.name}
                    </Text>
                    <Pressable
                      onPress={() => removeFromCart(item.product.id)}
                      hitSlop={8}
                      style={styles.trashBtn}>
                      <Feather name="trash-2" size={16} color={Colors.textMuted} />
                    </Pressable>
                  </View>

                  <Text style={styles.artisanName}>
                    oleh {item.product.artisan.name} ({item.product.artisan.village})
                  </Text>

                  <View style={styles.priceAndStepper}>
                    <Text style={styles.unitPrice}>
                      {formatPrice(item.product.price)}
                    </Text>

                    <View style={styles.stepper}>
                      <Pressable
                        onPress={() =>
                          updateCartQuantity(item.product.id, item.quantity - 1)
                        }
                        style={styles.stepBtn}>
                        <Feather name="minus" size={14} color={Colors.text} />
                      </Pressable>
                      <Text style={styles.stepCount}>{item.quantity}</Text>
                      <Pressable
                        onPress={() =>
                          updateCartQuantity(item.product.id, item.quantity + 1)
                        }
                        style={styles.stepBtn}>
                        <Feather name="plus" size={14} color={Colors.text} />
                      </Pressable>
                    </View>
                  </View>
                </View>
              </View>
            ))}
          </View>

          {/* Shipping Courier Selector */}
          <View style={styles.sectionBox}>
            <Text style={styles.boxTitle}>Pilihan Pengiriman Etnik</Text>
            
            <Pressable
              onPress={() => setSelectedCourier('Kurir Desa Pengrajin')}
              style={[
                styles.courierRow,
                selectedCourier === 'Kurir Desa Pengrajin' && styles.courierRowSelected,
              ]}>
              <View style={styles.radioCircle}>
                {selectedCourier === 'Kurir Desa Pengrajin' && (
                  <View style={styles.radioDot} />
                )}
              </View>
              <View style={styles.courierDetails}>
                <Text style={styles.courierName}>Kurir Desa Budaya (Packing Kayu Tradisi)</Text>
                <Text style={styles.courierEstimate}>Estimasi tiba 3-4 hari kerja</Text>
              </View>
              <Text style={styles.courierPrice}>Rp 25.000</Text>
            </Pressable>

            <Pressable
              onPress={() => setSelectedCourier('JNE Kilat Nusantara')}
              style={[
                styles.courierRow,
                selectedCourier === 'JNE Kilat Nusantara' && styles.courierRowSelected,
              ]}>
              <View style={styles.radioCircle}>
                {selectedCourier === 'JNE Kilat Nusantara' && (
                  <View style={styles.radioDot} />
                )}
              </View>
              <View style={styles.courierDetails}>
                <Text style={styles.courierName}>JNE Kilat Nusantara (Asuransi Penuh)</Text>
                <Text style={styles.courierEstimate}>Estimasi tiba 1-2 hari kerja</Text>
              </View>
              <Text style={styles.courierPrice}>Rp 35.000</Text>
            </Pressable>
          </View>

          {/* Promo Code Card */}
          <View style={styles.promoCard}>
            <Ionicons name="pricetag" size={18} color={Colors.accent} />
            <View style={styles.promoInfo}>
              <Text style={styles.promoCode}>Voucher Budaya: LOKALNUSANTARA</Text>
              <Text style={styles.promoDesc}>Hemat Rp 20.000 untuk apresiasi pengrajin</Text>
            </View>
            <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
          </View>

          {/* Price Breakdown */}
          <View style={styles.summaryBox}>
            <Text style={styles.summaryBoxTitle}>Rincian Biaya</Text>
            
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Harga Barang</Text>
              <Text style={styles.summaryVal}>{formatPrice(cartSubtotal)}</Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Ongkos Kirim ({selectedCourier})</Text>
              <Text style={styles.summaryVal}>{formatPrice(shippingFee)}</Text>
            </View>

            {promoDiscount > 0 && (
              <View style={styles.summaryRow}>
                <Text style={styles.promoLabel}>Potongan Promo Budaya</Text>
                <Text style={styles.promoVal}>-{formatPrice(promoDiscount)}</Text>
              </View>
            )}

            <View style={[styles.summaryRow, styles.grandTotalRow]}>
              <Text style={styles.grandTotalLabel}>Total Pembayaran</Text>
              <Text style={styles.grandTotalVal}>{formatPrice(grandTotal)}</Text>
            </View>
          </View>
        </ScrollView>
      ) : (
        /* Empty Cart State */
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconCircle}>
            <Feather name="shopping-bag" size={48} color={Colors.textMuted} />
          </View>
          <Text style={styles.emptyTitle}>Keranjang Belanja Masih Kosong</Text>
          <Text style={styles.emptyDesc}>
            Temukan kain tenun ikat asli, teko gerabah kasongan, atau patung kayu
            karya pengrajin lokal nusantara.
          </Text>
          <Pressable
            onPress={() => router.push('/(tabs)/store')}
            style={styles.exploreStoreBtn}>
            <Text style={styles.exploreStoreBtnText}>Jelajahi Artisan Store</Text>
            <Feather name="arrow-right" size={16} color="#FFF" />
          </Pressable>
        </View>
      )}

      {/* Sticky Bottom Checkout Bar */}
      {cart.length > 0 && (
        <View style={styles.bottomBar}>
          <View>
            <Text style={styles.bottomTotalLabel}>Total Bayar</Text>
            <Text style={styles.bottomTotalVal}>{formatPrice(grandTotal)}</Text>
          </View>

          <Pressable
            onPress={handleCheckout}
            style={({ pressed }) => [
              styles.checkoutBtn,
              pressed && styles.btnPressed,
            ]}>
            <Text style={styles.checkoutBtnText}>Checkout Sekarang</Text>
            <Feather name="arrow-right" size={16} color="#FFF" />
          </Pressable>
        </View>
      )}

      {/* Checkout Success Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showSuccessModal}
        onRequestClose={() => setShowSuccessModal(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.successIconCircle}>
              <Ionicons name="checkmark-circle" size={56} color={Colors.success} />
            </View>
            <Text style={styles.successModalTitle}>Pesanan Berhasil Dibuat!</Text>
            <Text style={styles.successModalDesc}>
              Karya seni Anda sedang dikemas dengan penuh kehati-hatian oleh para
              pengrajin lokal. Resi pengiriman akan dikirim via notifikasi.
            </Text>

            <View style={styles.receiptBox}>
              <View style={styles.receiptRow}>
                <Text style={styles.receiptLbl}>Kurir Pengiriman</Text>
                <Text style={styles.receiptVal}>{selectedCourier}</Text>
              </View>
              <View style={styles.receiptRow}>
                <Text style={styles.receiptLbl}>Metode Pembayaran</Text>
                <Text style={styles.receiptVal}>QRIS / Transfer Bank</Text>
              </View>
              <View style={[styles.receiptRow, styles.receiptTotalRow]}>
                <Text style={styles.receiptTotalLbl}>Total Dibayar</Text>
                <Text style={styles.receiptTotalVal}>{formatPrice(grandTotal)}</Text>
              </View>
            </View>

            <Pressable onPress={handleFinishOrder} style={styles.finishBtn}>
              <Text style={styles.finishBtnText}>Selesai & Kembali Belanja</Text>
            </Pressable>
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
    paddingBottom: 110,
  },
  supportBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.primaryLight,
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FED7D0',
  },
  supportBannerText: {
    fontSize: 12,
    color: Colors.primaryDark,
    flex: 1,
    lineHeight: 16,
    fontWeight: '500',
  },
  itemsSection: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.text,
  },
  clearAllText: {
    fontSize: 12,
    color: Colors.danger,
    fontWeight: '600',
  },
  cartCard: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 12,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    resizeMode: 'cover',
  },
  cardInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  productName: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.text,
    flex: 1,
    lineHeight: 18,
  },
  trashBtn: {
    padding: 4,
  },
  artisanName: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginVertical: 4,
  },
  priceAndStepper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  unitPrice: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.primary,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceSubtle,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 4,
  },
  stepBtn: {
    padding: 4,
  },
  stepCount: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.text,
    minWidth: 20,
    textAlign: 'center',
  },
  sectionBox: {
    marginHorizontal: 20,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 16,
  },
  boxTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 12,
  },
  courierRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.border,
    marginBottom: 10,
    gap: 10,
  },
  courierRowSelected: {
    borderColor: Colors.primary,
    backgroundColor: '#FFF8F6',
  },
  radioCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioDot: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: Colors.primary,
  },
  courierDetails: {
    flex: 1,
  },
  courierName: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.text,
  },
  courierEstimate: {
    fontSize: 10,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  courierPrice: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.text,
  },
  promoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.accentLight,
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 12,
    borderRadius: 12,
  },
  promoInfo: {
    flex: 1,
  },
  promoCode: {
    fontSize: 12,
    fontWeight: '800',
    color: '#92400E',
  },
  promoDesc: {
    fontSize: 10,
    color: '#B45309',
    marginTop: 1,
  },
  summaryBox: {
    marginHorizontal: 20,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 10,
  },
  summaryBoxTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 4,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  summaryVal: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text,
  },
  promoLabel: {
    fontSize: 12,
    color: Colors.success,
    fontWeight: '600',
  },
  promoVal: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.success,
  },
  grandTotalRow: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 10,
    marginTop: 4,
  },
  grandTotalLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.text,
  },
  grandTotalVal: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.primary,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
    paddingTop: 80,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyDesc: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 24,
  },
  exploreStoreBtn: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 22,
    paddingVertical: 13,
    borderRadius: 14,
  },
  exploreStoreBtnText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 28 : 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  bottomTotalLabel: {
    fontSize: 10,
    color: Colors.textSecondary,
  },
  bottomTotalVal: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.primary,
  },
  checkoutBtn: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 22,
    paddingVertical: 13,
    borderRadius: 14,
  },
  btnPressed: {
    opacity: 0.85,
  },
  checkoutBtnText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },

  // Modal
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    backgroundColor: Colors.surface,
    borderRadius: 22,
    padding: 24,
    alignItems: 'center',
  },
  successIconCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: Colors.successLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  successModalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  successModalDesc: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  receiptBox: {
    width: '100%',
    backgroundColor: Colors.surfaceSubtle,
    borderRadius: 14,
    padding: 14,
    marginBottom: 20,
  },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  receiptLbl: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  receiptVal: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text,
  },
  receiptTotalRow: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 8,
    marginTop: 4,
    marginBottom: 0,
  },
  receiptTotalLbl: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.text,
  },
  receiptTotalVal: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.primary,
  },
  finishBtn: {
    backgroundColor: Colors.primary,
    width: '100%',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  finishBtnText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
