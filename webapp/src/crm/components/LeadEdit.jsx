import React from 'react';
import { Edit, SimpleForm, TextInput, SelectInput, DateInput } from 'react-admin';

const LeadEdit = () => (
  <Edit>
    <SimpleForm>
      <TextInput source="name" label="Name" required />
      <TextInput source="email" label="Email" type="email" />
      <TextInput source="phone" label="Phone" />
      <TextInput source="company" label="Company" />
      <SelectInput 
        source="status" 
        label="Status" 
        choices={[
          { id: 'new', name: 'New' },
          { id: 'contacted', name: 'Contacted' },
          { id: 'qualified', name: 'Qualified' },
          { id: 'unqualified', name: 'Unqualified' },
          { id: 'converted', name: 'Converted' }
        ]}
      />
      <SelectInput 
        source="source" 
        label="Source" 
        choices={[
          { id: 'website', name: 'Website' },
          { id: 'referral', name: 'Referral' },
          { id: 'social', name: 'Social Media' },
          { id: 'email', name: 'Email Campaign' },
          { id: 'other', name: 'Other' }
        ]}
      />
      <TextInput source="notes" label="Notes" multiline rows={3} />
    </SimpleForm>
  </Edit>
);

export default LeadEdit; 