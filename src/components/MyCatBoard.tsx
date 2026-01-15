import {useEffect, useState} from "react";
import {
  Typography,
} from "@mui/material";

import type {Cat} from "../types/cat";
import {CatDetail} from "./CatDetail.tsx";
import {CatGenerator} from "./CatGenerator";
import {apiRequest} from "../utils/apiClient.ts";
import {MyCatList} from "./MyCatList.tsx";

export default function MyCatBoard() {
  const [cats, setCats] = useState<Cat[]>([]);
  const [selectedCat, setSelectedCat] = useState<Cat | null>(null);

  useEffect(() => {
    const getCatData = async () => {
      try {
        const response = await apiRequest("/api/cat");
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const catsData = await response.json();
        setCats(catsData);
        if (catsData.length > 0) setSelectedCat(catsData[0]);
      } catch (err) {
        console.error("Failed to fetch cats:", err);
      }
    };
    getCatData();
  }, []);

  const handleCatAdded = (newCat: Cat) => {
    setCats((prev) => [newCat, ...prev]);
    setSelectedCat(newCat);
  };

  return (
    <div className="max-w-full mx-auto max-w-[1600px] min-h-screen flex flex-col gap-8 py-6 text-white">

      {/* OBERE SEKTION: 50/50 Split */}
      <div className="flex-shrink-0">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-full">

          {/* LINKS: Mein Rudel */}
          <div className="flex h-full">
            <div
              className="bg-[#1e1e1e] rounded-3xl border-2 border-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.1)] w-full flex flex-col overflow-hidden">
              <div className="bg-yellow-400 p-5 text-black">
                <h2 className="text-xl font-black uppercase tracking-tighter italic">Mein Rudel</h2>
                <p className="text-[10px] font-bold opacity-70 uppercase">Einsatzbereite Einheiten</p>
              </div>

              <div className="p-6 flex-grow flex flex-col overflow-hidden">
                {/* Scroll-Container für die Liste */}
                <div className="flex-grow overflow-y-auto custom-scrollbar">
                  <MyCatList cats={cats} onSelect={setSelectedCat}/>
                </div>
              </div>
            </div>
          </div>

          {/* RECHTS: Katzendetails */}
          <div className="flex h-full">
            <div
              className="bg-[#1e1e1e] rounded-3xl border-2 border-gray-700 w-full flex flex-col overflow-hidden shadow-xl">
              <div className="bg-gray-800 p-5 text-yellow-400 border-b-2 border-yellow-400">
                <h2 className="text-xl font-black uppercase tracking-tighter italic text-white">Status-Monitor</h2>
                <p className="text-[10px] font-bold text-yellow-400 uppercase">Genaue Analyse</p>
              </div>

              <div className="p-6 flex-grow overflow-y-auto custom-scrollbar">
                {selectedCat ? (
                  <CatDetail cat={selectedCat}/>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-gray-500 italic">
                    <div
                      className="w-12 h-12 mb-4 border-2 border-dashed border-gray-700 rounded-full flex items-center justify-center">?
                    </div>
                    <Typography>Wähle eine Einheit aus der Liste.</Typography>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* UNTERE SEKTION: Generator */}
      <div className="flex-grow">
        <div
          className="bg-[#1e1e1e] rounded-3xl border-2 border-dashed border-yellow-400/30 p-8 shadow-2xl relative overflow-hidden">
          {/* Dekoratives Hintergrund-Element */}
          <div className="absolute top-0 right-0 p-4 opacity-5 select-none pointer-events-none">
            <h1 className="text-9xl font-black italic">RECRUIT</h1>
          </div>

          <Typography variant="h4" sx={{
            fontWeight: 900,
            mb: 6,
            textAlign: 'center',
            color: '#facc15',
            textTransform: 'uppercase',
            fontStyle: 'italic',
            letterSpacing: -1,
          }}>
              Neue Kampfkatze beschwören
          </Typography>

          <div className="max-w-4xl mx-auto bg-black/20 p-8 rounded-2xl border border-white/5 backdrop-blur-sm">
            <CatGenerator onAdded={handleCatAdded}/>
          </div>
        </div>
      </div>
    </div>
  );
}