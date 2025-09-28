import { FishCard } from '../types/game';

export const DEPTH_1_FISH: FishCard[] = [
  {
    id: 'FISH-D1-SARDINE-001',
    name: 'Sardine School',
    depth: 1,
    value: 1,
    baseValue: 1,
    difficulty: 2,
    abilities: [],
    tags: ['small', 'common'],
    description: 'Small silver fish that travel in groups.',
    quality: 'fair'
  },
  {
    id: 'FISH-D1-MACKEREL-002',
    name: 'Atlantic Mackerel',
    depth: 1,
    value: 2,
    baseValue: 2,
    difficulty: 3,
    abilities: [],
    tags: ['medium', 'common'],
    description: 'Striped predator fish, good eating.',
    quality: 'fair'
  },
  {
    id: 'FISH-D1-BASS-003',
    name: 'Sea Bass',
    depth: 1,
    value: 3,
    baseValue: 3,
    difficulty: 4,
    abilities: ['quick'],
    tags: ['medium'],
    description: 'A cunning fish that requires skill to catch.',
    quality: 'fair'
  },
  {
    id: 'FISH-D1-FLOUNDER-004',
    name: 'Whispering Flounder',
    depth: 1,
    value: 2,
    baseValue: 2,
    difficulty: 3,
    abilities: ['dink_on_catch'],
    tags: ['small', 'mystical'],
    description: 'This flatfish seems to whisper secrets from the deep.',
    quality: 'foul'
  },
  {
    id: 'FISH-D1-COD-005',
    name: 'Ancient Cod',
    depth: 1,
    value: 4,
    baseValue: 4,
    difficulty: 5,
    abilities: [],
    tags: ['medium', 'valuable'],
    description: 'An old fish with wisdom in its eyes.',
    quality: 'fair'
  }
];

export const DEPTH_2_FISH: FishCard[] = [
  {
    id: 'FISH-D2-TUNA-001',
    name: 'Bluefin Tuna',
    depth: 2,
    value: 6,
    baseValue: 6,
    difficulty: 7,
    abilities: ['strong'],
    tags: ['large', 'valuable'],
    description: 'A powerful fish that fights with tremendous strength.',
    quality: 'fair'
  },
  {
    id: 'FISH-D2-SHARK-002',
    name: 'Reef Shark',
    depth: 2,
    value: 7,
    baseValue: 7,
    difficulty: 8,
    abilities: ['shark', 'discard_small'],
    tags: ['predator', 'dangerous'],
    description: 'Discard a small fish after catching (if any).',
    quality: 'foul'
  },
  {
    id: 'FISH-D2-OCTOPUS-003',
    name: 'Giant Octopus',
    depth: 2,
    value: 8,
    baseValue: 8,
    difficulty: 9,
    abilities: ['tentacles', 'regret_draw'],
    tags: ['cephalopod', 'intelligent'],
    description: 'Its alien intelligence leaves lasting impressions. Draw a Regret.',
    quality: 'foul'
  },
  {
    id: 'FISH-D2-MANTA-004',
    name: 'Shadow Manta',
    depth: 2,
    value: 5,
    baseValue: 5,
    difficulty: 6,
    abilities: ['glide', 'dink_on_catch'],
    tags: ['graceful', 'mystical'],
    description: 'Glides through water like a living shadow.',
    quality: 'fair'
  },
  {
    id: 'FISH-D2-BARRACUDA-005',
    name: 'Cursed Barracuda',
    depth: 2,
    value: 6,
    baseValue: 6,
    difficulty: 7,
    abilities: ['curse', 'madness_+1'],
    tags: ['predator', 'cursed'],
    description: 'Its bite carries an otherworldly corruption. +1 Madness.',
    quality: 'foul'
  }
];

export const DEPTH_3_FISH: FishCard[] = [
  {
    id: 'FISH-D3-KRAKEN-001',
    name: 'Lesser Kraken',
    depth: 3,
    value: 12,
    baseValue: 12,
    difficulty: 15,
    abilities: ['legendary', 'tentacles', 'regret_draw_2'],
    tags: ['beast', 'legendary'],
    description: 'A smaller cousin of the great Kraken. Draw 2 Regrets.',
    quality: 'foul'
  },
  {
    id: 'FISH-D3-LEVIATHAN-002',
    name: 'Deep Leviathan',
    depth: 3,
    value: 15,
    baseValue: 15,
    difficulty: 18,
    abilities: ['legendary', 'ancient', 'madness_+2'],
    tags: ['beast', 'ancient'],
    description: 'An ancient creature from the beginning of time. +2 Madness.',
    quality: 'foul'
  },
  {
    id: 'FISH-D3-PLUG-003',
    name: 'The Plug',
    depth: 3,
    value: 0,
    baseValue: 0,
    difficulty: 10,
    abilities: ['special', 'end_turn', 'start_erosion'],
    tags: ['artifact', 'special'],
    description: 'End your turn immediately. Begin shoal erosion process.',
    quality: 'foul'
  },
  {
    id: 'FISH-D3-ORCA-004',
    name: 'Void Orca',
    depth: 3,
    value: 10,
    baseValue: 10,
    difficulty: 12,
    abilities: ['beast', 'discard_small', 'intelligence'],
    tags: ['mammal', 'intelligent'],
    description: 'An orca touched by void energy. Discard a small fish (if any).',
    quality: 'foul'
  },
  {
    id: 'FISH-D3-ANGLER-005',
    name: 'Abyssal Anglerfish',
    depth: 3,
    value: 8,
    baseValue: 8,
    difficulty: 11,
    abilities: ['lure', 'horror', 'regret_draw'],
    tags: ['deep', 'horror'],
    description: 'Its hypnotic light draws you into madness. Draw a Regret.',
    quality: 'foul'
  }
];

export const ALL_FISH = [...DEPTH_1_FISH, ...DEPTH_2_FISH, ...DEPTH_3_FISH];