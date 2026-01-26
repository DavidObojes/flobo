import {Avatar, Button, CircularProgress, Typography} from "@mui/material";
import {useState} from "react";
import type {CatStats} from "../types/cat.ts";
import generateRandomStats from "../utils/generateRandomStats.ts";
import {generateRandomCatName} from "../utils/generateRandomCatName.ts";
import type {Cat} from "../types/cat";
import ShuffleIcon from "@mui/icons-material/Shuffle";
import {apiRequest} from "../utils/apiClient.ts";


const CAT_URL = "https://cataas.com/cat?json=true";

export const CatGenerator = ({onAdded}: { onAdded?: (cat: Cat) => void }) => {

  const [loading, setLoading] = useState(false);
  const [catGenerated, setCatGenerated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingCat, setPendingCat] = useState<Cat | null>(null);

  const getRandomCatImage = async () => {
    try {
      const res = await fetch(CAT_URL);
      const data = await res.json();
      return data.url;
    } catch (err) {
      console.error(err);
    }
  };

  const generateCat = async () => {
    setLoading(true);
    setError(null);

    try {

      const image = await getRandomCatImage();
      const newCat: Cat = {
        name: generateRandomCatName(),
        imageUrl: image,
        stats: generateRandomStats(),
        xp: 0,
        level: 1,
        wins: 0,
        losses: 0,
      };

      setPendingCat(newCat);
      return newCat;
    } catch (e: any) {
      console.error(e);
      setError(e?.message ?? "Unknown error");
    } finally {
      setLoading(false);
      setCatGenerated(true);
    }
  };


  const addToPack = async (cat: Cat) => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiRequest("/api/cat", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(cat),
      });

      if (!res.ok) {
        const msg = await res.text();
        throw new Error(`Server returned ${res.status}: ${msg}`);
      }

      const savedCatFromServer = await res.json();

      // WICHTIG: Nur die vom Server bestätigte Katze (inkl. ID) zurückgeben
      onAdded?.(savedCatFromServer);

      // Generator zurücksetzen, damit Platz für die nächste Katze ist
      setCatGenerated(false);
      setPendingCat(null);

      console.log("Added Cat to DB and updated Dashboard");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-10 items-center md:items-stretch">

      {/* LINKE SEITE: Das Hologramm/Bild */}
      <div className="flex-shrink-0 relative group">

        <div className="relative">
          <Avatar
            alt="Generated Cat"
            src={loading ? "" : pendingCat?.imageUrl || ""}
            sx={{
              width: "320px",
              height: "320px",
              borderRadius: "100%",
              border: loading ? "4px dashed #444" : "4px solid #facc15",
              objectFit: "cover",
              opacity: loading ? 0.3 : 1,
              transition: "all 0.5s ease",
              boxShadow: loading ? "none" : "0 0 30px rgba(250, 204, 21, 0.2)",
              backgroundColor: "#1a1a1a",
            }}
          >
            {loading && <CircularProgress size={80} sx={{color: '#facc15'}}/>}
          </Avatar>

          {/* Scan-Linie Effekt wenn lädt */}
          {loading && (
            <div
              className="absolute top-0 left-0 w-full h-1 bg-yellow-400/50 shadow-[0_0_15px_#facc15] animate-scan"/>
          )}
        </div>
      </div>

      {/* RECHTE SEITE: Infos & Buttons */}
      <div className="flex-grow w-full flex flex-col justify-center self-stretch">

        {catGenerated && pendingCat ? (
          <div className="animate-in fade-in zoom-in-95 duration-500 flex flex-col h-full">
            {/* Header */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-[2px] bg-yellow-400"></div>
                <span className="text-yellow-400 text-[10px] font-black uppercase tracking-[0.2em]">Einheit Identifiziert</span>
              </div>
              <Typography variant="h3" sx={{
                fontWeight: 900,
                textTransform: 'uppercase',
                fontStyle: 'italic',
                color: 'white',
                letterSpacing: -1,
              }}>
                {pendingCat.name}
              </Typography>
            </div>

            {/* Stats-Monitor */}
            <div
              className="grid grid-cols-2 gap-x-6 gap-y-3 mb-8 bg-black/40 p-5 rounded-2xl border border-white/5">
              {(Object.keys(pendingCat.stats) as (keyof CatStats)[]).map((key) => (
                <div key={key} className="flex flex-col border-b border-white/5 pb-1 group">
                  <span
                    className="text-gray-500 text-[9px] uppercase font-black group-hover:text-yellow-400/50 transition-colors">
                    {key.replace(/([A-Z])/g, ' $1')}
                  </span>
                  <span className="font-mono font-bold text-lg text-white">
                    {pendingCat.stats[key]}
                  </span>
                </div>
              ))}
            </div>

            {/* Action-Buttons */}
            <div className="mt-auto flex flex-col sm:flex-row gap-4">
              <Button
                onClick={() => addToPack(pendingCat)}
                type="submit"
                fullWidth
                size="large"
                variant="contained"
                disabled={loading || !pendingCat}
                sx={{
                  bgcolor: '#facc15',
                  color: 'black',
                  fontWeight: 900,
                  fontSize: '1rem',
                  fontStyle: 'italic',
                  '&:hover': {bgcolor: '#eab308', transform: 'translateY(-2px)'},
                  '&.Mui-disabled': {bgcolor: '#333', color: '#666'},
                }}
              >
                    Einheit rekrutieren
              </Button>

              <Button
                fullWidth
                variant="outlined"
                disabled={loading}
                onClick={generateCat}
                sx={{
                  borderColor: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  fontWeight: 700,
                  '&:hover': {borderColor: '#facc15', bgcolor: 'transparent', color: '#facc15'},
                }}
              >
                    Neu auswürfeln
              </Button>
            </div>
          </div>
        ) : (
        /* Initialer Zustand: Das Terminal-Portal */
          <div
            className="flex flex-col items-center justify-center h-full text-center p-10 bg-[#1a1a1a] rounded-3xl border-2 border-dashed border-white/10 relative overflow-hidden">
            <div className="absolute inset-0 bg-yellow-400/[0.02] pointer-events-none"></div>

            <Button
              onClick={generateCat}
              size="large"
              variant="contained"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} color="inherit"/> : <ShuffleIcon/>}
              sx={{
                bgcolor: '#facc15',
                color: 'black',
                px: 6,
                py: 2,
                fontWeight: 900,
                borderRadius: '99px',
                '&:hover': {bgcolor: '#fff', boxShadow: '0 0 20px rgba(255,255,255,0.3)'},
              }}
            >
              {loading ? "Initialisiere..." : "Katze beschwören"}
            </Button>
          </div>
        )}

        {error && (
          <div className="mt-4 p-3 bg-red-900/20 border border-red-500/50 rounded-lg">
            <Typography className="text-red-500 text-xs font-bold text-center italic uppercase">
                  Kritischer Systemfehler: {error}
            </Typography>
          </div>
        )}
      </div>
    </div>
  );
};