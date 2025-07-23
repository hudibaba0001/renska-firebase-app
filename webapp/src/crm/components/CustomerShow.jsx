import React from 'react';
import { Show, SimpleShowLayout, TextField, EmailField, DateField } from 'react-admin';

const CustomerShow = () => (
  <Show>
    <SimpleShowLayout>
      <TextField source="name" label="Name" />
      <EmailField source="email" label="Email" />
      <TextField source="phone" label="Phone" />
      <TextField source="customerType" label="Customer Type" />
      <TextField source="companyName" label="Company Name" />
      <TextField source="address" label="Address" />
      <TextField source="city" label="City" />
      <TextField source="zipCode" label="Zip Code" />
      <TextField source="notes" label="Notes" />
      <DateField source="createdAt" label="Created At" />
      <DateField source="updatedAt" label="Updated At" />
    </SimpleShowLayout>
  </Show>
);

export default CustomerShow; 