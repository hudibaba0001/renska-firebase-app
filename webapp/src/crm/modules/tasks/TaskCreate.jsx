import React from 'react';
import { useNavigate } from 'react-router-dom';
import { createTask } from '../../services/taskService';
import TaskForm from '../../forms/TaskForm';

const TaskCreate = ({ companyId }) => {
  const navigate = useNavigate();

  const handleSubmit = async (formData) => {
    try {
      await createTask(companyId, formData);
      navigate(`/admin/${companyId}/crm-data/tasks`);
    } catch (error) {
      console.error('Error creating task:', error);
      // Error handling is done in the service layer
    }
  };

  const handleCancel = () => {
    navigate(`/admin/${companyId}/crm-data/tasks`);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Create New Task</h1>
      </div>
      
      <TaskForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        submitLabel="Create Task"
      />
    </div>
  );
};

export default TaskCreate; 