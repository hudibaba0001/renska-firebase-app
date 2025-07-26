import React from 'react';
import {
  Edit,
  SimpleForm,
  TextInput,
  SelectInput,
  DateInput,
  ReferenceInput,
  BooleanInput,
  required
} from 'react-admin';

const TaskEdit = () => (
  <Edit>
    <SimpleForm>
      <TextInput source="title" validate={[required()]} />
      <TextInput source="description" multiline />
      <SelectInput
        source="status"
        choices={[
          { id: 'pending', name: 'Pending' },
          { id: 'in_progress', name: 'In Progress' },
          { id: 'completed', name: 'Completed' },
          { id: 'cancelled', name: 'Cancelled' },
        ]}
      />
      <SelectInput
        source="priority"
        choices={[
          { id: 'low', name: 'Low' },
          { id: 'medium', name: 'Medium' },
          { id: 'high', name: 'High' },
          { id: 'urgent', name: 'Urgent' },
        ]}
      />
      <ReferenceInput source="customerId" reference="customers" label="Customer">
        <SelectInput optionText="firstName" />
      </ReferenceInput>
      <DateInput source="dueDate" label="Due Date" />
      <BooleanInput source="completed" />
      <TextInput source="notes" multiline />
    </SimpleForm>
  </Edit>
);

export default TaskEdit;