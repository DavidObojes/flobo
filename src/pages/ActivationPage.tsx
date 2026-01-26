import * as React from "react";
import {
  Alert,
  Box,
  Button,
  Container,
  Snackbar,
  TextField,
  Typography,
  CircularProgress,
} from "@mui/material";
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser'; // Passenderes Icon
import { useNavigate, useParams } from "react-router-dom";

// Der bewährte Terminal-Stil für die Inputs
const terminalInputStyle = {
  '& label': { color: '#666', fontWeight: 'bold', fontSize: '0.75rem' },
  '& label.Mui-focused': { color: '#facc15' },
  '& .MuiOutlinedInput-root': {
    marginBottom: '1rem',
    color: 'white',
    fontFamily: 'monospace',
    '& fieldset': { borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' },
    '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
    '&.Mui-focused fieldset': { borderColor: '#facc15', borderWidth: '2px' },
    bgcolor: 'rgba(0,0,0,0.2)',
  },
};

const ActivationPage: React.FC = () => {
  const navigate = useNavigate();
  const { token } = useParams();

  const [form, setForm] = React.useState({
    firstName: "",
    lastName: "",
    password: "",
  });

  const [loading, setLoading] = React.useState(false);
  const [snack, setSnack] = React.useState<{ open: boolean; ok: boolean; message: string }>({
    open: false,
    ok: true,
    message: "",
  });

  const handleChange = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const res = await fetch(`/api/register/${token}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    setLoading(false);
    if (!res.ok) {
      setSnack({ open: true, ok: false, message: "Kritischer Fehler bei Profil-Aktivierung" });
    } else {
      setSnack({ open: true, ok: true, message: "Profil erfolgreich autorisiert" });
      setTimeout(() => navigate(`/`), 1500);
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
      {token ? (
        <div className="w-full max-w-md bg-[#1e1e1e] rounded-3xl border-2 border-yellow-400 shadow-[0_0_30px_rgba(250,204,21,0.15)] overflow-hidden">
          
          {/* Header-Balken */}
          <div className="bg-yellow-400 p-6 text-black items-center gap-4">
              <VerifiedUserIcon sx={{ color: '#000' }} />
            <div>
              <h1 className="text-xl font-black uppercase italic leading-none tracking-tighter">
                Create Profile
              </h1>
              <p className="text-[10px] font-bold opacity-70 uppercase tracking-widest mt-1">
                Establish Brawl Identity
              </p>
            </div>
          </div>

          <div className="p-8">
            <Box component="form" onSubmit={handleSubmit} noValidate className="space-y-5">
              <TextField
                label="FIRST_NAME"
                fullWidth
                required
                value={form.firstName}
                onChange={handleChange("firstName")}
                autoComplete="given-name"
                sx={terminalInputStyle}
              />
              <TextField
                label="LAST_NAME"
                fullWidth
                required
                value={form.lastName}
                onChange={handleChange("lastName")}
                autoComplete="family-name"
                sx={terminalInputStyle}
              />
              <TextField
                label="SECRET_PASSWORD"
                type="password"
                fullWidth
                required
                value={form.password}
                onChange={handleChange("password")}
                autoComplete="new-password"
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
                    '&:hover': { bgcolor: '#fff', boxShadow: '0 0 20px rgba(255,255,255,0.2)' },
                    '&.Mui-disabled': { bgcolor: '#333', color: '#666' },
                  }}
                  startIcon={loading ? <CircularProgress size={18} color="inherit" /> : null}
                >
                  {loading ? "ESTABLISHING..." : "FINALIZE PROFILE"}
                </Button>
              </div>
            </Box>
          </div>
        </div>
      ) : (
        /* Fallback wenn kein Token da ist */
        <div className="text-center p-12 bg-[#1e1e1e] border-2 border-dashed border-yellow-400/30 rounded-3xl max-w-lg mx-4">
          <div className="text-yellow-400 mb-6 flex justify-center scale-[2]">
            <VerifiedUserIcon />
          </div>
          <Typography variant="h5" sx={{ color: 'white', fontWeight: 900, textTransform: 'uppercase', fontStyle: 'italic', mb: 2 }}>
            Awaiting Verification
          </Typography>
          <Typography sx={{ color: '#666', fontWeight: 'bold' }}>
            Check your transmission. A secure link has been sent to activate your combat profile.
          </Typography>
        </div>
      )}

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

export default ActivationPage;