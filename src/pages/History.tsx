import React, { useState, useEffect } from 'react';
import { getHistoryContent } from '../lib/firebase-admin';
import { Loader2, WifiOff, RefreshCw } from 'lucide-react';
import type { HistoryContent } from '../types';

export default function History() {
  const [content, setContent] = useState<HistoryContent | null>(null);
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

  const loadContent = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getHistoryContent();
      setContent(data);
    } catch (err) {
      console.error('Failed to load history content:', err);
      setError(
        !navigator.onLine
          ? 'You are currently offline. Please check your internet connection and try again.'
          : 'Failed to load content. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContent();
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
            onClick={loadContent}
            className="mt-4 inline-flex items-center space-x-2 text-sm font-medium text-red-700 hover:text-red-800"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Try again</span>
          </button>
        </div>
      ) : (
        <div>
          <h1 className="text-3xl font-bold mb-8">Geschichte</h1>
          
          {/* Main Text Section */}
          {content?.mainText && (
            <div className="prose max-w-none mb-12">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="max-w-3xl mx-auto">
                  <div className="text-gray-700 whitespace-pre-line">
                    {content.mainText}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Milestones Section */}
          {content?.milestones && content.milestones.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Meilensteine</h2>
              <div className="space-y-6">
                {content.milestones
                  .sort((a, b) => b.year - a.year) // Sort by year descending
                  .map((milestone, index) => (
                    <div key={index} className="bg-white rounded-lg shadow-sm p-6">
                      <div className="max-w-3xl mx-auto">
                        <div className="flex items-start">
                          <div className="text-3xl font-bold text-indigo-600 w-32 flex-shrink-0">
                            {milestone.year}
                          </div>
                          <div>
                            <h3 className="text-xl font-semibold mb-3">{milestone.title}</h3>
                            <p className="text-gray-600">{milestone.description}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}