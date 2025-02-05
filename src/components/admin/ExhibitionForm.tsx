import React, { useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, AlertCircle, Image as ImageIcon, ChevronDown, Check } from 'lucide-react';
import { uploadImage, createExhibition, updateExhibition, getArtists } from '../../lib/firebase-admin';
import type { Exhibition, Artist } from '../../types';

interface ExhibitionFormProps {
  exhibition?: Exhibition | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ExhibitionForm({ exhibition, onClose, onSuccess }: ExhibitionFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mainImage, setMainImage] = useState<File | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [existingGallery, setExistingGallery] = useState<string[]>(exhibition?.gallery || []);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [showArtistDropdown, setShowArtistDropdown] = useState(false);
  const [formData, setFormData] = useState({
    title: exhibition?.title || '',
    description: exhibition?.description || '',
    shortDescription: exhibition?.shortDescription || '',
    startDate: exhibition?.startDate || '',
    endDate: exhibition?.endDate || '',
    artistIds: exhibition?.artistIds || [],
    isFeatured: exhibition?.isFeatured || false,
    visitorInfo: {
      hours: exhibition?.visitorInfo?.hours || '',
      ticketInfo: exhibition?.visitorInfo?.ticketInfo || '',
      location: exhibition?.visitorInfo?.location || ''
    }
  });

  useEffect(() => {
    const loadArtists = async () => {
      try {
        const artistsData = await getArtists();
        setArtists(artistsData);
      } catch (err) {
        console.error('Failed to load artists:', err);
        setError('Failed to load artists');
      }
    };

    loadArtists();
  }, []);

  const { getRootProps: getMainImageProps, getInputProps: getMainImageInputProps } = useDropzone({
    accept: { 'image/*': [] },
    maxFiles: 1,
    onDrop: (acceptedFiles) => setMainImage(acceptedFiles[0])
  });

  const { getRootProps: getGalleryProps, getInputProps: getGalleryInputProps } = useDropzone({
    accept: { 'image/*': [] },
    onDrop: (acceptedFiles) => setGalleryFiles(prev => [...prev, ...acceptedFiles])
  });

  const removeGalleryImage = (index: number) => {
    setGalleryFiles(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingGalleryImage = (index: number) => {
    setExistingGallery(prev => prev.filter((_, i) => i !== index));
  };

  const toggleArtist = (artistId: string) => {
    setFormData(prev => ({
      ...prev,
      artistIds: prev.artistIds.includes(artistId)
        ? prev.artistIds.filter(id => id !== artistId)
        : [...prev.artistIds, artistId]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let mainImageUrl = exhibition?.mainImage || '';
      
      // Upload main image if changed
      if (mainImage) {
        mainImageUrl = await uploadImage(mainImage, 'exhibitions');
      }

      // Upload new gallery images
      const newGalleryUrls = await Promise.all(galleryFiles.map(file => uploadImage(file, 'exhibitions')));
      
      // Combine existing and new gallery images
      const galleryUrls = [...existingGallery, ...newGalleryUrls];

      const exhibitionData = {
        ...formData,
        mainImage: mainImageUrl,
        gallery: galleryUrls
      };

      if (exhibition) {
        await updateExhibition(exhibition.id, exhibitionData);
      } else {
        if (!mainImageUrl) {
          throw new Error('Main image is required');
        }
        await createExhibition(exhibitionData);
      }

      onSuccess();
    } catch (err) {
      console.error('Failed to save exhibition:', err);
      setError(err instanceof Error ? err.message : 'Failed to save exhibition');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">
            {exhibition ? 'Edit Exhibition' : 'New Exhibition'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-6 w-6" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 rounded-md flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
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
              Short Description
            </label>
            <textarea
              required
              rows={2}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              value={formData.shortDescription}
              onChange={e => setFormData(prev => ({ ...prev, shortDescription: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                required
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                value={formData.startDate}
                onChange={e => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                required
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                value={formData.endDate}
                onChange={e => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Artists
            </label>
            <div className="relative">
              <button
                type="button"
                className="w-full bg-white border border-gray-300 rounded-md shadow-sm px-4 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                onClick={() => setShowArtistDropdown(!showArtistDropdown)}
              >
                <div className="flex items-center justify-between">
                  <span className="block truncate">
                    {formData.artistIds.length > 0
                      ? `${formData.artistIds.length} artist${formData.artistIds.length > 1 ? 's' : ''} selected`
                      : 'Select artists'}
                  </span>
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                </div>
              </button>

              {showArtistDropdown && (
                <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                  {artists.length > 0 ? (
                    artists.map((artist) => (
                      <div
                        key={artist.id}
                        className={`
                          cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-indigo-50
                          ${formData.artistIds.includes(artist.id) ? 'bg-indigo-50' : ''}
                        `}
                        onClick={() => toggleArtist(artist.id)}
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
                        {formData.artistIds.includes(artist.id) && (
                          <span className="absolute inset-y-0 right-0 flex items-center pr-4">
                            <Check className="h-5 w-5 text-indigo-600" />
                          </span>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="relative cursor-default select-none py-2 px-4 text-gray-700">
                      No artists found
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                checked={formData.isFeatured}
                onChange={e => setFormData(prev => ({ ...prev, isFeatured: e.target.checked }))}
              />
              <span className="text-sm font-medium text-gray-700">Featured Exhibition</span>
            </label>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Visitor Information</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hours
              </label>
              <input
                type="text"
                required
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                value={formData.visitorInfo.hours}
                onChange={e => setFormData(prev => ({
                  ...prev,
                  visitorInfo: { ...prev.visitorInfo, hours: e.target.value }
                }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ticket Information
              </label>
              <input
                type="text"
                required
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                value={formData.visitorInfo.ticketInfo}
                onChange={e => setFormData(prev => ({
                  ...prev,
                  visitorInfo: { ...prev.visitorInfo, ticketInfo: e.target.value }
                }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <input
                type="text"
                required
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                value={formData.visitorInfo.location}
                onChange={e => setFormData(prev => ({
                  ...prev,
                  visitorInfo: { ...prev.visitorInfo, location: e.target.value }
                }))}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Main Image {!exhibition && <span className="text-red-500">*</span>}
            </label>
            <div
              {...getMainImageProps()}
              className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-indigo-500 transition-colors cursor-pointer"
            >
              <input {...getMainImageInputProps()} />
              {mainImage ? (
                <div className="flex items-center justify-center">
                  <img
                    src={URL.createObjectURL(mainImage)}
                    alt="Preview"
                    className="max-h-40 rounded"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setMainImage(null);
                    }}
                    className="ml-2 text-red-600 hover:text-red-800"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              ) : exhibition?.mainImage ? (
                <div className="flex items-center justify-center">
                  <img
                    src={exhibition.mainImage}
                    alt="Current main image"
                    className="max-h-40 rounded"
                  />
                  <div className="ml-4 text-gray-600">
                    <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <p>Drop or click to replace main image</p>
                  </div>
                </div>
              ) : (
                <div className="text-gray-600">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <p>Drop or click to select main image</p>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Gallery Images
            </label>
            <div
              {...getGalleryProps()}
              className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-indigo-500 transition-colors cursor-pointer"
            >
              <input {...getGalleryInputProps()} />
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <p className="text-gray-600">Drop or click to add gallery images</p>
            </div>

            {/* Existing Gallery Images */}
            {existingGallery.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Current Gallery Images</h4>
                <div className="grid grid-cols-4 gap-4">
                  {existingGallery.map((imageUrl, index) => (
                    <div key={index} className="relative">
                      <img
                        src={imageUrl}
                        alt={`Gallery ${index + 1}`}
                        className="w-full h-24 object-cover rounded"
                      />
                      <button
                        type="button"
                        onClick={() => removeExistingGalleryImage(index)}
                        className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* New Gallery Images */}
            {galleryFiles.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">New Gallery Images</h4>
                <div className="grid grid-cols-4 gap-4">
                  {galleryFiles.map((file, index) => (
                    <div key={index} className="relative">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`New gallery ${index + 1}`}
                        className="w-full h-24 object-cover rounded"
                      />
                      <button
                        type="button"
                        onClick={() => removeGalleryImage(index)}
                        className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
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
              {loading ? 'Saving...' : exhibition ? 'Update Exhibition' : 'Create Exhibition'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}