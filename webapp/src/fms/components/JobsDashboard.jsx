import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { jobService } from '../services/jobService';
import { 
  Card, 
  Table, 
  Button, 
  Badge, 
  Spinner,
  Select 
} from 'flowbite-react';
import { 
  PlusIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import NewJobModal from './NewJobModal';

const JOB_STATUSES = {
  scheduled: { label: 'Scheduled', color: 'info', icon: ClockIcon },
  in_progress: { label: 'In Progress', color: 'warning', icon: ExclamationTriangleIcon },
  completed: { label: 'Completed', color: 'success', icon: CheckCircleIcon }
};

const JobStatusBadge = ({ status }) => {
  const statusConfig = JOB_STATUSES[status] || JOB_STATUSES.scheduled;
  const Icon = statusConfig.icon;
  
  return (
    <Badge color={statusConfig.color} className="flex items-center gap-1">
      <Icon className="w-4 h-4" />
      {statusConfig.label}
    </Badge>
  );
};

export default function JobsDashboard() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewJobModal, setShowNewJobModal] = useState(false);
  const [updatingJobId, setUpdatingJobId] = useState(null);

  useEffect(() => {
    loadJobs();
  }, [user?.companyId]);

  const loadJobs = async () => {
    if (!user?.companyId) return;

    try {
      setLoading(true);
      const fetchedJobs = await jobService.fetchJobs(user.companyId);
      setJobs(fetchedJobs);
    } catch (error) {
      console.error('Error loading jobs:', error);
      toast.error('Could not load jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (jobId, newStatus) => {
    if (!user?.companyId || updatingJobId) return;

    try {
      setUpdatingJobId(jobId);
      await jobService.updateJob(user.companyId, jobId, { status: newStatus });
      
      // Update local state
      setJobs(jobs.map(job => 
        job.id === jobId ? { ...job, status: newStatus } : job
      ));
      
      toast.success('Job status updated');
    } catch (error) {
      console.error('Error updating job status:', error);
      toast.error('Could not update job status');
    } finally {
      setUpdatingJobId(null);
    }
  };

  const handleNewJobCreated = (newJob) => {
    setJobs([newJob, ...jobs]);
    setShowNewJobModal(false);
    toast.success('New job created');
  };

  if (!user?.companyId) {
    return (
      <Card>
        <div className="text-center py-4">
          <p className="text-gray-600">Please select a company to view jobs.</p>
        </div>
      </Card>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Jobs</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage and track all field service jobs
          </p>
        </div>
        <Button
          onClick={() => setShowNewJobModal(true)}
          className="flex items-center gap-2"
        >
          <PlusIcon className="w-4 h-4" />
          New Job
        </Button>
      </div>

      {/* Jobs Table */}
      <Card>
        {jobs.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No jobs found
            </h3>
            <p className="text-gray-600 mb-4">
              Create your first job to get started
            </p>
            <Button
              onClick={() => setShowNewJobModal(true)}
              className="flex items-center gap-2"
            >
              <PlusIcon className="w-4 h-4" />
              Create Job
            </Button>
          </div>
        ) : (
          <Table>
            <Table.Head>
              <Table.HeadCell>Job ID</Table.HeadCell>
              <Table.HeadCell>Booking</Table.HeadCell>
              <Table.HeadCell>Customer</Table.HeadCell>
              <Table.HeadCell>Schedule</Table.HeadCell>
              <Table.HeadCell>Status</Table.HeadCell>
              <Table.HeadCell>Actions</Table.HeadCell>
            </Table.Head>
            <Table.Body>
              {jobs.map(job => (
                <Table.Row key={job.id}>
                  <Table.Cell className="font-medium">
                    {job.id.slice(0, 8)}
                  </Table.Cell>
                  <Table.Cell>
                    {job.bookingId ? (
                      <a 
                        href={`/bookings/${job.bookingId}`}
                        className="text-blue-600 hover:underline"
                      >
                        View Booking
                      </a>
                    ) : (
                      <span className="text-gray-500">No booking</span>
                    )}
                  </Table.Cell>
                  <Table.Cell>
                    {job.customerName || 'N/A'}
                  </Table.Cell>
                  <Table.Cell>
                    {job.scheduledDate ? (
                      new Date(job.scheduledDate).toLocaleDateString('sv-SE')
                    ) : (
                      'Not scheduled'
                    )}
                  </Table.Cell>
                  <Table.Cell>
                    <Select
                      value={job.status}
                      onChange={(e) => handleStatusChange(job.id, e.target.value)}
                      disabled={updatingJobId === job.id}
                      className="w-40"
                    >
                      {Object.entries(JOB_STATUSES).map(([value, { label }]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </Select>
                  </Table.Cell>
                  <Table.Cell>
                    <Button.Group>
                      <Button 
                        size="sm"
                        href={`/fms/jobs/${job.id}`}
                      >
                        View Details
                      </Button>
                    </Button.Group>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        )}
      </Card>

      {/* New Job Modal */}
      <NewJobModal
        show={showNewJobModal}
        onClose={() => setShowNewJobModal(false)}
        onJobCreated={handleNewJobCreated}
      />
    </div>
  );
}