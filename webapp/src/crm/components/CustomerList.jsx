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
import { Card, CardContent, Typography, Button } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';

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

const EmptyState = () => (
  <Card>
    <CardContent style={{ textAlign: 'center', padding: '40px' }}>
      <Typography variant="h5" gutterBottom>
        No Customers Yet
      </Typography>
      <Typography variant="body1" color="textSecondary" paragraph>
        Start by adding your first customer to the CRM system.
      </Typography>
      <Button
        variant="contained"
        color="primary"
        startIcon={<AddIcon />}
        onClick={() => window.location.href = window.location.pathname + '/create'}
      >
        Add First Customer
      </Button>
    </CardContent>
  </Card>
);

const CustomerList = () => (
  <List
    filters={CustomerFilters}
    actions={<CustomerListActions />}
    sort={{ field: 'createdAt', order: 'DESC' }}
    perPage={25}
    empty={<EmptyState />}
  >
    <Datagrid>
      <TextField source="name" label="Name" />
      <TextField source="email" />
      <TextField source="phone" />
      <TextField source="status" label="Status" />
      <DateField source="createdAt" label="Created" />
      <EditButton />
      <ShowButton />
      <DeleteButton />
    </Datagrid>
  </List>
);

export default CustomerList;