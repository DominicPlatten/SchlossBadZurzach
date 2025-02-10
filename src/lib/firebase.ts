import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics, isSupported } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Initialize Analytics only if supported
export const analytics = await isSupported().then(yes => yes ? getAnalytics(app) : null);

// Storage paths
export const STORAGE_PATHS = {
  EXHIBITIONS: 'exhibitions',
  ARTISTS: 'artists',
  MAP: 'map',
  ART_LOCATIONS: 'artLocations'
} as const;

// Collection names
export const COLLECTIONS = {
  EXHIBITIONS: 'exhibitions',
  ARTISTS: 'artists',
  USERS: 'users',
  ART_LOCATIONS: 'artLocations',
  MAP_CONTENT: 'mapContent'
} as const;