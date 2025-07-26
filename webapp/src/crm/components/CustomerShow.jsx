import React from 'react';
import {
  Show,
  SimpleShowLayout,
  TextField,
  DateField,
  BooleanField,
  EditButton,
  TopToolbar
} from 'react-admin';

const CustomerShowActions = () => (
  <TopToolbar>
    <EditButton />
  </TopToolbar>
);

const CustomerShow = () => (
  <Show actions={<CustomerShowActions />}>
    <SimpleShowLayout>
      <TextField source="name" label="Full Name" />
      <TextField source="email" />
      <TextField source="phone" label="Phone Number" />
      <TextField source="status" label="Status" />
      <TextField source="address" />
      <TextField source="city" />
      <TextField source="postalCode" label="Postal Code" />
      <TextField source="country" />
      <TextField source="notes" />
      <DateField source="createdAt" label="Created" />
      <DateField source="updatedAt" label="Updated" />
    </SimpleShowLayout>
  </Show>
);

export default CustomerShow;