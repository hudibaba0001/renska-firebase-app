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
  SelectInput
} from 'react-admin';

const TaskFilters = [
  <SearchInput source="q" alwaysOn />,
  <SelectInput
    source="status"
    choices={[
      { id: 'pending', name: 'Pending' },
      { id: 'in-progress', name: 'In Progress' },
      { id: 'completed', name: 'Completed' },
    ]}
  />,
  <SelectInput
    source="priority"
    choices={[
      { id: 'low', name: 'Low' },
      { id: 'medium', name: 'Medium' },
      { id: 'high', name: 'High' },
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
    sort={{ field: 'createdAt', order: 'DESC' }}
    perPage={25}
  >
    <Datagrid>
      <TextField source="title" label="Task Title" />
      <TextField source="description" />
      <TextField source="assignedTo" label="Assigned To" />
      <TextField source="priority" />
      <TextField source="status" />
      <DateField source="dueDate" label="Due Date" />
      <DateField source="createdAt" label="Created" />
      <EditButton />
      <DeleteButton />
    </Datagrid>
  </List>
);

export default TaskList;