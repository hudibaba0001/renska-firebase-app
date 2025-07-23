import React from 'react';
import { List, Datagrid, TextField, DateField, EditButton, ShowButton } from 'react-admin';

const TaskList = () => (
  <List>
    <Datagrid>
      <TextField source="title" label="Title" />
      <TextField source="description" label="Description" />
      <TextField source="status" label="Status" />
      <TextField source="priority" label="Priority" />
      <DateField source="dueDate" label="Due Date" />
      <DateField source="createdAt" label="Created" />
      <EditButton />
      <ShowButton />
    </Datagrid>
  </List>
);

export default TaskList; 