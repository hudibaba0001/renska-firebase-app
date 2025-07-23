import React from 'react';
import { Create, SimpleForm, TextInput, SelectInput, DateInput } from 'react-admin';

const TaskCreate = () => (
  <Create>
    <SimpleForm>
      <TextInput source="title" label="Title" required />
      <TextInput source="description" label="Description" multiline rows={4} />
      <SelectInput 
        source="status" 
        label="Status"
        choices={[
          { id: 'pending', name: 'Pending' },
          { id: 'in-progress', name: 'In Progress' },
          { id: 'completed', name: 'Completed' },
          { id: 'cancelled', name: 'Cancelled' }
        ]}
      />
      <SelectInput 
        source="priority" 
        label="Priority"
        choices={[
          { id: 'low', name: 'Low' },
          { id: 'medium', name: 'Medium' },
          { id: 'high', name: 'High' },
          { id: 'urgent', name: 'Urgent' }
        ]}
      />
      <DateInput source="dueDate" label="Due Date" />
    </SimpleForm>
  </Create>
);

export default TaskCreate; 