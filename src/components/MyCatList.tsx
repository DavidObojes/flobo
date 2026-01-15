import { motion } from "framer-motion";
import { Avatar, Typography } from "@mui/material";
import type { Cat } from "../types/cat.ts";

export const MyCatList = ({ cats, onSelect }: {
  cats: Cat[];
  onSelect: (cat: Cat) => void;
}) => (
  <div className="space-y-3 overflow-y-auto max-h-[60vh] pr-2 custom-scrollbar">
    {cats.map((cat, index) => (
      <motion.div
        key={cat._id || index}
        whileHover={{ x: 5 }} // Kleiner Slide-Effekt nach rechts beim Hover
        whileTap={{ scale: 0.98 }}
        className="group relative bg-[#2a2a2a] border border-white/5 rounded-xl p-3 flex items-center justify-between cursor-pointer hover:border-yellow-400/50 transition-all duration-200"
        onClick={() => onSelect(cat)}
      >
        <div className="flex items-center gap-4">
          {/* Avatar mit gelbem Glow-Effekt beim Hover */}
          <div className="relative">
            <Avatar
              alt={cat.name}
              src={cat.imageUrl}
              className="border-2 border-gray-700 group-hover:border-yellow-400 transition-colors"
              sx={{ width: 60, height: 60, borderRadius: '12px' }}
            />
            <div className="absolute -top-2 -right-2 bg-yellow-400 text-black text-[10px] font-black px-1.5 py-0.5 rounded shadow-lg">
              LVL {cat.level}
            </div>
          </div>

          <div>
            <Typography className="text-white font-bold tracking-tight group-hover:text-yellow-400 transition-colors">
              {cat.name}
            </Typography>
            <div className="flex items-center gap-3 mt-1">
              <div className="flex flex-col">
                <span className="text-[10px] uppercase text-gray-500 font-bold leading-none">Erfahrung</span>
                <span className="text-xs text-yellow-400/80 font-mono">{cat.xp} XP</span>
              </div>
              <div className="h-6 w-[1px] bg-white/10" />
              <div className="flex flex-col">
                <span className="text-[10px] uppercase text-gray-500 font-bold leading-none">Statistik</span>
                <span className="text-xs text-gray-400 font-mono">{cat.wins}W / {cat.losses}L</span>
              </div>
            </div>
          </div>
        </div>

        {/* Indikator-Icon an der rechten Seite */}
        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-2 h-2 bg-yellow-400 rotate-45" />
        </div>
      </motion.div>
    ))}

    {cats.length === 0 && (
      <div className="text-center py-10 border-2 border-dashed border-white/5 rounded-2xl">
        <Typography className="text-gray-600 italic">
          Dein Squad ist leer. Trainiere eine neue Katze!
        </Typography>
      </div>
    )}
  </div>
);