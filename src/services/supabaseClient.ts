/**
 * Re-export Supabase Client from src/lib/supabase
 * Memastikan kompatibilitas backward antara modul service dan lib.
 */
import { supabase, isSupabaseConfigured, ExpoSecureStoreAdapter } from '../lib/supabase';

export { supabase, isSupabaseConfigured, ExpoSecureStoreAdapter };

export const getSupabaseStatus = () => {
  const configured = isSupabaseConfigured();
  return {
    status: configured ? 'Tersambung ke Supabase Cloud' : 'Mode Demo (Mock Local Store)',
    isLive: configured,
    projectUrl: configured ? process.env.EXPO_PUBLIC_SUPABASE_URL : 'https://app.supabase.com',
  };
};

export default supabase;
