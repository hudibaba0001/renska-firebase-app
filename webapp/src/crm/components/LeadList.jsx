import React from 'react';
import { List, Datagrid, TextField, EmailField, DateField, EditButton, ShowButton } from 'react-admin';

const LeadList = () => (
  <List>
    <Datagrid>
      <TextField source="name" label="Name" />
      <EmailField source="email" label="Email" />
      <TextField source="phone" label="Phone" />
      <TextField source="status" label="Status" />
      <TextField source="source" label="Source" />
      <DateField source="createdAt" label="Created" />
      <EditButton />
      <ShowButton />
    </Datagrid>
  </List>
);

export default LeadList; 