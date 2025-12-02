import { UpgradeCard } from '../types/game';

export const RODS: UpgradeCard[] = [
  {
    id: 'ROD-001',
    name: 'Glass Rod',
    type: 'rod',
    cost: 3,
    effects: ['reroll_1_die'],
    equipSlot: 'rod',
    description: 'Reroll 1 die when fishing.'
  },
  {
    id: 'ROD-002',
    name: 'Carbon Fiber Rod',
    type: 'rod', 
    cost: 5,
    effects: ['half_dice_round_up'],
    equipSlot: 'rod',
    description: 'Half-dice round up instead of down.'
  },
  {
    id: 'ROD-003',
    name: 'Blessed Rod',
    type: 'rod',
    cost: 7,
    effects: ['reduce_regrets_1'],
    equipSlot: 'rod',
    description: 'Reduce Regret draws by 1 (minimum 0).'
  },
  {
    id: 'ROD-004',
    name: 'Ancient Harpoon',
    type: 'rod',
    cost: 8,
    effects: ['ignore_shark_penalty'],
    equipSlot: 'rod',
    description: 'Ignore "discard small fish" penalties.'
  }
];

export const REELS: UpgradeCard[] = [
  {
    id: 'REEL-001',
    name: 'Quick Release Reel',
    type: 'reel',
    cost: 4,
    effects: ['draw_dink_on_catch'],
    equipSlot: 'reel',
    description: 'Draw a Dink whenever you catch a fish.'
  },
  {
    id: 'REEL-002',
    name: 'Deep Sea Reel',
    type: 'reel',
    cost: 6,
    effects: ['descend_cost_-1'],
    equipSlot: 'reel',
    description: 'Reduce cost to descend by 1.'
  },
  {
    id: 'REEL-003',
    name: 'Mechanical Reel',
    type: 'reel',
    cost: 5,
    effects: ['auto_catch_difficulty_3'],
    equipSlot: 'reel',
    description: 'Automatically catch fish with difficulty 3 or less.'
  },
  {
    id: 'REEL-004',
    name: 'Void Reel',
    type: 'reel',
    cost: 9,
    effects: ['madness_immune'],
    equipSlot: 'reel',
    description: 'Immune to Madness increases from fish.'
  }
];

export const SUPPLIES: UpgradeCard[] = [
  {
    id: 'SUPPLY-001',
    name: 'Lucky Lure',
    type: 'supply',
    cost: 2,
    effects: ['reroll_1s'],
    equipSlot: 'supply',
    description: 'Reroll all 1s when fishing.'
  },
  {
    id: 'SUPPLY-002',
    name: 'Fish Finder',
    type: 'supply',
    cost: 4,
    effects: ['reveal_before_move'],
    equipSlot: 'supply',
    description: 'Reveal top fish before moving to a shoal.'
  },
  {
    id: 'SUPPLY-003',
    name: 'Safety Net',
    type: 'supply',
    cost: 3,
    effects: ['prevent_regret_1_per_day'],
    equipSlot: 'supply',
    description: 'Prevent 1 Regret draw per day.'
  },
  {
    id: 'SUPPLY-004',
    name: 'Ancient Map',
    type: 'supply',
    cost: 6,
    effects: ['start_depth_2'],
    equipSlot: 'supply',
    description: 'Start each day at Depth II.'
  },
  {
    id: 'SUPPLY-005',
    name: 'Lifeboat',
    type: 'supply',
    cost: 5,
    effects: ['port_from_sea'],
    equipSlot: 'supply',
    description: 'Make Port from Sea. Sometimes you just have to abandon ship.'
  }
];

export const ALL_UPGRADES = [...RODS, ...REELS, ...SUPPLIES];