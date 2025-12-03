import {useEffect, useState} from "react";

import {
  Typography,
  IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Stack
} from "@mui/material";
import ShuffleIcon from "@mui/icons-material/Shuffle";

import type {Cat} from "../types/cat";
//import testCats from "../data/test-cats.json";

import {CatList} from "./CatList.tsx";
import {CatDetail} from "./CatDetail.tsx";
import {CatGenerator} from "./CatGenerator";


// === Super Crazy CatBoard ===
export default function CatBoard() {

  const [cats, setCats] = useState<Cat[]>([]);
  const [selectedCat, setSelectedCat] = useState<Cat | null>(cats[0]);
  const [myCat, setMyCat] = useState<Cat | null>(null);
  const [fightOpen, setFightOpen] = useState(false);
  const [opponent, setOpponent] = useState<Cat | null>(null);
  const [result, setResult] = useState<string | null>(null);

  useEffect(() => {
    const getCatData = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const response = await fetch("/api/cat", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const catsData = await response.json();
        setCats(catsData);
        setSelectedCat(catsData[0] ?? null);
      } catch (err) {
        console.error("Failed to fetch cats:", err);
      }
    };

    getCatData();
  }, []);

  const levelUpCat = async (catId: string) => {
    const res = await fetch(`/api/cat/${catId}/level`, {
      method: 'PATCH',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({delta: 1, incWin: true})
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

  const fight = (opponent: Cat) => {
    console.log("Fight against another Cat...")
    setOpponent(opponent);
    setFightOpen(true);
  };


  return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto grid grid-cols-12 gap-6">
          {/* Katzengenerator */}
          <aside className="col-span-5 bg-white rounded-2xl shadow p-5">
            <Typography variant="h5" className="mb-8">
              Katzengenerator
            </Typography>
            <CatGenerator onGenerated={(cat) => {
              setMyCat(cat);
              setSelectedCat(cat);
            }}/>

          </aside>

          {/* Katzenübersicht */}
          <main className="col-span-7 bg-white rounded-2xl shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-semibold">Katzenübersicht</h2>
                <p className="text-sm text-gray-500">
                  Wähle eine Katze, sieh ihre Werte oder kämpfe!
                </p>
              </div>
              <div className="flex gap-2">
                <IconButton title="Mischen" onClick={() => setCats((c) => [...c].sort(() => Math.random() - 0.5))}>
                  <ShuffleIcon/>
                </IconButton>
              </div>
            </div>

            <CatList cats={cats} onFight={fight} onSelect={setSelectedCat}/>

            <Dialog open={fightOpen} onClose={closeFight} fullWidth maxWidth="sm">
              <DialogTitle>Fight!</DialogTitle>
              <DialogContent>
                <div style={{display: "flex", gap: 16, alignItems: "center", justifyContent: "space-between"}}>
                  <div style={{textAlign: "center"}}>
                    {myCat && <>
                      <img src={myCat.imageUrl} alt={myCat.name}
                           style={{width: 140, height: 140, objectFit: "cover", borderRadius: 12}}/>
                      <Typography variant="subtitle1">{myCat.name}</Typography>
                    </>}
                  </div>
                  <Typography variant="h5">vs</Typography>
                  <div style={{textAlign: "center"}}>
                    {opponent && <>
                      <img src={opponent.imageUrl} alt={opponent.name}
                           style={{width: 140, height: 140, objectFit: "cover", borderRadius: 12}}/>
                      <Typography variant="subtitle1">{opponent.name}</Typography>
                    </>}
                  </div>
                </div>

                {result && <Typography variant="h6" sx={{mt: 2}}>{result}</Typography>}
                <Stack mt={2} spacing={1}>
                  {selectedCat && (
                      <Typography variant="body2">
                        {selectedCat.name}: HP {selectedCat.stats.clawPower} • ATK {selectedCat.stats.zoomSpeed}
                      </Typography>
                  )}
                  {opponent && (
                      <Typography variant="body2">
                        {opponent.name}: HP {opponent.stats.clawPower} • ATK {opponent.stats.zoomSpeed}
                      </Typography>
                  )}
                </Stack>
              </DialogContent>
              <DialogActions>
                {!result ? <Button onClick={startFight} variant="contained">Start fight</Button>
                    : <Button onClick={closeFight}>Close</Button>}
              </DialogActions>
            </Dialog>


            <CatDetail cat={selectedCat}/>

          </main>
        </div>
      </div>
  );
}
