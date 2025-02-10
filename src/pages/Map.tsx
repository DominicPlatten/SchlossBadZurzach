import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getArtLocations, getArtists, getMapUrl, getMapContent } from '../lib/firebase-admin';
import { Loader2, X, WifiOff, RefreshCw, Info, MapPin, Clock, Phone, Mail, Car, Train } from 'lucide-react';
import type { ArtLocation, Artist, MapContent } from '../types';

export default function Map() {
  const [locations, setLocations] = useState<ArtLocation[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [mapUrl, setMapUrl] = useState<string | null>(null);
  const [mapContent, setMapContent] = useState<MapContent | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<ArtLocation | null>(null);
  const [showInfo, setShowInfo] = useState(false);
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

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [locationsData, artistsData, mapUrlData, mapContentData] = await Promise.all([
        getArtLocations(),
        getArtists(),
        getMapUrl(),
        getMapContent()
      ]);
      setLocations(locationsData);
      setArtists(artistsData);
      setMapUrl(mapUrlData);
      setMapContent(mapContentData);
    } catch (err) {
      console.error('Failed to load data:', err);
      setError(
        !navigator.onLine
          ? 'You are currently offline. Please check your internet connection and try again.'
          : 'Failed to load data. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getArtist = (artistId: string) => {
    return artists.find(a => a.id === artistId);
  };

  const handleShowOnMap = () => {
    window.open('https://maps.google.com/?q=47.5889,8.2944', '_blank');
  };

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
            onClick={loadData}
            className="mt-4 inline-flex items-center space-x-2 text-sm font-medium text-red-700 hover:text-red-800"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Try again</span>
          </button>
        </div>
      ) : (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Park Himmelrych</h1>
            <button
              onClick={() => setShowInfo(!showInfo)}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              <Info className="h-5 w-5" />
              <span>{showInfo ? 'Hide Information' : 'Show Information'}</span>
            </button>
          </div>

          {showInfo && (
            <div className="mb-8 bg-white rounded-lg shadow-lg p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h2 className="text-xl font-semibold mb-4">Visitor Information</h2>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <Clock className="h-5 w-5 text-indigo-600 mt-1" />
                      <div>
                        <h3 className="font-medium">Opening Hours</h3>
                        <p className="text-gray-600">Daily from 10:00 until dusk</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <MapPin className="h-5 w-5 text-indigo-600 mt-1" />
                      <div>
                        <h3 className="font-medium">Location</h3>
                        <p className="text-gray-600">Park Himmelrych</p>
                        <button
                          onClick={handleShowOnMap}
                          className="text-indigo-600 hover:text-indigo-800 text-sm mt-1"
                        >
                          Show on map
                        </button>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <Car className="h-5 w-5 text-indigo-600 mt-1" />
                      <div>
                        <h3 className="font-medium">Parking</h3>
                        <p className="text-gray-600">Available on site</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <Train className="h-5 w-5 text-indigo-600 mt-1" />
                      <div>
                        <h3 className="font-medium">Public Transport</h3>
                        <p className="text-gray-600">Direct access from Bad Zurzach train station</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <h2 className="text-xl font-semibold mb-4">Contact</h2>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <Mail className="h-5 w-5 text-indigo-600 mt-1" />
                      <div>
                        <h3 className="font-medium">Email</h3>
                        <a 
                          href="mailto:info@parkhimmelrych.ch" 
                          className="text-indigo-600 hover:text-indigo-800"
                        >
                          info@parkhimmelrych.ch
                        </a>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <Phone className="h-5 w-5 text-indigo-600 mt-1" />
                      <div>
                        <h3 className="font-medium">Phone</h3>
                        <a 
                          href="tel:+41792542376" 
                          className="text-indigo-600 hover:text-indigo-800"
                        >
                          079 254 23 76
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="relative">
            <div className="relative w-full" style={{ paddingBottom: '75%' }}>
              <div className="absolute inset-0 rounded-lg overflow-hidden">
                {mapUrl ? (
                  <img
                    src={mapUrl}
                    alt="Museum Map"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100">
                    <p className="text-gray-500">Map not available</p>
                  </div>
                )}
                
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

            {/* Park Description */}
            {mapContent?.parkDescription && (
              <div className="mt-8 prose max-w-none">
                <div className="whitespace-pre-line text-gray-700">
                  {mapContent.parkDescription}
                </div>
              </div>
            )}

            {/* Legend */}
            {mapContent?.legend && mapContent.legend.length > 0 && (
              <div className="mt-8">
                <h2 className="text-2xl font-bold mb-4">Legende</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {mapContent.legend.map((item) => {
                    const artist = getArtist(item.artistId);
                    return (
                      <div key={item.number} className="flex items-start space-x-2">
                        <span className="font-bold text-gray-700">{item.number}.</span>
                        <div>
                          <p className="text-gray-900">{item.title}</p>
                          {artist && (
                            <Link
                              to={`/artist/${artist.id}`}
                              className="text-sm text-indigo-600 hover:text-indigo-800"
                            >
                              {artist.name}
                            </Link>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
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
                  {selectedLocation.artistId && (
                    <div className="flex items-center">
                      {getArtist(selectedLocation.artistId) && (
                        <Link 
                          to={`/artist/${selectedLocation.artistId}`}
                          className="flex items-center space-x-3 text-indigo-600 hover:text-indigo-800"
                        >
                          <img
                            src={getArtist(selectedLocation.artistId)!.mainImage}
                            alt={getArtist(selectedLocation.artistId)!.name}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                          <span className="font-medium">
                            {getArtist(selectedLocation.artistId)!.name}
                          </span>
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}