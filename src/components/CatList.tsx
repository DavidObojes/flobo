// Listet alle Katzen in einer Liste mit Vorschau & Fight-Button

import { motion } from "framer-motion";
import {
  Avatar,
  Button,
} from "@mui/material";

import type {Cat} from "../types/cat.ts";


export const CatList = ({ cats, onFight, onSelect }: {
  cats: Cat[];
  onFight: (cat: Cat) => void;
  onSelect: (cat: Cat) => void;
}) => (
  <div className="space-y-3 overflow-auto pr-2">
    {cats.map((cat) => (
      <motion.div
        key={cat.userId}
        whileHover={{ scale: 1.01 }}
        className="bg-gray-50 rounded-xl p-3 flex items-center justify-between cursor-pointer hover:bg-gray-100"
        onClick={() => onSelect(cat)}
      >
        <div className="flex items-center gap-3">
          <Avatar alt={cat.name} src={cat.imageUrl} sx={{ width: 56, height: 56 }} />
          <div>
            <h3 className="font-medium">{cat.name}</h3>
            <div className="text-xs text-gray-500">Lvl {cat.level} • XP {cat.xp}</div>
          </div>
        </div>

        <Button
          variant="contained"
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            onFight(cat);
          }}
        >
          Fight
        </Button>
      </motion.div>
    ))}
    {cats.length === 0 && (
      <div className="text-center text-gray-500 py-6">
        Keine Katzen vorhanden.
      </div>
    )}
  </div>
);