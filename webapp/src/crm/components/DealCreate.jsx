import React from 'react';
import {
  Create,
  SimpleForm,
  TextInput,
  SelectInput,
  NumberInput,
  DateInput,
  required,
  email
} from 'react-admin';

const DealCreate = () => (
  <Create>
    <SimpleForm>
      <TextInput source="name" label="Deal Name" validate={[required()]} />
      <TextInput source="customer" label="Customer Name" validate={[required()]} />
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
      <TextInput source="notes" label="Notes" multiline />
    </SimpleForm>
  </Create>
);

export default DealCreate;