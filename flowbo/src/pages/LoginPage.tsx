// src/pages/LoginPage.tsx
import * as React from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Container,
  Link as MUILink,
  Snackbar,
  TextField,
  Typography,
  CircularProgress,
  Card,
  CardContent,
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import {Link as RouterLink, useNavigate} from "react-router-dom";

const LoginPage: React.FC = () => {

  const navigate = useNavigate();

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [snack, setSnack] = React.useState<{ open: boolean; ok: boolean; message: string }>({
    open: false,
    ok: true,
    message: "",
  });

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);

  try {
    const formData = new URLSearchParams();
    formData.append("grant_type", "password");
    formData.append("username", email);
    formData.append("password", password);
    formData.append("client_id", "client");

    const res = await fetch("/api/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formData,
    });

    let data;
    try {
      data = await res.json(); // ✅ versuch JSON zu parsen
    } catch {
      data = {}; // kein JSON im Fehlerfall
    }

    if (res.ok) {
      // ✅ Erfolg
      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("refresh_token", data.refresh_token);
      localStorage.setItem("expires_in", (Date.now() + data.expires_in * 1000).toString());

      setSnack({ open: true, ok: true, message: "Login erfolgreich" });
      setTimeout(() => navigate(`/`), 1500);
    } else {
      // ❌ Fehler
      const errorMessage = "Login fehlgeschlagen";

      setSnack({ open: true, ok: false, message: errorMessage });
    }
  } catch (err) {
    console.error(err);
    setSnack({ open: true, ok: false, message: "Netzwerkfehler" });
  } finally {
    setLoading(false);
  }
};


  return (
      <Container maxWidth="sm" sx={{minHeight: "100dvh", display: "flex", alignItems: "center"}}>
        <Card sx={{width: "100%", borderRadius: 3, boxShadow: 6}}>
          <CardContent sx={{p: 4}}>
            <Box sx={{display: "flex", flexDirection: "column", alignItems: "center", mb: 2}}>
              <Avatar sx={{m: 1}}>
                <LockOutlinedIcon/>
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

              <Button
                  type="submit"
                  fullWidth
                  size="large"
                  variant="contained"
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={18}/> : null}
                  sx={{mt: 1.5}}
              >
                {loading ? "Anmelden…" : "Anmelden"}
              </Button>

              <Typography variant="body2" align="center" sx={{mt: 2}}>
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
            onClose={() => setSnack((s) => ({...s, open: false}))}
            anchorOrigin={{vertical: "bottom", horizontal: "center"}}
        >
          <Alert
              severity={snack.ok ? "success" : "error"}
              variant="filled"
              onClose={() => setSnack((s) => ({...s, open: false}))}
              sx={{width: "100%"}}
          >
            {snack.message}
          </Alert>
        </Snackbar>
      </Container>
  );
};

export default LoginPage;
