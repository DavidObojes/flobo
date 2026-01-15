import { NavLink, Outlet } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
} from "@mui/material";
// Icons für den Battle-Look
import PetsIcon from '@mui/icons-material/Pets';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import LogoutIcon from '@mui/icons-material/Logout';
import MilitaryTechIcon from '@mui/icons-material/MilitaryTech';
import { logout } from "../utils/apiClient.ts";

export default function Menu() {
  const isLoggedIn = !!localStorage.getItem("access_token");

  return (
    <>
      <AppBar position="sticky" sx={{ backgroundColor: '#1a1a1a', borderBottom: '2px solid #f1c40f' }}>
        <Container maxWidth="xl">
          <Toolbar disableGutters>
            {/* Logo Bereich */}
            <PetsIcon sx={{ color: '#f1c40f', mr: 1 }} />
            <Typography
              variant="h6"
              component={NavLink}
              to="/"
              sx={{
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

            {/* Haupt-Navigation */}
            <Box sx={{ flexGrow: 1, display: 'flex', gap: 1 }}>
              <Button
                component={NavLink}
                to="/"
                color="inherit"
                sx={{ "&.active": { color: '#f1c40f' } }}
              >
                Home
              </Button>

              {isLoggedIn && (
                <>
                  <Button
                    component={NavLink}
                    to="/arena"
                    startIcon={<FlashOnIcon />}
                    color="inherit"
                    sx={{ "&.active": { color: '#f1c40f' } }}
                  >
                    Arena
                  </Button>

                  {/* Test-User Links */}
                  <Button
                    component={NavLink}
                    to="/leaderboard"
                    startIcon={<MilitaryTechIcon />}
                    color="inherit"
                    sx={{ "&.active": { color: '#f1c40f' }, display: { xs: 'none', md: 'flex' } }}
                  >
                    Leaderboards
                  </Button>

                  {/* Test-User Links */}
                  {/* <Button
                    component={NavLink}
                    to="/user/1234"
                    startIcon={<PersonIcon />}
                    color="inherit"
                    sx={{ "&.active": { color: '#f1c40f' }, display: { xs: 'none', md: 'flex' } }}
                  >
                    User A
                  </Button>*/}
                </>
              )}
            </Box>

            {/* Logout/Auth Bereich */}
            <Box>
              {isLoggedIn ? (
                <Button
                  onClick={logout}
                  variant="outlined"
                  color="error"
                  startIcon={<LogoutIcon />}
                  sx={{ borderRadius: '20px' }}
                >
                  Logout
                </Button>
              ) : (
                <Button
                  component={NavLink}
                  to="/login"
                  variant="contained"
                  sx={{ backgroundColor: '#f1c40f', color: 'black', '&:hover': { backgroundColor: '#d4ac0d' } }}
                >
                  Login
                </Button>
              )}
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Hier wird der Content der Routen gerendert */}
      <Outlet />
    </>
  );
}