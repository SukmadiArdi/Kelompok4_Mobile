// Komponen tombol untuk navigasi antarhalaman
import React from 'react';
import { Pressable, Text } from 'react-native';
import { buttonStyles } from '@/styles';

// Tipe properti tombol navigasi
type PageButtonProps = {
  title: string;
  onPress: () => void;
};

// Komponen tombol kustom
export default function PageButton({ title, onPress }: PageButtonProps) {
  return (
    <Pressable style={buttonStyles.button} onPress={onPress}>
      <Text style={buttonStyles.text}>{title}</Text>
    </Pressable>
  );
}
