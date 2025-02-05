import React, { useState } from 'react';
import { auth, db } from '../../lib/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

export default function Setup() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const createAdminUser = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check if admin user already exists
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        'dominic.platten@gmail.com',
        '1234!A'
      );

      // Create admin document in Firestore
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        email: 'dominic.platten@gmail.com',
        isAdmin: true,
        createdAt: new Date().toISOString(),
      });

      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error: any) {
      console.error('Setup error:', error);
      if (error.code === 'auth/email-already-in-use') {
        setError('Admin user already exists. Please use the login page.');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setError(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Initial Admin Setup
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            This page is for creating the first admin user.
          </p>
        </div>
        
        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}
        
        {success && (
          <div className="rounded-md bg-green-50 p-4">
            <p className="text-sm text-green-700">
              Admin user created successfully! Redirecting to login...
            </p>
          </div>
        )}

        <button
          onClick={createAdminUser}
          disabled={loading || success}
          className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {loading ? 'Creating admin user...' : 'Create Admin User'}
        </button>
      </div>
    </div>
  );
}