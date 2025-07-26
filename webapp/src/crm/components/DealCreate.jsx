import React from 'react';
import {
  Create,
  SimpleForm,
  TextInput,
  SelectInput,
  NumberInput,
  DateInput,
  ReferenceInput,
  required
} from 'react-admin';

const DealCreate = () => (
  <Create>
    <SimpleForm>
      <TextInput source="title" validate={[required()]} />
      <ReferenceInput source="customerId" reference="customers">
        <SelectInput optionText="firstName" />
      </ReferenceInput>
      <NumberInput source="value" label="Value (SEK)" validate={[required()]} />
      <SelectInput
        source="status"
        choices={[
          { id: 'negotiation', name: 'Negotiation' },
          { id: 'proposal', name: 'Proposal Sent' },
          { id: 'won', name: 'Won' },
          { id: 'lost', name: 'Lost' },
        ]}
        defaultValue="negotiation"
      />
      <DateInput source="expectedCloseDate" label="Expected Close Date" />
      <TextInput source="description" multiline />
      <TextInput source="notes" multiline />
    </SimpleForm>
  </Create>
);

export default DealCreate;