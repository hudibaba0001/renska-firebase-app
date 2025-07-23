import React from 'react';
import { Create, SimpleForm, TextInput, SelectInput, NumberInput, DateInput } from 'react-admin';

const DealCreate = () => (
  <Create>
    <SimpleForm>
      <TextInput source="title" label="Title" required />
      <TextInput source="customerName" label="Customer Name" />
      <NumberInput source="value" label="Value" />
      <SelectInput 
        source="stage" 
        label="Stage"
        choices={[
          { id: 'prospecting', name: 'Prospecting' },
          { id: 'qualification', name: 'Qualification' },
          { id: 'proposal', name: 'Proposal' },
          { id: 'negotiation', name: 'Negotiation' },
          { id: 'closed-won', name: 'Closed Won' },
          { id: 'closed-lost', name: 'Closed Lost' }
        ]}
      />
      <DateInput source="expectedCloseDate" label="Expected Close Date" />
      <TextInput source="description" label="Description" multiline rows={4} />
    </SimpleForm>
  </Create>
);

export default DealCreate; 