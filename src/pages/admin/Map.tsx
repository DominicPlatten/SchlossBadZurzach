import React, { useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { PlusCircle, Pencil, Trash2, AlertCircle, Upload, X, ChevronDown, Check, FileText } from 'lucide-react';
import { getArtLocations, createArtLocation, updateArtLocation, deleteArtLocation, uploadImage, uploadDocument, getArtists, getMapContent, updateMapContent, createMapContent } from '../../lib/firebase-admin';
import type { ArtLocation, Artist, MapContent } from '../../types';

const MAP_URL = 'https://raw.githubusercontent.com/dominicplatten/SchlossBadZurzach/main/map.png';

interface LocationFormData {
  title: string;
  description: string;
  artistId: string;
  coordinates: {
    x: number;
    y: number;
  };
  documentTitle?: string;
}

export default function AdminMap() {
  const [locations, setLocations] = useState<ArtLocation[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<ArtLocation | null>(null);
  const [showArtistDropdown, setShowArtistDropdown] = useState(false);
  const [formData, setFormData] = useState<LocationFormData>({
    title: '',
    description: '',
    artistId: '',
    coordinates: { x: 0, y: 0 }
  });
  const [artworkImage, setArtworkImage] = useState<File | null>(null);
  const [document, setDocument] = useState<File | null>(null);
  const [mapImage, setMapImage] = useState<File | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [placingMarker, setPlacingMarker] = useState(false);
  const [mapContent, setMapContent] = useState<MapContent | null>(null);
  const [showMapContentForm, setShowMapContentForm] = useState(false);
  const [mapContentFormData, setMapContentFormData] = useState({
    parkDescription: '',
    legend: [] as Array<{ number: number; title: string; artistId: string; }>
  });

  const { getRootProps: getArtworkProps, getInputProps: getArtworkInputProps } = useDropzone({
    accept: { 'image/*': [] },
    maxFiles: 1,
    onDrop: (acceptedFiles) => setArtworkImage(acceptedFiles[0])
  });

  const { getRootProps: getDocumentProps, getInputProps: getDocumentInputProps } = useDropzone({
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
    onDrop: (acceptedFiles) => setDocument(acceptedFiles[0])
  });

  const { getRootProps: getMapProps, getInputProps: getMapInputProps } = useDropzone({
    accept: { 'image/*': [] },
    maxFiles: 1,
    onDrop: (acceptedFiles) => setMapImage(acceptedFiles[0])
  });

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [locationsData, artistsData, mapContentData] = await Promise.all([
        getArtLocations(),
        getArtists(),
        getMapContent()
      ]);
      setLocations(locationsData);
      setArtists(artistsData);
      setMapContent(mapContentData);
      if (mapContentData) {
        setMapContentFormData({
          parkDescription: mapContentData.parkDescription,
          legend: mapContentData.legend
        });
      }
    } catch (err) {
      console.error('Failed to load data:', err);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
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

      if (!formData.artistId) {
        setError('Please select an artist');
        return;
      }

      let artworkImageUrl = selectedLocation?.imageUrl || '';
      if (artworkImage) {
        artworkImageUrl = await uploadImage(artworkImage, 'artLocations');
      }

      let documentUrl = selectedLocation?.documentUrl;
      if (document) {
        documentUrl = await uploadDocument(document);
      }

      const locationData = {
        ...formData,
        imageUrl: artworkImageUrl,
        documentUrl,
        documentTitle: formData.documentTitle
      };

      if (selectedLocation) {
        await updateArtLocation(selectedLocation.id, locationData);
      } else {
        await createArtLocation(locationData);
      }

      if (mapImage) {
        await uploadImage(mapImage, 'map', 'current.jpg');
      }

      await loadData();
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
      artistId: '',
      coordinates: { x: 0, y: 0 }
    });
    setArtworkImage(null);
    setDocument(null);
    setMapImage(null);
    setPlacingMarker(false);
    setShowArtistDropdown(false);
  };

  const handleEdit = (location: ArtLocation) => {
    setSelectedLocation(location);
    setFormData({
      title: location.title,
      description: location.description,
      artistId: location.artistId,
      coordinates: location.coordinates,
      documentTitle: location.documentTitle
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
      await loadData();
      setDeleteConfirm(null);
    } catch (err) {
      console.error('Failed to delete location:', err);
      setError('Failed to delete location');
    } finally {
      setLoading(false);
    }
  };

  const getArtistName = (artistId: string) => {
    const artist = artists.find(a => a.id === artistId);
    return artist ? artist.name : 'Unknown Artist';
  };

  const handleMapContentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      if (mapContent) {
        await updateMapContent(mapContent.id, mapContentFormData);
      } else {
        await createMapContent(mapContentFormData);
      }

      await loadData();
      setShowMapContentForm(false);
    } catch (err) {
      console.error('Failed to save map content:', err);
      setError('Failed to save map content');
    } finally {
      setLoading(false);
    }
  };

  const addLegendItem = () => {
    setMapContentFormData(prev => ({
      ...prev,
      legend: [
        ...prev.legend,
        {
          number: prev.legend.length + 1,
          title: '',
          artistId: ''
        }
      ]
    }));
  };

  const removeLegendItem = (index: number) => {
    setMapContentFormData(prev => ({
      ...prev,
      legend: prev.legend.filter((_, i) => i !== index)
    }));
  };

  const updateLegendItem = (index: number, field: 'title' | 'artistId', value: string) => {
    setMapContentFormData(prev => ({
      ...prev,
      legend: prev.legend.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
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
                    <div className="relative">
                      <button
                        type="button"
                        className="w-full bg-white border border-gray-300 rounded-md shadow-sm px-4 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                        onClick={() => setShowArtistDropdown(!showArtistDropdown)}
                      >
                        <div className="flex items-center justify-between">
                          <span className="block truncate">
                            {formData.artistId ? getArtistName(formData.artistId) : 'Select an artist'}
                          </span>
                          <ChevronDown className="h-5 w-5 text-gray-400" />
                        </div>
                      </button>

                      {showArtistDropdown && (
                        <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                          {artists.map((artist) => (
                            <div
                              key={artist.id}
                              className={`
                                cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-indigo-50
                                ${formData.artistId === artist.id ? 'bg-indigo-50' : ''}
                              `}
                              onClick={() => {
                                setFormData(prev => ({ ...prev, artistId: artist.id }));
                                setShowArtistDropdown(false);
                              }}
                            >
                              <div className="flex items-center">
                                <img
                                  src={artist.mainImage}
                                  alt={artist.name}
                                  className="h-8 w-8 rounded-full object-cover"
                                />
                                <span className="ml-3 block truncate font-medium">
                                  {artist.name}
                                </span>
                              </div>
                              {formData.artistId === artist.id && (
                                <span className="absolute inset-y-0 right-0 flex items-center pr-4">
                                  <Check className="h-5 w-5 text-indigo-600" />
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
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

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Document (PDF)
                    </label>
                    <div
                      {...getDocumentProps()}
                      className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-indigo-500 transition-colors cursor-pointer"
                    >
                      <input {...getDocumentInputProps()} />
                      {document ? (
                        <div className="flex items-center justify-center">
                          <FileText className="h-12 w-12 text-gray-400" />
                          <span className="ml-2">{document.name}</span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDocument(null);
                            }}
                            className="ml-2 text-red-600 hover:text-red-800"
                          >
                            <X className="h-5 w-5" />
                          </button>
                        </div>
                      ) : selectedLocation?.documentUrl ? (
                        <div className="flex items-center justify-center">
                          <FileText className="h-12 w-12 text-gray-400" />
                          <span className="ml-2">Current document</span>
                          <div className="ml-4 text-gray-600">
                            <Upload className="mx-auto h-12 w-12 text-gray-400" />
                            <p>Drop or click to replace document</p>
                          </div>
                        </div>
                      ) : (
                        <div className="text-gray-600">
                          <Upload className="mx-auto h-12 w-12 text-gray-400" />
                          <p>Drop or click to select PDF document</p>
                        </div>
                      )}
                    </div>
                    {(document || selectedLocation?.documentUrl) && (
                      <div className="mt-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Document Title
                        </label>
                        <input
                          type="text"
                          className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                          value={formData.documentTitle || ''}
                          onChange={e => setFormData(prev => ({ ...prev, documentTitle: e.target.value }))}
                          placeholder="Enter document title"
                        />
                      </div>
                    )}
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
                          src={MAP_URL}
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
                  {getArtistName(location.artistId)}
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

      <div className="mt-12">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold">Map Content</h2>
          <button
            onClick={() => setShowMapContentForm(true)}
            className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
          >
            <Pencil className="h-5 w-5" />
            <span>Edit Content</span>
          </button>
        </div>

        {showMapContentForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Edit Map Content</h2>
                <button
                  onClick={() => setShowMapContentForm(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleMapContentSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Park Description
                  </label>
                  <textarea
                    rows={10}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    value={mapContentFormData.parkDescription}
                    onChange={e => setMapContentFormData(prev => ({
                      ...prev,
                      parkDescription: e.target.value
                    }))}
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-4">
                    <label className="block text-sm font-medium text-gray-700">
                      Legend
                    </label>
                    <button
                      type="button"
                      onClick={addLegendItem}
                      className="flex items-center space-x-2 text-sm text-indigo-600 hover:text-indigo-800"
                    >
                      <PlusCircle className="h-4 w-4" />
                      <span>Add Item</span>
                    </button>
                  </div>

                  <div className="space-y-4">
                    {mapContentFormData.legend.map((item, index) => (
                      <div key={index} className="flex items-start space-x-4">
                        <div className="w-16">
                          <label className="block text-xs text-gray-500 mb-1">
                            Number
                          </label>
                          <input
                            type="number"
                            value={item.number}
                            onChange={e => updateLegendItem(index, 'title', e.target.value)}
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                          />
                        </div>
                        <div className="flex-grow">
                          <label className="block text-xs text-gray-500 mb-1">
                            Title
                          </label>
                          <input
                            type="text"
                            value={item.title}
                            onChange={e => updateLegendItem(index, 'title', e.target.value)}
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                          />
                        </div>
                        <div className="w-64">
                          <label className="block text-xs text-gray-500 mb-1">
                            Artist
                          </label>
                          <select
                            value={item.artistId}
                            onChange={e => updateLegendItem(index, 'artistId', e.target.value)}
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                          >
                            <option value="">Select Artist</option>
                            {artists.map(artist => (
                              <option key={artist.id} value={artist.id}>
                                {artist.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeLegendItem(index)}
                          className="mt-6 text-red-600 hover:text-red-800"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => setShowMapContentForm(false)}
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
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}