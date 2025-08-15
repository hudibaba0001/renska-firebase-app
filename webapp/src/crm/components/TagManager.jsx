import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X } from 'lucide-react';
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/init';

const TagManager = ({ companyId, onTagsUpdate }) => {
  const [tags, setTags] = useState([]);
  const [newTag, setNewTag] = useState('');
  const [editingTag, setEditingTag] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTags();
  }, [companyId]);

  const loadTags = async () => {
    try {
      setLoading(true);
      const tagsSnapshot = await getDocs(collection(db, `companies/${companyId}/tags`));
      const tagsData = tagsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTags(tagsData);
    } catch (error) {
      console.error('Error loading tags:', error);
    } finally {
      setLoading(false);
    }
  };

  const addTag = async () => {
    if (!newTag.trim()) return;

    try {
      const tagData = {
        name: newTag.trim(),
        createdAt: new Date(),
        usageCount: 0
      };

      await addDoc(collection(db, `companies/${companyId}/tags`), tagData);
      setNewTag('');
      loadTags();
      if (onTagsUpdate) onTagsUpdate();
    } catch (error) {
      console.error('Error adding tag:', error);
    }
  };

  const updateTag = async (tagId) => {
    if (!editValue.trim()) return;

    try {
      const tagRef = doc(db, `companies/${companyId}/tags`, tagId);
      await updateDoc(tagRef, {
        name: editValue.trim(),
        updatedAt: new Date()
      });
      setEditingTag(null);
      setEditValue('');
      loadTags();
      if (onTagsUpdate) onTagsUpdate();
    } catch (error) {
      console.error('Error updating tag:', error);
    }
  };

  const deleteTag = async (tagId) => {
    if (!confirm('Är du säker på att du vill ta bort denna tagg?')) return;

    try {
      await deleteDoc(doc(db, `companies/${companyId}/tags`, tagId));
      loadTags();
      if (onTagsUpdate) onTagsUpdate();
    } catch (error) {
      console.error('Error deleting tag:', error);
    }
  };

  const startEditing = (tag) => {
    setEditingTag(tag.id);
    setEditValue(tag.name);
  };

  const cancelEditing = () => {
    setEditingTag(null);
    setEditValue('');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Laddar taggar...</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Hantera Kundtaggar</h3>
        <p className="text-sm text-gray-500">Skapa och hantera anpassade taggar för kunder</p>
      </div>

      {/* Add New Tag */}
      <div className="mb-6">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            placeholder="Skriv en ny tagg..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            onKeyPress={(e) => e.key === 'Enter' && addTag()}
          />
          <button
            onClick={addTag}
            disabled={!newTag.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center"
          >
            <Plus className="w-4 h-4 mr-1" />
            Lägg till
          </button>
        </div>
      </div>

      {/* Tags List */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-700">Befintliga taggar ({tags.length})</h4>
        
        {tags.length === 0 ? (
          <p className="text-gray-500 text-sm">Inga anpassade taggar skapade än.</p>
        ) : (
          <div className="space-y-2">
            {tags.map(tag => (
              <div
                key={tag.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                {editingTag === tag.id ? (
                  <div className="flex items-center space-x-2 flex-1">
                    <input
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      onKeyPress={(e) => e.key === 'Enter' && updateTag(tag.id)}
                    />
                    <button
                      onClick={() => updateTag(tag.id)}
                      className="p-1 text-green-600 hover:text-green-800"
                    >
                      ✓
                    </button>
                    <button
                      onClick={cancelEditing}
                      className="p-1 text-gray-600 hover:text-gray-800"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                        {tag.name}
                      </span>
                      {tag.usageCount > 0 && (
                        <span className="text-xs text-gray-500">
                          ({tag.usageCount} användningar)
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => startEditing(tag)}
                        className="p-1 text-gray-600 hover:text-blue-600 transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteTag(tag.id)}
                        className="p-1 text-gray-600 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Predefined Tags Info */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="text-sm font-medium text-blue-900 mb-2">Fördefinierade taggar</h4>
        <p className="text-xs text-blue-700 mb-3">
          Dessa taggar är alltid tillgängliga och kan inte tas bort:
        </p>
        <div className="flex flex-wrap gap-2">
          {['VIP', 'Ny kund', 'Kommersiell', 'Flerårig kontrakt', 'RUT-berättigad', 'ROT-berättigad', 'Återkommande', 'Stor kund'].map(tag => (
            <span
              key={tag}
              className="px-2 py-1 bg-blue-200 text-blue-800 text-xs font-medium rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TagManager; 