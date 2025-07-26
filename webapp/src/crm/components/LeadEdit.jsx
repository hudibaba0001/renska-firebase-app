import React from 'react';
import {
  Edit,
  SimpleForm,
  TextInput,
  SelectInput,
  NumberInput,
  DateInput,
  required,
  email
} from 'react-admin';

const LeadEdit = () => (
  <Edit>
    <SimpleForm>
      <TextInput source="name" label="Full Name" validate={[required()]} />
      <TextInput source="email" type="email" validate={[required(), email()]} />
      <TextInput source="phone" label="Phone Number" />
      <TextInput source="company" label="Company" />
      <SelectInput
        source="status"
        choices={[
          { id: 'new', name: 'New' },
          { id: 'contacted', name: 'Contacted' },
          { id: 'qualified', name: 'Qualified' },
          { id: 'proposal', name: 'Proposal' },
          { id: 'won', name: 'Won' },
          { id: 'lost', name: 'Lost' },
        ]}
      />
      <SelectInput
        source="source"
        choices={[
          { id: 'website', name: 'Website' },
          { id: 'referral', name: 'Referral' },
          { id: 'social', name: 'Social Media' },
          { id: 'advertising', name: 'Advertising' },
          { id: 'other', name: 'Other' },
        ]}
      />
      <SelectInput
        source="priority"
        choices={[
          { id: 'low', name: 'Low' },
          { id: 'medium', name: 'Medium' },
          { id: 'high', name: 'High' },
        ]}
      />
      <TextInput source="notes" label="Notes" multiline />
    </SimpleForm>
  </Edit>
);

export default LeadEdit;