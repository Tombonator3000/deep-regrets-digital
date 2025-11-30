import { TackleDie } from '@/types/game';

// Per rulebook (p.17): Tackle dice have different costs and pip values by color
// Green: $1, faces [0, 0, 1, 2]
// Blue: $2, faces [0, 1, 1, 1]
// Orange: $3, faces [2, 3]

export const TACKLE_DICE: TackleDie[] = [
  {
    id: 'TACKLE-GREEN-001',
    name: 'Green Tackle Die',
    color: 'green',
    cost: 1,
    faces: [0, 0, 1, 2, 1, 2], // 6-sided with rulebook distribution
    description: 'Basic tackle die, affordable but unreliable.'
  },
  {
    id: 'TACKLE-GREEN-002',
    name: 'Green Tackle Die',
    color: 'green',
    cost: 1,
    faces: [0, 0, 1, 2, 1, 2],
    description: 'Basic tackle die, affordable but unreliable.'
  },
  {
    id: 'TACKLE-GREEN-003',
    name: 'Green Tackle Die',
    color: 'green',
    cost: 1,
    faces: [0, 0, 1, 2, 1, 2],
    description: 'Basic tackle die, affordable but unreliable.'
  },
  {
    id: 'TACKLE-GREEN-004',
    name: 'Green Tackle Die',
    color: 'green',
    cost: 1,
    faces: [0, 0, 1, 2, 1, 2],
    description: 'Basic tackle die, affordable but unreliable.'
  },
  {
    id: 'TACKLE-GREEN-005',
    name: 'Green Tackle Die',
    color: 'green',
    cost: 1,
    faces: [0, 0, 1, 2, 1, 2],
    description: 'Basic tackle die, affordable but unreliable.'
  },
  {
    id: 'TACKLE-GREEN-006',
    name: 'Green Tackle Die',
    color: 'green',
    cost: 1,
    faces: [0, 0, 1, 2, 1, 2],
    description: 'Basic tackle die, affordable but unreliable.'
  },
  {
    id: 'TACKLE-BLUE-001',
    name: 'Blue Tackle Die',
    color: 'blue',
    cost: 2,
    faces: [0, 1, 1, 1, 1, 1], // 6-sided with rulebook distribution
    description: 'Reliable tackle die with consistent results.'
  },
  {
    id: 'TACKLE-BLUE-002',
    name: 'Blue Tackle Die',
    color: 'blue',
    cost: 2,
    faces: [0, 1, 1, 1, 1, 1],
    description: 'Reliable tackle die with consistent results.'
  },
  {
    id: 'TACKLE-BLUE-003',
    name: 'Blue Tackle Die',
    color: 'blue',
    cost: 2,
    faces: [0, 1, 1, 1, 1, 1],
    description: 'Reliable tackle die with consistent results.'
  },
  {
    id: 'TACKLE-BLUE-004',
    name: 'Blue Tackle Die',
    color: 'blue',
    cost: 2,
    faces: [0, 1, 1, 1, 1, 1],
    description: 'Reliable tackle die with consistent results.'
  },
  {
    id: 'TACKLE-BLUE-005',
    name: 'Blue Tackle Die',
    color: 'blue',
    cost: 2,
    faces: [0, 1, 1, 1, 1, 1],
    description: 'Reliable tackle die with consistent results.'
  },
  {
    id: 'TACKLE-BLUE-006',
    name: 'Blue Tackle Die',
    color: 'blue',
    cost: 2,
    faces: [0, 1, 1, 1, 1, 1],
    description: 'Reliable tackle die with consistent results.'
  },
  {
    id: 'TACKLE-ORANGE-001',
    name: 'Orange Tackle Die',
    color: 'orange',
    cost: 3,
    faces: [2, 2, 2, 3, 3, 3], // 6-sided with rulebook distribution
    description: 'Premium tackle die with high values.'
  },
  {
    id: 'TACKLE-ORANGE-002',
    name: 'Orange Tackle Die',
    color: 'orange',
    cost: 3,
    faces: [2, 2, 2, 3, 3, 3],
    description: 'Premium tackle die with high values.'
  },
  {
    id: 'TACKLE-ORANGE-003',
    name: 'Orange Tackle Die',
    color: 'orange',
    cost: 3,
    faces: [2, 2, 2, 3, 3, 3],
    description: 'Premium tackle die with high values.'
  },
  {
    id: 'TACKLE-ORANGE-004',
    name: 'Orange Tackle Die',
    color: 'orange',
    cost: 3,
    faces: [2, 2, 2, 3, 3, 3],
    description: 'Premium tackle die with high values.'
  },
  {
    id: 'TACKLE-ORANGE-005',
    name: 'Orange Tackle Die',
    color: 'orange',
    cost: 3,
    faces: [2, 2, 2, 3, 3, 3],
    description: 'Premium tackle die with high values.'
  },
  {
    id: 'TACKLE-ORANGE-006',
    name: 'Orange Tackle Die',
    color: 'orange',
    cost: 3,
    faces: [2, 2, 2, 3, 3, 3],
    description: 'Premium tackle die with high values.'
  }
];

// All tackle die IDs for the bag
export const ALL_TACKLE_DIE_IDS = TACKLE_DICE.map(die => die.id);

export const TACKLE_DICE_LOOKUP: Record<string, TackleDie> = Object.fromEntries(
  TACKLE_DICE.map(die => [die.id, die])
);

// Helper to get color from die ID
export const getTackleDieColor = (dieId: string): 'green' | 'blue' | 'orange' => {
  if (dieId.includes('GREEN')) return 'green';
  if (dieId.includes('BLUE')) return 'blue';
  return 'orange';
};
