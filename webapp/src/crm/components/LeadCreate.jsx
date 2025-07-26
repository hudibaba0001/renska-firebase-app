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

const LeadCreate = () => (
  <Create>
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
        defaultValue="new"
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
        defaultValue="website"
      />
      <SelectInput
        source="priority"
        choices={[
          { id: 'low', name: 'Low' },
          { id: 'medium', name: 'Medium' },
          { id: 'high', name: 'High' },
        ]}
        defaultValue="medium"
      />
      <TextInput source="notes" label="Notes" multiline />
    </SimpleForm>
  </Create>
);

export default LeadCreate;