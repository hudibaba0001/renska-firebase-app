import React from 'react';
import {
  List,
  Datagrid,
  TextField,
  DateField,
  EditButton,
  DeleteButton,
  CreateButton,
  TopToolbar,
  FilterButton,
  SearchInput,
  SelectInput,
  NumberField
} from 'react-admin';

const LeadFilters = [
  <SearchInput source="q" alwaysOn />,
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
  />,
  <SelectInput
    source="source"
    choices={[
      { id: 'website', name: 'Website' },
      { id: 'referral', name: 'Referral' },
      { id: 'social', name: 'Social Media' },
      { id: 'advertising', name: 'Advertising' },
      { id: 'other', name: 'Other' },
    ]}
  />,
];

const LeadListActions = () => (
  <TopToolbar>
    <FilterButton />
    <CreateButton />
  </TopToolbar>
);

const LeadList = () => (
  <List
    filters={LeadFilters}
    actions={<LeadListActions />}
    sort={{ field: 'createdAt', order: 'DESC' }}
    perPage={25}
  >
    <Datagrid>
      <TextField source="firstName" label="First Name" />
      <TextField source="lastName" label="Last Name" />
      <TextField source="email" />
      <TextField source="phone" />
      <TextField source="status" />
      <TextField source="source" />
      <NumberField source="estimatedValue" label="Est. Value" />
      <DateField source="createdAt" label="Created" />
      <EditButton />
      <DeleteButton />
    </Datagrid>
  </List>
);

export default LeadList;