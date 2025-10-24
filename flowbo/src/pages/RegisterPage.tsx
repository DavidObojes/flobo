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

const RegisterPage: React.FC = () => {
  const [form, setForm] = React.useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirm: "",
    terms: false,
  });
  const [loading, setLoading] = React.useState(false);
  const [snack, setSnack] = React.useState<{ open: boolean; ok: boolean; message: string }>({
    open: false,
    ok: true,
    message: "",
  });

  const handleChange =
    (key: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value =
        e.target.type === "checkbox" ? (e.target as HTMLInputElement).checked : e.target.value;
      setForm((f) => ({ ...f, [key]: value as any }));
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (form.password !== form.confirm) {
      setSnack({ open: true, ok: false, message: "Passwörter stimmen nicht überein." });
      return;
    }
    if (!form.terms) {
      setSnack({ open: true, ok: false, message: "Bitte AGB akzeptieren (Demo)." });
      return;
    }

    setLoading(true);
    const res = await fakeAuthCall(form);
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
              Registrieren
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Demo-Seite – es wird kein echter Account erstellt.
            </Typography>
          </Box>

          <Box component="form" onSubmit={handleSubmit} noValidate>
            <TextField
              label="Vorname"
              fullWidth
              required
              margin="normal"
              value={form.firstName}
              onChange={handleChange("firstName")}
              autoComplete="given-name"
            />
            <TextField
              label="Nachname"
              fullWidth
              required
              margin="normal"
              value={form.lastName}
              onChange={handleChange("lastName")}
              autoComplete="family-name"
            />
            <TextField
              label="E-Mail"
              type="email"
              fullWidth
              required
              margin="normal"
              value={form.email}
              onChange={handleChange("email")}
              autoComplete="email"
            />
            <TextField
              label="Passwort"
              type="password"
              fullWidth
              required
              margin="normal"
              value={form.password}
              onChange={handleChange("password")}
              autoComplete="new-password"
            />
            <TextField
              label="Passwort bestätigen"
              type="password"
              fullWidth
              required
              margin="normal"
              value={form.confirm}
              onChange={handleChange("confirm")}
              autoComplete="new-password"
            />

            <FormControlLabel
              sx={{ mt: 1 }}
              control={
                <Checkbox
                  checked={form.terms}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, terms: (e.target as HTMLInputElement).checked }))
                  }
                />
              }
              label="Ich akzeptiere die AGB (Demo)"
            />

            <Button
              type="submit"
              fullWidth
              size="large"
              variant="contained"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={18} /> : null}
              sx={{ mt: 2 }}
            >
              {loading ? "Erstellen…" : "Konto erstellen"}
            </Button>

            <Typography variant="body2" align="center" sx={{ mt: 2 }}>
              Bereits ein Konto?{" "}
              <MUILink component={RouterLink} to="/login" underline="hover">
                Anmelden (Demo)
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

export default RegisterPage;
