import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTask, deleteTask, TASK_STATUSES, TASK_PRIORITIES, TASK_TYPES } from '../../services/taskService';
import { Edit, Trash2, ArrowLeft, Calendar, Clock, User, FileText, CheckCircle, AlertCircle } from 'lucide-react';

const TaskShow = ({ companyId }) => {
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    loadTask();
  }, [id]);

  const loadTask = async () => {
    try {
      setLoading(true);
      const taskData = await getTask(companyId, id);
      setTask(taskData);
    } catch (error) {
      console.error('Error loading task:', error);
      navigate(`/admin/${companyId}/crm-data/tasks`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteTask(companyId, id);
      setShowDeleteModal(false);
      navigate(`/admin/${companyId}/crm-data/tasks`);
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const getStatusColor = (status) => {
    const statusObj = TASK_STATUSES.find(s => s.value === status);
    return statusObj?.color || 'gray';
  };

  const getPriorityColor = (priority) => {
    const priorityObj = TASK_PRIORITIES.find(p => p.value === priority);
    return priorityObj?.color || 'gray';
  };

  const getTypeIcon = (type) => {
    const typeObj = TASK_TYPES.find(t => t.value === type);
    return typeObj?.icon || 'more-horizontal';
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('sv-SE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isOverdue = (dueDate, status) => {
    if (!dueDate || status === 'completed') return false;
    return new Date(dueDate) < new Date();
  };

  const isDueToday = (dueDate) => {
    if (!dueDate) return false;
    const today = new Date();
    const due = new Date(dueDate);
    return due.toDateString() === today.toDateString();
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
          <p className="text-gray-500">Task not found</p>
          <button
            onClick={() => navigate(`/admin/${companyId}/crm-data/tasks`)}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
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
            onClick={() => navigate(`/admin/${companyId}/crm-data/tasks`)}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Tasks</span>
          </button>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => navigate(`/admin/${companyId}/crm-data/tasks/${id}/edit`)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Edit className="w-4 h-4" />
            <span>Edit</span>
          </button>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete</span>
          </button>
        </div>
      </div>

      {/* Task Information */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{task.title}</h1>
              {task.description && (
                <p className="text-gray-600 mt-2">{task.description}</p>
              )}
            </div>
            <div className="flex space-x-2">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-${getStatusColor(task.status)}-100 text-${getStatusColor(task.status)}-800`}>
                {TASK_STATUSES.find(s => s.value === task.status)?.label || task.status}
              </span>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-${getPriorityColor(task.priority)}-100 text-${getPriorityColor(task.priority)}-800`}>
                {TASK_PRIORITIES.find(p => p.value === task.priority)?.label || task.priority}
              </span>
            </div>
          </div>

          {/* Due Date Status */}
          {task.dueDate && (
            <div className="mb-6 p-4 rounded-lg border">
              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">Due Date</p>
                  <p className="text-lg font-medium text-gray-900">{formatDateTime(task.dueDate)}</p>
                </div>
                {isOverdue(task.dueDate, task.status) && (
                  <div className="flex items-center space-x-2 text-red-600">
                    <AlertCircle className="w-5 h-5" />
                    <span className="font-medium">Overdue</span>
                  </div>
                )}
                {isDueToday(task.dueDate) && !isOverdue(task.dueDate, task.status) && (
                  <div className="flex items-center space-x-2 text-orange-600">
                    <Clock className="w-5 h-5" />
                    <span className="font-medium">Due Today</span>
                  </div>
                )}
                {task.status === 'completed' && (
                  <div className="flex items-center space-x-2 text-green-600">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">Completed</span>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Basic Information */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Assignment
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Assigned To</p>
                    <p className="text-lg font-medium text-gray-900">{task.assignedTo || 'Unassigned'}</p>
                  </div>
                  {task.customer && (
                    <div>
                      <p className="text-sm text-gray-600">Customer</p>
                      <p className="text-lg font-medium text-gray-900">{task.customer}</p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Clock className="w-5 h-5 mr-2" />
                  Task Details
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Type</p>
                    <p className="text-lg font-medium text-gray-900">
                      {TASK_TYPES.find(t => t.value === task.type)?.label || task.type}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Priority</p>
                    <p className="text-lg font-medium text-gray-900">
                      {TASK_PRIORITIES.find(p => p.value === task.priority)?.label || task.priority}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <p className="text-lg font-medium text-gray-900">
                      {TASK_STATUSES.find(s => s.value === task.status)?.label || task.status}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  Timeline
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Created</p>
                    <p className="text-lg font-medium text-gray-900">{formatDateTime(task.createdAt?.toDate?.())}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Last Updated</p>
                    <p className="text-lg font-medium text-gray-900">{formatDateTime(task.updatedAt?.toDate?.())}</p>
                  </div>
                </div>
              </div>

              {task.notes && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <FileText className="w-5 h-5 mr-2" />
                    Notes
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-900 whitespace-pre-wrap">{task.notes}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Delete Task</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "{task.title}"? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskShow; 