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
  NumberField,
  ReferenceField
} from 'react-admin';

const DealFilters = [
  <SearchInput source="q" alwaysOn />,
  <SelectInput
    source="status"
    choices={[
      { id: 'negotiation', name: 'Negotiation' },
      { id: 'proposal', name: 'Proposal Sent' },
      { id: 'won', name: 'Won' },
      { id: 'lost', name: 'Lost' },
    ]}
  />,
];

const DealListActions = () => (
  <TopToolbar>
    <FilterButton />
    <CreateButton />
  </TopToolbar>
);

const DealList = () => (
  <List
    filters={DealFilters}
    actions={<DealListActions />}
    sort={{ field: 'createdAt', order: 'DESC' }}
    perPage={25}
  >
    <Datagrid>
      <TextField source="title" />
      <ReferenceField source="customerId" reference="customers">
        <TextField source="firstName" />
      </ReferenceField>
      <NumberField source="value" label="Value (SEK)" />
      <TextField source="status" />
      <DateField source="expectedCloseDate" label="Expected Close" />
      <DateField source="createdAt" label="Created" />
      <EditButton />
      <DeleteButton />
    </Datagrid>
  </List>
);

export default DealList;