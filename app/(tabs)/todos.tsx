import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

// =========================================================================
// [MODUL WEEK 8/9 - DEFINISI TIPE DATA TODO]
// Sesuai skema JSONPlaceholder (jsonplaceholder.typicode.com)
// =========================================================================
export interface Todo {
  userId?: number;
  id: number;
  title: string;
  completed: boolean;
}

export default function TodoListScreen() {
  // =======================================================================
  // 1. STATE MANAGEMENT (POLA TRI-STATE & FORM INPUT)
  // =======================================================================
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // State Orang 2: Input teks tugas baru & loading state saat submit
  const [newTask, setNewTask] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);

  // =======================================================================
  // 2. FITUR 01 — TAMPILKAN DATA API (GET + ASYNC/AWAIT) [Orang 1]
  // =======================================================================
  const fetchTodos = async (signal?: AbortSignal) => {
    try {
      const response = await fetch(
        'https://jsonplaceholder.typicode.com/todos?_limit=10',
        { signal }
      );

      if (!response.ok) {
        throw new Error(`HTTP Error! Status: ${response.status}`);
      }

      const data: Todo[] = await response.json();
      setTodos(data);
    } catch (error: any) {
      if (error.name === 'AbortError') {
        // Request dibatalkan saat komponen unmount untuk mencegah memory leak
        return;
      }
      console.error('Gagal mengambil data tugas:', error);
      Alert.alert(
        'Terjadi Kesalahan',
        'Gagal memproses data ke server API. Periksa koneksi internet Anda.'
      );
    } finally {
      // Fitur 02: Matikan loading indicator setelah fetch selesai
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Mount Effect: Jalankan hanya 1 kali saat komponen pertama kali dimuat
  useEffect(() => {
    const controller = new AbortController();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchTodos(controller.signal);

    // Cleanup function untuk membatalkan request jika pengguna meninggalkan halaman
    return () => {
      controller.abort();
    };
  }, []);

  // =======================================================================
  // 3. FITUR 06 — REFRESH DATA (RE-FETCH DATA TERBARU) [Orang 1]
  // =======================================================================
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchTodos();
  };

  // =======================================================================
  // 4. FITUR 03 — MENAMBAHKAN TODO (POST + FORM INPUT) [Orang 2]
  // =======================================================================
  const handleAddTodo = async () => {
    const trimmedTitle = newTask.trim();

    // Fitur 05: Validasi input kosong
    if (!trimmedTitle) {
      Alert.alert('Peringatan', 'Nama tugas tidak boleh kosong!');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('https://jsonplaceholder.typicode.com/todos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: trimmedTitle,
          completed: false,
          userId: 1,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP Error! Status: ${response.status}`);
      }

      await response.json();

      // Buat item baru dengan id unik lokal (Date.now()) karena server JSONPlaceholder
      // selalu mengembalikan id: 201 untuk simulasi
      const createdTodo: Todo = {
        id: Date.now(),
        title: trimmedTitle,
        completed: false,
        userId: 1,
      };

      // Perbarui state todos secara lokal di bagian paling atas daftar
      setTodos((prevTodos) => [createdTodo, ...prevTodos]);
      // Kosongkan kembali input teks setelah berhasil
      setNewTask('');
    } catch (error) {
      console.error('Gagal menambahkan tugas:', error);
      Alert.alert(
        'Terjadi Kesalahan',
        'Gagal memproses data ke server API. Periksa koneksi internet Anda.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  // =======================================================================
  // 5. FITUR 04 — UBAH STATUS TUGAS (PATCH + TOGGLE STATE) [Orang 2]
  // =======================================================================
  const handleToggleTodo = async (id: number, currentStatus: boolean) => {
    try {
      // Gunakan ID 1 untuk fallback jika ID > 200 (karena mock JSONPlaceholder hanya memiliki ID 1-200)
      const targetId = id > 200 ? 1 : id;
      const response = await fetch(
        `https://jsonplaceholder.typicode.com/todos/${targetId}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            completed: !currentStatus,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP Error! Status: ${response.status}`);
      }

      // Perbarui state todos menggunakan .map() untuk membalikkan status completed
      setTodos((prevTodos) =>
        prevTodos.map((todo) =>
          todo.id === id ? { ...todo, completed: !currentStatus } : todo
        )
      );
    } catch (error) {
      console.error('Gagal mengubah status tugas:', error);
      Alert.alert(
        'Terjadi Kesalahan',
        'Gagal memproses data ke server API. Periksa koneksi internet Anda.'
      );
    }
  };

  // =======================================================================
  // 6. FITUR 04 — HAPUS ITEM TUGAS (DELETE + FILTER STATE) [Orang 2]
  // =======================================================================
  const handleDeleteTodo = async (id: number) => {
    try {
      const targetId = id > 200 ? 1 : id;
      const response = await fetch(
        `https://jsonplaceholder.typicode.com/todos/${targetId}`,
        {
          method: 'DELETE',
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP Error! Status: ${response.status}`);
      }

      // Hapus item dari state todos secara lokal
      setTodos((prevTodos) => prevTodos.filter((todo) => todo.id !== id));
    } catch (error) {
      console.error('Gagal menghapus tugas:', error);
      Alert.alert(
        'Terjadi Kesalahan',
        'Gagal memproses data ke server API. Periksa koneksi internet Anda.'
      );
    }
  };

  // =======================================================================
  // 7. RENDER ITEM TUGAS (CARD LAYOUT)
  // =======================================================================
  const renderTodoItem = ({ item }: { item: Todo }) => (
    <View style={styles.card}>
      {/* Checkbox Indikator Selesai (Fitur 04) */}
      <TouchableOpacity
        style={styles.checkboxTouch}
        activeOpacity={0.7}
        onPress={() => handleToggleTodo(item.id, item.completed)}
        accessibilityLabel={item.completed ? 'Tandai belum selesai' : 'Tandai selesai'}
      >
        {item.completed ? (
          <Ionicons name="checkbox" size={24} color="#16A34A" />
        ) : (
          <Ionicons name="square-outline" size={24} color="#94A3B8" />
        )}
      </TouchableOpacity>

      {/* Judul Tugas (Dengan efek coret jika selesai) */}
      <Text
        style={[
          styles.todoTitle,
          item.completed && styles.todoTitleCompleted,
        ]}
        numberOfLines={2}
      >
        {item.title}
      </Text>

      {/* Tombol Hapus Tugas (Fitur 04) */}
      <TouchableOpacity
        style={styles.deleteButton}
        activeOpacity={0.7}
        onPress={() => handleDeleteTodo(item.id)}
        accessibilityLabel="Hapus tugas"
      >
        <Ionicons name="trash-outline" size={20} color="#EF4444" />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar style="light" />

      {/* =================================================================== */}
      {/* HEADER BAR: Biru tua dengan judul di kiri & tombol reload di kanan   */}
      {/* =================================================================== */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          activeOpacity={0.7}
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.navigate('/(tabs)');
            }
          }}
          accessibilityLabel="Kembali ke Beranda"
        >
          <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
        </TouchableOpacity>

        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Todo List App</Text>
          <Text style={styles.headerSubtitle}>Week 8/9 — Async Data</Text>
        </View>

        {/* Fitur 06 - Cara 1: Tombol Reload di Header */}
        <TouchableOpacity
          style={styles.reloadButton}
          activeOpacity={0.7}
          onPress={handleRefresh}
          disabled={loading || refreshing}
          accessibilityLabel="Muat ulang daftar tugas"
        >
          {refreshing ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Ionicons name="refresh" size={22} color="#FFFFFF" />
          )}
        </TouchableOpacity>
      </View>

      {/* =================================================================== */}
      {/* FITUR 02: LOADING INDICATOR DI TENGAH LAYAR                        */}
      {/* =================================================================== */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#1D4ED8" />
          <Text style={styles.loadingText}>Memuat daftar tugas...</Text>
        </View>
      ) : (
        <FlatList
          data={todos}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderTodoItem}
          contentContainerStyle={styles.listContainer}
          // Fitur 06 - Cara 2: Pull-to-Refresh pada FlatList
          refreshing={refreshing}
          onRefresh={handleRefresh}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View style={styles.listHeaderWrapper}>
              {/* Ringkasan Jumlah Tugas */}
              <View style={styles.summaryBadge}>
                <Ionicons name="list" size={16} color="#1D4ED8" />
                <Text style={styles.summaryText}>
                  Menampilkan {todos.length} tugas ({todos.filter((t) => t.completed).length} selesai)
                </Text>
              </View>

              {/* Fitur 03: Form Input POST Todo (Bagian Orang 2) */}
              <View style={styles.formRow}>
                <TextInput
                  style={styles.input}
                  placeholder="Tugas baru..."
                  placeholderTextColor="#94A3B8"
                  value={newTask}
                  onChangeText={setNewTask}
                  editable={!submitting}
                  returnKeyType="done"
                  onSubmitEditing={handleAddTodo}
                />
                <TouchableOpacity
                  style={[styles.addButton, submitting && styles.addButtonDisabled]}
                  activeOpacity={0.8}
                  onPress={handleAddTodo}
                  disabled={submitting}
                  accessibilityLabel="Tambah tugas baru"
                >
                  {submitting ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.addButtonText}>+ Tambah</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="clipboard-outline" size={48} color="#94A3B8" />
              <Text style={styles.emptyTitle}>Belum ada tugas</Text>
              <Text style={styles.emptySubtitle}>
                Tarik ke bawah atau tekan tombol reload untuk memuat data.
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#1D4ED8',
  },
  header: {
    backgroundColor: '#1D4ED8',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#BFDBFE',
    marginTop: 2,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  reloadButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    color: '#475569',
    fontWeight: '500',
  },
  listContainer: {
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 32,
    flexGrow: 1,
  },
  listHeaderWrapper: {
    marginBottom: 12,
  },
  summaryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DBEAFE',
    marginBottom: 12,
  },
  summaryText: {
    marginLeft: 8,
    fontSize: 13,
    color: '#1E40AF',
    fontWeight: '600',
  },
  formRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 10,
  },
  input: {
    flex: 1,
    height: 46,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 15,
    color: '#1E293B',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  addButton: {
    height: 46,
    paddingHorizontal: 18,
    backgroundColor: '#EA580C', // Oranye sesuai modul
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#EA580C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  addButtonDisabled: {
    backgroundColor: '#FDBA74',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  checkboxTouch: {
    padding: 2,
    marginRight: 10,
  },
  todoTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: '#1E293B',
    lineHeight: 20,
  },
  todoTitleCompleted: {
    textDecorationLine: 'line-through',
    color: '#94A3B8',
  },
  deleteButton: {
    padding: 6,
    marginLeft: 8,
    borderRadius: 8,
    backgroundColor: '#FEF2F2',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  emptyTitle: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '600',
    color: '#475569',
  },
  emptySubtitle: {
    marginTop: 6,
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 18,
  },
});
