import React from 'react';
import {
  Create,
  SimpleForm,
  TextInput,
  SelectInput,
  DateInput,
  required
} from 'react-admin';

const TaskCreate = () => (
  <Create>
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
        defaultValue="medium"
      />
      <SelectInput
        source="status"
        choices={[
          { id: 'pending', name: 'Pending' },
          { id: 'in-progress', name: 'In Progress' },
          { id: 'completed', name: 'Completed' },
        ]}
        defaultValue="pending"
      />
      <DateInput source="dueDate" label="Due Date" />
    </SimpleForm>
  </Create>
);

export default TaskCreate;