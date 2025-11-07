// Zeigt Details einer ausgewählten Katze an

import {
  Card as MUICard,
  CardContent,
  Avatar,
  Typography,
  Divider,
} from "@mui/material";
import type { Cat } from "../types/cat";

export const CatDetail = ({ cat }: { cat: Cat | null }) => {
  if (!cat)
    return <div className="text-gray-500 text-center py-6">Keine Katze ausgewählt</div>;

  return (
    <MUICard variant="outlined" className="mt-4">
      <CardContent>
        <div className="flex gap-4 items-center mb-3">
          <Avatar alt={cat.name} src={cat.imageUrl} sx={{ width: 72, height: 72 }} />
          <div>
            <Typography variant="h6">{cat.name}</Typography>
            <Typography variant="body2" color="text.secondary">
              Level {cat.level} — XP {cat.xp}
            </Typography>
          </div>
        </div>
        <Divider className="mb-3" />
        <Typography variant="subtitle1">Attribute</Typography>
        <ul className="mt-2 text-sm text-gray-700 grid grid-cols-2 gap-x-4 gap-y-1">
          {Object.entries(cat.stats).map(([key, value]) => (
            <li key={key} className="flex justify-between">
              <span className="capitalize">{key}</span>
              <strong>{value}</strong>
            </li>
          ))}
        </ul>
        <Divider className="my-3" />
        <Typography variant="body2" color="text.secondary">
          Siege: {cat.wins} • Niederlagen: {cat.losses}
        </Typography>
      </CardContent>
    </MUICard>
  );
};