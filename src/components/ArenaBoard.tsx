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
import type {User} from "../types/user.ts";


// === Super Crazy Arenaboard ===
export default function ArenaBoard() {

  const [cats, setCats] = useState<Cat[]>([]);
  const [selectedCat, setSelectedCat] = useState<Cat | null>(cats[0]);
  const [myCat, setMyCat] = useState<Cat | null>(null);
  const [fightOpen, setFightOpen] = useState(false);
  const [opponent, setOpponent] = useState<Cat | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [enemyCats, setEnemyCats] = useState<Cat[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      const res = await apiRequest("/api/user");
      const data = await res.json();
      setUsers(data);
    };
    fetchUsers();
  }, []);


  useEffect(() => {
    const getCatData = async () => {
      try {

        const response = await apiRequest("/api/cat");

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

  const updateCatStats = async (catId: string | undefined, isWinner: boolean) => {
    const res = await apiRequest(`/api/cat/${catId}/progress`, {
      method: 'PATCH',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        // Only the winner gains a level/progress point
        delta: isWinner ? 1 : 0,
        incWin: isWinner,
        incLoss: !isWinner,
      }),
    });

    if (!res.ok) throw new Error(`Failed to update stats for cat ${catId}`);
    return res.json();
  };

  const replaceCatInState = (updated: Cat) => {
    // 1. Update your Squad list (only replace the cat with the matching _id)
    setCats(prev => prev.map(c => c._id === updated._id ? updated : c));

    // 2. Update the Enemy list (in case the opponent was an enemy)
    setEnemyCats(prev => prev.map(c => c._id === updated._id ? updated : c));

    // 3. Update active UI references
    if (selectedCat?._id === updated._id) setSelectedCat(updated);
    if (myCat?._id === updated._id) setMyCat(updated);
    if (opponent?._id === updated._id) setOpponent(updated);
  };

  const power = (c: Cat) =>
    (c.stats.clawPower + c.stats.zoomSpeed + c.stats.furDensity + c.stats.cuteness + c.stats.chaosLuck) + Math.random() * 10;


  const startFight = async () => {
    if (!myCat || !opponent) return;

    // 1. Determine outcome locally
    const iWon = power(myCat) >= power(opponent);
    const winner = iWon ? myCat : opponent;
    const loser = iWon ? opponent : myCat;

    try {
      // 2. Fire both fetch calls simultaneously
      const [updatedWinner, updatedLoser] = await Promise.all([
        updateCatStats(winner._id, true),  // The Winner
        updateCatStats(loser._id, false),  // The Loser
      ]);

      // 3. Sync your local React state with the new data
      replaceCatInState(updatedWinner);
      replaceCatInState(updatedLoser);

      setResult(`${updatedWinner.name} wins!`);
    } catch (e) {
      console.error("Combat sync failed:", e);
      setResult("Combat recorded locally, but server sync failed.");
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
              {myCat && <div
                className="animate-pulse bg-red-600 px-2 py-1 rounded text-[10px] font-black italic">ACTIVE</div>}
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
                users={users}
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

      {/* --- KAMPF DIALOG --- */}
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
        <DialogContent>
          <div className="flex justify-between items-center my-6 gap-4">
            <div className="text-center group">
              {myCat && (
                <div className="relative">
                  <img
                    src={myCat.imageUrl}
                    alt={myCat.name}
                    className="w-32 h-32 md:w-40 md:h-40 object-cover rounded-full border-4 border-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.5)]"
                  />

                  <Typography variant="h6" mt={2} mb={2}>{myCat.name}</Typography>
                  <div
                    className="bg-yellow-400 text-black text-xs font-bold px-3 py-1 rounded max-w-[50px] mx-auto">YOU
                  </div>
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
                  <Typography variant="h6" mt={2} mb={2}>{opponent.name}</Typography>
                  <div
                    className="bg-red-500 text-black text-xs font-bold px-3 py-1 rounded max-w-[50px] mx-auto">FOE
                  </div>
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
            <div
              className="flex justify-between text-sm uppercase font-bold tracking-widest text-gray-400 border-b border-white/10 pb-2">
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
                  Start Combat!
            </Button>
          ) : (
            <Button onClick={closeFight} sx={{color: '#facc15'}}>Schließen</Button>
          )}
        </DialogActions>
      </Dialog>
    </div>
  );
}
