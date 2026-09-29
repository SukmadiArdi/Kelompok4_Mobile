import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Theme';

interface RatingStarsProps {
  rating: number;
  count?: number;
  size?: number;
  showText?: boolean;
}

export const RatingStars: React.FC<RatingStarsProps> = ({
  rating,
  count,
  size = 13,
  showText = true,
}) => {
  return (
    <View style={styles.container}>
      <Ionicons name="star" size={size} color={Colors.accent} />
      {showText && (
        <Text style={styles.ratingText}>
          {rating.toFixed(1)}
          {count !== undefined && (
            <Text style={styles.countText}> ({count})</Text>
          )}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.text,
  },
  countText: {
    fontSize: 11,
    fontWeight: '400',
    color: Colors.textSecondary,
  },
});

export default RatingStars;
