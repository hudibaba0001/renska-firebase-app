import React from 'react';
import {
  Edit,
  SimpleForm,
  TextInput,
  SelectInput,
  BooleanInput,
  required,
  email
} from 'react-admin';

const CustomerEdit = () => (
  <Edit>
    <SimpleForm>
      <TextInput source="name" label="Full Name" validate={[required()]} />
      <TextInput source="email" type="email" validate={[required(), email()]} />
      <TextInput source="phone" label="Phone Number" />
      <SelectInput
        source="status"
        choices={[
          { id: 'active', name: 'Active' },
          { id: 'inactive', name: 'Inactive' },
          { id: 'prospect', name: 'Prospect' },
        ]}
      />
      <TextInput source="address" label="Address" multiline />
      <TextInput source="city" label="City" />
      <TextInput source="postalCode" label="Postal Code" />
      <TextInput source="country" label="Country" />
      <TextInput source="notes" label="Notes" multiline />
    </SimpleForm>
  </Edit>
);

export default CustomerEdit;