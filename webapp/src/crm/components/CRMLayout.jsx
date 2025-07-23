import React from 'react';
import { Layout, AppBar, TitlePortal } from 'react-admin';
import { Box, Typography } from '@mui/material';

const CRMLayout = (props) => (
  <Layout
    {...props}
    appBar={CustomAppBar}
    menu={CustomMenu}
  />
);

const CustomAppBar = () => (
  <AppBar>
    <TitlePortal />
    <Box sx={{ flex: 1 }} />
    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
      Reniska CRM
    </Typography>
  </AppBar>
);

const CustomMenu = () => (
  <div>
    {/* React Admin will automatically generate menu items */}
  </div>
);

export default CRMLayout; 