// Import dependensi React dan React Native
import React, { createContext, useContext, useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

// Inisialisasi context tema
const ThemeContext = createContext<any>(null);

// Komponen utama aplikasi
export default function App() {
  // State tema dark mode
  const [darkMode, setDarkMode] = useState(false);

  return (
    // Provider tema untuk child component
    <ThemeContext.Provider value={{ darkMode, setDarkMode }}>
      <Home />
    </ThemeContext.Provider>
  );
}

// Komponen perantara Home
function Home() {
  return <Profile />;
}

// Komponen perantara Profile
function Profile() {
  return <UserCard />;
}

// Komponen perantara UserCard
function UserCard() {
  return <UserName />;
}

// Komponen pemanggil data context
function UserName() {
  // Mengambil state dan setter dari context
  const theme = useContext(ThemeContext);
  const darkMode = theme.darkMode;
  const setDarkMode = theme.setDarkMode;

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: darkMode ? '#121212' : '#ffffff' },
      ]}>
      <Text
        style={[
          styles.text,
          { color: darkMode ? '#ffffff' : '#000000' },
        ]}>
        {darkMode ? 'Dark Mode' : 'Light Mode'}
      </Text>
      {/* Tombol toggle tema */}
      <Button
        title="Toggle Theme"
        onPress={() => setDarkMode(!darkMode)}
        color={darkMode ? '#BB86FC' : '#6200EE'}
      />
    </View>
  );
}

// Definisi styling tampilan
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  text: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
});
