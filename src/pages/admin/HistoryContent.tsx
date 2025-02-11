import React, { useState, useEffect } from 'react';
import { Pencil, PlusCircle, X, AlertCircle } from 'lucide-react';
import { getHistoryContent, createHistoryContent, updateHistoryContent } from '../../lib/firebase-admin';
import type { HistoryContent } from '../../types';

export default function AdminHistoryContent() {
  const [content, setContent] = useState<HistoryContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    mainText: '',
    milestones: [] as { year: number; title: string; description: string; }[]
  });

  const loadContent = async () => {
    try {
      setLoading(true);
      const data = await getHistoryContent();
      setContent(data);
      if (data) {
        setFormData({
          mainText: data.mainText,
          milestones: data.milestones
        });
      }
    } catch (err) {
      console.error('Failed to load history content:', err);
      setError('Failed to load content');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContent();
  }, []);

  const addMilestone = () => {
    setFormData(prev => ({
      ...prev,
      milestones: [
        ...prev.milestones,
        { year: new Date().getFullYear(), title: '', description: '' }
      ]
    }));
  };

  const removeMilestone = (index: number) => {
    setFormData(prev => ({
      ...prev,
      milestones: prev.milestones.filter((_, i) => i !== index)
    }));
  };

  const updateMilestone = (index: number, field: keyof typeof formData.milestones[0], value: string | number) => {
    if (field === 'year') {
      // Ensure we have a valid number for the year
      const yearValue = parseInt(value.toString()) || new Date().getFullYear();
      value = yearValue;
    }
    
    setFormData(prev => ({
      ...prev,
      milestones: prev.milestones.map((milestone, i) => 
        i === index ? { ...milestone, [field]: value } : milestone
      )
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      // Validate milestones
      const validMilestones = formData.milestones.map(milestone => ({
        ...milestone,
        year: milestone.year || new Date().getFullYear() // Ensure year is never NaN
      }));

      const validatedData = {
        ...formData,
        milestones: validMilestones
      };

      if (content) {
        await updateHistoryContent(content.id, validatedData);
      } else {
        await createHistoryContent(validatedData);
      }

      await loadContent();
      setShowForm(false);
    } catch (err) {
      console.error('Failed to save history content:', err);
      setError('Failed to save content. Please make sure you are logged in and have the necessary permissions.');
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
        <h1 className="text-2xl font-bold">Manage History Content</h1>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
        >
          <Pencil className="h-5 w-5" />
          <span>Edit Content</span>
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
              <h2 className="text-2xl font-bold">Edit History Content</h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Main Text
                </label>
                <textarea
                  rows={10}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  value={formData.mainText}
                  onChange={e => setFormData(prev => ({
                    ...prev,
                    mainText: e.target.value
                  }))}
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Milestones
                  </label>
                  <button
                    type="button"
                    onClick={addMilestone}
                    className="flex items-center space-x-2 text-sm text-indigo-600 hover:text-indigo-800"
                  >
                    <PlusCircle className="h-4 w-4" />
                    <span>Add Milestone</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {formData.milestones.map((milestone, index) => (
                    <div key={index} className="flex items-start space-x-4 bg-gray-50 p-4 rounded-lg">
                      <div className="w-32">
                        <label className="block text-xs text-gray-500 mb-1">
                          Year
                        </label>
                        <input
                          type="number"
                          value={milestone.year.toString()}
                          onChange={e => updateMilestone(index, 'year', e.target.value)}
                          min="1"
                          max="9999"
                          className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        />
                      </div>
                      <div className="flex-grow">
                        <label className="block text-xs text-gray-500 mb-1">
                          Title
                        </label>
                        <input
                          type="text"
                          value={milestone.title}
                          onChange={e => updateMilestone(index, 'title', e.target.value)}
                          className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        />
                      </div>
                      <div className="flex-grow">
                        <label className="block text-xs text-gray-500 mb-1">
                          Description
                        </label>
                        <textarea
                          value={milestone.description}
                          onChange={e => updateMilestone(index, 'description', e.target.value)}
                          className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                          rows={2}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeMilestone(index)}
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
                  onClick={() => setShowForm(false)}
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

      {/* Preview Section */}
      <div className="bg-white shadow-sm rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4">Current Content</h2>
        {content ? (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-2">Main Text</h3>
              <div className="bg-gray-50 p-4 rounded-lg whitespace-pre-line">
                {content.mainText}
              </div>
            </div>
            {content.milestones.length > 0 && (
              <div>
                <h3 className="text-lg font-medium mb-2">Milestones</h3>
                <div className="space-y-4">
                  {content.milestones
                    .sort((a, b) => b.year - a.year) // Sort by year descending
                    .map((milestone, index) => (
                      <div key={index} className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-start">
                          <div className="text-xl font-bold text-indigo-600 w-32 flex-shrink-0">
                            {milestone.year}
                          </div>
                          <div>
                            <div className="font-medium">{milestone.title}</div>
                            <div className="text-gray-600">{milestone.description}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <p className="text-gray-500">No content added yet</p>
        )}
      </div>
    </div>
  );
}