import { create } from 'zustand';
import { auth } from '../lib/firebase';
import { 
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged
} from 'firebase/auth';
import type { User } from '../types';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  error: null,

  signIn: async (email: string, password: string) => {
    try {
      set({ loading: true, error: null });
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      set({
        user: {
          id: userCredential.user.uid,
          email: userCredential.user.email!,
          isAdmin: true // All authenticated users are admins
        },
        loading: false,
        error: null
      });
    } catch (error: any) {
      let errorMessage = 'Failed to sign in';
      
      // Handle specific Firebase errors
      switch (error.code) {
        case 'auth/quota-exceeded':
          errorMessage = 'The service is temporarily unavailable. Please try again in a few minutes.';
          break;
        case 'auth/wrong-password':
        case 'auth/user-not-found':
          errorMessage = 'Invalid email or password';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many failed login attempts. Please try again later.';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Network error. Please check your connection.';
          break;
      }
      
      set({ error: errorMessage, loading: false });
    }
  },

  signOut: async () => {
    try {
      await firebaseSignOut(auth);
      set({ user: null, error: null });
    } catch (error) {
      set({ error: 'Failed to sign out' });
    }
  }
}));

// Set up auth state listener
onAuthStateChanged(auth, (user) => {
  if (user) {
    useAuthStore.setState({
      user: {
        id: user.uid,
        email: user.email!,
        isAdmin: true // All authenticated users are admins
      },
      loading: false
    });
  } else {
    useAuthStore.setState({ user: null, loading: false });
  }
});