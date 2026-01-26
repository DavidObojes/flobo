// Zeigt Details einer ausgewählten Katze an

import {
  Avatar,
  Typography,
  Divider,
} from "@mui/material";
import type { Cat } from "../types/cat";

export const CatDetail = ({ cat }: { cat: Cat | null }) => {
  if (!cat)
    return (
      <div className="text-gray-600 text-center py-10 italic animate-pulse">
        System bereit. Warte auf Datensatz...
      </div>
    );

  return (
    <div className="bg-[#1a1a1a] rounded-2xl overflow-hidden border border-white/5 shadow-2xl">
      {/* Profil Header mit Glitch-Effekt-Farbe */}
      <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 p-4 flex gap-5 items-center">
        <Avatar
          alt={cat.name}
          src={cat.imageUrl}
          className="border-2 border-black/20 shadow-lg"
          sx={{ width: 80, height: 80, borderRadius: '12px' }}
        />
        <div>
          <Typography variant="h5" className="font-black text-black uppercase italic leading-tight">
            {cat.name}
          </Typography>
          <div className="flex gap-2 mt-1">
            <span className="bg-black/80 text-yellow-400 text-[10px] font-black px-2 py-0.5 rounded uppercase">
              RANK: {cat.level}
            </span>
            <span className="bg-black/20 text-black text-[10px] font-black px-2 py-0.5 rounded uppercase">
              XP: {cat.xp}
            </span>
          </div>
        </div>
      </div>

      <div className="p-5 space-y-6">
        {/* Attribute Sektion */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-4 bg-yellow-400" />
            <Typography className="text-white font-black uppercase text-xs tracking-widest">
              Kampf-Attribute
            </Typography>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {Object.entries(cat.stats).map(([key, value]) => (
              <div key={key} className="group flex flex-col gap-1">
                <div className="flex justify-between text-[11px] uppercase font-bold text-gray-500 group-hover:text-yellow-400/70 transition-colors">
                  <span>{key.replace(/([A-Z])/g, ' $1')}</span>
                  <span className="font-mono text-white text-sm">{value}</span>
                </div>
                {/* Visual Power Bar */}
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                   <div
                    className="h-full bg-yellow-400/40 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min((value as number) * 10, 100)}%` }}
                   />
                </div>
              </div>
            ))}
          </div>
        </div>

        <Divider className="border-white/5" />

        {/* Combat Stats Footer */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-black/30 p-3 rounded-xl border border-white/5 text-center">
            <Typography className="text-[10px] uppercase text-gray-500 font-bold mb-1">Siege</Typography>
            <Typography className="text-2xl font-black text-green-500 font-mono">{cat.wins}</Typography>
          </div>
          <div className="bg-black/30 p-3 rounded-xl border border-white/5 text-center">
            <Typography className="text-[10px] uppercase text-gray-500 font-bold mb-1">Niederlagen</Typography>
            <Typography className="text-2xl font-black text-red-500 font-mono">{cat.losses}</Typography>
          </div>
        </div>
      </div>

      {/* Deko-Element Footer */}
      <div className="bg-yellow-400/5 h-1 w-full" />
    </div>
  );
};