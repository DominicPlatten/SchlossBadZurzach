import React, { useState, useEffect } from 'react';
import { PlusCircle, Pencil, Trash2, AlertCircle } from 'lucide-react';
import { getExhibitions, deleteExhibition } from '../../lib/firebase-admin';
import ExhibitionForm from '../../components/admin/ExhibitionForm';
import type { Exhibition } from '../../types';

export default function AdminExhibitions() {
  const [exhibitions, setExhibitions] = useState<Exhibition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedExhibition, setSelectedExhibition] = useState<Exhibition | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const loadExhibitions = async () => {
    try {
      setLoading(true);
      const data = await getExhibitions();
      setExhibitions(data);
    } catch (err) {
      setError('Failed to load exhibitions');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExhibitions();
  }, []);

  const handleEdit = (exhibition: Exhibition) => {
    setSelectedExhibition(exhibition);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    // If not confirming this exhibition, set it for confirmation
    if (deleteConfirm !== id) {
      setDeleteConfirm(id);
      return;
    }

    try {
      setLoading(true);
      await deleteExhibition(id);
      await loadExhibitions();
      setDeleteConfirm(null);
    } catch (err) {
      console.error('Failed to delete exhibition:', err);
      setError('Failed to delete exhibition');
    } finally {
      setLoading(false);
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setSelectedExhibition(null);
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
        <h1 className="text-2xl font-bold">Manage Exhibitions</h1>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
        >
          <PlusCircle className="h-5 w-5" />
          <span>New Exhibition</span>
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-md flex items-center space-x-2">
          <AlertCircle className="h-5 w-5" />
          <p>{error}</p>
        </div>
      )}

      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Exhibition
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Dates
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Featured
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {exhibitions.map((exhibition) => (
              <tr key={exhibition.id}>
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <img
                      src={exhibition.mainImage}
                      alt={exhibition.title}
                      className="h-10 w-10 rounded-md object-cover"
                    />
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {exhibition.title}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {new Date(exhibition.startDate).toLocaleDateString()} - {new Date(exhibition.endDate).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {exhibition.isFeatured ? 'Yes' : 'No'}
                </td>
                <td className="px-6 py-4 text-sm font-medium">
                  <div className="flex space-x-3">
                    <button
                      onClick={() => handleEdit(exhibition)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      <Pencil className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(exhibition.id)}
                      className={`${
                        deleteConfirm === exhibition.id
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
        <ExhibitionForm
          exhibition={selectedExhibition}
          onClose={handleFormClose}
          onSuccess={() => {
            handleFormClose();
            loadExhibitions();
          }}
        />
      )}
    </div>
  );
}