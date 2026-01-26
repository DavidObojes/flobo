import {useState} from "react";
import {NavLink, Outlet} from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
} from "@mui/material";

// Icons
import PetsIcon from '@mui/icons-material/Pets';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import LogoutIcon from '@mui/icons-material/Logout';
import MilitaryTechIcon from '@mui/icons-material/MilitaryTech';
import MenuIcon from '@mui/icons-material/Menu';
import {logout} from "../utils/apiClient.ts";

export default function Menu() {
  const isLoggedIn = !!localStorage.getItem("access_token");
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    logout();
    setMobileOpen(false);
  };

  // Mobile Drawer Content
  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{textAlign: 'center', bgcolor: '#1a1a1a', height: '100%', color: 'white'}}>
      <Typography variant="h6" sx={{my: 2, fontWeight: 900, color: '#f1c40f'}}>
          CAT BRAWL
      </Typography>
      <Divider sx={{bgcolor: 'rgba(255,255,255,0.1)'}}/>
      <List>
        <ListItem disablePadding>
          <ListItemButton component={NavLink} to="/" sx={{textAlign: 'left'}}>
            <ListItemIcon sx={{color: '#f1c40f', minWidth: 40}}>
              <PetsIcon/>
            </ListItemIcon>
            <ListItemText primary="My Cats"/>
          </ListItemButton>
        </ListItem>

        {isLoggedIn && (
          <>
            <ListItem disablePadding>
              <ListItemButton component={NavLink} to="/arena">
                <ListItemIcon sx={{color: '#f1c40f', minWidth: 40}}><FlashOnIcon/></ListItemIcon>
                <ListItemText primary="Arena"/>
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton component={NavLink} to="/leaderboard">
                <ListItemIcon sx={{color: '#f1c40f', minWidth: 40}}><MilitaryTechIcon/></ListItemIcon>
                <ListItemText primary="Leaderboards"/>
              </ListItemButton>
            </ListItem>
            <Divider sx={{my: 1, bgcolor: 'rgba(255,255,255,0.1)'}}/>
            <ListItem disablePadding>
              <ListItemButton onClick={handleLogout}>
                <ListItemIcon sx={{color: '#f44336', minWidth: 40}}><LogoutIcon/></ListItemIcon>
                <ListItemText primary="Logout" sx={{color: '#f44336'}}/>
              </ListItemButton>
            </ListItem>
          </>
        )}

        {!isLoggedIn && (
          <ListItem disablePadding>
            <ListItemButton component={NavLink} to="/login">
              <ListItemText primary="Login" sx={{color: '#f1c40f'}}/>
            </ListItemButton>
          </ListItem>
        )}
      </List>
    </Box>
  );

  return (
    <>
      <AppBar position="sticky"
        sx={{backgroundColor: '#1a1a1a', borderBottom: '2px solid #f1c40f', backgroundImage: 'none'}}>
        <Container maxWidth="xl">
          <Toolbar disableGutters>
            {/* --- MOBILE HAMBURGER --- */}
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{mr: 2, display: {md: 'none'}}}
            >
              <MenuIcon/>
            </IconButton>

            {/* --- LOGO --- */}
            <PetsIcon sx={{color: '#f1c40f', mr: 1, display: {xs: 'none', md: 'flex'}}}/>
            <Typography
              variant="h6"
              component={NavLink}
              to="/"
              sx={{
                flexGrow: {xs: 1, md: 0},
                mr: 4,
                fontWeight: 800,
                letterSpacing: '.1rem',
                color: 'inherit',
                textDecoration: 'none',
                fontFamily: 'monospace',
              }}
            >
                CAT BRAWL
            </Typography>

            {/* --- DESKTOP NAVIGATION --- */}
            <Box sx={{flexGrow: 1, display: {xs: 'none', md: 'flex'}, gap: 1}}>
              <Button
                component={NavLink}
                to="/"
                startIcon={<PetsIcon/>} // Add this line
                color="inherit"
                sx={{"&.active": {color: '#f1c40f', borderBottom: '2px solid #f1c40f', borderRadius: 0}}}
              >
                  My Cats
              </Button>

              {isLoggedIn && (
                <>
                  <Button
                    component={NavLink}
                    to="/arena"
                    startIcon={<FlashOnIcon/>}
                    color="inherit"
                    sx={{"&.active": {color: '#f1c40f', borderBottom: '2px solid #f1c40f', borderRadius: 0}}}
                  >
                        Arena
                  </Button>
                  <Button
                    component={NavLink}
                    to="/leaderboard"
                    startIcon={<MilitaryTechIcon/>}
                    color="inherit"
                    sx={{"&.active": {color: '#f1c40f', borderBottom: '2px solid #f1c40f', borderRadius: 0}}}
                  >
                        Leaderboards
                  </Button>
                </>
              )}
            </Box>

            {/* --- DESKTOP AUTH --- */}
            <Box sx={{display: {xs: 'none', md: 'block'}}}>
              {isLoggedIn ? (
                <Button
                  onClick={handleLogout}
                  variant="outlined"
                  color="error"
                  startIcon={<LogoutIcon/>}
                  sx={{borderRadius: '4px', borderWidth: '2px', '&:hover': {borderWidth: '2px'}}}
                >
                      Logout
                </Button>
              ) : (
                <Button
                  component={NavLink}
                  to="/login"
                  variant="contained"
                  sx={{
                    backgroundColor: '#f1c40f',
                    color: 'black',
                    fontWeight: 'bold',
                    '&:hover': {backgroundColor: '#d4ac0d'},
                  }}
                >
                      Login
                </Button>
              )}
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* --- MOBILE DRAWER --- */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{keepMounted: true}} // Better open performance on mobile.
        sx={{
          display: {xs: 'block', md: 'none'},
          '& .MuiDrawer-paper': {boxSizing: 'border-box', width: 240, borderRight: '2px solid #f1c40f'},
        }}
      >
        {drawer}
      </Drawer>

      <Outlet/>
    </>
  );
}