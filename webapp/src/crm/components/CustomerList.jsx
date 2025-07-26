import React from 'react';
import {
  List,
  Datagrid,
  TextField,
  DateField,
  EditButton,
  ShowButton,
  DeleteButton,
  CreateButton,
  TopToolbar,
  FilterButton,
  SearchInput,
  SelectInput,
  BooleanField
} from 'react-admin';

const CustomerFilters = [
  <SearchInput source="q" alwaysOn />,
  <SelectInput
    source="customerType"
    choices={[
      { id: 'private', name: 'Private' },
      { id: 'business', name: 'Business' },
    ]}
  />,
];

const CustomerListActions = () => (
  <TopToolbar>
    <FilterButton />
    <CreateButton />
  </TopToolbar>
);

const CustomerList = () => (
  <List
    filters={CustomerFilters}
    actions={<CustomerListActions />}
    sort={{ field: 'createdAt', order: 'DESC' }}
    perPage={25}
  >
    <Datagrid>
      <TextField source="firstName" label="First Name" />
      <TextField source="lastName" label="Last Name" />
      <TextField source="email" />
      <TextField source="phone" />
      <TextField source="customerType" label="Type" />
      <BooleanField source="active" />
      <DateField source="createdAt" label="Created" />
      <EditButton />
      <ShowButton />
      <DeleteButton />
    </Datagrid>
  </List>
);

export default CustomerList;