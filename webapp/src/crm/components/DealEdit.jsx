import React from 'react';
import { Edit, SimpleForm, TextInput, NumberInput, SelectInput, DateInput } from 'react-admin';

const DealEdit = () => (
  <Edit>
    <SimpleForm>
      <TextInput source="title" label="Deal Title" required />
      <TextInput source="customerName" label="Customer Name" />
      <NumberInput source="value" label="Deal Value" />
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
      <SelectInput 
        source="probability" 
        label="Probability" 
        choices={[
          { id: '10%', name: '10%' },
          { id: '25%', name: '25%' },
          { id: '50%', name: '50%' },
          { id: '75%', name: '75%' },
          { id: '90%', name: '90%' },
          { id: '100%', name: '100%' }
        ]}
      />
      <DateInput source="expectedCloseDate" label="Expected Close Date" />
      <TextInput source="description" label="Description" multiline rows={3} />
    </SimpleForm>
  </Edit>
);

export default DealEdit; 