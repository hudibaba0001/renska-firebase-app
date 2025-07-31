import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { crewService } from '../services/crewService';
import { Button, Card, Modal, TextInput } from 'flowbite-react';
import { PlusIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

function NewCrewModal({ show, onClose, onCreated }) {
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const { user } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setSaving(true);
      const crew = await crewService.createCrew(user.companyId, name.trim());
      onCreated(crew);
      setName('');
      onClose();
    } catch (error) {
      console.error('Error creating crew:', error);
      toast.error('Could not create crew');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal show={show} onClose={onClose}>
      <Modal.Header>Create New Crew</Modal.Header>
      <form onSubmit={handleSubmit}>
        <Modal.Body>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Crew Name
              </label>
              <TextInput
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter crew name"
                required
              />
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <div className="flex justify-end gap-2">
            <Button color="gray" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Creating...' : 'Create Crew'}
            </Button>
          </div>
        </Modal.Footer>
      </form>
    </Modal>
  );
}

export default function CrewsDashboard() {
  const { user } = useAuth();
  const [crews, setCrews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewModal, setShowNewModal] = useState(false);
  const [editingCrew, setEditingCrew] = useState(null);

  useEffect(() => {
    loadCrews();
  }, [user?.companyId]);

  async function loadCrews() {
    try {
      setLoading(true);
      const fetchedCrews = await crewService.fetchCrews(user.companyId);
      setCrews(fetchedCrews);
    } catch (error) {
      console.error('Error loading crews:', error);
      toast.error('Could not load crews');
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateCrew(crewId, newName) {
    try {
      await crewService.updateCrew(user.companyId, crewId, newName);
      setCrews(crews.map(crew => 
        crew.id === crewId ? { ...crew, name: newName } : crew
      ));
      setEditingCrew(null);
      toast.success('Crew updated');
    } catch (error) {
      console.error('Error updating crew:', error);
      toast.error('Could not update crew');
    }
  }

  async function handleDeleteCrew(crewId) {
    if (!window.confirm('Are you sure you want to delete this crew?')) return;

    try {
      await crewService.deleteCrew(user.companyId, crewId);
      setCrews(crews.filter(crew => crew.id !== crewId));
      toast.success('Crew deleted');
    } catch (error) {
      console.error('Error deleting crew:', error);
      toast.error('Could not delete crew');
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Crews</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage your work crews
          </p>
        </div>
        <Button onClick={() => setShowNewModal(true)}>
          <PlusIcon className="h-5 w-5 mr-2" />
          New Crew
        </Button>
      </div>

      {/* Crews List */}
      <Card>
        {crews.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No crews found
            </h3>
            <p className="text-gray-600 mb-4">
              Create your first crew to get started
            </p>
            <Button onClick={() => setShowNewModal(true)}>
              <PlusIcon className="h-5 w-5 mr-2" />
              Create Crew
            </Button>
          </div>
        ) : (
          <div className="divide-y">
            {crews.map(crew => (
              <div key={crew.id} className="flex items-center justify-between p-4">
                {editingCrew?.id === crew.id ? (
                  <div className="flex items-center gap-2">
                    <TextInput
                      value={editingCrew.name}
                      onChange={(e) => setEditingCrew({ ...editingCrew, name: e.target.value })}
                      className="w-64"
                    />
                    <Button.Group>
                      <Button 
                        size="sm"
                        onClick={() => handleUpdateCrew(crew.id, editingCrew.name)}
                      >
                        Save
                      </Button>
                      <Button 
                        size="sm"
                        color="gray"
                        onClick={() => setEditingCrew(null)}
                      >
                        Cancel
                      </Button>
                    </Button.Group>
                  </div>
                ) : (
                  <>
                    <span className="text-gray-900 font-medium">{crew.name}</span>
                    <div className="flex items-center gap-2">
                      <Button 
                        size="sm"
                        color="gray"
                        onClick={() => setEditingCrew(crew)}
                      >
                        Edit
                      </Button>
                      <Button 
                        size="sm"
                        color="failure"
                        onClick={() => handleDeleteCrew(crew.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* New Crew Modal */}
      <NewCrewModal
        show={showNewModal}
        onClose={() => setShowNewModal(false)}
        onCreated={(crew) => {
          setCrews([...crews, crew]);
          toast.success('Crew created');
        }}
      />
    </div>
  );
}