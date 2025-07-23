import React from 'react';
import { List, Datagrid, TextField, EmailField, DateField, EditButton, ShowButton } from 'react-admin';

const CustomerList = () => (
  <List>
    <Datagrid>
      <TextField source="name" label="Name" />
      <EmailField source="email" label="Email" />
      <TextField source="phone" label="Phone" />
      <TextField source="customerType" label="Type" />
      <DateField source="createdAt" label="Created" />
      <EditButton />
      <ShowButton />
    </Datagrid>
  </List>
);

export default CustomerList; 