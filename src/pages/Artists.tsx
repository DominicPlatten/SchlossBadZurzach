import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db, COLLECTIONS } from '../lib/firebase';
import { Loader2, WifiOff, RefreshCw } from 'lucide-react';
import type { Artist } from '../types';

export default function Artists() {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const loadArtists = async () => {
    try {
      setLoading(true);
      setError(null);

      const artistsRef = collection(db, COLLECTIONS.ARTISTS);
      const snapshot = await getDocs(artistsRef);
      
      const artistsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Artist[];

      setArtists(artistsData);
    } catch (err) {
      console.error('Failed to load artists:', err);
      setError(
        !navigator.onLine
          ? 'You are currently offline. Please check your internet connection and try again.'
          : 'Failed to load artists. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadArtists();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-center items-center h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {isOffline && (
        <div className="mb-4 bg-yellow-50 p-4 rounded-lg">
          <div className="flex items-center space-x-3">
            <WifiOff className="h-5 w-5 text-yellow-600" />
            <p className="text-yellow-700">You are currently offline. Some content may not be up to date.</p>
          </div>
        </div>
      )}

      {error ? (
        <div className="bg-red-50 p-6 rounded-lg">
          <div className="flex items-center space-x-3">
            <RefreshCw className="h-6 w-6 text-red-600" />
            <p className="text-red-700">{error}</p>
          </div>
          <button
            onClick={loadArtists}
            className="mt-4 inline-flex items-center space-x-2 text-sm font-medium text-red-700 hover:text-red-800"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Try again</span>
          </button>
        </div>
      ) : (
        <>
          <h1 className="text-3xl font-bold mb-8">Featured Artists</h1>
          {artists.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {artists.map(artist => (
                <Link key={artist.id} to={`/artist/${artist.id}`} className="group">
                  <div className="bg-white rounded-lg overflow-hidden shadow-lg">
                    <div className="aspect-[4/3] overflow-hidden">
                      <img
                        src={artist.mainImage}
                        alt={artist.name}
                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-6">
                      <h2 className="text-xl font-semibold mb-2">{artist.name}</h2>
                      <p className="text-gray-600 line-clamp-3">{artist.bio}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No artists found</p>
          )}
        </>
      )}
    </div>
  );
}