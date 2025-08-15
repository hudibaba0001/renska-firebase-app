import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/init';
import { ArrowLeft, Edit, Trash2 } from 'lucide-react';

const TaskShow = () => {
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const { id, companyId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    loadTask();
  }, [id]);

  const loadTask = async () => {
    try {
      const docRef = doc(db, `companies/${companyId}/tasks`, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        setTask({ id: docSnap.id, ...docSnap.data() });
      } else {
        console.log('No such task!');
      }
    } catch (error) {
      console.error('Error loading task:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading task...</p>
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Task Not Found</h1>
          <p className="text-gray-600 mb-4">The task you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('tasks')}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Back to Tasks
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('tasks')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Tasks</span>
          </button>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => navigate(`tasks/${id}/edit`)}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
          >
            <Edit className="w-4 h-4" />
            <span>Edit</span>
          </button>
        </div>
      </div>

      {/* Task Details */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">{task.title}</h1>
          <p className="text-gray-600">{task.description}</p>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Task Information</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500">Assigned To</label>
                  <p className="text-gray-900">{task.assignedTo || 'Not assigned'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Priority</label>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    task.priority === 'high' ? 'bg-red-100 text-red-800' :
                    task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {task.priority}
                  </span>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    task.status === 'completed' ? 'bg-green-100 text-green-800' :
                    task.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {task.status}
                  </span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Timeline</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500">Due Date</label>
                  <p className="text-gray-900">{task.dueDate || 'No due date set'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Created</label>
                  <p className="text-gray-900">{task.createdAt?.toDate?.()?.toLocaleDateString() || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Last Updated</label>
                  <p className="text-gray-900">{task.updatedAt?.toDate?.()?.toLocaleDateString() || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskShow; 