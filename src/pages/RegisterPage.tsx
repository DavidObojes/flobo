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
import { Link as RouterLink, useNavigate } from "react-router-dom";

// Der konsistente Terminal-Stil für die Eingabefelder
const terminalInputStyle = {
  '& label': { color: '#666', fontWeight: 'bold'},
  '& label.Mui-focused': { color: '#facc15' },
  '& .MuiOutlinedInput-root': {
    marginBottom: '2rem',
    color: 'white',
    fontFamily: 'monospace',
    '& fieldset': { borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px'},
    '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.3)'},
    '&.Mui-focused fieldset': { borderColor: '#facc15', borderWidth: '2px' },
    bgcolor: 'rgba(0,0,0,0.2)',
  },
};

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
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();

    setLoading(false);
    setSnack({ open: true, ok: res.ok, message: data.message });

    if (res.ok) {
      setTimeout(() => navigate(`/activate/`), 1500);
    }
  };

  return (
    <Container
      maxWidth={false}
      sx={{
        minHeight: "100dvh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "#121212",
        p: 0,
      }}
    >
      <div className="w-full max-w-md bg-[#1e1e1e] rounded-3xl border-2 border-yellow-400 shadow-[0_0_30px_rgba(250,204,21,0.15)] overflow-hidden">

        {/* Header-Balken */}
        <div className="bg-yellow-400 p-6 text-black items-center gap-4">
          <div>
            <h1 className="text-xl font-black uppercase italic leading-none tracking-tighter">
              Register
            </h1>
            <p className="text-[10px] font-bold opacity-70 uppercase tracking-widest mt-1">
              Initialize Combat Profile
            </p>
          </div>
        </div>

        <div className="p-8">

          <Box component="form" onSubmit={handleSubmit} noValidate className="space-y-6">
            <TextField
              label="EMAIL"
              type="email"
              fullWidth
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={terminalInputStyle}
            />

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
                '&:hover': { bgcolor: '#fff', boxShadow: '0 0 20px rgba(255,255,255,0.2)' },
                '&.Mui-disabled': { bgcolor: '#333', color: '#666' },
              }}
              startIcon={loading ? <CircularProgress size={18} color="inherit" /> : null}
            >
              {loading ? "INITIALIZING..." : "CREATE PROFILE"}
            </Button>

            <div className="mt-6 text-center border-t border-white/5 pt-6">
              <Typography variant="body2" sx={{ color: '#666', fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.7rem' }}>
                Already registered?{" "}
                <MUILink
                  component={RouterLink}
                  to="/login"
                  sx={{ color: '#facc15', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                >
                  Return to Login
                </MUILink>
              </Typography>
            </div>
          </Box>
        </div>
      </div>

      <Snackbar
        open={snack.open}
        autoHideDuration={2400}
        onClose={() => setSnack((s) => ({...s, open: false}))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
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

export default RegisterPage;