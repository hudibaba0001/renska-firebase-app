import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, Badge, Spinner } from 'flowbite-react';
import { 
  ClockIcon, 
  MapPinIcon, 
  UserGroupIcon,
  PhoneIcon,
  EnvelopeIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { jobService } from '../services/jobService';

export default function JobDetail() {
  const { jobId, companyId } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadJob();
  }, [jobId, companyId]);

  async function loadJob() {
    try {
      setLoading(true);
      const jobData = await jobService.fetchJob(companyId, jobId);
      setJob(jobData);
    } catch (error) {
      console.error('Error loading job:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="xl" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">Job not found</h2>
        <Button onClick={() => navigate('/fms/jobs')} color="gray" className="mt-4">
          Back to Jobs
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{job.customerName}</h1>
          <p className="mt-1 text-sm text-gray-600">{job.serviceName}</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button color="gray">
            <PencilIcon className="h-5 w-5 mr-2" />
            Edit
          </Button>
          <Button color="failure">
            <TrashIcon className="h-5 w-5 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-lg font-semibold">Job Details</h2>
              <Badge color={getStatusColor(job.status)}>{job.status}</Badge>
            </div>

            <div className="space-y-4">
              <div className="flex items-center">
                <ClockIcon className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Scheduled For</p>
                  <p className="text-sm text-gray-600">
                    {new Date(job.scheduledAt).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center">
                <MapPinIcon className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Location</p>
                  <p className="text-sm text-gray-600">{job.address}</p>
                </div>
              </div>

              {job.crewName && (
                <div className="flex items-center">
                  <UserGroupIcon className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Assigned Crew</p>
                    <p className="text-sm text-gray-600">{job.crewName}</p>
                  </div>
                </div>
              )}
            </div>
          </Card>

          <Card>
            <h2 className="text-lg font-semibold mb-4">Service Notes</h2>
            <p className="text-gray-600 whitespace-pre-wrap">
              {job.notes || 'No notes provided.'}
            </p>
          </Card>
        </div>

        {/* Customer Info Sidebar */}
        <div className="space-y-6">
          <Card>
            <h2 className="text-lg font-semibold mb-4">Customer Information</h2>
            <div className="space-y-4">
              <div className="flex items-center">
                <PhoneIcon className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Phone</p>
                  <p className="text-sm text-gray-600">{job.contactPhone}</p>
                </div>
              </div>

              <div className="flex items-center">
                <EnvelopeIcon className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Email</p>
                  <p className="text-sm text-gray-600">{job.contactEmail}</p>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <h2 className="text-lg font-semibold mb-4">Job Summary</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Service Type</span>
                <span className="text-sm font-medium">{job.serviceName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Duration</span>
                <span className="text-sm font-medium">{job.estimatedDuration}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Price</span>
                <span className="text-sm font-medium">
                  {new Intl.NumberFormat('sv-SE', {
                    style: 'currency',
                    currency: job.currency || 'SEK'
                  }).format(job.price)}
                </span>
              </div>
            </div>
          </Card>
        </div>
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