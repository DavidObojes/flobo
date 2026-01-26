// === Typdefinitionen ===
export type CatStats = {
  clawPower: number;
  zoomSpeed: number;
  furDensity: number;
  cuteness: number;
  chaosLuck: number;
};

export type Cat = {
  _id?: string;
  userId?: string;
  name: string;
  imageUrl: string;
  stats: CatStats;
  unspentPoints?: number;
  xp: number;
  level: number;
  wins: number;
  losses: number;
};