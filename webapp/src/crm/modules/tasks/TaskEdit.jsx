import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTask, updateTask } from '../../services/taskService';
import TaskForm from '../../forms/TaskForm';

const TaskEdit = ({ companyId }) => {
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
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

  const handleSubmit = async (formData) => {
    try {
      await updateTask(companyId, id, formData);
      navigate(`/admin/${companyId}/crm-data/tasks/${id}`);
    } catch (error) {
      console.error('Error updating task:', error);
      // Error handling is done in the service layer
    }
  };

  const handleCancel = () => {
    navigate(`/admin/${companyId}/crm-data/tasks/${id}`);
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Edit Task</h1>
      </div>
      
      <TaskForm
        initialData={task}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        submitLabel="Update Task"
      />
    </div>
  );
};

export default TaskEdit; 