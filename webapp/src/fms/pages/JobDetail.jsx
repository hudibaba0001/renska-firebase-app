import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { jobService } from '../services/jobService';
import { crewService } from '../services/crewService';
import LoadingOverlay from '../components/LoadingOverlay';

function CrewAssignment({ job, onUpdate }) {
  const { user } = useAuth();
  const [crews, setCrews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadCrews();
  }, []);

  async function loadCrews() {
    try {
      const fetchedCrews = await crewService.fetchCrews(user.companyId);
      setCrews(fetchedCrews);
    } catch (error) {
      console.error('Error loading crews:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleAssignCrew(crewId) {
    try {
      setSaving(true);
      await jobService.updateJob(user.companyId, job.id, { crewId });
      onUpdate();
    } catch (error) {
      console.error('Error assigning crew:', error);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div>Loading crews...</div>;

  return (
    <div className="flex gap-4 items-center">
      <select
        value={job.crewId || ''}
        onChange={(e) => handleAssignCrew(e.target.value)}
        disabled={saving}
        className="border rounded px-3 py-1.5"
      >
        <option value="">Select Crew</option>
        {crews.map(crew => (
          <option key={crew.id} value={crew.id}>
            {crew.name}
          </option>
        ))}
      </select>
    </div>
  );
}

export default function JobDetail() {
  const { user } = useAuth();
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);

  async function loadJob() {
    try {
      const data = await jobService.fetchJob(user.companyId, jobId);
      setJob(data);
    } catch (error) {
      console.error('Error loading job:', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadJob();
  }, [jobId, user?.companyId]);

  if (loading) return <LoadingOverlay message="Loading job details..." />;
  if (!job) return <div>Job not found</div>;

  return (
    <div className="p-6">
      <button onClick={() => navigate(-1)} className="mb-4 text-blue-600">← Back to Jobs</button>
      
      <h1 className="text-2xl font-bold mb-4">Job Details</h1>
      
      <div className="space-y-6">
        {/* Basic Job Info */}
        <div className="space-y-2">
          <div><strong>Booking ID:</strong> {job.bookingId}</div>
          <div><strong>Customer:</strong> {job.customerName}</div>
          <div><strong>Status:</strong> {job.status}</div>
          <div><strong>Scheduled For:</strong> {new Date(job.scheduledAt).toLocaleString()}</div>
        </div>

        {/* Crew Assignment Section */}
        <div>
          <h2 className="text-lg font-medium mb-2">Crew Assignment</h2>
          <div className="bg-gray-50 border border-gray-200 rounded p-4">
            <CrewAssignment job={job} onUpdate={loadJob} />
          </div>
        </div>

        {/* Notes if any */}
        {job.notes && (
          <div>
            <h2 className="text-lg font-medium mb-2">Notes</h2>
            <div className="bg-gray-50 rounded p-4">{job.notes}</div>
          </div>
        )}
      </div>
    </div>
  );
}