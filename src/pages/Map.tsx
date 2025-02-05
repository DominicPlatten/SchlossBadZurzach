import React, { useState, useEffect } from 'react';
import { getArtLocations } from '../lib/firebase-admin';
import { Loader2, X, WifiOff, RefreshCw } from 'lucide-react';
import type { ArtLocation } from '../types';

const DEFAULT_MAP_URL = 'https://images.unsplash.com/photo-1524813686514-a57563d77965?w=1200&auto=format&fit=crop&q=80';

export default function Map() {
  const [locations, setLocations] = useState<ArtLocation[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<ArtLocation | null>(null);
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

  const loadLocations = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getArtLocations();
      setLocations(data);
    } catch (err) {
      console.error('Failed to load art locations:', err);
      setError(
        !navigator.onLine
          ? 'You are currently offline. Please check your internet connection and try again.'
          : 'Failed to load art locations. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLocations();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
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
            onClick={loadLocations}
            className="mt-4 inline-flex items-center space-x-2 text-sm font-medium text-red-700 hover:text-red-800"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Try again</span>
          </button>
        </div>
      ) : (
        <div className="relative">
          {/* Map Container */}
          <div className="relative w-full" style={{ paddingBottom: '75%' }}>
            <div className="absolute inset-0 rounded-lg overflow-hidden">
              <img
                src={DEFAULT_MAP_URL}
                alt="Museum Map"
                className="w-full h-full object-cover"
              />
              
              {/* Location Points */}
              {locations.map((location) => (
                <button
                  key={location.id}
                  onClick={() => setSelectedLocation(location)}
                  className="absolute w-6 h-6 transform -translate-x-1/2 -translate-y-1/2 bg-indigo-600 rounded-full border-2 border-white shadow-lg hover:bg-indigo-700 transition-colors"
                  style={{
                    left: `${location.coordinates.x}%`,
                    top: `${location.coordinates.y}%`,
                  }}
                >
                  <span className="sr-only">View {location.title}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Location Details Modal */}
          {selectedLocation && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg max-w-lg w-full overflow-hidden">
                <div className="relative aspect-video">
                  <img
                    src={selectedLocation.imageUrl}
                    alt={selectedLocation.title}
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => setSelectedLocation(null)}
                    className="absolute top-2 right-2 p-2 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <div className="p-6">
                  <h2 className="text-2xl font-bold mb-2">{selectedLocation.title}</h2>
                  <p className="text-gray-600 mb-4">{selectedLocation.description}</p>
                  <p className="text-sm text-gray-500">Artist: {selectedLocation.artist}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}