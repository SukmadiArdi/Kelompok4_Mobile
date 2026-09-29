import React from 'react';
import { View, TextInput, StyleSheet, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Colors } from '../../constants/Theme';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onFilterPress?: () => void;
  showFilter?: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  placeholder = 'Cari tur budaya, hidden gem, kerajinan...',
  onFilterPress,
  showFilter = true,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <Feather name="search" size={18} color={Colors.textMuted} style={styles.searchIcon} />
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={Colors.textMuted}
        />
        {value.length > 0 && (
          <Pressable onPress={() => onChangeText('')} hitSlop={8} style={styles.clearButton}>
            <Feather name="x-circle" size={16} color={Colors.textMuted} />
          </Pressable>
        )}
      </View>

      {showFilter && (
        <Pressable
          onPress={onFilterPress}
          style={({ pressed }) => [styles.filterButton, pressed && styles.buttonPressed]}>
          <Feather name="sliders" size={18} color={Colors.primary} />
        </Pressable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 48,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: Colors.text,
    paddingVertical: 0,
  },
  clearButton: {
    padding: 4,
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FED7D0',
  },
  buttonPressed: {
    opacity: 0.7,
  },
});

export default SearchBar;
