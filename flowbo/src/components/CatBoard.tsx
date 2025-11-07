import {useEffect, useState} from "react";

import {
  Typography,
  IconButton,
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

   useEffect(() => {
    const getCatData = async () => {
      try {
        const response = await fetch("/api/cat");
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const catsData = await response.json();
        setCats(catsData);
      } catch (err) {
        console.error("Failed to fetch cats:", err);
      }
    };

    getCatData();
  }, []); // Empty dependency array → runs once on mount



  const fight = () => {
    console.log("Fight against another Cat...")
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
              </div>
            </div>

            <CatList cats={cats} onFight={fight} onSelect={setSelectedCat}/>
            <CatDetail cat={selectedCat}/>

          </main>
        </div>
      </div>
  );
}
