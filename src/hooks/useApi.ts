import { useState, useEffect, useCallback } from 'react';
import {
  getExperiences,
  getHiddenGems,
  getArtisanProducts,
  getBookings,
} from '../services/apiService';
import { Experience, HiddenGem, ArtisanProduct, Booking } from '../types';

/**
 * Hook bantuan untuk mempermudah rekan Anda mengambil data API
 * lengkap dengan status Loading, Error, Data, dan fungsi Refresh.
 */

export function useExperiences() {
  const [data, setData] = useState<Experience[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getExperiences();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat data experiences');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, loading, error, refresh: fetch };
}

export function useHiddenGems() {
  const [data, setData] = useState<HiddenGem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getHiddenGems();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat data hidden gems');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, loading, error, refresh: fetch };
}

export function useArtisanProducts() {
  const [data, setData] = useState<ArtisanProduct[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getArtisanProducts();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat data produk artisan');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, loading, error, refresh: fetch };
}

export function useBookings(userId?: string) {
  const [data, setData] = useState<Booking[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getBookings(userId);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat data bookings');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, loading, error, refresh: fetch };
}
