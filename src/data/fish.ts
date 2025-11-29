import { FishCard } from '../types/game';

// Difficulty ranges by size and depth (from rulebook):
// | DEPTH | SMALL | MID   | LARGE |
// |-------|-------|-------|-------|
// | I     | 0-2   | 1-3   | 2-4   |
// | II    | 1-3   | 2-4   | 3-5   |
// | III   | 2-4   | 3-5   | 4-6   |

export const DEPTH_1_FISH: FishCard[] = [
  // SMALL fish (Depth 1: difficulty 0-2)
  {
    id: 'FISH-D1-SARDINE-001',
    name: 'Sardine School',
    depth: 1,
    size: 'small',
    value: 1,
    baseValue: 1,
    difficulty: 1,
    abilities: [],
    tags: ['small', 'common'],
    description: 'Small silver fish that travel in groups.',
    quality: 'fair'
  },
  {
    id: 'FISH-D1-HERRING-006',
    name: 'Silver Herring',
    depth: 1,
    size: 'small',
    value: 1,
    baseValue: 1,
    difficulty: 0,
    abilities: [],
    tags: ['small', 'common'],
    description: 'A quick flash of silver in the shallows.',
    quality: 'fair'
  },
  {
    id: 'FISH-D1-ANCHOVY-009',
    name: 'Anchovy Swarm',
    depth: 1,
    size: 'small',
    value: 1,
    baseValue: 1,
    difficulty: 0,
    abilities: [],
    tags: ['small', 'common'],
    description: 'Tiny but abundant, the foundation of the food chain.',
    quality: 'fair'
  },
  {
    id: 'FISH-D1-PERCH-007',
    name: 'Spotted Perch',
    depth: 1,
    size: 'small',
    value: 2,
    baseValue: 2,
    difficulty: 1,
    abilities: [],
    tags: ['small', 'common'],
    description: 'Colorful spots mark this common catch.',
    quality: 'fair'
  },
  {
    id: 'FISH-D1-FLOUNDER-004',
    name: 'Whispering Flounder',
    depth: 1,
    size: 'small',
    value: 2,
    baseValue: 2,
    difficulty: 2,
    abilities: ['dink_on_catch'],
    tags: ['small', 'mystical'],
    description: 'This flatfish seems to whisper secrets from the deep.',
    quality: 'foul'
  },
  // MID fish (Depth 1: difficulty 1-3)
  {
    id: 'FISH-D1-MACKEREL-002',
    name: 'Atlantic Mackerel',
    depth: 1,
    size: 'mid',
    value: 2,
    baseValue: 2,
    difficulty: 1,
    abilities: [],
    tags: ['mid', 'common'],
    description: 'Striped predator fish, good eating.',
    quality: 'fair'
  },
  {
    id: 'FISH-D1-SQUID-012',
    name: 'Ink Squid',
    depth: 1,
    size: 'mid',
    value: 2,
    baseValue: 2,
    difficulty: 2,
    abilities: ['dink_on_catch'],
    tags: ['mid', 'cephalopod'],
    description: 'Releases a cloud of ink when caught.',
    quality: 'fair'
  },
  {
    id: 'FISH-D1-CRAB-010',
    name: 'Stone Crab',
    depth: 1,
    size: 'mid',
    value: 2,
    baseValue: 2,
    difficulty: 2,
    abilities: [],
    tags: ['mid', 'crustacean'],
    description: 'Armored claws snap at unwary fingers.',
    quality: 'fair'
  },
  {
    id: 'FISH-D1-BASS-003',
    name: 'Sea Bass',
    depth: 1,
    size: 'mid',
    value: 3,
    baseValue: 3,
    difficulty: 2,
    abilities: ['quick'],
    tags: ['mid'],
    description: 'A cunning fish that requires skill to catch.',
    quality: 'fair'
  },
  {
    id: 'FISH-D1-TROUT-008',
    name: 'Rainbow Trout',
    depth: 1,
    size: 'mid',
    value: 3,
    baseValue: 3,
    difficulty: 3,
    abilities: [],
    tags: ['mid'],
    description: 'Iridescent scales shimmer in the light.',
    quality: 'fair'
  },
  // LARGE fish (Depth 1: difficulty 2-4)
  {
    id: 'FISH-D1-COD-005',
    name: 'Ancient Cod',
    depth: 1,
    size: 'large',
    value: 3,
    baseValue: 3,
    difficulty: 3,
    abilities: [],
    tags: ['large'],
    description: 'An old fish with wisdom in its eyes.',
    quality: 'fair'
  },
  {
    id: 'FISH-D1-SNAPPER-011',
    name: 'Red Snapper',
    depth: 1,
    size: 'large',
    value: 3,
    baseValue: 3,
    difficulty: 3,
    abilities: [],
    tags: ['large'],
    description: 'Prized for its firm, flavorful flesh.',
    quality: 'fair'
  },
  {
    id: 'FISH-D1-HALIBUT-013',
    name: 'Young Halibut',
    depth: 1,
    size: 'large',
    value: 3,
    baseValue: 3,
    difficulty: 4,
    abilities: [],
    tags: ['large'],
    description: 'A juvenile flatfish with great potential.',
    quality: 'fair'
  }
];

export const DEPTH_2_FISH: FishCard[] = [
  // SMALL fish (Depth 2: difficulty 1-3)
  {
    id: 'FISH-D2-JELLYFISH-009',
    name: 'Stinging Medusa',
    depth: 2,
    size: 'small',
    value: 5,
    baseValue: 5,
    difficulty: 2,
    abilities: ['madness_+1'],
    tags: ['small', 'jellyfish', 'dangerous'],
    description: 'Its tentacles burn with eldritch venom. +1 Madness.',
    quality: 'foul'
  },
  {
    id: 'FISH-D2-CUTTLEFISH-011',
    name: 'Hypnotic Cuttlefish',
    depth: 2,
    size: 'small',
    value: 6,
    baseValue: 6,
    difficulty: 3,
    abilities: ['regret_draw'],
    tags: ['small', 'cephalopod', 'mystical'],
    description: 'Its shifting colors entrance the mind. Draw a Regret.',
    quality: 'foul'
  },
  // MID fish (Depth 2: difficulty 2-4)
  {
    id: 'FISH-D2-MANTA-004',
    name: 'Shadow Manta',
    depth: 2,
    size: 'mid',
    value: 6,
    baseValue: 6,
    difficulty: 3,
    abilities: ['glide', 'dink_on_catch'],
    tags: ['mid', 'graceful', 'mystical'],
    description: 'Glides through water like a living shadow.',
    quality: 'fair'
  },
  {
    id: 'FISH-D2-MORAY-007',
    name: 'Phantom Moray',
    depth: 2,
    size: 'mid',
    value: 6,
    baseValue: 6,
    difficulty: 3,
    abilities: ['dink_on_catch'],
    tags: ['mid', 'serpent', 'mystical'],
    description: 'Slips through the water like a ghost.',
    quality: 'fair'
  },
  {
    id: 'FISH-D2-BARRACUDA-005',
    name: 'Cursed Barracuda',
    depth: 2,
    size: 'mid',
    value: 7,
    baseValue: 7,
    difficulty: 3,
    abilities: ['curse', 'madness_+1'],
    tags: ['mid', 'predator', 'cursed'],
    description: 'Its bite carries an otherworldly corruption. +1 Madness.',
    quality: 'foul'
  },
  {
    id: 'FISH-D2-TUNA-001',
    name: 'Bluefin Tuna',
    depth: 2,
    size: 'mid',
    value: 7,
    baseValue: 7,
    difficulty: 4,
    abilities: ['strong'],
    tags: ['mid', 'valuable'],
    description: 'A powerful fish that fights with tremendous strength.',
    quality: 'fair'
  },
  {
    id: 'FISH-D2-GROUPER-008',
    name: 'Goliath Grouper',
    depth: 2,
    size: 'mid',
    value: 7,
    baseValue: 7,
    difficulty: 4,
    abilities: ['strong'],
    tags: ['mid'],
    description: 'A massive fish that tests even experienced anglers.',
    quality: 'fair'
  },
  {
    id: 'FISH-D2-WAHOO-012',
    name: 'Swift Wahoo',
    depth: 2,
    size: 'mid',
    value: 7,
    baseValue: 7,
    difficulty: 4,
    abilities: ['quick'],
    tags: ['mid'],
    description: 'One of the fastest fish in the sea.',
    quality: 'fair'
  },
  // LARGE fish (Depth 2: difficulty 3-5)
  {
    id: 'FISH-D2-SHARK-002',
    name: 'Reef Shark',
    depth: 2,
    size: 'large',
    value: 8,
    baseValue: 8,
    difficulty: 4,
    abilities: ['shark', 'discard_small'],
    tags: ['large', 'predator', 'dangerous'],
    description: 'Discard a small fish after catching (if any).',
    quality: 'foul'
  },
  {
    id: 'FISH-D2-LOBSTER-013',
    name: 'Giant Lobster',
    depth: 2,
    size: 'large',
    value: 8,
    baseValue: 8,
    difficulty: 4,
    abilities: [],
    tags: ['large', 'crustacean', 'valuable'],
    description: 'Massive claws guard succulent flesh.',
    quality: 'fair'
  },
  {
    id: 'FISH-D2-SWORDFISH-006',
    name: 'Bronze Swordfish',
    depth: 2,
    size: 'large',
    value: 9,
    baseValue: 9,
    difficulty: 4,
    abilities: ['strong'],
    tags: ['large', 'valuable'],
    description: 'Its blade-like bill gleams with ancient power.',
    quality: 'fair'
  },
  {
    id: 'FISH-D2-OCTOPUS-003',
    name: 'Giant Octopus',
    depth: 2,
    size: 'large',
    value: 10,
    baseValue: 10,
    difficulty: 5,
    abilities: ['tentacles', 'regret_draw'],
    tags: ['large', 'cephalopod', 'intelligent'],
    description: 'Its alien intelligence leaves lasting impressions. Draw a Regret.',
    quality: 'foul'
  },
  {
    id: 'FISH-D2-MARLIN-010',
    name: 'Striped Marlin',
    depth: 2,
    size: 'large',
    value: 10,
    baseValue: 10,
    difficulty: 5,
    abilities: ['strong'],
    tags: ['large', 'valuable'],
    description: 'The king of sport fish, a true challenge.',
    quality: 'fair'
  }
];

export const DEPTH_3_FISH: FishCard[] = [
  // SMALL fish (Depth 3: difficulty 2-4)
  {
    id: 'FISH-D3-BLOBFISH-012',
    name: 'Eldritch Blobfish',
    depth: 3,
    size: 'small',
    value: 10,
    baseValue: 10,
    difficulty: 3,
    abilities: ['madness_+1'],
    tags: ['small', 'deep', 'horror'],
    description: 'Its melancholy face haunts your dreams. +1 Madness.',
    quality: 'foul'
  },
  {
    id: 'FISH-D3-ISOPOD-011',
    name: 'Giant Isopod',
    depth: 3,
    size: 'small',
    value: 12,
    baseValue: 12,
    difficulty: 4,
    abilities: [],
    tags: ['small', 'crustacean', 'deep'],
    description: 'An armored scavenger from the deepest trenches.',
    quality: 'fair'
  },
  // MID fish (Depth 3: difficulty 3-5)
  {
    id: 'FISH-D3-ANGLER-005',
    name: 'Abyssal Anglerfish',
    depth: 3,
    size: 'mid',
    value: 14,
    baseValue: 14,
    difficulty: 4,
    abilities: ['lure', 'horror', 'regret_draw'],
    tags: ['mid', 'deep', 'horror'],
    description: 'Its hypnotic light draws you into madness. Draw a Regret.',
    quality: 'foul'
  },
  {
    id: 'FISH-D3-COELACANTH-009',
    name: 'Living Fossil',
    depth: 3,
    size: 'mid',
    value: 15,
    baseValue: 15,
    difficulty: 4,
    abilities: ['ancient'],
    tags: ['mid', 'ancient', 'rare'],
    description: 'Thought extinct, it survives in the abyss.',
    quality: 'fair'
  },
  {
    id: 'FISH-D3-ORCA-004',
    name: 'Void Orca',
    depth: 3,
    size: 'mid',
    value: 16,
    baseValue: 16,
    difficulty: 5,
    abilities: ['beast', 'discard_small', 'intelligence'],
    tags: ['mid', 'mammal', 'intelligent'],
    description: 'An orca touched by void energy. Discard a small fish (if any).',
    quality: 'foul'
  },
  {
    id: 'FISH-D3-OARFISH-010',
    name: 'Doom Oarfish',
    depth: 3,
    size: 'mid',
    value: 16,
    baseValue: 16,
    difficulty: 5,
    abilities: ['regret_draw'],
    tags: ['mid', 'serpent', 'omen'],
    description: 'Its appearance heralds disaster. Draw a Regret.',
    quality: 'foul'
  },
  // LARGE fish (Depth 3: difficulty 4-6)
  {
    id: 'FISH-D3-PLUG-003',
    name: 'The Plug',
    depth: 3,
    size: 'large',
    value: 0,
    baseValue: 0,
    difficulty: 4,
    abilities: ['special', 'end_turn', 'start_erosion'],
    tags: ['large', 'artifact', 'special'],
    description: 'End your turn immediately. Begin shoal erosion process.',
    quality: 'foul'
  },
  {
    id: 'FISH-D3-KRAKEN-001',
    name: 'Lesser Kraken',
    depth: 3,
    size: 'large',
    value: 18,
    baseValue: 18,
    difficulty: 5,
    abilities: ['legendary', 'tentacles', 'regret_draw_2'],
    tags: ['large', 'beast', 'legendary'],
    description: 'A smaller cousin of the great Kraken. Draw 2 Regrets.',
    quality: 'foul'
  },
  {
    id: 'FISH-D3-SQUID-006',
    name: 'Colossal Squid',
    depth: 3,
    size: 'large',
    value: 18,
    baseValue: 18,
    difficulty: 5,
    abilities: ['tentacles', 'regret_draw'],
    tags: ['large', 'cephalopod', 'legendary'],
    description: 'Tentacles as thick as ship masts. Draw a Regret.',
    quality: 'foul'
  },
  {
    id: 'FISH-D3-SERPENT-008',
    name: 'Sea Serpent',
    depth: 3,
    size: 'large',
    value: 20,
    baseValue: 20,
    difficulty: 5,
    abilities: ['legendary', 'madness_+1'],
    tags: ['large', 'serpent', 'legendary'],
    description: 'Ancient sailors warned of its coils. +1 Madness.',
    quality: 'foul'
  },
  {
    id: 'FISH-D3-WHALE-007',
    name: 'Ghost Whale',
    depth: 3,
    size: 'large',
    value: 22,
    baseValue: 22,
    difficulty: 6,
    abilities: ['legendary', 'ancient'],
    tags: ['large', 'mammal', 'legendary'],
    description: 'A spectral cetacean from beyond the veil.',
    quality: 'fair'
  },
  {
    id: 'FISH-D3-LEVIATHAN-002',
    name: 'Deep Leviathan',
    depth: 3,
    size: 'large',
    value: 25,
    baseValue: 25,
    difficulty: 6,
    abilities: ['legendary', 'ancient', 'madness_+2'],
    tags: ['large', 'beast', 'ancient'],
    description: 'An ancient creature from the beginning of time. +2 Madness.',
    quality: 'foul'
  },
  {
    id: 'FISH-D3-DRAGON-013',
    name: 'Abyssal Dragon',
    depth: 3,
    size: 'large',
    value: 28,
    baseValue: 28,
    difficulty: 6,
    abilities: ['legendary', 'madness_+2', 'regret_draw'],
    tags: ['large', 'beast', 'legendary'],
    description: 'The ultimate prize of the deep. +2 Madness, draw a Regret.',
    quality: 'foul'
  }
];

export const ALL_FISH = [...DEPTH_1_FISH, ...DEPTH_2_FISH, ...DEPTH_3_FISH];
