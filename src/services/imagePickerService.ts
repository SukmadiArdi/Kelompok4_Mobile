import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';

export interface ImagePickerResult {
  canceled: boolean;
  uri?: string;
  base64?: string;
  width?: number;
  height?: number;
  fileName?: string;
  fileSize?: number;
}

export interface CustomPickerOptions {
  allowsEditing?: boolean;
  aspect?: [number, number];
  quality?: number;
  includeBase64?: boolean;
}

/**
 * Service Helper Kamera & Galeri Foto
 * Mendukung jepret langsung dari kamera atau pilih file foto dari galeri
 * dengan manajemen izin otomatis dan penanganan error yang ramah pengguna.
 */
class ImagePickerService {
  /**
   * Mengambil foto langsung menggunakan kamera perangkat
   */
  async takePhotoFromCamera(options: CustomPickerOptions = {}): Promise<ImagePickerResult> {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          'Izin Kamera Dibutuhkan',
          'LokalTrip membutuhkan izin akses kamera untuk mengambil foto secara langsung.',
          [{ text: 'Mengerti' }]
        );
        return { canceled: true };
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: options.allowsEditing ?? true,
        aspect: options.aspect ?? [1, 1],
        quality: options.quality ?? 0.8,
        base64: options.includeBase64 ?? true,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return { canceled: true };
      }

      const asset = result.assets[0];
      return {
        canceled: false,
        uri: asset.uri,
        base64: asset.base64 || undefined,
        width: asset.width,
        height: asset.height,
        fileName: asset.fileName || `cam_${Date.now()}.jpg`,
        fileSize: asset.fileSize,
      };
    } catch (err: any) {
      console.error('[ImagePickerService] Error saat mengambil foto kamera:', err);
      Alert.alert(
        'Kamera Tidak Tersedia',
        'Gagal mengakses modul kamera perangkat. Anda dapat mencoba memilih foto dari galeri.'
      );
      return { canceled: true };
    }
  }

  /**
   * Memilih foto dari galeri perangkat
   */
  async pickImageFromGallery(options: CustomPickerOptions = {}): Promise<ImagePickerResult> {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          'Izin Galeri Dibutuhkan',
          'LokalTrip membutuhkan izin akses galeri foto untuk memilih gambar.',
          [{ text: 'Mengerti' }]
        );
        return { canceled: true };
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: options.allowsEditing ?? true,
        aspect: options.aspect ?? [1, 1],
        quality: options.quality ?? 0.8,
        base64: options.includeBase64 ?? true,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return { canceled: true };
      }

      const asset = result.assets[0];
      return {
        canceled: false,
        uri: asset.uri,
        base64: asset.base64 || undefined,
        width: asset.width,
        height: asset.height,
        fileName: asset.fileName || `gallery_${Date.now()}.jpg`,
        fileSize: asset.fileSize,
      };
    } catch (err: any) {
      console.error('[ImagePickerService] Error saat memilih foto galeri:', err);
      Alert.alert('Gagal Membuka Galeri', 'Terjadi kesalahan saat mengakses galeri perangkat.');
      return { canceled: true };
    }
  }
}

export const imagePickerService = new ImagePickerService();
export default imagePickerService;
