// Function to generate random stats
import type {CatStats} from "../types/cat.ts";

export default function generateRandomStats(): CatStats {
  let randomPoints = 15;

  // Initialize stats with 0
  const stats: CatStats = {
    clawPower: 0,
    zoomSpeed: 0,
    furDensity: 0,
    cuteness: 0,
    chaosLuck: 0,
  };

  const keys = Object.keys(stats) as (keyof CatStats)[];

  // Distribute points randomly
  while (randomPoints > 0) {
    const randomKey = keys[Math.floor(Math.random() * keys.length)];
    stats[randomKey]++;
    randomPoints--;
  }

  return stats;
}
