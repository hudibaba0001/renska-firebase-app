import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import JobForm from '../components/JobForm';
import { Card, Button, Badge, Spinner } from 'flowbite-react';
import { PlusIcon, ClockIcon, UserGroupIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { jobService } from '../services/jobService';
import toast from 'react-hot-toast';

export default function JobsDashboard() {
  const { companyId } = useParams();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showJobForm, setShowJobForm] = useState(false);

  useEffect(() => {
    loadJobs();
  }, [companyId]);

  async function loadJobs() {
    try {
      setLoading(true);
      setError(null);
      const fetchedJobs = await jobService.fetchJobs(companyId);
      setJobs(fetchedJobs);
    } catch (error) {
      console.error('Error loading jobs:', error);
      setError('Failed to load jobs. Please try again.');
      toast.error('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <Spinner size="xl" className="mb-4" />
          <p className="text-gray-600">Loading jobs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 bg-red-50 rounded-lg">
        <div className="mx-auto w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <ExclamationTriangleIcon className="h-12 w-12 text-red-400" />
        </div>
        <h3 className="text-lg font-medium text-red-900 mb-2">
          {error}
        </h3>
        <Button color="failure" onClick={loadJobs}>
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Jobs</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage and track all field service jobs
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Button as={Link} to={`/admin/${companyId}/fms/schedule`} color="gray">
            <ClockIcon className="h-5 w-5 mr-2" />
            Schedule View
          </Button>
          <Button as={Link} to={`/admin/${companyId}/fms/crews`} color="gray">
            <UserGroupIcon className="h-5 w-5 mr-2" />
            Manage Crews
          </Button>
          <Button color="blue" onClick={() => setShowJobForm(true)}>
            <PlusIcon className="h-5 w-5 mr-2" />
            New Job
          </Button>
          
          <JobForm 
            isOpen={showJobForm} 
            onClose={() => {
              setShowJobForm(false);
              loadJobs(); // Refresh the list after adding
            }}
            companyId={companyId}
          />
        </div>
      </div>

      {/* Jobs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {jobs.length > 0 ? (
          jobs.map((job) => (
            <Card key={job.id} className="hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {job.customerName}
                  </h3>
                  <p className="text-sm text-gray-600">{job.serviceName}</p>
                </div>
                <Badge color={getStatusColor(job.status)}>
                  {job.status}
                </Badge>
              </div>

              <div className="mt-4 space-y-2">
                <div className="flex items-center text-sm">
                  <ClockIcon className="h-4 w-4 text-gray-400 mr-2" />
                  <span>{new Date(job.scheduledAt).toLocaleDateString()}</span>
                </div>
                {job.crewName && (
                  <div className="flex items-center text-sm">
                    <UserGroupIcon className="h-4 w-4 text-gray-400 mr-2" />
                    <span>{job.crewName}</span>
                  </div>
                )}
              </div>

              <div className="mt-4">
                <Button
                  as={Link}
                  to={`/admin/${companyId}/fms/jobs/${job.id}`}
                  color="gray"
                  className="w-full"
                >
                  View Details
                </Button>
              </div>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-12 bg-gray-50 rounded-lg">
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <ClockIcon className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Jobs Yet
            </h3>
            <p className="text-gray-600 mb-4">
              Create your first job to start managing field work.
            </p>
            <Button color="blue" onClick={() => setShowJobForm(true)}>
              <PlusIcon className="h-5 w-5 mr-2" />
              Create First Job
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function getStatusColor(status) {
  switch (status?.toLowerCase()) {
    case 'completed':
      return 'success';
    case 'in_progress':
      return 'info';
    case 'pending':
      return 'warning';
    case 'cancelled':
      return 'failure';
    default:
      return 'gray';
  }
}