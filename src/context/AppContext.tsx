import React, { createContext, useContext, useState } from 'react';
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

interface AppContextType {
  experiences: Experience[];
  gems: HiddenGem[];
  products: ArtisanProduct[];
  cart: CartItem[];
  bookings: Booking[];
  savedGemIds: string[];
  favoriteProductIds: string[];

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
  const [cart, setCart] = useState<CartItem[]>([
    {
      product: MOCK_ARTISANS[1], // Teko Gerabah Kasongan as default cart item for instant UI demo
      quantity: 1,
    },
  ]);
  const [bookings, setBookings] = useState<Booking[]>(INITIAL_BOOKINGS);
  const [savedGemIds, setSavedGemIds] = useState<string[]>(['gem-1', 'gem-3']);
  const [favoriteProductIds, setFavoriteProductIds] = useState<string[]>(['prod-1']);

  // Cart operations
  const addToCart = (product: ArtisanProduct, quantity: number = 1, variant?: string) => {
    setCart((prev) => {
      const existingIndex = prev.findIndex((item) => item.product.id === product.id);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        return updated;
      }
      return [...prev, { product, quantity, selectedVariant: variant }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => setCart([]);

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const cartSubtotal = cart.reduce(
    (total, item) => total + item.product.price * item.quantity,
    0
  );

  // Booking operations
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

    setBookings((prev) => [newBooking, ...prev]);
    return newBooking;
  };

  // Toggle Gem Bookmark
  const toggleBookmarkGem = (gemId: string) => {
    setSavedGemIds((prev) =>
      prev.includes(gemId) ? prev.filter((id) => id !== gemId) : [...prev, gemId]
    );
  };

  // Toggle Product Favorite
  const toggleFavoriteProduct = (productId: string) => {
    setFavoriteProductIds((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
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
