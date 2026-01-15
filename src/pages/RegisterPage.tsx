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


const RegisterPage: React.FC = () => {

  const navigate = useNavigate();

  const [email, setEmail] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const [snack, setSnack] = React.useState<{ open: boolean; ok: boolean; message: string }>({
    open: false,
    ok: true,
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    const res = await fetch("/api/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({email}),
    });
    const data = await res.json();

    setLoading(false);
    setSnack({open: true, ok: res.ok, message: data.message});

    if(res.ok) {
      setTimeout( () => navigate(`/activate/`), 1500);
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
                Registrieren
            </Typography>
            <Typography variant="body2" color="text.secondary">
                Demo-Seite – es wird kein echter Account erstellt.
            </Typography>
          </Box>

          <Box component="form" onSubmit={handleSubmit} noValidate>
            <TextField
              label="E-Mail"
              type="email"
              fullWidth
              required
              margin="normal"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
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

            <Typography variant="body2" align="center" sx={{mt: 2}}>
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

export default RegisterPage;
