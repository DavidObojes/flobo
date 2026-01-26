import { motion } from "framer-motion";
import { Avatar, Button, Typography } from "@mui/material";
import type { Cat } from "../types/cat.ts";
import type { User } from "../types/user.ts"; // Import the User type
import SportsMmaIcon from '@mui/icons-material/SportsMma';

type EnemyCatListProps = {
  cats: Cat[];
  users: User[]; // Add users prop
  onFight: (cat: Cat) => void;
  onSelect: (cat: Cat) => void;
};

export const EnemyCatList = ({ cats, users, onFight, onSelect }: EnemyCatListProps) => {

  // Helper to find the trainer's name
  const getOwnerName = (userId: string | undefined) => {
    const user = users.find((u) => String(u._id) === String(userId));
    return user ? `${user.firstName} ${user.lastName}` : "Anonym";
  };

  return (
    <div className="space-y-3 overflow-y-auto max-h-[60vh] pr-2 custom-scrollbar">
      {cats.map((cat) => (
        <motion.div
          key={cat._id ?? cat.name}
          whileHover={{ x: -5 }}
          whileTap={{ scale: 0.98 }}
          className="group relative bg-[#2a2a2a] border border-white/5 rounded-xl p-3 flex items-center justify-between cursor-pointer hover:border-red-500/50 transition-all duration-200"
          onClick={() => onSelect(cat)}
        >
          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar
                alt={cat.name}
                src={cat.imageUrl}
                className="border-2 border-gray-700 group-hover:border-red-500 transition-colors"
                sx={{ width: 60, height: 60, borderRadius: '12px' }}
              />
              <div className="absolute -top-2 -left-2 bg-red-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded shadow-lg">
                LVL {cat.level}
              </div>
            </div>

            <div>
              <Typography className="text-white text-left font-bold tracking-tight group-hover:text-red-400 transition-colors">
                {cat.name}
              </Typography>
              <div className="flex flex-col mt-1 text-left">
                <span className="text-[10px] uppercase text-gray-500 font-bold leading-none">Besitzer</span>
                {/* DISPLAY TRAINER NAME HERE */}
                <span className="text-xs text-red-400/80 font-black italic truncate max-w-[120px]">
                  {getOwnerName(cat.userId)}
                </span>
              </div>
            </div>
          </div>

          <Button
            variant="contained"
            size="small"
            startIcon={<SportsMmaIcon />}
            onClick={(e) => {
              e.stopPropagation();
              onFight(cat);
            }}
            sx={{
              bgcolor: 'transparent',
              border: '1px solid #ef4444',
              color: '#ef4444',
              fontWeight: 'bold',
              textTransform: 'uppercase',
              fontSize: '0.7rem',
              '&:hover': {
                bgcolor: '#ef4444',
                color: 'white',
                boxShadow: '0 0 15px rgba(239, 68, 68, 0.4)',
              },
            }}
          >
            Fight
          </Button>
        </motion.div>
      ))}

      {cats.length === 0 && (
        <div className="text-center py-10 border-2 border-dashed border-white/5 rounded-2xl">
          <Typography className="text-gray-600 italic text-sm">
            Keine Gegner in Sicht. Die Arena ist leer...
          </Typography>
        </div>
      )}
    </div>
  );
};