import React from 'react';
import { List, Datagrid, TextField, DateField, ShowButton } from 'react-admin';

const ReportList = () => (
  <List>
    <Datagrid>
      <TextField source="name" label="Report Name" />
      <TextField source="type" label="Report Type" />
      <TextField source="description" label="Description" />
      <DateField source="lastGenerated" label="Last Generated" />
      <DateField source="createdAt" label="Created" />
      <ShowButton />
    </Datagrid>
  </List>
);

export default ReportList; 