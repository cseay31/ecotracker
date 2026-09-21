// Game logic for the EcoTracker biodiversity discovery game.
import { SPECIES, RARITY, TOTAL_DEX } from "@/lib/speciesData";

export const TIERS = [
  { name: "Sprout", min: 0, icon: "🌱" },
  { name: "Tracker", min: 100, icon: "🥾" },
  { name: "Ranger", min: 300, icon: "🧭" },
  { name: "Naturalist", min: 600, icon: "🔬" },
  { name: "Ecologist", min: 1000, icon: "🌍" },
  { name: "Legendary Ranger", min: 2000, icon: "🏆" },
];

export function tierForPoints(points) {
  let tier = TIERS[0];
  for (const t of TIERS) {
    if (points >= t.min) tier = t;
  }
  return tier;
}

export function pointsForNewDiscovery(species) {
  let pts = RARITY[species.rarity].basePoints;
  if (species.is_invasive) pts *= 2; // invasive = legendary-tier bonus
  return pts;
}

export const REPEAT_POINTS = 5;

// Weighted random encounter within a biome. Invasive species get a small extra
// rarity bump so they feel like special "dangerous" finds.
export function pickEncounter(biome) {
  const pool = SPECIES.filter((s) => s.biome === biome);
  if (pool.length === 0) return null;
  const weighted = pool.map((s) => {
    let w = RARITY[s.rarity].weight;
    if (s.is_invasive) w = Math.max(2, Math.round(w * 0.6)); // invasive = rarer
    return { s, w };
  });
  const total = weighted.reduce((a, b) => a + b.w, 0);
  let r = Math.random() * total;
  for (const { s, w } of weighted) {
    r -= w;
    if (r <= 0) return s;
  }
  return pool[0];
}

export function biomeSpeciesCount(biome) {
  return SPECIES.filter((s) => s.biome === biome).length;
}

export { TOTAL_DEX };