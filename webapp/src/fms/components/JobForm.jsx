import React, { useState, useEffect } from 'react';
import { Modal, Button, Label, TextInput, Textarea, Select } from 'flowbite-react';
import { jobService } from '../services/jobService';
import { crewService } from '../services/crewService';
import toast from 'react-hot-toast';

const JobForm = ({ isOpen, onClose, initialData = null, companyId }) => {
  const [loading, setLoading] = useState(false);
  const [crews, setCrews] = useState([]);
  const [formData, setFormData] = useState({
    customerName: '',
    serviceName: '',
    address: '',
    scheduledAt: '',
    crewId: '',
    crewName: '',
    contactPhone: '',
    contactEmail: '',
    notes: '',
    estimatedDuration: '',
    price: '',
    currency: 'SEK',
    status: 'pending',
    ...initialData
  });

  // Format scheduledAt for datetime-local input if it exists
  useEffect(() => {
    if (initialData?.scheduledAt) {
      const date = new Date(initialData.scheduledAt);
      const formattedDate = date.toISOString().slice(0, 16); // Format for datetime-local
      setFormData(prev => ({
        ...prev,
        scheduledAt: formattedDate
      }));
    } else if (initialData === null) {
      // Reset form when creating new job
      setFormData({
        customerName: '',
        serviceName: '',
        address: '',
        scheduledAt: '',
        crewId: '',
        crewName: '',
        contactPhone: '',
        contactEmail: '',
        notes: '',
        estimatedDuration: '',
        price: '',
        currency: 'SEK',
        status: 'pending'
      });
    }
  }, [initialData]);

  useEffect(() => {
    loadCrews();
  }, [companyId]);

  async function loadCrews() {
    try {
      const fetchedCrews = await crewService.fetchCrews(companyId, { active: true });
      setCrews(fetchedCrews);
    } catch (error) {
      console.error('Error loading crews:', error);
      toast.error('Failed to load crews');
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Update crewName when crew is selected
    if (name === 'crewId') {
      const selectedCrew = crews.find(crew => crew.id === value);
      setFormData(prev => ({
        ...prev,
        crewName: selectedCrew?.name || ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Convert scheduledAt to proper Date object if it's a string
      const jobData = {
        ...formData,
        scheduledAt: formData.scheduledAt ? new Date(formData.scheduledAt) : null
      };

      if (initialData?.id) {
        await jobService.updateJob(companyId, initialData.id, jobData);
        toast.success('Job updated successfully');
      } else {
        await jobService.createJob(companyId, jobData);
        toast.success('Job created successfully');
        // Don't navigate away when creating from modal, just close it
      }
      onClose();
    } catch (error) {
      console.error('Error saving job:', error);
      toast.error('Failed to save job');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={isOpen} onClose={onClose} size="xl">
      <Modal.Header>
        {initialData ? 'Edit Job' : 'Create New Job'}
      </Modal.Header>
      <Modal.Body>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="customerName">Customer Name</Label>
              <TextInput
                id="customerName"
                name="customerName"
                value={formData.customerName}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <Label htmlFor="serviceName">Service Type</Label>
              <TextInput
                id="serviceName"
                name="serviceName"
                value={formData.serviceName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="address">Service Address</Label>
              <TextInput
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <Label htmlFor="scheduledAt">Scheduled Date & Time</Label>
              <TextInput
                id="scheduledAt"
                name="scheduledAt"
                type="datetime-local"
                value={formData.scheduledAt}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <Label htmlFor="crewId">Assign Crew</Label>
              <Select
                id="crewId"
                name="crewId"
                value={formData.crewId}
                onChange={handleChange}
              >
                <option value="">Select a crew</option>
                {crews.map(crew => (
                  <option key={crew.id} value={crew.id}>
                    {crew.name}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <Label htmlFor="contactPhone">Contact Phone</Label>
              <TextInput
                id="contactPhone"
                name="contactPhone"
                value={formData.contactPhone}
                onChange={handleChange}
              />
            </div>

            <div>
              <Label htmlFor="contactEmail">Contact Email</Label>
              <TextInput
                id="contactEmail"
                name="contactEmail"
                type="email"
                value={formData.contactEmail}
                onChange={handleChange}
              />
            </div>

            <div>
              <Label htmlFor="estimatedDuration">Estimated Duration</Label>
              <TextInput
                id="estimatedDuration"
                name="estimatedDuration"
                value={formData.estimatedDuration}
                onChange={handleChange}
                placeholder="e.g., 2h"
              />
            </div>

            <div>
              <Label htmlFor="price">Price (SEK)</Label>
              <TextInput
                id="price"
                name="price"
                type="number"
                value={formData.price}
                onChange={handleChange}
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={4}
              />
            </div>
          </div>
        </form>
      </Modal.Body>
      <Modal.Footer>
        <Button
          type="submit"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? 'Saving...' : (initialData ? 'Update Job' : 'Create Job')}
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
};

export default JobForm;