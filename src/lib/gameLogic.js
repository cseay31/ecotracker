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

// Points for adding a real, photographed species to your collection.
export function pointsForRealDiscovery({ rarity, is_invasive }) {
  let base = (RARITY[rarity] && RARITY[rarity].basePoints) || 50;
  if (is_invasive) base *= 2; // invasive = bonus "dangerous" find
  return base;
}

export const REPEAT_POINTS = 10;

// Try to match an identified observation to the curated regional dex (by
// scientific or common name). Returns the curated species for emoji/rarity,
// or null for species outside the curated list.
export function matchCurated(obs) {
  const sci = (obs.scientific_name || obs.species_name || "").toLowerCase().trim();
  const com = (obs.common_name || "").toLowerCase().trim();
  for (const s of SPECIES) {
    if (sci && s.scientific_name.toLowerCase() === sci) return s;
    if (com && s.common_name.toLowerCase() === com) return s;
  }
  return null;
}

// Build a collection entry shape from an identification result.
export function collectionFromObservation(obs) {
  const curated = matchCurated(obs);
  const isInv = !!obs.is_invasive;
  return {
    species_id: (obs.species_name || obs.common_name || "unknown").toLowerCase(),
    common_name: obs.common_name || obs.species_name || "Unknown species",
    scientific_name: obs.species_name || "",
    taxon_group: curated ? curated.taxon_group : undefined,
    biome: curated ? curated.biome : undefined,
    rarity: curated ? curated.rarity : (isInv ? "rare" : "common"),
    is_invasive: isInv,
    establishment_means: obs.establishment_means || "unknown",
    emoji: curated ? curated.emoji : "🐾",
  };
}

export { TOTAL_DEX };