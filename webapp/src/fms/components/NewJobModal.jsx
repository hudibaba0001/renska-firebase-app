import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { jobService } from '../services/jobService';
import { 
  Modal,
  Label,
  TextInput,
  Button,
  Select,
  Textarea
} from 'flowbite-react';
import { toast } from 'react-hot-toast';

const initialFormData = {
  customerName: '',
  customerEmail: '',
  customerPhone: '',
  address: '',
  scheduledDate: '',
  scheduledTime: '',
  status: 'scheduled',
  notes: '',
  priority: 'normal'
};

export default function NewJobModal({ show, onClose, onJobCreated }) {
  const { user } = useAuth();
  const [formData, setFormData] = useState(initialFormData);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user?.companyId) return;

    try {
      setSubmitting(true);

      // Validate required fields
      if (!formData.customerName || !formData.address) {
        toast.error('Please fill in all required fields');
        return;
      }

      const jobData = {
        ...formData,
        createdAt: new Date().toISOString(),
        createdBy: user.email,
        companyId: user.companyId,
        // Convert date and time to ISO string if provided
        scheduledAt: formData.scheduledDate && formData.scheduledTime
          ? new Date(\`\${formData.scheduledDate}T\${formData.scheduledTime}\`).toISOString()
          : null
      };

      const newJob = await jobService.createJob(user.companyId, jobData);
      onJobCreated(newJob);
      setFormData(initialFormData);
    } catch (error) {
      console.error('Error creating job:', error);
      toast.error('Could not create job');
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <Modal show={show} onClose={onClose} size="xl">
      <Modal.Header>
        Create New Job
      </Modal.Header>
      <form onSubmit={handleSubmit}>
        <Modal.Body>
          <div className="space-y-6">
            {/* Customer Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Customer Information
              </h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="customerName" value="Customer Name *" />
                  <TextInput
                    id="customerName"
                    name="customerName"
                    value={formData.customerName}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="customerEmail" value="Email" />
                  <TextInput
                    id="customerEmail"
                    name="customerEmail"
                    type="email"
                    value={formData.customerEmail}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="customerPhone" value="Phone" />
                  <TextInput
                    id="customerPhone"
                    name="customerPhone"
                    type="tel"
                    value={formData.customerPhone}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="address" value="Service Address *" />
                  <TextInput
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Schedule Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Schedule Information
              </h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="scheduledDate" value="Date" />
                  <TextInput
                    id="scheduledDate"
                    name="scheduledDate"
                    type="date"
                    value={formData.scheduledDate}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="scheduledTime" value="Time" />
                  <TextInput
                    id="scheduledTime"
                    name="scheduledTime"
                    type="time"
                    value={formData.scheduledTime}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="priority" value="Priority" />
                  <Select
                    id="priority"
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                  >
                    <option value="low">Low</option>
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="status" value="Initial Status" />
                  <Select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                  >
                    <option value="scheduled">Scheduled</option>
                    <option value="in_progress">In Progress</option>
                  </Select>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div>
              <Label htmlFor="notes" value="Notes" />
              <Textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
              />
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <div className="flex justify-end gap-2">
            <Button
              color="gray"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting}
            >
              {submitting ? 'Creating...' : 'Create Job'}
            </Button>
          </div>
        </Modal.Footer>
      </form>
    </Modal>
  );
}