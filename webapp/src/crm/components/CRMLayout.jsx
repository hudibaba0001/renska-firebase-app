import React from 'react';
import { Layout, AppBar, TitlePortal, Menu } from 'react-admin';
import { Box, Typography, Button } from '@mui/material';
import { Link, useParams } from 'react-router-dom';

const CRMLayout = (props) => (
  <Layout
    {...props}
    appBar={CustomAppBar}
    menu={CustomMenu}
  />
);

const CustomAppBar = () => {
  const { companyId } = useParams();
  return (
    <AppBar>
      <TitlePortal />
      <Box sx={{ flex: 1 }} />
      <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
        Reniska CRM
      </Typography>
      <Button
        component={Link}
        to={`/admin/${companyId}`}
        variant="outlined"
        color="inherit"
        sx={{ mr: 2 }}
      >
        ← Back to Admin
      </Button>
    </AppBar>
  );
};

const CustomMenu = () => (
  <Menu>
    {/* React Admin will automatically generate menu items from Resources */}
  </Menu>
);

export default CRMLayout; 