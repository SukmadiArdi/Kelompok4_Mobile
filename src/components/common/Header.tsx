import React from 'react';
import { View, Text, StyleSheet, Pressable, Platform, Image } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors } from '../../constants/Theme';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  showCart?: boolean;
  showProfile?: boolean;
  rightAction?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  showBack = false,
  showCart = true,
  showProfile = true,
  rightAction,
}) => {
  const { cartCount } = useApp();
  const { user, isAuthenticated } = useAuth();

  return (
    <View style={styles.headerContainer}>
      <View style={styles.leftRow}>
        {showBack ? (
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [styles.iconButton, pressed && styles.buttonPressed]}
            hitSlop={8}>
            <Feather name="arrow-left" size={22} color={Colors.text} />
          </Pressable>
        ) : (
          <View style={styles.brandBox}>
            <View style={styles.logoBadge}>
              <Ionicons name="compass" size={20} color={Colors.primary} />
            </View>
            <View>
              <Text style={styles.brandName}>
                Lokal<Text style={styles.brandHighlight}>Trip</Text>
              </Text>
              <View style={styles.locationPill}>
                <Ionicons name="location-sharp" size={12} color={Colors.primary} />
                <Text style={styles.locationText}>Nusantara, Indonesia</Text>
              </View>
            </View>
          </View>
        )}

        {title && showBack && (
          <View style={styles.titleWrapper}>
            <Text style={styles.titleText} numberOfLines={1}>
              {title}
            </Text>
            {subtitle && <Text style={styles.subtitleText}>{subtitle}</Text>}
          </View>
        )}
      </View>

      <View style={styles.rightRow}>
        {rightAction}

        {showCart && (
          <Pressable
            onPress={() => router.push('/cart')}
            style={({ pressed }) => [styles.cartButton, pressed && styles.buttonPressed]}>
            <Feather name="shopping-bag" size={20} color={Colors.text} />
            {cartCount > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{cartCount}</Text>
              </View>
            )}
          </Pressable>
        )}
        {showProfile && !showBack && (
          <Pressable
            onPress={() => {
              if (isAuthenticated) {
                router.push('/(tabs)/profile');
              } else {
                router.push('/auth/login' as any);
              }
            }}
            style={({ pressed }) => [styles.profileButton, pressed && styles.buttonPressed]}>
            {isAuthenticated && user?.avatar ? (
              <Image source={{ uri: user.avatar }} style={styles.profileAvatarImg} />
            ) : (
              <Feather
                name={isAuthenticated ? 'user-check' : 'user'}
                size={18}
                color={isAuthenticated ? Colors.secondary : Colors.textSecondary}
              />
            )}
          </Pressable>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 12 : 16,
    paddingBottom: 14,
    backgroundColor: Colors.background,
  },
  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  rightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  brandBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoBadge: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandName: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.text,
    letterSpacing: -0.5,
  },
  brandHighlight: {
    color: Colors.primary,
  },
  locationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 1,
  },
  locationText: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cartButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    position: 'relative',
  },
  buttonPressed: {
    opacity: 0.75,
    transform: [{ scale: 0.96 }],
  },
  cartBadge: {
    position: 'absolute',
    top: -3,
    right: -3,
    backgroundColor: Colors.primary,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: Colors.surface,
  },
  cartBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
  },
  titleWrapper: {
    flex: 1,
  },
  titleText: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.text,
  },
  subtitleText: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  profileAvatarImg: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },
});

export default Header;
