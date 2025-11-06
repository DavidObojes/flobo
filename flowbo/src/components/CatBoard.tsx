import {useState} from "react";

import {
  Card as MUICard,
  CardContent,
  Typography,
  IconButton,
} from "@mui/material";
import SportsKabaddiIcon from "@mui/icons-material/SportsKabaddi";
import ShuffleIcon from "@mui/icons-material/Shuffle";

import type {Cat} from "../types/cat";
import testCats from "../data/test-cats.json";

import {CatList} from "./CatList.tsx";
import {CatDetail} from "./CatDetail.tsx";
import {CatGenerator} from "./CatGenerator";


// === Hauptkomponente ===
export default function CatBoard() {
  const [cats, setCats] = useState<Cat[]>(testCats);

  const [selectedCat, setSelectedCat] = useState<Cat | null>(cats[0]);
  const [log, setLog] = useState<string[]>([]);

  // Kampf-Simulation
  function fight(catId: string) {
    const attacker = cats.find((c) => c.userId === catId);
    const opponents = cats.filter((c) => c.userId !== catId);
    if (!attacker || opponents.length === 0) return;

    const defender = opponents[Math.floor(Math.random() * opponents.length)];
    const aStats = attacker.stats;
    const dStats = defender.stats;

    const attackScore =
        aStats.clawPower * (0.7 + Math.random() * 0.6) +
        aStats.zoomSpeed * (Math.random() * 0.5) +
        aStats.chaosLuck * 0.1;
    const defendScore =
        dStats.furDensity * (0.7 + Math.random() * 0.6) +
        dStats.cuteness * (Math.random() * 0.5) +
        dStats.chaosLuck * 0.1;

    const winner = attackScore >= defendScore ? attacker : defender;
    const loser = winner.userId === attacker.userId ? defender : attacker;

    setLog((prev) => [
      `${new Date().toLocaleTimeString()} — ${attacker.name} vs ${defender.name} → Sieger: ${winner.name}`,
      ...prev,
    ].slice(0, 15));

    setCats((prev) =>
        prev.map((c) =>
            c.userId === winner.userId
                ? {...c, xp: c.xp + 50, wins: c.wins + 1}
                : c.userId === loser.userId
                    ? {...c, losses: c.losses + 1}
                    : c
        )
    );
  }

  return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto grid grid-cols-12 gap-6">
          {/* Katzengenerator */}
          <aside className="col-span-5 bg-white rounded-2xl shadow p-5">
            <Typography variant="h5" className="mb-8">
              Katzengenerator
            </Typography>
            <CatGenerator/>

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
                <IconButton title="Simulieren: alle kämpfen" onClick={() => cats.forEach((c) => fight(c.userId))}>
                  <SportsKabaddiIcon/>
                </IconButton>
              </div>
            </div>

            <CatList cats={cats} onFight={fight} onSelect={setSelectedCat}/>
            <CatDetail cat={selectedCat}/>

            <div className="mt-4">
              <MUICard variant="outlined">
                <CardContent>
                  <Typography variant="subtitle1">Kampflog</Typography>
                  <div className="text-xs text-gray-700 max-h-36 overflow-auto mt-2">
                    {log.length === 0 ? (
                        <div className="text-gray-500">Keine Kämpfe bisher.</div>
                    ) : (
                        log.map((l, i) => (
                            <div key={i} className="py-1 border-b last:border-b-0">
                              {l}
                            </div>
                        ))
                    )}
                  </div>
                </CardContent>
              </MUICard>
            </div>
          </main>
        </div>
      </div>
  );
}
