import React from 'react';
import { List, Datagrid, TextField, BooleanField, EditButton } from 'react-admin';

const Settings = () => (
  <List>
    <Datagrid>
      <TextField source="name" label="Setting Name" />
      <TextField source="value" label="Value" />
      <TextField source="description" label="Description" />
      <BooleanField source="enabled" label="Enabled" />
      <EditButton />
    </Datagrid>
  </List>
);

export default Settings; 