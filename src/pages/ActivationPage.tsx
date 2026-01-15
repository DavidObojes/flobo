import * as React from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Container,
  Snackbar,
  TextField,
  Typography,
  CircularProgress,
  Card,
  CardContent,
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import {useNavigate, useParams} from "react-router-dom";

const ActivationPage: React.FC = () => {
  const navigate = useNavigate();

  const [form, setForm] = React.useState({
    firstName: "",
    lastName: "",
    password: "",
  });

  const {token} = useParams();

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
          setForm((f) => ({...f, [key]: value as any}));
        };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    const res = await fetch(`/api/register/${token}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    });

    if (!res.ok) {
      setLoading(false);
      setSnack({open: true, ok: false, message: "Fehler"});
    } else {
      setLoading(false);
      setSnack({open: true, ok: true, message: "Erfolgreich erstellt"});
      setTimeout(() => navigate(`/`), 1500);
    }


  };

  return (<>
    {token &&
            <Container maxWidth="sm" sx={{minHeight: "100dvh", display: "flex", alignItems: "center"}}>
              <Card sx={{width: "100%", borderRadius: 3, boxShadow: 6}}>
                <CardContent sx={{p: 4}}>
                  <Box sx={{display: "flex", flexDirection: "column", alignItems: "center", mb: 2}}>
                    <Avatar sx={{m: 1}}>
                      <LockOutlinedIcon/>
                    </Avatar>
                    <Typography component="h1" variant="h5" fontWeight={700}>
                      Kontoaktivierung
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
                      label="Passwort"
                      type="password"
                      fullWidth
                      required
                      margin="normal"
                      value={form.password}
                      onChange={handleChange("password")}
                      autoComplete="new-password"
                    />

                    <Button
                      type="submit"
                      fullWidth
                      size="large"
                      variant="contained"
                      disabled={loading}
                      startIcon={loading ? <CircularProgress size={18}/> : null}
                      sx={{mt: 2}}
                    >
                      {loading ? "Erstellen…" : "Konto erstellen"}
                    </Button>
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
    }
    {!token &&
            <Typography component="h1" variant="h5" fontWeight={700}>
              We've sent you an verification link to activate your account!
            </Typography>
    }
  </>
  );
};

export default ActivationPage;
