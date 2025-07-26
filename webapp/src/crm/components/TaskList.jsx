import React from 'react';
import {
  List,
  Datagrid,
  TextField,
  DateField,
  EditButton,
  DeleteButton,
  CreateButton,
  TopToolbar,
  FilterButton,
  SearchInput,
  SelectInput,
  BooleanField,
  ReferenceField
} from 'react-admin';

const TaskFilters = [
  <SearchInput source="q" alwaysOn />,
  <SelectInput
    source="status"
    choices={[
      { id: 'pending', name: 'Pending' },
      { id: 'in_progress', name: 'In Progress' },
      { id: 'completed', name: 'Completed' },
      { id: 'cancelled', name: 'Cancelled' },
    ]}
  />,
  <SelectInput
    source="priority"
    choices={[
      { id: 'low', name: 'Low' },
      { id: 'medium', name: 'Medium' },
      { id: 'high', name: 'High' },
      { id: 'urgent', name: 'Urgent' },
    ]}
  />,
];

const TaskListActions = () => (
  <TopToolbar>
    <FilterButton />
    <CreateButton />
  </TopToolbar>
);

const TaskList = () => (
  <List
    filters={TaskFilters}
    actions={<TaskListActions />}
    sort={{ field: 'dueDate', order: 'ASC' }}
    perPage={25}
  >
    <Datagrid>
      <TextField source="title" />
      <TextField source="status" />
      <TextField source="priority" />
      <ReferenceField source="customerId" reference="customers" label="Customer">
        <TextField source="firstName" />
      </ReferenceField>
      <DateField source="dueDate" label="Due Date" />
      <BooleanField source="completed" />
      <DateField source="createdAt" label="Created" />
      <EditButton />
      <DeleteButton />
    </Datagrid>
  </List>
);

export default TaskList;