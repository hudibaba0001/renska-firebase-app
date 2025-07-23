import React from 'react';
import { List, Datagrid, TextField, NumberField, DateField, EditButton, ShowButton } from 'react-admin';

const DealList = () => (
  <List>
    <Datagrid>
      <TextField source="title" label="Deal Title" />
      <TextField source="customerName" label="Customer" />
      <NumberField source="value" label="Value" />
      <TextField source="stage" label="Stage" />
      <TextField source="probability" label="Probability" />
      <DateField source="expectedCloseDate" label="Expected Close" />
      <DateField source="createdAt" label="Created" />
      <EditButton />
      <ShowButton />
    </Datagrid>
  </List>
);

export default DealList; 