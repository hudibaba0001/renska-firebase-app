import React from 'react';
import { Create, SimpleForm, TextInput, SelectInput, TextField } from 'react-admin';

const LeadCreate = () => (
  <Create>
    <SimpleForm>
      <TextInput source="name" label="Name" required />
      <TextInput source="email" label="Email" type="email" />
      <TextInput source="phone" label="Phone" />
      <SelectInput 
        source="status" 
        label="Status"
        choices={[
          { id: 'new', name: 'New' },
          { id: 'contacted', name: 'Contacted' },
          { id: 'qualified', name: 'Qualified' },
          { id: 'converted', name: 'Converted' },
          { id: 'lost', name: 'Lost' }
        ]}
      />
      <SelectInput 
        source="source" 
        label="Source"
        choices={[
          { id: 'website', name: 'Website' },
          { id: 'referral', name: 'Referral' },
          { id: 'social', name: 'Social Media' },
          { id: 'advertising', name: 'Advertising' },
          { id: 'other', name: 'Other' }
        ]}
      />
      <TextInput source="notes" label="Notes" multiline rows={4} />
    </SimpleForm>
  </Create>
);

export default LeadCreate; 