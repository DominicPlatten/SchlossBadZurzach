import React, { useState, useEffect } from 'react';
import { PlusCircle, Pencil, Trash2, AlertCircle } from 'lucide-react';
import { getArtists, deleteArtist } from '../../lib/firebase-admin';
import ArtistForm from '../../components/admin/ArtistForm';
import type { Artist } from '../../types';

export default function AdminArtists() {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const loadArtists = async () => {
    try {
      setLoading(true);
      const data = await getArtists();
      setArtists(data);
    } catch (err) {
      setError('Failed to load artists');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadArtists();
  }, []);

  const handleEdit = (artist: Artist) => {
    setSelectedArtist(artist);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    // If not confirming this artist, set it for confirmation
    if (deleteConfirm !== id) {
      setDeleteConfirm(id);
      return;
    }

    try {
      setLoading(true);
      await deleteArtist(id);
      await loadArtists();
      setDeleteConfirm(null);
    } catch (err) {
      console.error('Failed to delete artist:', err);
      setError('Failed to delete artist');
    } finally {
      setLoading(false);
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setSelectedArtist(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Manage Artists</h1>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
        >
          <PlusCircle className="h-5 w-5" />
          <span>New Artist</span>
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 rounded-md flex items-center space-x-2">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <p className="text-red-700">{error}</p>
        </div>
      )}

      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Artist
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Bio
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Portfolio
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {artists.map((artist) => (
              <tr key={artist.id}>
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <img
                      src={artist.mainImage}
                      alt={artist.name}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {artist.name}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900 line-clamp-2">
                    {artist.bio}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {artist.portfolio?.length || 0} works
                </td>
                <td className="px-6 py-4 text-sm font-medium">
                  <div className="flex space-x-3">
                    <button
                      onClick={() => handleEdit(artist)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      <Pencil className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(artist.id)}
                      className={`${
                        deleteConfirm === artist.id
                          ? 'text-red-800 bg-red-100 p-1 rounded'
                          : 'text-red-600 hover:text-red-900'
                      }`}
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <ArtistForm
          artist={selectedArtist}
          onClose={handleFormClose}
          onSuccess={() => {
            handleFormClose();
            loadArtists();
          }}
        />
      )}
    </div>
  );
}