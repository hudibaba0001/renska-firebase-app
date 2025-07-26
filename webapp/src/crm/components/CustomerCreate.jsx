import React from 'react';
import {
  Create,
  SimpleForm,
  TextInput,
  SelectInput,
  BooleanInput,
  required,
  email
} from 'react-admin';

const CustomerCreate = () => (
  <Create>
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
        defaultValue="private"
      />
      <TextInput source="address" multiline />
      <TextInput source="city" />
      <TextInput source="postalCode" />
      <TextInput source="country" defaultValue="Sweden" />
      <BooleanInput source="active" defaultValue={true} />
      <TextInput source="notes" multiline />
    </SimpleForm>
  </Create>
);

export default CustomerCreate;