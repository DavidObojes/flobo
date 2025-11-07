// === Typdefinitionen ===
export type CatStats = {
  clawPower: number;
  zoomSpeed: number;
  furDensity: number;
  cuteness: number;
  chaosLuck: number;
};

export type Cat = {
  userId: string;
  name: string;
  imageUrl: string;
  stats: CatStats;
  xp: number;
  level: number;
  wins: number;
  losses: number;
};