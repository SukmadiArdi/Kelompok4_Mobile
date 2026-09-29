import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Experience,
  HiddenGem,
  ArtisanProduct,
  CartItem,
  Booking,
  GemReview,
} from '../types';
import {
  MOCK_EXPERIENCES,
  MOCK_HIDDEN_GEMS,
  MOCK_ARTISANS,
  INITIAL_BOOKINGS,
} from '../data/mockData';
import {
  LocalStorage,
  LOCAL_STORAGE_KEYS,
  UserPreferences,
  DEFAULT_PREFERENCES,
} from '../services/localStorage';
import {
  SecureStorage,
  SECURE_STORAGE_KEYS,
  SecureUserSession,
} from '../services/secureStorage';

interface AppContextType {
  experiences: Experience[];
  gems: HiddenGem[];
  products: ArtisanProduct[];
  cart: CartItem[];
  bookings: Booking[];
  savedGemIds: string[];
  favoriteProductIds: string[];

  // Storage Persistence state
  isStorageLoaded: boolean;
  userPreferences: UserPreferences;
  updateUserPreferences: (prefs: Partial<UserPreferences>) => Promise<void>;
  
  // Secure Storage State
  userSession: SecureUserSession | null;
  securityPin: string | null;
  saveUserSession: (session: SecureUserSession) => Promise<boolean>;
  clearUserSession: () => Promise<boolean>;
  saveSecurityPin: (pin: string) => Promise<boolean>;

  // Storage Management & Debug inspection
  clearLocalStorageData: () => Promise<void>;
  clearSecureStorageData: () => Promise<void>;
  storageSnapshot: {
    local: Record<string, any>;
    secure: Record<string, string | null>;
  };
  refreshStorageSnapshot: () => Promise<void>;
  // Cart operations
  addToCart: (product: ArtisanProduct, quantity?: number, variant?: string) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartSubtotal: number;

  // Booking operations
  createBooking: (
    experience: Experience,
    date: string,
    timeSlot: string,
    guestsCount: number
  ) => Booking;

  // Bookmarking & favorites
  toggleBookmarkGem: (gemId: string) => void;
  toggleFavoriteProduct: (productId: string) => void;
  addGemReview: (gemId: string, review: Omit<GemReview, 'id' | 'date'>) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [experiences] = useState<Experience[]>(MOCK_EXPERIENCES);
  const [gems, setGems] = useState<HiddenGem[]>(MOCK_HIDDEN_GEMS);
  const [products] = useState<ArtisanProduct[]>(MOCK_ARTISANS);
  // States with Local Storage Persistence
  const [cart, setCart] = useState<CartItem[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [savedGemIds, setSavedGemIds] = useState<string[]>([]);
  const [favoriteProductIds, setFavoriteProductIds] = useState<string[]>([]);
  const [userPreferences, setUserPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);

  // States with Secure Storage Persistence
  const [userSession, setUserSession] = useState<SecureUserSession | null>(null);
  const [securityPin, setSecurityPin] = useState<string | null>(null);

  const [isStorageLoaded, setIsStorageLoaded] = useState<boolean>(false);
  const [storageSnapshot, setStorageSnapshot] = useState<{
    local: Record<string, any>;
    secure: Record<string, string | null>;
  }>({ local: {}, secure: {} });

  // 1. Initial Storage Load from Local Storage & Secure Storage
  useEffect(() => {
    const loadStoredAppData = async () => {
      try {
        // Local Storage Loads
        const storedCart = await LocalStorage.getItem<CartItem[]>(
          LOCAL_STORAGE_KEYS.CART,
          [
            {
              product: MOCK_ARTISANS[1], // Default demo item if empty
              quantity: 1,
            },
          ]
        );
        const storedBookings = await LocalStorage.getItem<Booking[]>(
          LOCAL_STORAGE_KEYS.BOOKINGS,
          INITIAL_BOOKINGS
        );
        const storedSavedGems = await LocalStorage.getItem<string[]>(
          LOCAL_STORAGE_KEYS.SAVED_GEMS,
          ['gem-1', 'gem-3']
        );
        const storedFavorites = await LocalStorage.getItem<string[]>(
          LOCAL_STORAGE_KEYS.FAVORITE_PRODUCTS,
          ['prod-1']
        );
        const storedPrefs = await LocalStorage.getItem<UserPreferences>(
          LOCAL_STORAGE_KEYS.USER_PREFERENCES,
          DEFAULT_PREFERENCES
        );

        setCart(storedCart);
        setBookings(storedBookings);
        setSavedGemIds(storedSavedGems);
        setFavoriteProductIds(storedFavorites);
        setUserPreferences(storedPrefs);

        // Secure Storage Loads
        const session = await SecureStorage.getUserSession();
        const pin = await SecureStorage.getItem(SECURE_STORAGE_KEYS.SECURITY_PIN);

        // Demo default secure session if none exists yet
        if (!session) {
          const defaultSession: SecureUserSession = {
            userId: 'usr_883921',
            email: 'arya.wibowo@lokaltrip.id',
            authToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.lokaltrip_secure_token_demo',
            loginTimestamp: new Date().toISOString(),
            isBiometricEnabled: true,
          };
          await SecureStorage.saveUserSession(defaultSession);
          setUserSession(defaultSession);
        } else {
          setUserSession(session);
        }

        if (!pin) {
          await SecureStorage.setItem(SECURE_STORAGE_KEYS.SECURITY_PIN, '789012');
          setSecurityPin('789012');
        } else {
          setSecurityPin(pin);
        }

        // Fetch initial snapshot for UI verification
        const localData = await LocalStorage.getAllStoredData();
        const secureData = await SecureStorage.getSecureStorageSnapshot();
        setStorageSnapshot({ local: localData, secure: secureData });
      } catch (err) {
        console.error('Error loading initial app storage:', err);
      } finally {
        setIsStorageLoaded(true);
      }
    };

    loadStoredAppData();
  }, []);

  // Sync snapshot helper
  const refreshStorageSnapshot = async () => {
    const localData = await LocalStorage.getAllStoredData();
    const secureData = await SecureStorage.getSecureStorageSnapshot();
    setStorageSnapshot({ local: localData, secure: secureData });
  };

  // 2. Persist Cart on change
  const saveCartToStorage = (newCart: CartItem[]) => {
    setCart(newCart);
    LocalStorage.setItem(LOCAL_STORAGE_KEYS.CART, newCart).then(refreshStorageSnapshot);
  };

  const addToCart = (product: ArtisanProduct, quantity: number = 1, variant?: string) => {
    const existingIndex = cart.findIndex((item) => item.product.id === product.id);
    let updated: CartItem[];
    if (existingIndex > -1) {
      updated = [...cart];
      updated[existingIndex].quantity += quantity;
    } else {
      updated = [...cart, { product, quantity, selectedVariant: variant }];
    }
    saveCartToStorage(updated);
  };

  const removeFromCart = (productId: string) => {
    const updated = cart.filter((item) => item.product.id !== productId);
    saveCartToStorage(updated);
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    const updated = cart.map((item) =>
      item.product.id === productId ? { ...item, quantity } : item
    );
    saveCartToStorage(updated);
  };

  const clearCart = () => {
    saveCartToStorage([]);
  };

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const cartSubtotal = cart.reduce(
    (total, item) => total + item.product.price * item.quantity,
    0
  );

  // 3. Persist Bookings on change
  const createBooking = (
    experience: Experience,
    date: string,
    timeSlot: string,
    guestsCount: number
  ): Booking => {
    const newBooking: Booking = {
      id: `book-${Date.now()}`,
      experienceId: experience.id,
      experienceTitle: experience.title,
      experienceImage: experience.image,
      location: experience.location,
      date,
      timeSlot,
      guestsCount,
      totalPrice: experience.price * guestsCount,
      status: 'Dikonfirmasi',
      guideName: experience.guide.name,
      createdAt: new Date().toISOString().split('T')[0],
    };

    const updatedBookings = [newBooking, ...bookings];
    setBookings(updatedBookings);
    LocalStorage.setItem(LOCAL_STORAGE_KEYS.BOOKINGS, updatedBookings).then(
      refreshStorageSnapshot
    );
    return newBooking;
  };

  // 4. Persist Bookmark Gems on change
  const toggleBookmarkGem = (gemId: string) => {
    const updated = savedGemIds.includes(gemId)
      ? savedGemIds.filter((id) => id !== gemId)
      : [...savedGemIds, gemId];
    setSavedGemIds(updated);
    LocalStorage.setItem(LOCAL_STORAGE_KEYS.SAVED_GEMS, updated).then(
      refreshStorageSnapshot
    );
  };

  // 5. Persist Favorite Products on change
  const toggleFavoriteProduct = (productId: string) => {
    const updated = favoriteProductIds.includes(productId)
      ? favoriteProductIds.filter((id) => id !== productId)
      : [...favoriteProductIds, productId];
    setFavoriteProductIds(updated);
    LocalStorage.setItem(LOCAL_STORAGE_KEYS.FAVORITE_PRODUCTS, updated).then(
      refreshStorageSnapshot
    );
  };

  // 6. User Preferences Manager
  const updateUserPreferences = async (prefs: Partial<UserPreferences>) => {
    const updated = { ...userPreferences, ...prefs };
    setUserPreferences(updated);
    await LocalStorage.setItem(LOCAL_STORAGE_KEYS.USER_PREFERENCES, updated);
    await refreshStorageSnapshot();
  };

  // 7. Secure Storage Operations
  const handleSaveUserSession = async (session: SecureUserSession): Promise<boolean> => {
    const success = await SecureStorage.saveUserSession(session);
    if (success) {
      setUserSession(session);
      await refreshStorageSnapshot();
    }
    return success;
  };

  const handleClearUserSession = async (): Promise<boolean> => {
    const success = await SecureStorage.removeAuthToken();
    await SecureStorage.deleteItem(SECURE_STORAGE_KEYS.USER_CREDENTIALS);
    setUserSession(null);
    await refreshStorageSnapshot();
    return success;
  };

  const handleSaveSecurityPin = async (pin: string): Promise<boolean> => {
    const success = await SecureStorage.setItem(SECURE_STORAGE_KEYS.SECURITY_PIN, pin);
    if (success) {
      setSecurityPin(pin);
      await refreshStorageSnapshot();
    }
    return success;
  };

  // Reset Storage Handlers
  const clearLocalStorageData = async () => {
    await LocalStorage.clearAllAppLocalData();
    setCart([]);
    setBookings([]);
    setSavedGemIds([]);
    setFavoriteProductIds([]);
    setUserPreferences(DEFAULT_PREFERENCES);
    await refreshStorageSnapshot();
  };

  const clearSecureStorageData = async () => {
    await SecureStorage.clearAllSecureSession();
    setUserSession(null);
    setSecurityPin(null);
    await refreshStorageSnapshot();
  };
  // Add Gem Review
  const addGemReview = (gemId: string, reviewData: Omit<GemReview, 'id' | 'date'>) => {
    const newReview: GemReview = {
      ...reviewData,
      id: `rev-${Date.now()}`,
      date: 'Baru saja',
    };

    setGems((prev) =>
      prev.map((g) => {
        if (g.id === gemId) {
          const updatedReviews = [newReview, ...g.reviews];
          return {
            ...g,
            reviews: updatedReviews,
            reviewsCount: g.reviewsCount + 1,
            likesCount: g.likesCount + 1,
          };
        }
        return g;
      })
    );
  };

  return (
    <AppContext.Provider
      value={{
        experiences,
        gems,
        products,
        cart,
        bookings,
        savedGemIds,
        favoriteProductIds,
        isStorageLoaded,
        userPreferences,
        updateUserPreferences,
        userSession,
        securityPin,
        saveUserSession: handleSaveUserSession,
        clearUserSession: handleClearUserSession,
        saveSecurityPin: handleSaveSecurityPin,

        clearLocalStorageData,
        clearSecureStorageData,
        storageSnapshot,
        refreshStorageSnapshot,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        cartCount,
        cartSubtotal,
        createBooking,
        toggleBookmarkGem,
        toggleFavoriteProduct,
        addGemReview,
      }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export default AppContext;
