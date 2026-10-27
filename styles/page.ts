// Definisi styling halaman dokumentasi
import { StyleSheet } from 'react-native';

export const pageStyles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 20,
  },
  card: {
    padding: 20,
    borderRadius: 12,
    backgroundColor: '#f2f2f2',
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
});
