import React, { useState } from 'react';
import Link from 'next/link';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  IconButton, 
  Drawer, 
  List, 
  ListItem, 
  ListItemButton,
  ListItemIcon, 
  ListItemText,
  useTheme,
  useMediaQuery
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import DevicesIcon from '@mui/icons-material/Devices';
import SettingsIcon from '@mui/icons-material/Settings';

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const menuItems = [
    { text: 'Dashboard', href: '/dashboard', icon: <DashboardIcon /> },
    { text: 'Salas', href: '/gerenciamento/salas', icon: <MeetingRoomIcon /> },
    { text: 'Climatizadores', href: '/gerenciamento/climatizadores', icon: <AcUnitIcon /> },
    { text: 'Dispositivos', href: '/diagnose/dispositivos', icon: <DevicesIcon /> },
    { text: 'Configurações', href: '/settings', icon: <SettingsIcon /> },
  ];

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawer = (
    <div className="bg-gray-50 h-full">
      <div className="p-4 bg-blue-700">
        <Typography variant="h6" className="text-white font-bold">
          AC Control
        </Typography>
      </div>
      <List>
        {menuItems.map((item) => (
          <Link href={item.href} key={item.text} className="block">
            <ListItem disablePadding>
              <ListItemButton className="hover:bg-blue-50">
                <ListItemIcon className="text-blue-700">
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text}
                  className="text-gray-700"
                />
              </ListItemButton>
            </ListItem>
          </Link>
        ))}
      </List>
    </div>
  );

  return (
    <>
      <AppBar position="fixed" className="bg-blue-700">
        <Toolbar className="justify-between">
          {isMobile ? (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              className="mr-2"
            >
              <MenuIcon />
            </IconButton>
          ) : null}
          <Link href="/" className="no-underline">
            <Typography variant="h6" className="text-white font-bold cursor-pointer">
              AC Control
            </Typography>
          </Link>
          {!isMobile && (
            <div className="flex gap-4">
              {menuItems.map((item) => (
                <Link href={item.href} key={item.text} className="no-underline">
                  <Button 
                    color="inherit"
                    startIcon={item.icon}
                    className="text-white hover:bg-blue-800"
                  >
                    {item.text}
                  </Button>
                </Link>
              ))}
            </div>
          )}
        </Toolbar>
      </AppBar>
      <nav>
        <Drawer
          variant="temporary"
          anchor="left"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          className="block sm:hidden"
        >
          {drawer}
        </Drawer>
      </nav>
      <Toolbar /> {/* Spacer for fixed AppBar */}
    </>
  );
};

export default Navbar;