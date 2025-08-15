import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import CrewForm from '../components/CrewForm';
import { Card, Button, Badge, Spinner } from 'flowbite-react';
import { 
  PlusIcon, 
  UserGroupIcon,
  PhoneIcon,
  EnvelopeIcon,
  PencilIcon,
  TrashIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { crewService } from '../services/crewService';
import toast from 'react-hot-toast';

export default function CrewsDashboard() {
  const { companyId } = useParams();
  const [crews, setCrews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCrewForm, setShowCrewForm] = useState(false);
  const [initialData, setInitialData] = useState(null);

  useEffect(() => {
    loadCrews();
  }, [companyId]);

  async function loadCrews() {
    try {
      setLoading(true);
      setError(null);
      const fetchedCrews = await crewService.fetchCrews(companyId);
      setCrews(fetchedCrews);
    } catch (error) {
      console.error('Error loading crews:', error);
      setError('Failed to load crews. Please try again.');
      toast.error('Failed to load crews');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <Spinner size="xl" className="mb-4" />
          <p className="text-gray-600">Loading crews...</p>
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
        <Button color="failure" onClick={loadCrews}>
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
          <h1 className="text-2xl font-bold text-gray-900">Crews</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage your field service teams
          </p>
        </div>
        <Button color="blue" onClick={() => setShowCrewForm(true)}>
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Crew
        </Button>

        <CrewForm 
          isOpen={showCrewForm} 
          onClose={() => {
            setShowCrewForm(false);
            setInitialData(null);
            loadCrews(); // Refresh the list after adding
          }}
          initialData={initialData}
          companyId={companyId}
        />
      </div>

      {/* Crews Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {crews.length > 0 ? (
          crews.map((crew) => (
            <Card key={crew.id} className="hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {crew.name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {crew.members?.length || 0} members
                  </p>
                </div>
                <Badge color={crew.active ? 'success' : 'gray'}>
                  {crew.active ? 'Active' : 'Inactive'}
                </Badge>
              </div>

              {crew.members && crew.members.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">
                    Team Members
                  </h4>
                  <div className="space-y-2">
                    {crew.members.map((member, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                            <UserGroupIcon className="h-4 w-4 text-gray-600" />
                          </div>
                          <span className="ml-2 text-sm">{member.name}</span>
                        </div>
                        <div className="flex space-x-2">
                          {member.phone && (
                            <PhoneIcon className="h-4 w-4 text-gray-400" />
                          )}
                          {member.email && (
                            <EnvelopeIcon className="h-4 w-4 text-gray-400" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-4 flex space-x-2">
                <Button 
                  color="gray" 
                  className="flex-1"
                  onClick={() => {
                    setInitialData(crew);
                    setShowCrewForm(true);
                  }}
                >
                  <PencilIcon className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button 
                  color="failure" 
                  className="flex-1"
                  onClick={async () => {
                    if (window.confirm('Are you sure you want to delete this crew?')) {
                      try {
                        await crewService.deleteCrew(companyId, crew.id);
                        toast.success('Crew deleted successfully');
                        loadCrews();
                      } catch (error) {
                        console.error('Error deleting crew:', error);
                        toast.error('Failed to delete crew');
                      }
                    }
                  }}
                >
                  <TrashIcon className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-12 bg-gray-50 rounded-lg">
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <UserGroupIcon className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Crews Yet
            </h3>
            <p className="text-gray-600 mb-4">
              Create your first crew to start managing teams.
            </p>
            <Button color="blue" onClick={() => setShowCrewForm(true)}>
              <PlusIcon className="h-5 w-5 mr-2" />
              Create First Crew
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}