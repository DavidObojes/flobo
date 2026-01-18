// src/pages/LoginPage.tsx
import * as React from "react";
import {
  Alert,
  Box,
  Button,
  Container,
  Link as MUILink,
  Snackbar,
  TextField,
  Typography,
  CircularProgress,
} from "@mui/material";
import {Link as RouterLink, useNavigate} from "react-router-dom";
import PetsIcon from "@mui/icons-material/Pets";

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
        headers: {"Content-Type": "application/x-www-form-urlencoded"},
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

        setSnack({open: true, ok: true, message: "Login erfolgreich"});
        setTimeout(() => navigate(`/`), 1500);
      } else {
        // ❌ Fehler
        const errorMessage = "Login fehlgeschlagen";

        setSnack({open: true, ok: false, message: errorMessage});
      }
    } catch (err) {
      console.error(err);
      setSnack({open: true, ok: false, message: "Netzwerkfehler"});
    } finally {
      setLoading(false);
    }
  };

  const terminalInputStyle = {
    '& label': {color: '#666', fontWeight: 'bold',},
    '& label.Mui-focused': {color: '#facc15'},
    '& .MuiOutlinedInput-root': {
      color: 'white',
      fontFamily: 'monospace',
      marginBottom: '2rem',
      borderRadius: '12px',
      overflow: 'hidden',
      '& fieldset': {borderColor: 'rgba(255,255,255,0.1)'},
      '&:hover fieldset': {borderColor: 'rgba(255,255,255,0.3)'},
      '&.Mui-focused fieldset': {borderColor: '#facc15', borderWidth: '2px'},
      bgcolor: 'rgba(0,0,0,0.2)',
    },
  };


  return (
    <Container
      maxWidth={false}
      sx={{
        minHeight: "100dvh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bg: "#121212", // Sicherstellen, dass der Hintergrund schwarz ist
        p: 0,
      }}
    >
      {/* Das Login-Terminal */}
      <div
        className="w-full max-w-md bg-[#1e1e1e] rounded-3xl border-2 border-yellow-400 shadow-[0_0_30px_rgba(250,204,21,0.15)] overflow-hidden">

        {/* Header-Balken im Topbar-Stil */}
        <div className="bg-yellow-400 p-6 text-black items-center gap-4">

          <PetsIcon sx={{ color: '#000000'}} />

          <div>
            <h1 className="text-xl font-black uppercase italic leading-none tracking-tighter">
                Cat Brawl
            </h1>
            <p className="text-[10px] font-bold opacity-70 uppercase tracking-widest mt-1">
                Identity Verification Required
            </p>
          </div>
        </div>

        <div className="p-8">
          <Box component="form" onSubmit={handleSubmit} noValidate className="space-y-4">
            {/* E-Mail Feld */}
            <TextField className="mb-8 block"
              label="E-MAIL"
              type="email"
              fullWidth
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={terminalInputStyle}
            />


            {/* Passwort Feld */}
            <TextField
              label="PASSWORD"
              type="password"
              fullWidth
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              sx={terminalInputStyle}
            />

            <div className="pt-4">
              <Button
                type="submit"
                fullWidth
                size="large"
                variant="contained"
                disabled={loading}
                sx={{
                  bgcolor: '#facc15',
                  color: 'black',
                  fontWeight: 900,
                  fontStyle: 'italic',
                  py: 1.5,
                  fontSize: '1rem',
                  '&:hover': {bgcolor: '#fff', boxShadow: '0 0 20px rgba(255,255,255,0.2)'},
                  '&.Mui-disabled': {bgcolor: '#333', color: '#666'},
                }}
                startIcon={loading ? <CircularProgress size={18} color="inherit"/> : null}
              >
                {loading ? "AUTHENTICATING..." : "Login"}
              </Button>
            </div>

            <div className="mt-6 text-center border-t border-white/5 pt-6">
              <Typography variant="body2"
                sx={{color: '#666', fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.7rem'}}>
                  New Recruit?{" "}
                <MUILink
                  component={RouterLink}
                  to="/register"
                  sx={{color: '#facc15', textDecoration: 'none', '&:hover': {textDecoration: 'underline'}}}
                >
                    Initialize New Account
                </MUILink>
              </Typography>
            </div>
          </Box>
        </div>
      </div>

      {/* Snackbar wie gewohnt, aber farblich passend */}
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
          sx={{
            bgcolor: snack.ok ? '#facc15' : '#ef4444',
            color: snack.ok ? 'black' : 'white',
            fontWeight: 'bold',
            textTransform: 'uppercase',
            fontSize: '0.75rem',
          }}
        >
          {snack.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default LoginPage;
