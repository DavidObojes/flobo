// src/pages/LoginPage.tsx
import * as React from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Checkbox,
  Container,
  FormControlLabel,
  Link as MUILink,
  Snackbar,
  TextField,
  Typography,
  CircularProgress,
  Card,
  CardContent,
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { fakeAuthCall } from "../Auth";
import { Link as RouterLink } from "react-router-dom";

const LoginPage: React.FC = () => {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [remember, setRemember] = React.useState(true);
  const [loading, setLoading] = React.useState(false);
  const [snack, setSnack] = React.useState<{ open: boolean; ok: boolean; message: string }>({
    open: false,
    ok: true,
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await fakeAuthCall({ email, password, remember });
    setLoading(false);
    setSnack({ open: true, ok: res.ok, message: res.message });
  };

  return (
    <Container maxWidth="sm" sx={{ minHeight: "100dvh", display: "flex", alignItems: "center" }}>
      <Card sx={{ width: "100%", borderRadius: 3, boxShadow: 6 }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mb: 2 }}>
            <Avatar sx={{ m: 1 }}>
              <LockOutlinedIcon />
            </Avatar>
            <Typography component="h1" variant="h5" fontWeight={700}>
              Anmelden
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Nur Demo – keine echte Authentifizierung.
            </Typography>
          </Box>

          <Box component="form" onSubmit={handleSubmit} noValidate>
            <TextField
              label="E-Mail"
              type="email"
              fullWidth
              required
              margin="normal"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <TextField
              label="Passwort"
              type="password"
              fullWidth
              required
              margin="normal"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  color="primary"
                />
              }
              label="Angemeldet bleiben"
            />

            <Button
              type="submit"
              fullWidth
              size="large"
              variant="contained"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={18} /> : null}
              sx={{ mt: 1.5 }}
            >
              {loading ? "Anmelden…" : "Anmelden"}
            </Button>

            <Typography variant="body2" align="center" sx={{ mt: 2 }}>
              Neu hier?{" "}
              <MUILink component={RouterLink} to="/register" underline="hover">
                Konto erstellen (Demo)
              </MUILink>
            </Typography>
          </Box>
        </CardContent>
      </Card>

      <Snackbar
        open={snack.open}
        autoHideDuration={2400}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={snack.ok ? "success" : "error"}
          variant="filled"
          onClose={() => setSnack((s) => ({ ...s, open: false }))}
          sx={{ width: "100%" }}
        >
          {snack.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default LoginPage;
