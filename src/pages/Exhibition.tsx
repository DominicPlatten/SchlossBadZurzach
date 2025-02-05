import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db, COLLECTIONS } from '../lib/firebase';
import { Loader2, Clock, Ticket, MapPin, WifiOff, RefreshCw } from 'lucide-react';
import ImageViewer from '../components/ImageViewer';
import type { Exhibition } from '../types';

export default function Exhibition() {
  const { id } = useParams<{ id: string }>();
  const [exhibition, setExhibition] = useState<Exhibition | null>(null);
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

  const loadExhibition = async () => {
    if (!id) {
      console.error('No exhibition ID provided');
      setError('Exhibition ID is missing');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const exhibitionRef = doc(db, COLLECTIONS.EXHIBITIONS, id);
      const exhibitionDoc = await getDoc(exhibitionRef);

      if (!exhibitionDoc.exists()) {
        setError('Exhibition not found');
        return;
      }

      const data = {
        id: exhibitionDoc.id,
        ...exhibitionDoc.data()
      } as Exhibition;

      setExhibition(data);
    } catch (err) {
      console.error('Failed to load exhibition:', err);
      setError(
        !navigator.onLine
          ? 'You are currently offline. Please check your internet connection and try again.'
          : 'Failed to load exhibition. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExhibition();
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

  if (error || !exhibition) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-red-50 p-6 rounded-lg">
          <div className="flex items-center space-x-3">
            {isOffline ? (
              <WifiOff className="h-6 w-6 text-red-600" />
            ) : (
              <RefreshCw className="h-6 w-6 text-red-600" />
            )}
            <p className="text-red-700">{error || 'Exhibition not found'}</p>
          </div>
          <div className="mt-4 space-x-4">
            <button
              onClick={loadExhibition}
              className="inline-flex items-center space-x-2 text-sm font-medium text-red-700 hover:text-red-800"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Try again</span>
            </button>
            <Link
              to="/"
              className="inline-flex items-center space-x-2 text-sm font-medium text-gray-700 hover:text-gray-800"
            >
              Return to home
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

      {/* Hero Section */}
      <div className="relative h-[70vh] rounded-lg overflow-hidden mb-12">
        <img
          src={exhibition.mainImage}
          alt={exhibition.title}
          className="w-full h-full object-cover cursor-pointer"
          onClick={() => setSelectedImage(exhibition.mainImage)}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <h1 className="text-4xl font-bold text-white mb-4">{exhibition.title}</h1>
          <p className="text-xl text-gray-200 mb-4">{exhibition.shortDescription}</p>
          <p className="text-gray-300 text-lg">
            {new Date(exhibition.startDate).toLocaleDateString()} - {new Date(exhibition.endDate).toLocaleDateString()}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-bold mb-6">About the Exhibition</h2>
          <p className="text-gray-700 text-lg leading-relaxed mb-8">
            {exhibition.description}
          </p>

          {/* Gallery */}
          {exhibition.gallery && exhibition.gallery.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Gallery</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {exhibition.gallery.map((image, index) => (
                  <div 
                    key={index} 
                    className="relative aspect-[4/3] cursor-pointer group"
                    onClick={() => setSelectedImage(image)}
                  >
                    <img
                      src={image}
                      alt={`Gallery image ${index + 1}`}
                      className="w-full h-full object-cover rounded-lg group-hover:opacity-90 transition-opacity"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Visitor Information Sidebar */}
        {exhibition.visitorInfo && (
          <div className="bg-gray-50 p-6 rounded-lg h-fit">
            <h2 className="text-xl font-bold mb-6">Visitor Information</h2>
            <div className="space-y-6">
              {exhibition.visitorInfo.hours && (
                <div className="flex items-start space-x-3">
                  <Clock className="h-6 w-6 text-indigo-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold mb-1">Opening Hours</h3>
                    <p className="text-gray-600">{exhibition.visitorInfo.hours}</p>
                  </div>
                </div>
              )}

              {exhibition.visitorInfo.ticketInfo && (
                <div className="flex items-start space-x-3">
                  <Ticket className="h-6 w-6 text-indigo-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold mb-1">Tickets</h3>
                    <p className="text-gray-600">{exhibition.visitorInfo.ticketInfo}</p>
                  </div>
                </div>
              )}

              {exhibition.visitorInfo.location && (
                <div className="flex items-start space-x-3">
                  <MapPin className="h-6 w-6 text-indigo-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold mb-1">Location</h3>
                    <p className="text-gray-600">{exhibition.visitorInfo.location}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {selectedImage && (
        <ImageViewer
          src={selectedImage}
          alt="Exhibition image"
          onClose={() => setSelectedImage(null)}
        />
      )}
    </div>
  );
}