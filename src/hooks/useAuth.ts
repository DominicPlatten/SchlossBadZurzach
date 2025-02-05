import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../lib/firebase';
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';

const RATE_LIMIT_KEY = 'auth_rate_limit';
const MAX_ATTEMPTS = 3;
const BASE_DELAY = 60; // Base delay in seconds

interface RateLimit {
  attempts: number;
  timestamp: number;
  delay: number;
}

export interface User {
  uid: string;
  email: string | null;
  isAdmin: boolean;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Load rate limit data from localStorage
  const getRateLimit = (): RateLimit | null => {
    const stored = localStorage.getItem(RATE_LIMIT_KEY);
    if (!stored) return null;
    return JSON.parse(stored);
  };

  // Save rate limit data to localStorage
  const setRateLimit = (data: RateLimit) => {
    localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(data));
  };

  // Clear rate limit data
  const clearRateLimit = () => {
    localStorage.removeItem(RATE_LIMIT_KEY);
  };

  // Check if rate limited
  const isRateLimited = (): { limited: boolean; remainingTime: number } => {
    const rateLimit = getRateLimit();
    if (!rateLimit) return { limited: false, remainingTime: 0 };

    const now = Date.now();
    const timePassed = (now - rateLimit.timestamp) / 1000; // Convert to seconds
    const remainingTime = Math.max(0, rateLimit.delay - timePassed);

    return {
      limited: remainingTime > 0,
      remainingTime: Math.ceil(remainingTime)
    };
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          isAdmin: true // All authenticated users are admins
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      // Check rate limiting
      const { limited, remainingTime } = isRateLimited();
      if (limited) {
        throw new Error(`Too many attempts. Please wait ${remainingTime} seconds.`);
      }

      setError(null);
      setLoading(true);
      
      await signInWithEmailAndPassword(auth, email, password);
      clearRateLimit(); // Clear rate limit on successful login
      navigate('/admin');
    } catch (error: any) {
      console.error('Login error:', error);
      
      let errorMessage = 'Failed to sign in';
      let shouldRateLimit = false;
      
      // Handle specific Firebase errors
      switch (error.code) {
        case 'auth/quota-exceeded':
          errorMessage = 'Service temporarily unavailable. Please try again later.';
          shouldRateLimit = true;
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many attempts. Please try again later.';
          shouldRateLimit = true;
          break;
        case 'auth/wrong-password':
        case 'auth/user-not-found':
          errorMessage = 'Invalid email or password';
          shouldRateLimit = true;
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Network error. Please check your connection.';
          break;
      }

      if (shouldRateLimit) {
        const rateLimit = getRateLimit() || { attempts: 0, timestamp: Date.now(), delay: BASE_DELAY };
        rateLimit.attempts += 1;
        // Exponential backoff: double the delay for each attempt
        rateLimit.delay = BASE_DELAY * Math.pow(2, Math.min(rateLimit.attempts - 1, MAX_ATTEMPTS - 1));
        rateLimit.timestamp = Date.now();
        setRateLimit(rateLimit);
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      setError('Failed to sign out');
    }
  };

  return { user, loading, error, login, logout, isRateLimited };
}