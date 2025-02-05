import React, { useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { PlusCircle, Pencil, Trash2, AlertCircle, Upload, X } from 'lucide-react';
import { getArtLocations, createArtLocation, updateArtLocation, deleteArtLocation, uploadImage } from '../../lib/firebase-admin';
import type { ArtLocation } from '../../types';

const DEFAULT_MAP_URL = 'https://images.unsplash.com/photo-1524813686514-a57563d77965?w=1200&auto=format&fit=crop&q=80';

interface LocationFormData {
  title: string;
  description: string;
  artist: string;
  coordinates: {
    x: number;
    y: number;
  };
}

export default function AdminMap() {
  const [locations, setLocations] = useState<ArtLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<ArtLocation | null>(null);
  const [formData, setFormData] = useState<LocationFormData>({
    title: '',
    description: '',
    artist: '',
    coordinates: { x: 0, y: 0 }
  });
  const [artworkImage, setArtworkImage] = useState<File | null>(null);
  const [mapImage, setMapImage] = useState<File | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [placingMarker, setPlacingMarker] = useState(false);

  const { getRootProps: getArtworkProps, getInputProps: getArtworkInputProps } = useDropzone({
    accept: { 'image/*': [] },
    maxFiles: 1,
    onDrop: (acceptedFiles) => setArtworkImage(acceptedFiles[0])
  });

  const { getRootProps: getMapProps, getInputProps: getMapInputProps } = useDropzone({
    accept: { 'image/*': [] },
    maxFiles: 1,
    onDrop: (acceptedFiles) => setMapImage(acceptedFiles[0])
  });

  const loadLocations = async () => {
    try {
      setLoading(true);
      const data = await getArtLocations();
      setLocations(data);
    } catch (err) {
      setError('Failed to load locations');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLocations();
  }, []);

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!placingMarker) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setFormData(prev => ({
      ...prev,
      coordinates: { x, y }
    }));
    setPlacingMarker(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      let artworkImageUrl = selectedLocation?.imageUrl || '';
      if (artworkImage) {
        artworkImageUrl = await uploadImage(artworkImage, 'artLocations');
      }

      const locationData = {
        ...formData,
        imageUrl: artworkImageUrl,
      };

      if (selectedLocation) {
        await updateArtLocation(selectedLocation.id, locationData);
      } else {
        await createArtLocation(locationData);
      }

      // If map image was uploaded, update it in the map folder
      if (mapImage) {
        await uploadImage(mapImage, 'map', 'current.jpg');
      }

      await loadLocations();
      handleFormClose();
    } catch (err) {
      console.error('Failed to save location:', err);
      setError('Failed to save location');
    } finally {
      setLoading(false);
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setSelectedLocation(null);
    setFormData({
      title: '',
      description: '',
      artist: '',
      coordinates: { x: 0, y: 0 }
    });
    setArtworkImage(null);
    setMapImage(null);
    setPlacingMarker(false);
  };

  const handleEdit = (location: ArtLocation) => {
    setSelectedLocation(location);
    setFormData({
      title: location.title,
      description: location.description,
      artist: location.artist,
      coordinates: location.coordinates
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (deleteConfirm !== id) {
      setDeleteConfirm(id);
      return;
    }

    try {
      setLoading(true);
      await deleteArtLocation(id);
      await loadLocations();
      setDeleteConfirm(null);
    } catch (err) {
      console.error('Failed to delete location:', err);
      setError('Failed to delete location');
    } finally {
      setLoading(false);
    }
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
        <h1 className="text-2xl font-bold">Manage Map</h1>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
        >
          <PlusCircle className="h-5 w-5" />
          <span>Add Location</span>
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 rounded-md flex items-center space-x-2">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">
                {selectedLocation ? 'Edit Location' : 'New Location'}
              </h2>
              <button onClick={handleFormClose} className="text-gray-500 hover:text-gray-700">
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Title
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      value={formData.title}
                      onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      required
                      rows={4}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      value={formData.description}
                      onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Artist
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      value={formData.artist}
                      onChange={e => setFormData(prev => ({ ...prev, artist: e.target.value }))}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Artwork Image
                    </label>
                    <div
                      {...getArtworkProps()}
                      className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-indigo-500 transition-colors cursor-pointer"
                    >
                      <input {...getArtworkInputProps()} />
                      {artworkImage ? (
                        <div className="flex items-center justify-center">
                          <img
                            src={URL.createObjectURL(artworkImage)}
                            alt="Preview"
                            className="max-h-40 rounded"
                          />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setArtworkImage(null);
                            }}
                            className="ml-2 text-red-600 hover:text-red-800"
                          >
                            <X className="h-5 w-5" />
                          </button>
                        </div>
                      ) : selectedLocation?.imageUrl ? (
                        <div className="flex items-center justify-center">
                          <img
                            src={selectedLocation.imageUrl}
                            alt="Current artwork"
                            className="max-h-40 rounded"
                          />
                          <div className="ml-4 text-gray-600">
                            <Upload className="mx-auto h-12 w-12 text-gray-400" />
                            <p>Drop or click to replace image</p>
                          </div>
                        </div>
                      ) : (
                        <div className="text-gray-600">
                          <Upload className="mx-auto h-12 w-12 text-gray-400" />
                          <p>Drop or click to select artwork image</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Map Image
                    </label>
                    <div
                      {...getMapProps()}
                      className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-indigo-500 transition-colors cursor-pointer"
                    >
                      <input {...getMapInputProps()} />
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <p className="text-gray-600">Drop or click to update map image</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location on Map
                    </label>
                    <div className="relative w-full" style={{ paddingBottom: '75%' }}>
                      <div
                        className="absolute inset-0 rounded-lg overflow-hidden cursor-crosshair"
                        onClick={handleMapClick}
                      >
                        <img
                          src={DEFAULT_MAP_URL}
                          alt="Museum Map"
                          className="w-full h-full object-cover"
                        />
                        {formData.coordinates && (
                          <div
                            className="absolute w-6 h-6 transform -translate-x-1/2 -translate-y-1/2 bg-indigo-600 rounded-full border-2 border-white shadow-lg"
                            style={{
                              left: `${formData.coordinates.x}%`,
                              top: `${formData.coordinates.y}%`,
                            }}
                          />
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setPlacingMarker(true)}
                      className="mt-2 text-sm text-indigo-600 hover:text-indigo-700"
                    >
                      Click to place marker
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={handleFormClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                  disabled={loading}
                >
                  {loading ? 'Saving...' : selectedLocation ? 'Update Location' : 'Create Location'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Location
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Artist
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Coordinates
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {locations.map((location) => (
              <tr key={location.id}>
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <img
                      src={location.imageUrl}
                      alt={location.title}
                      className="h-10 w-10 rounded-md object-cover"
                    />
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {location.title}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {location.artist}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  x: {location.coordinates.x.toFixed(1)}%, y: {location.coordinates.y.toFixed(1)}%
                </td>
                <td className="px-6 py-4 text-sm font-medium">
                  <div className="flex space-x-3">
                    <button
                      onClick={() => handleEdit(location)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      <Pencil className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(location.id)}
                      className={`${
                        deleteConfirm === location.id
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
    </div>
  );
}