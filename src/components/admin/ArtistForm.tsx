import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, AlertCircle, Image as ImageIcon, Plus, Link as LinkIcon, FileText } from 'lucide-react';
import { uploadImage, uploadDocument, createArtist, updateArtist } from '../../lib/firebase-admin';
import type { Artist } from '../../types';

interface ArtistFormProps {
  artist?: Artist | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ArtistForm({ artist, onClose, onSuccess }: ArtistFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mainImage, setMainImage] = useState<File | null>(null);
  const [portfolioFiles, setPortfolioFiles] = useState<Array<{ file: File; title: string; year: string }>>([]);
  const [existingPortfolio, setExistingPortfolio] = useState(artist?.portfolio || []);
  const [salesDocuments, setSalesDocuments] = useState<File[]>([]);
  const [existingSalesDocuments, setExistingSalesDocuments] = useState(
    artist?.documents?.filter(doc => doc.category === 'sales') || []
  );
  const [otherDocuments, setOtherDocuments] = useState<File[]>([]);
  const [existingOtherDocuments, setExistingOtherDocuments] = useState(
    artist?.documents?.filter(doc => doc.category === 'other') || []
  );
  const [formData, setFormData] = useState({
    name: artist?.name || '',
    bio: artist?.bio || '',
    detailedBio: artist?.detailedBio || '',
    website: artist?.website || '',
    socialLinks: artist?.socialLinks || []
  });

  const { getRootProps: getMainImageProps, getInputProps: getMainImageInputProps } = useDropzone({
    accept: { 'image/*': [] },
    maxFiles: 1,
    onDrop: (acceptedFiles) => setMainImage(acceptedFiles[0])
  });

  const { getRootProps: getPortfolioProps, getInputProps: getPortfolioInputProps } = useDropzone({
    accept: { 'image/*': [] },
    onDrop: (acceptedFiles) => {
      const newFiles = acceptedFiles.map(file => ({
        file,
        title: '',
        year: new Date().getFullYear().toString()
      }));
      setPortfolioFiles(prev => [...prev, ...newFiles]);
    }
  });

  const { getRootProps: getSalesDocumentProps, getInputProps: getSalesDocumentInputProps } = useDropzone({
    accept: { 'application/pdf': ['.pdf'] },
    onDrop: (acceptedFiles) => setSalesDocuments(prev => [...prev, ...acceptedFiles])
  });

  const { getRootProps: getOtherDocumentProps, getInputProps: getOtherDocumentInputProps } = useDropzone({
    accept: { 'application/pdf': ['.pdf'] },
    onDrop: (acceptedFiles) => setOtherDocuments(prev => [...prev, ...acceptedFiles])
  });

  const removePortfolioFile = (index: number) => {
    setPortfolioFiles(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingPortfolioItem = (index: number) => {
    setExistingPortfolio(prev => prev.filter((_, i) => i !== index));
  };

  const removeSalesDocument = (index: number) => {
    setSalesDocuments(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingSalesDocument = (index: number) => {
    setExistingSalesDocuments(prev => prev.filter((_, i) => i !== index));
  };

  const removeOtherDocument = (index: number) => {
    setOtherDocuments(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingOtherDocument = (index: number) => {
    setExistingOtherDocuments(prev => prev.filter((_, i) => i !== index));
  };

  const addSocialLink = () => {
    setFormData(prev => ({
      ...prev,
      socialLinks: [...prev.socialLinks, { platform: 'instagram', url: '' }]
    }));
  };

  const removeSocialLink = (index: number) => {
    setFormData(prev => ({
      ...prev,
      socialLinks: prev.socialLinks.filter((_, i) => i !== index)
    }));
  };

  const updateSocialLink = (index: number, field: 'platform' | 'url', value: string) => {
    setFormData(prev => ({
      ...prev,
      socialLinks: prev.socialLinks.map((link, i) => 
        i === index ? { ...link, [field]: value } : link
      )
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let mainImageUrl = artist?.mainImage || '';
      
      if (mainImage) {
        mainImageUrl = await uploadImage(mainImage, 'artists');
      }

      // Upload new portfolio images
      const newPortfolioItems = await Promise.all(
        portfolioFiles.map(async ({ file, title, year }) => {
          const imageUrl = await uploadImage(file, 'artists');
          return { imageUrl, title, year };
        })
      );
      
      // Upload new sales documents
      const newSalesDocuments = await Promise.all(
        salesDocuments.map(async (file) => {
          const url = await uploadDocument(file);
          return {
            title: file.name.replace('.pdf', ''),
            url,
            type: 'pdf' as const,
            category: 'sales' as const
          };
        })
      );

      // Upload new other documents
      const newOtherDocuments = await Promise.all(
        otherDocuments.map(async (file) => {
          const url = await uploadDocument(file);
          return {
            title: file.name.replace('.pdf', ''),
            url,
            type: 'pdf' as const,
            category: 'other' as const
          };
        })
      );

      // Combine existing and new items
      const portfolio = [...existingPortfolio, ...newPortfolioItems];
      const allDocuments = [
        ...existingSalesDocuments,
        ...existingOtherDocuments,
        ...newSalesDocuments,
        ...newOtherDocuments
      ];

      const artistData = {
        ...formData,
        mainImage: mainImageUrl,
        portfolio,
        documents: allDocuments
      };

      if (artist) {
        await updateArtist(artist.id, artistData);
      } else {
        if (!mainImageUrl) {
          throw new Error('Main image is required');
        }
        await createArtist(artistData);
      }

      onSuccess();
    } catch (err) {
      console.error('Failed to save artist:', err);
      setError(err instanceof Error ? err.message : 'Failed to save artist');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">
            {artist ? 'Edit Artist' : 'New Artist'}
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
              Name
            </label>
            <input
              type="text"
              required
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              value={formData.name}
              onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Short Biography
            </label>
            <textarea
              required
              rows={4}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              value={formData.bio}
              onChange={e => setFormData(prev => ({ ...prev, bio: e.target.value }))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Detailed Biography
            </label>
            <textarea
              rows={8}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              value={formData.detailedBio}
              onChange={e => setFormData(prev => ({ ...prev, detailedBio: e.target.value }))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Website
            </label>
            <input
              type="url"
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              value={formData.website}
              onChange={e => setFormData(prev => ({ ...prev, website: e.target.value }))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Social Links
            </label>
            <div className="space-y-4">
              {formData.socialLinks.map((link, index) => (
                <div key={index} className="flex gap-4">
                  <select
                    value={link.platform}
                    onChange={e => updateSocialLink(index, 'platform', e.target.value)}
                    className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  >
                    <option value="instagram">Instagram</option>
                    <option value="twitter">Twitter</option>
                    <option value="facebook">Facebook</option>
                    <option value="linkedin">LinkedIn</option>
                  </select>
                  <input
                    type="url"
                    value={link.url}
                    onChange={e => updateSocialLink(index, 'url', e.target.value)}
                    placeholder="URL"
                    className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => removeSocialLink(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addSocialLink}
                className="flex items-center text-indigo-600 hover:text-indigo-700"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Social Link
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Main Image {!artist && <span className="text-red-500">*</span>}
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
              ) : artist?.mainImage ? (
                <div className="flex items-center justify-center">
                  <img
                    src={artist.mainImage}
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

          {/* Portfolio Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Portfolio Images
            </label>
            <div
              {...getPortfolioProps()}
              className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-indigo-500 transition-colors cursor-pointer"
            >
              <input {...getPortfolioInputProps()} />
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <p className="text-gray-600">Drop or click to add portfolio images</p>
            </div>

            {/* Existing Portfolio */}
            {existingPortfolio.length > 0 && (
              <div className="mt-4 grid grid-cols-2 gap-4">
                {existingPortfolio.map((item, index) => (
                  <div key={index} className="relative bg-gray-50 p-4 rounded-lg">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-48 object-cover rounded mb-2"
                    />
                    <input
                      type="text"
                      placeholder="Title"
                      value={item.title}
                      onChange={(e) => {
                        const newPortfolio = [...existingPortfolio];
                        newPortfolio[index].title = e.target.value;
                        setExistingPortfolio(newPortfolio);
                      }}
                      className="w-full mb-2 rounded-md border-gray-300"
                    />
                    <input
                      type="text"
                      placeholder="Year"
                      value={item.year}
                      onChange={(e) => {
                        const newPortfolio = [...existingPortfolio];
                        newPortfolio[index].year = e.target.value;
                        setExistingPortfolio(newPortfolio);
                      }}
                      className="w-full rounded-md border-gray-300"
                    />
                    <button
                      type="button"
                      onClick={() => removeExistingPortfolioItem(index)}
                      className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* New Portfolio Items */}
            {portfolioFiles.length > 0 && (
              <div className="mt-4 grid grid-cols-2 gap-4">
                {portfolioFiles.map((item, index) => (
                  <div key={index} className="relative bg-gray-50 p-4 rounded-lg">
                    <img
                      src={URL.createObjectURL(item.file)}
                      alt="Preview"
                      className="w-full h-48 object-cover rounded mb-2"
                    />
                    <input
                      type="text"
                      placeholder="Title"
                      value={item.title}
                      onChange={(e) => {
                        const newFiles = [...portfolioFiles];
                        newFiles[index].title = e.target.value;
                        setPortfolioFiles(newFiles);
                      }}
                      className="w-full mb-2 rounded-md border-gray-300"
                    />
                    <input
                      type="text"
                      placeholder="Year"
                      value={item.year}
                      onChange={(e) => {
                        const newFiles = [...portfolioFiles];
                        newFiles[index].year = e.target.value;
                        setPortfolioFiles(newFiles);
                      }}
                      className="w-full rounded-md border-gray-300"
                    />
                    <button
                      type="button"
                      onClick={() => removePortfolioFile(index)}
                      className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sales Documents Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Verkaufsunterlagen
            </label>
            <div
              {...getSalesDocumentProps()}
              className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-indigo-500 transition-colors cursor-pointer"
            >
              <input {...getSalesDocumentInputProps()} />
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <p className="text-gray-600">Drop or click to add sales documents (PDF)</p>
            </div>

            {/* Existing Sales Documents */}
            {existingSalesDocuments.length > 0 && (
              <div className="mt-4 space-y-2">
                {existingSalesDocuments.map((doc, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 text-gray-400 mr-2" />
                      <span>{doc.title}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeExistingSalesDocument(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* New Sales Documents */}
            {salesDocuments.length > 0 && (
              <div className="mt-4 space-y-2">
                {salesDocuments.map((doc, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 text-gray-400 mr-2" />
                      <span>{doc.name}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeSalesDocument(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Other Documents Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Other Documents
            </label>
            <div
              {...getOtherDocumentProps()}
              className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-indigo-500 transition-colors cursor-pointer"
            >
              <input {...getOtherDocumentInputProps()} />
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <p className="text-gray-600">Drop or click to add other documents (PDF)</p>
            </div>

            {/* Existing Other Documents */}
            {existingOtherDocuments.length > 0 && (
              <div className="mt-4 space-y-2">
                {existingOtherDocuments.map((doc, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 text-gray-400 mr-2" />
                      <span>{doc.title}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeExistingOtherDocument(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* New Other Documents */}
            {otherDocuments.length > 0 && (
              <div className="mt-4 space-y-2">
                {otherDocuments.map((doc, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 text-gray-400 mr-2" />
                      <span>{doc.name}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeOtherDocument(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                ))}
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
              {loading ? 'Saving...' : artist ? 'Update Artist' : 'Create Artist'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}