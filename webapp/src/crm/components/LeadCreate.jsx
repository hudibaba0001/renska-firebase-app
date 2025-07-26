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
      <TextInput source="firstName" validate={[required()]} />
      <TextInput source="lastName" validate={[required()]} />
      <TextInput source="email" type="email" validate={[required(), email()]} />
      <TextInput source="phone" />
      <TextInput source="company" />
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
      <NumberInput source="estimatedValue" label="Estimated Value (SEK)" />
      <DateInput source="expectedCloseDate" label="Expected Close Date" />
      <TextInput source="notes" multiline />
    </SimpleForm>
  </Create>
);

export default LeadCreate;