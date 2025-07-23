import React from 'react';
import { Edit, SimpleForm, TextInput, SelectInput, DateInput } from 'react-admin';

const CustomerEdit = () => (
  <Edit>
    <SimpleForm>
      <TextInput source="name" label="Name" required />
      <TextInput source="email" label="Email" type="email" />
      <TextInput source="phone" label="Phone" />
      <SelectInput 
        source="customerType" 
        label="Customer Type"
        choices={[
          { id: 'individual', name: 'Individual' },
          { id: 'company', name: 'Company' }
        ]}
      />
      <TextInput source="companyName" label="Company Name" />
      <TextInput source="address" label="Address" multiline rows={3} />
      <TextInput source="city" label="City" />
      <TextInput source="zipCode" label="Zip Code" />
      <TextInput source="notes" label="Notes" multiline rows={4} />
    </SimpleForm>
  </Edit>
);

export default CustomerEdit; 