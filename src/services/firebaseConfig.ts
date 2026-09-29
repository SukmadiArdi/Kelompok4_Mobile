/**
 * LokalTrip - Firebase Integration Scaffold
 * 
 * Konfigurasi ini siap disambungkan ke Firebase Project Anda (Auth, Firestore, Storage).
 * Anda dapat menambahkan key di file `.env` atau `app.json`:
 * 
 * EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
 * EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
 * EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
 * EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
 * EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
 * EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
 */

export interface FirebaseConfig {
  apiKey?: string;
  authDomain?: string;
  projectId?: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
}

export const firebaseConfig: FirebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || '',
};

export const isFirebaseConfigured = (): boolean => {
  return !!(
    process.env.EXPO_PUBLIC_FIREBASE_API_KEY &&
    process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID
  );
};

export const getFirebaseStatus = () => {
  const configured = isFirebaseConfigured();
  return {
    status: configured ? 'Tersambung ke Cloud' : 'Mode Demo (Mock Local Store)',
    isLive: configured,
    projectId: firebaseConfig.projectId,
  };
};

export default firebaseConfig;
