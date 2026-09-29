import React from 'react';
import { ScrollView, Text, StyleSheet, Pressable } from 'react-native';
import { Colors } from '../../constants/Theme';

interface CategoryPillsProps {
  categories: string[];
  activeCategory: string;
  onSelectCategory: (cat: string) => void;
  icons?: Record<string, string>;
}

export const CategoryPills: React.FC<CategoryPillsProps> = ({
  categories,
  activeCategory,
  onSelectCategory,
}) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}>
      {categories.map((cat) => {
        const isActive = activeCategory === cat;
        return (
          <Pressable
            key={cat}
            onPress={() => onSelectCategory(cat)}
            style={[
              styles.pill,
              isActive ? styles.pillActive : styles.pillInactive,
            ]}>
            <Text
              style={[
                styles.pillText,
                isActive ? styles.pillTextActive : styles.pillTextInactive,
              ]}>
              {cat}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    gap: 8,
    paddingBottom: 12,
  },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 24,
    borderWidth: 1,
  },
  pillActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  pillInactive: {
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
  },
  pillText: {
    fontSize: 13,
    fontWeight: '600',
  },
  pillTextActive: {
    color: '#FFF',
  },
  pillTextInactive: {
    color: Colors.textSecondary,
  },
});

export default CategoryPills;
