import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db, COLLECTIONS } from '../lib/firebase';
import { Loader2, WifiOff, RefreshCw } from 'lucide-react';
import ImageViewer from '../components/ImageViewer';
import ExhibitionTile from '../components/ExhibitionTile';
import type { Artist, Exhibition } from '../types';

export default function Artist() {
  const { id } = useParams<{ id: string }>();
  const [artist, setArtist] = useState<Artist | null>(null);
  const [exhibitions, setExhibitions] = useState<Exhibition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

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

  const loadArtistAndExhibitions = async () => {
    if (!id) {
      setError('Artist ID is missing');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Get artist data
      const artistRef = doc(db, COLLECTIONS.ARTISTS, id);
      const artistDoc = await getDoc(artistRef);

      if (!artistDoc.exists()) {
        setError('Artist not found');
        return;
      }

      const artistData = {
        id: artistDoc.id,
        ...artistDoc.data()
      } as Artist;

      setArtist(artistData);

      // Get artist's exhibitions
      const exhibitionsRef = collection(db, COLLECTIONS.EXHIBITIONS);
      const exhibitionsQuery = query(exhibitionsRef, where('artistId', '==', id));
      const exhibitionsSnapshot = await getDocs(exhibitionsQuery);

      const exhibitionsData = exhibitionsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Exhibition[];

      setExhibitions(exhibitionsData);
    } catch (err) {
      console.error('Failed to load artist data:', err);
      setError(
        !navigator.onLine
          ? 'You are currently offline. Please check your internet connection and try again.'
          : 'Failed to load artist data. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadArtistAndExhibitions();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-center items-center h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        </div>
      </div>
    );
  }

  if (error || !artist) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-red-50 p-6 rounded-lg">
          <div className="flex items-center space-x-3">
            {isOffline ? (
              <WifiOff className="h-6 w-6 text-red-600" />
            ) : (
              <RefreshCw className="h-6 w-6 text-red-600" />
            )}
            <p className="text-red-700">{error || 'Artist not found'}</p>
          </div>
          <div className="mt-4 space-x-4">
            <button
              onClick={loadArtistAndExhibitions}
              className="inline-flex items-center space-x-2 text-sm font-medium text-red-700 hover:text-red-800"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Try again</span>
            </button>
            <Link
              to="/artists"
              className="inline-flex items-center space-x-2 text-sm font-medium text-gray-700 hover:text-gray-800"
            >
              Return to artists
            </Link>
          </div>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-12">
        <div>
          <img
            src={artist.mainImage}
            alt={artist.name}
            className="w-full h-96 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
            onClick={() => setSelectedImage(artist.mainImage)}
          />
        </div>
        <div className="lg:col-span-2">
          <h1 className="text-4xl font-bold mb-6">{artist.name}</h1>
          <p className="text-lg text-gray-700">{artist.bio}</p>
        </div>
      </div>

      {artist.portfolio && artist.portfolio.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Portfolio</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {artist.portfolio.map((work, index) => (
              <div key={index} className="group cursor-pointer" onClick={() => setSelectedImage(work.imageUrl)}>
                <div className="relative aspect-[4/3] rounded-lg overflow-hidden">
                  <img
                    src={work.imageUrl}
                    alt={work.title}
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="mt-2">
                  <h3 className="font-semibold text-gray-900">{work.title}</h3>
                  <p className="text-sm text-gray-500">{work.year}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {exhibitions.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-6">Exhibitions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {exhibitions.map(exhibition => (
              <ExhibitionTile key={exhibition.id} exhibition={exhibition} />
            ))}
          </div>
        </div>
      )}

      {selectedImage && (
        <ImageViewer
          src={selectedImage}
          alt="Artist image"
          onClose={() => setSelectedImage(null)}
        />
      )}
    </div>
  );
}