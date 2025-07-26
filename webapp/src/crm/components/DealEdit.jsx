import React from 'react';
import {
  Edit,
  SimpleForm,
  TextInput,
  SelectInput,
  NumberInput,
  DateInput,
  required
} from 'react-admin';

const DealEdit = () => (
  <Edit>
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
      />
      <DateInput source="expectedCloseDate" label="Expected Close Date" />
      <TextInput source="notes" label="Notes" multiline />
    </SimpleForm>
  </Edit>
);

export default DealEdit;