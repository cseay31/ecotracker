// Curated biodiversity "dex" — real species organized by biome, used by the
// Pokémon-style discovery game. Invasive species are treated as rare, high-value
// "legendary"-style encounters worth bonus points.

export const BIOMES = ["Forest", "Wetland", "Grassland", "Urban", "Coastal", "Desert"];

export const RARITY = {
  common: { label: "Common", weight: 55, basePoints: 10, color: "#10b981" },
  uncommon: { label: "Uncommon", weight: 30, basePoints: 25, color: "#14b8a6" },
  rare: { label: "Rare", weight: 12, basePoints: 60, color: "#f59e0b" },
  legendary: { label: "Legendary", weight: 3, basePoints: 150, color: "#ec4899" },
};

export const TAXON_EMOJI = {
  Mammal: "🦌",
  Bird: "🐦",
  Reptile: "🦎",
  Amphibian: "🐸",
  Fish: "🐟",
  Invertebrate: "🦀",
  Insect: "🦋",
  Plant: "🌿",
  Fungi: "🍄",
};

// id, common, scientific, taxon, biome, rarity, invasive, establishment, emoji, blurb
export const SPECIES = [
  // ---- Forest ----
  { id: "f-white-tailed-deer", common_name: "White-tailed Deer", scientific_name: "Odocoileus virginianus", taxon_group: "Mammal", biome: "Forest", rarity: "common", is_invasive: false, establishment_means: "native", emoji: "🦌", blurb: "A fleet-footed grazer of North American woodlands, flashing its white tail when alarmed." },
  { id: "f-red-fox", common_name: "Red Fox", scientific_name: "Vulpes vulpes", taxon_group: "Mammal", biome: "Forest", rarity: "uncommon", is_invasive: false, establishment_means: "native", emoji: "🦊", blurb: "A cunning, cat-like canid that pounces on small prey beneath the snow." },
  { id: "f-gray-squirrel", common_name: "Eastern Gray Squirrel", scientific_name: "Sciurus carolinensis", taxon_group: "Mammal", biome: "Forest", rarity: "common", is_invasive: false, establishment_means: "native", emoji: "🐿️", blurb: "A nimble tree-dweller that buries acorns and accidentally plants forests." },
  { id: "f-great-horned-owl", common_name: "Great Horned Owl", scientific_name: "Bubo virginianus", taxon_group: "Bird", biome: "Forest", rarity: "uncommon", is_invasive: false, establishment_means: "native", emoji: "🦉", blurb: "A silent nocturnal hunter with piercing yellow eyes and feathered 'horns'." },
  { id: "f-pileated-woodpecker", common_name: "Pileated Woodpecker", scientific_name: "Dryocopus pileatus", taxon_group: "Bird", biome: "Forest", rarity: "uncommon", is_invasive: false, establishment_means: "native", emoji: "🐦", blurb: "A crow-sized woodpecker that carves rectangular holes in dead trees." },
  { id: "f-black-bear", common_name: "American Black Bear", scientific_name: "Ursus americanus", taxon_group: "Mammal", biome: "Forest", rarity: "rare", is_invasive: false, establishment_means: "native", emoji: "🐻", blurb: "A powerful omnivore that climbs trees and roams vast forest territories." },
  { id: "f-wild-turkey", common_name: "Wild Turkey", scientific_name: "Meleagris gallopavo", taxon_group: "Bird", biome: "Forest", rarity: "common", is_invasive: false, establishment_means: "native", emoji: "🦃", blurb: "A wary, strutting gamebird that roosts high in the trees at night." },
  { id: "f-raccoon", common_name: "Raccoon", scientific_name: "Procyon lotor", taxon_group: "Mammal", biome: "Forest", rarity: "common", is_invasive: false, establishment_means: "native", emoji: "🦝", blurb: "A masked, dexterous forager famous for 'washing' its food." },
  { id: "f-emerald-ash-borer", common_name: "Emerald Ash Borer", scientific_name: "Agrilus planipennis", taxon_group: "Insect", biome: "Forest", rarity: "rare", is_invasive: true, establishment_means: "introduced", emoji: "🪲", blurb: "A glittering green beetle from Asia whose larvae devastate ash trees. INVASIVE — report sightings!" },
  { id: "f-spongy-moth", common_name: "Spongy Moth", scientific_name: "Lymantria dispar", taxon_group: "Insect", biome: "Forest", rarity: "uncommon", is_invasive: true, establishment_means: "introduced", emoji: "🐛", blurb: "An introduced defoliator whose caterpillars can strip entire oak canopies. INVASIVE." },

  // ---- Wetland ----
  { id: "w-great-blue-heron", common_name: "Great Blue Heron", scientific_name: "Ardea herodias", taxon_group: "Bird", biome: "Wetland", rarity: "common", is_invasive: false, establishment_means: "native", emoji: "🦩", blurb: "A statuesque wader that spears fish with a lightning-fast strike." },
  { id: "w-alligator", common_name: "American Alligator", scientific_name: "Alligator mississippiensis", taxon_group: "Reptile", biome: "Wetland", rarity: "uncommon", is_invasive: false, establishment_means: "native", emoji: "🐊", blurb: "A living dinosaur that engineers swamp ecosystems with its wallows." },
  { id: "w-beaver", common_name: "North American Beaver", scientific_name: "Castor canadensis", taxon_group: "Mammal", biome: "Wetland", rarity: "uncommon", is_invasive: false, establishment_means: "native", emoji: "🦫", blurb: "A rodent architect whose dams create entire wetland habitats." },
  { id: "w-bullfrog", common_name: "American Bullfrog", scientific_name: "Lithobates catesbeianus", taxon_group: "Amphibian", biome: "Wetland", rarity: "common", is_invasive: false, establishment_means: "native", emoji: "🐸", blurb: "A deep-voiced amphibian with an appetite for almost anything that fits its mouth." },
  { id: "w-painted-turtle", common_name: "Painted Turtle", scientific_name: "Chrysemys picta", taxon_group: "Reptile", biome: "Wetland", rarity: "common", is_invasive: false, establishment_means: "native", emoji: "🐢", blurb: "A colorful basking turtle that suns itself on logs in tight rows." },
  { id: "w-river-otter", common_name: "North American River Otter", scientific_name: "Lontra canadensis", taxon_group: "Mammal", biome: "Wetland", rarity: "rare", is_invasive: false, establishment_means: "native", emoji: "🦦", blurb: "A playful, sleek swimmer that slides down muddy banks for fun." },
  { id: "w-water-snake", common_name: "Northern Water Snake", scientific_name: "Nerodia sipedon", taxon_group: "Reptile", biome: "Wetland", rarity: "uncommon", is_invasive: false, establishment_means: "native", emoji: "🐍", blurb: "A non-venomous fish-hunter often mistaken for its dangerous cousins." },
  { id: "w-nutria", common_name: "Nutria", scientific_name: "Myocastor coypus", taxon_group: "Mammal", biome: "Wetland", rarity: "uncommon", is_invasive: true, establishment_means: "introduced", emoji: "🐀", blurb: "A large South American rodint that erodes marshlands with its burrows. INVASIVE." },
  { id: "w-purple-loosestrife", common_name: "Purple Loosestrife", scientific_name: "Lythrum salicaria", taxon_group: "Plant", biome: "Wetland", rarity: "uncommon", is_invasive: true, establishment_means: "introduced", emoji: "🌿", blurb: "A showy purple marsh plant that crowds out native wetland flora. INVASIVE." },

  // ---- Grassland ----
  { id: "g-red-tailed-hawk", common_name: "Red-tailed Hawk", scientific_name: "Buteo jamaicensis", taxon_group: "Bird", biome: "Grassland", rarity: "common", is_invasive: false, establishment_means: "native", emoji: "🦅", blurb: "A soaring raptor with a raspy scream, watching for rodents from fence posts." },
  { id: "g-coyote", common_name: "Coyote", scientific_name: "Canis latrans", taxon_group: "Mammal", biome: "Grassland", rarity: "uncommon", is_invasive: false, establishment_means: "native", emoji: "🐺", blurb: "An adaptable song-dog that has spread across the continent." },
  { id: "g-pronghorn", common_name: "Pronghorn", scientific_name: "Antilocapra americana", taxon_group: "Mammal", biome: "Grassland", rarity: "common", is_invasive: false, establishment_means: "native", emoji: "🦌", blurb: "The fastest land animal in North America, built for open plains." },
  { id: "g-meadowlark", common_name: "Western Meadowlark", scientific_name: "Sturnella neglecta", taxon_group: "Bird", biome: "Grassland", rarity: "common", is_invasive: false, establishment_means: "native", emoji: "🐦", blurb: "A yellow-breasted songster whose flute-like call defines the prairie." },
  { id: "g-bison", common_name: "American Bison", scientific_name: "Bison bison", taxon_group: "Mammal", biome: "Grassland", rarity: "rare", is_invasive: false, establishment_means: "native", emoji: "🐃", blurb: "A massive grazer that once thundered across the plains in millions." },
  { id: "g-burrowing-owl", common_name: "Burrowing Owl", scientific_name: "Athene cunicularia", taxon_group: "Bird", biome: "Grassland", rarity: "uncommon", is_invasive: false, establishment_means: "native", emoji: "🦉", blurb: "A tiny, long-legged owl that nests in prairie-dog burrows." },
  { id: "g-rattlesnake", common_name: "Prairie Rattlesnake", scientific_name: "Crotalus viridis", taxon_group: "Reptile", biome: "Grassland", rarity: "uncommon", is_invasive: false, establishment_means: "native", emoji: "🐍", blurb: "A camouflaged pit-viper that warns with a buzzing tail." },
  { id: "g-cheatgrass", common_name: "Cheatgrass", scientific_name: "Bromus tectorum", taxon_group: "Plant", biome: "Grassland", rarity: "uncommon", is_invasive: true, establishment_means: "introduced", emoji: "🌾", blurb: "An early-spring grass that fuels dangerous wildfires. INVASIVE." },
  { id: "g-starling", common_name: "European Starling", scientific_name: "Sturnus vulgaris", taxon_group: "Bird", biome: "Grassland", rarity: "common", is_invasive: true, establishment_means: "introduced", emoji: "🐦", blurb: "Released in the 1890s, now one of the most abundant — and damaging — birds. INVASIVE." },

  // ---- Urban ----
  { id: "u-rock-pigeon", common_name: "Rock Pigeon", scientific_name: "Columba livia", taxon_group: "Bird", biome: "Urban", rarity: "common", is_invasive: false, establishment_means: "introduced", emoji: "🐦", blurb: "A familiar city bird descended from domesticated cliff-dwellers." },
  { id: "u-house-sparrow", common_name: "House Sparrow", scientific_name: "Passer domesticus", taxon_group: "Bird", biome: "Urban", rarity: "common", is_invasive: true, establishment_means: "introduced", emoji: "🐦", blurb: "A cheeky introduced bird that thrives around human crumbs. INVASIVE." },
  { id: "u-norway-rat", common_name: "Norway Rat", scientific_name: "Rattus norvegicus", taxon_group: "Mammal", biome: "Urban", rarity: "common", is_invasive: true, establishment_means: "introduced", emoji: "🐀", blurb: "A prolific commensal rodent that follows human civilization everywhere. INVASIVE." },
  { id: "u-monarch", common_name: "Monarch Butterfly", scientific_name: "Danaus plexippus", taxon_group: "Insect", biome: "Urban", rarity: "uncommon", is_invasive: false, establishment_means: "native", emoji: "🦋", blurb: "An orange-and-black migrant that navigates thousands of miles to overwinter." },
  { id: "u-honey-bee", common_name: "Honey Bee", scientific_name: "Apis mellifera", taxon_group: "Insect", biome: "Urban", rarity: "common", is_invasive: false, establishment_means: "introduced", emoji: "🐝", blurb: "A social pollinator whose hives fuel both agriculture and gardens." },
  { id: "u-feral-cat", common_name: "Feral Cat", scientific_name: "Felis catus", taxon_group: "Mammal", biome: "Urban", rarity: "uncommon", is_invasive: true, establishment_means: "introduced", emoji: "🐱", blurb: "A prolific hunter responsible for billions of songbird deaths. INVASIVE." },
  { id: "u-catbird", common_name: "Gray Catbird", scientific_name: "Dumetella carolinensis", taxon_group: "Bird", biome: "Urban", rarity: "uncommon", is_invasive: false, establishment_means: "native", emoji: "🐦", blurb: "A secretive mimid that mews like a kitten from dense shrubs." },
  { id: "u-dandelion", common_name: "Common Dandelion", scientific_name: "Taraxacum officinale", taxon_group: "Plant", biome: "Urban", rarity: "common", is_invasive: false, establishment_means: "introduced", emoji: "🌼", blurb: "A sunny lawn weed beloved by pollinators and children alike." },

  // ---- Coastal ----
  { id: "c-brown-pelican", common_name: "Brown Pelican", scientific_name: "Pelecanus occidentalis", taxon_group: "Bird", biome: "Coastal", rarity: "uncommon", is_invasive: false, establishment_means: "native", emoji: "🐦", blurb: "A pouch-billed diver that plunge-fishes along warm coastlines." },
  { id: "c-herring-gull", common_name: "Herring Gull", scientific_name: "Larus argentatus", taxon_group: "Bird", biome: "Coastal", rarity: "common", is_invasive: false, establishment_means: "native", emoji: "🐦", blurb: "The quintessential seaside gull, bold and opportunistic." },
  { id: "c-osprey", common_name: "Osprey", scientific_name: "Pandion haliaetus", taxon_group: "Bird", biome: "Coastal", rarity: "uncommon", is_invasive: false, establishment_means: "native", emoji: "🦅", blurb: "A fish-hawk that shakes water mid-dive and builds huge stick nests." },
  { id: "c-harbor-seal", common_name: "Harbor Seal", scientific_name: "Phoca vitulina", taxon_group: "Mammal", biome: "Coastal", rarity: "uncommon", is_invasive: false, establishment_means: "native", emoji: "🦭", blurb: "A spotted, dog-faced pinniped that hauls out on rocks and beaches." },
  { id: "c-green-crab", common_name: "European Green Crab", scientific_name: "Carcinus maenas", taxon_group: "Invertebrate", biome: "Coastal", rarity: "uncommon", is_invasive: true, establishment_means: "introduced", emoji: "🦀", blurb: "An aggressive intertidal predator that shells out native clams. INVASIVE." },
  { id: "c-sea-star", common_name: "Ochre Sea Star", scientific_name: "Pisaster ochraceus", taxon_group: "Invertebrate", biome: "Coastal", rarity: "uncommon", is_invasive: false, establishment_means: "native", emoji: "⭐", blurb: "A keystone predator whose purple arms pattern the rocky shore." },
  { id: "c-ghost-crab", common_name: "Atlantic Ghost Crab", scientific_name: "Ocypode quadrata", taxon_group: "Invertebrate", biome: "Coastal", rarity: "uncommon", is_invasive: false, establishment_means: "native", emoji: "🦀", blurb: "A pale, sand-colored sprinter that vanishes down burrows." },
  { id: "c-cordgrass", common_name: "Smooth Cordgrass", scientific_name: "Spartina alterniflora", taxon_group: "Plant", biome: "Coastal", rarity: "uncommon", is_invasive: true, establishment_means: "introduced", emoji: "🌿", blurb: "A marsh grass that turns open mudflats into dense meadows. INVASIVE." },

  // ---- Desert ----
  { id: "d-roadrunner", common_name: "Greater Roadrunner", scientific_name: "Geococcyx californianus", taxon_group: "Bird", biome: "Desert", rarity: "uncommon", is_invasive: false, establishment_means: "native", emoji: "🐦", blurb: "A fast, ground-running cuckoo that hunts lizards and snakes." },
  { id: "d-tortoise", common_name: "Desert Tortoise", scientific_name: "Gopherus agassizii", taxon_group: "Reptile", biome: "Desert", rarity: "uncommon", is_invasive: false, establishment_means: "native", emoji: "🐢", blurb: "A long-lived reptile that spends most of the year underground." },
  { id: "d-gila-monster", common_name: "Gila Monster", scientific_name: "Heloderma suspectum", taxon_group: "Reptile", biome: "Desert", rarity: "rare", is_invasive: false, establishment_means: "native", emoji: "🦎", blurb: "One of only two venomous lizards in the world, slow but powerful." },
  { id: "d-jackrabbit", common_name: "Black-tailed Jackrabbit", scientific_name: "Lepus californicus", taxon_group: "Mammal", biome: "Desert", rarity: "uncommon", is_invasive: false, establishment_means: "native", emoji: "🐰", blurb: "A long-eared hare that radiates heat through its enormous ears." },
  { id: "d-sidewinder", common_name: "Sidewinder Rattlesnake", scientific_name: "Crotalus cerastes", taxon_group: "Reptile", biome: "Desert", rarity: "uncommon", is_invasive: false, establishment_means: "native", emoji: "🐍", blurb: "A pale viper that glides sideways across loose sand." },
  { id: "d-tamarisk", common_name: "Saltcedar (Tamarisk)", scientific_name: "Tamarix ramosissima", taxon_group: "Plant", biome: "Desert", rarity: "rare", is_invasive: true, establishment_means: "introduced", emoji: "🌿", blurb: "A thirsty shrub that dries desert streams and salts the soil. INVASIVE." },
  { id: "d-sahara-mustard", common_name: "Sahara Mustard", scientific_name: "Brassica tournefortii", taxon_group: "Plant", biome: "Desert", rarity: "uncommon", is_invasive: true, establishment_means: "introduced", emoji: "🌿", blurb: "A fast-spreading invader that smothers native desert wildflowers. INVASIVE." },
];

export const SPECIES_BY_ID = Object.fromEntries(SPECIES.map((s) => [s.id, s]));

export const TOTAL_DEX = SPECIES.length;