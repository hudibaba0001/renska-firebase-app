import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Modal, Button, Label, TextInput, Textarea } from 'flowbite-react';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { crewService } from '../services/crewService';
import toast from 'react-hot-toast';

export default function CrewForm({ isOpen, onClose, initialData = null, companyId }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    members: [],
    active: true,
    notes: '',
    ...initialData
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleMemberChange = (index, field, value) => {
    setFormData(prev => {
      const newMembers = [...prev.members];
      newMembers[index] = {
        ...newMembers[index],
        [field]: value
      };
      return {
        ...prev,
        members: newMembers
      };
    });
  };

  const addMember = () => {
    setFormData(prev => ({
      ...prev,
      members: [...prev.members, { name: '', phone: '', email: '' }]
    }));
  };

  const removeMember = (index) => {
    setFormData(prev => ({
      ...prev,
      members: prev.members.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (initialData?.id) {
        await crewService.updateCrew(companyId, initialData.id, formData);
        toast.success('Crew updated successfully');
      } else {
        await crewService.createCrew(companyId, formData);
        toast.success('Crew created successfully');
      }
      onClose();
    } catch (error) {
      console.error('Error saving crew:', error);
      toast.error('Failed to save crew');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={isOpen} onClose={onClose} size="xl">
      <Modal.Header>
        {initialData ? 'Edit Crew' : 'Create New Crew'}
      </Modal.Header>
      <Modal.Body>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="name">Crew Name</Label>
            <TextInput
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-4">
              <Label>Team Members</Label>
              <Button
                size="xs"
                onClick={addMember}
                type="button"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Member
              </Button>
            </div>

            <div className="space-y-4">
              {formData.members.map((member, index) => (
                <div key={index} className="flex gap-4 items-start">
                  <div className="flex-1">
                    <TextInput
                      placeholder="Name"
                      value={member.name}
                      onChange={(e) => handleMemberChange(index, 'name', e.target.value)}
                      required
                    />
                  </div>
                  <div className="flex-1">
                    <TextInput
                      placeholder="Phone"
                      value={member.phone}
                      onChange={(e) => handleMemberChange(index, 'phone', e.target.value)}
                    />
                  </div>
                  <div className="flex-1">
                    <TextInput
                      placeholder="Email"
                      type="email"
                      value={member.email}
                      onChange={(e) => handleMemberChange(index, 'email', e.target.value)}
                    />
                  </div>
                  <Button
                    color="failure"
                    size="xs"
                    onClick={() => removeMember(index)}
                    type="button"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                </div>
              ))}

              {formData.members.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">
                  No team members added yet. Click "Add Member" to start building your crew.
                </p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={4}
            />
          </div>
        </form>
      </Modal.Body>
      <Modal.Footer>
        <Button
          type="submit"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? 'Saving...' : (initialData ? 'Update Crew' : 'Create Crew')}
        </Button>
        <Button
          color="gray"
          onClick={onClose}
          disabled={loading}
        >
          Cancel
        </Button>
      </Modal.Footer>
    </Modal>
  );
}