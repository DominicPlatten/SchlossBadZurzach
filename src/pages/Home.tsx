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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {featuredExhibition && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Aktuelle Ausstellung</h2>
          <Link to={`/exhibition/${featuredExhibition.id}`} className="block">
            <div className="relative h-[70vh] rounded-lg overflow-hidden group">
              <img
                src={featuredExhibition.mainImage}
                alt={featuredExhibition.title}
                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-8">
                <h1 className="text-4xl font-bold text-white mb-2">{featuredExhibition.title}</h1>
                <p className="text-gray-200 text-lg mb-4">{featuredExhibition.shortDescription}</p>
                <p className="text-gray-300">
                  {new Date(featuredExhibition.startDate).toLocaleDateString()} - {new Date(featuredExhibition.endDate).toLocaleDateString()}
                </p>
              </div>
            </div>
          </Link>
        </div>
      )}

      {regularExhibitions.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Weitere Ausstellungen</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {regularExhibitions.map(exhibition => (
              <ExhibitionTile key={exhibition.id} exhibition={exhibition} />
            ))}
          </div>
        </div>
      )}

      {/* Welcome Section */}
      <div className="prose max-w-none w-full">
        <div className="bg-white w-full">
          <div className="px-4 sm:px-6 lg:px-8"> 
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
  );
}