import {useEffect, useState} from "react";
import {EnemyCatList} from "./EnemyCatList";

import {
  Typography,
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Stack,
} from "@mui/material";

import type {Cat} from "../types/cat";
import {CatDetail} from "./CatDetail.tsx";
import {apiRequest} from "../utils/apiClient.ts";
import {MyCatList} from "./MyCatList.tsx";


// === Super Crazy LeaderBoard ===
export default function LeaderBoardGlobal() {

  const [cats, setCats] = useState<Cat[]>([]);
  const [selectedCat, setSelectedCat] = useState<Cat | null>(cats[0]);
  const [myCat, setMyCat] = useState<Cat | null>(null);
  const [fightOpen, setFightOpen] = useState(false);
  const [opponent, setOpponent] = useState<Cat | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [enemyCats, setEnemyCats] = useState<Cat[]>([]);


  useEffect(() => {
    const getCatData = async () => {
      try {

        const response = await apiRequest("/api/cat/all");

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const catsData = await response.json();
        setCats(catsData);
        if (catsData.length > 0) {
          setSelectedCat(catsData[0]);
          setMyCat(catsData[0]); // Initialisiert den Kämpfer
        }
      } catch (err) {
        console.error("Failed to fetch cats:", err);
      }
    };

    const getEnemyCats = async () => {
      try {
        const response = await apiRequest("/api/cat/enemies");
        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        setEnemyCats(data);
      } catch (err) {
        console.error("Failed to fetch enemy cats:", err);
      }
    };

    getCatData();
    getEnemyCats();
  }, []);

  const levelUpCat = async (catId: string) => {
    const res = await apiRequest(`/api/cat/${catId}/level`, {
      method: 'PATCH',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({delta: 1, incWin: true}),
    });
    if (!res.ok) throw new Error('Level up failed');
    return res.json(); // updated cat
  };

  const replaceCatInState = (updated: Cat) => {
    setCats(prev => prev.map(c => c.userId === updated.userId ? updated : c));
    setMyCat(prev => (prev && prev.userId === updated.userId ? updated : prev));
    setOpponent(prev => (prev && prev.userId === updated.userId ? updated : prev));
  };

  const power = (c: Cat) =>
    (c.stats.clawPower + c.stats.zoomSpeed + c.stats.furDensity + c.stats.cuteness + c.stats.chaosLuck) + Math.random() * 10;


  const startFight = async () => {
    if (!myCat || !opponent) return;
    const winner = power(myCat) >= power(opponent) ? myCat : opponent;

    try {
      if (!winner._id) throw new Error("Winner has no _id");
      const updatedWinner = await levelUpCat(winner._id);
      replaceCatInState(updatedWinner);
      setResult(`${updatedWinner.name} wins! Lv.${updatedWinner.level}`);
    } catch (e) {
      console.error(e);
      setResult("Konnte Level-Up nicht speichern.");
    }
  };

  const closeFight = () => {
    setFightOpen(false);
    setOpponent(null);
    setResult(null);
  };

  /*  const fight = (opponent: Cat) => {
    console.log("Fight against another Cat...");
    setOpponent(opponent);
    setFightOpen(true);
  };*/


  return (
    <div className="min-h-screen p-4 md:p-10 text-white">
      {/* Grid System: 12 Spalten für maximale Kontrolle */}
      <div className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* 1. SPALTE: SQUAD LISTE (3/12) */}
        <aside className="lg:col-span-4 flex flex-col gap-4 h-full">
          <div className="bg-[#1e1e1e] rounded-3xl border-2 border-yellow-400 overflow-hidden shadow-lg">
            <div className="bg-yellow-400 p-4 text-black">
              <h2 className="text-lg font-black uppercase italic leading-none">Squad</h2>
              <p className="text-[10px] font-bold opacity-70 uppercase">Wähle Kämpfer</p>
            </div>
            <div className="p-4">
              <MyCatList cats={cats} onSelect={(cat) => {
                setSelectedCat(cat);
                setMyCat(cat);
              }}/>
            </div>
          </div>
        </aside>

        {/* 2. SPALTE: KÄMPFER-DETAILS (5/12) */}
        <main className="lg:col-span-4 flex flex-col gap-4">
          <div className="bg-[#1e1e1e] rounded-3xl border-2 border-white/10 overflow-hidden shadow-2xl relative">
            <div className="bg-gray-800 p-4 text-white border-b border-white/5 flex justify-between items-center">
              <div>
                <h2 className="text-lg font-black uppercase italic leading-none text-yellow-400">Gewählte Einheit</h2>

              </div>
              {myCat && <div className="animate-pulse bg-red-600 px-2 py-1 rounded text-[10px] font-black italic">ACTIVE</div>}
            </div>

            <div className="p-6">
              <CatDetail cat={selectedCat}/>
            </div>
          </div>
        </main>

        {/* 3. SPALTE: GEGNER-ARENA (4/12) */}
        <aside className="lg:col-span-4 flex flex-col gap-4">
          <div className="bg-[#1e1e1e] rounded-3xl border-2 border-red-500/50 overflow-hidden shadow-lg">
            <div className="bg-red-600 p-4 text-white">
              <h2 className="text-lg font-black uppercase italic leading-none">Gegner-Arena</h2>
              <p className="text-[10px] font-bold opacity-70 uppercase">Wähle Ziel</p>
            </div>
            <div className="p-4">
              <EnemyCatList
                cats={enemyCats}
                onSelect={(cat) => setOpponent(cat)}
                onFight={(cat) => {
                  setOpponent(cat);
                  setFightOpen(true);
                }}
              />
            </div>
          </div>
        </aside>

      </div>

      {/* --- KAMPF DIALOG BLEIBT GLEICH --- */}
      <Dialog
        open={fightOpen}
        onClose={closeFight}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            bgcolor: '#1e1e1e',
            color: 'white',
            borderRadius: 4,
            border: '2px solid #facc15',
            backgroundImage: 'none',
          },
        }}
      >
        <DialogTitle className="text-center bg-yellow-400 text-black font-black uppercase italic">
          Arena Battle
        </DialogTitle>
        <DialogContent className="p-8">
          <div className="flex justify-between items-center my-6 gap-4">
            <div className="text-center group">
              {myCat && (
                <div className="relative">
                  <img
                    src={myCat.imageUrl}
                    alt={myCat.name}
                    className="w-32 h-32 md:w-40 md:h-40 object-cover rounded-full border-4 border-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.5)]"
                  />
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-yellow-400 text-black text-xs font-bold px-3 py-1 rounded">YOU</div>
                  <Typography variant="h6" className="mt-4 font-bold tracking-tight">{myCat.name}</Typography>
                </div>
              )}
            </div>

            <div className="bg-yellow-400 text-black px-4 py-2 rounded-full font-black italic animate-pulse">VS</div>

            <div className="text-center">
              {opponent && (
                <div className="relative">
                  <img
                    src={opponent.imageUrl}
                    alt={opponent.name}
                    className="w-32 h-32 md:w-40 md:h-40 object-cover rounded-full border-4 border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]"
                  />
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded">FOE</div>
                  <Typography variant="h6" className="mt-4 font-bold tracking-tight">{opponent.name}</Typography>
                </div>
              )}
            </div>
          </div>

          {result && (
            <div className="bg-white/10 p-4 rounded-xl text-center border-l-4 border-yellow-400 animate-bounce">
              <Typography variant="h5" className="font-black text-yellow-400 underline italic">{result}</Typography>
            </div>
          )}

          <Stack mt={4} spacing={2} className="bg-black/30 p-4 rounded-xl">
            <div className="flex justify-between text-sm uppercase font-bold tracking-widest text-gray-400 border-b border-white/10 pb-2">
              <span>Combat Analysis</span>
              <span>Power Level</span>
            </div>
            {/* Stats hier anzeigen */}
          </Stack>
        </DialogContent>
        <DialogActions className="p-4 bg-gray-900/50">
          {!result ? (
            <Button
              onClick={startFight}
              variant="contained"
              fullWidth
              sx={{
                bgcolor: '#facc15',
                color: 'black',
                fontWeight: 'black',
                paddingY: 1.5,
                '&:hover': {bgcolor: '#eab308'},
              }}
            >
            Angriff starten!
            </Button>
          ) : (
            <Button onClick={closeFight} sx={{color: '#facc15'}}>Schließen</Button>
          )}
        </DialogActions>
      </Dialog>
    </div>
  );
}
