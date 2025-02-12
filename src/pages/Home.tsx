import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getExhibitions, getFeaturedExhibition } from '../lib/firebase-admin';
import ExhibitionTile from '../components/ExhibitionTile';
import type { Exhibition } from '../types';
import { Loader2, MapPin } from 'lucide-react';

export default function Home() {
  const [featuredExhibition, setFeaturedExhibition] = useState<Exhibition | null>(null);
  const [regularExhibitions, setRegularExhibitions] = useState<Exhibition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadExhibitions = async () => {
      try {
        setLoading(true);
        const [featured, allExhibitions] = await Promise.all([
          getFeaturedExhibition(),
          getExhibitions()
        ]);
        
        setFeaturedExhibition(featured);
        setRegularExhibitions(allExhibitions.filter(ex => !ex.isFeatured));
      } catch (err) {
        console.error('Failed to load exhibitions:', err);
        setError('Failed to load exhibitions');
      } finally {
        setLoading(false);
      }
    };

    loadExhibitions();
  }, []);

  const handleShowOnMap = () => {
    window.open('https://maps.google.com/?q=47.5889,8.2944', '_blank');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 text-red-700 p-4 rounded-md">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div>
      {featuredExhibition && (
        <Link to={`/exhibition/${featuredExhibition.id}`} className="block mb-12">
          <div className="relative h-[85vh] overflow-hidden">
            <div className="absolute inset-0 group">
              <img
                src={featuredExhibition.mainImage}
                alt={featuredExhibition.title}
                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
            </div>
            <div className="absolute bottom-0 left-0 right-0">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="max-w-3xl">
                  <h1 className="text-5xl font-bold text-white mb-4">{featuredExhibition.title}</h1>
                  <p className="text-xl text-gray-200 mb-6">{featuredExhibition.shortDescription}</p>
                  <p className="text-lg text-gray-300">
                    {new Date(featuredExhibition.startDate).toLocaleDateString()} - {new Date(featuredExhibition.endDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Link>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {regularExhibitions.length > 0 && (
          <div className="mb-12 flex flex-col items-center">
            {/* Title now shares the same width as tiles */}
            <h2 className="text-2xl font-bold mb-6 w-full lg:w-2/3">Ausstellungen</h2>

            {/* Exhibition tiles aligned properly */}
            <div className="space-y-10 w-full lg:w-2/3">
              {regularExhibitions.map(exhibition => (
                <ExhibitionTile key={exhibition.id} exhibition={exhibition} />
              ))}
            </div>
          </div>
        )}

        {/* Welcome Section */}
        <div className="prose max-w-none">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="max-w-3xl mx-auto">
              <div className="text-gray-700 space-y-6 whitespace-pre-line">
                {`Lassen Sie sich von der einzigartigen Atmosphäre im Park Himmelrych verzaubern.

Entdecken Sie die Skulpturenausstellung „Aufatmen im Park" und geniessen Sie inspirierende Kunst in der Natur. 

Erleben Sie eine Hauch von Naturspiritualität und tanken Sie Energie.

Der Park Himmelrych ist öffentlich zugänglich und der Eintritt ist frei, damit Sie ein rundum entspanntes Erlebnis geniessen können.
`}
              </div>

              <button
                onClick={handleShowOnMap}
                className="mt-8 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <MapPin className="h-5 w-5 mr-2" />
                Google Maps
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}