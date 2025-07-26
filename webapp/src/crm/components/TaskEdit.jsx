import React from 'react';
import {
  Edit,
  SimpleForm,
  TextInput,
  SelectInput,
  DateInput,
  required
} from 'react-admin';

const TaskEdit = () => (
  <Edit>
    <SimpleForm>
      <TextInput source="title" label="Task Title" validate={[required()]} />
      <TextInput source="description" label="Description" multiline />
      <TextInput source="assignedTo" label="Assigned To" />
      <SelectInput
        source="priority"
        choices={[
          { id: 'low', name: 'Low' },
          { id: 'medium', name: 'Medium' },
          { id: 'high', name: 'High' },
        ]}
      />
      <SelectInput
        source="status"
        choices={[
          { id: 'pending', name: 'Pending' },
          { id: 'in-progress', name: 'In Progress' },
          { id: 'completed', name: 'Completed' },
        ]}
      />
      <DateInput source="dueDate" label="Due Date" />
    </SimpleForm>
  </Edit>
);

export default TaskEdit;