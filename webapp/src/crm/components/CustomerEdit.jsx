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
      <TextInput source="firstName" validate={[required()]} />
      <TextInput source="lastName" validate={[required()]} />
      <TextInput source="email" type="email" validate={[required(), email()]} />
      <TextInput source="phone" />
      <SelectInput
        source="customerType"
        choices={[
          { id: 'private', name: 'Private' },
          { id: 'business', name: 'Business' },
        ]}
      />
      <TextInput source="address" multiline />
      <TextInput source="city" />
      <TextInput source="postalCode" />
      <TextInput source="country" />
      <BooleanInput source="active" />
      <TextInput source="notes" multiline />
    </SimpleForm>
  </Edit>
);

export default CustomerEdit;