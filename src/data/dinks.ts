import { DinkCard } from '@/types/game';

export const DINK_CARDS: DinkCard[] = [
  {
    id: 'DINK-001',
    name: 'Lucky Minnow',
    timing: ['immediate'],
    effects: ['gain_1_fishbuck'],
    oneShot: true,
    description: 'Flip this trinket for an instant Fishbuck windfall.'
  },
  {
    id: 'DINK-002',
    name: 'Pocket Compass',
    timing: ['declaration'],
    effects: ['start_at_depth_2'],
    oneShot: false,
    description: 'Choose to begin the day already positioned at Depth II.'
  },
  {
    id: 'DINK-003',
    name: 'Sturdy Net',
    timing: ['catch'],
    effects: ['reroll_failed_catch'],
    oneShot: true,
    description: 'After failing a catch attempt, reroll any number of spent dice.'
  },
  {
    id: 'DINK-004',
    name: 'Coffee Thermos',
    timing: ['refresh'],
    effects: ['ready_spent_die'],
    oneShot: true,
    description: 'Move one spent die back to your fresh pool during Refresh.'
  },
  {
    id: 'DINK-005',
    name: 'Fisherman\'s Tale',
    timing: ['end_of_day'],
    effects: ['score_bonus_2'],
    oneShot: false,
    description: 'Spin a yarn to secure +2 glory at the end of the day.'
  },
  {
    id: 'DINK-006',
    name: 'Salt-Cured Worms',
    timing: ['catch'],
    effects: ['+1_die_value_once'],
    oneShot: true,
    description: 'Treat a single die as though its value were increased by 1.'
  },
  {
    id: 'DINK-007',
    name: 'Tin of Ball Bearings',
    timing: ['movement'],
    effects: ['descend_cost_-1'],
    oneShot: false,
    description: 'Your rig glides silently—descending costs 1 less die value.'
  },
  {
    id: 'DINK-008',
    name: 'Scrimshaw Token',
    timing: ['madness'],
    effects: ['ignore_madness_increase'],
    oneShot: true,
    description: 'Discard to ignore a single Madness increase.'
  },
  {
    id: 'DINK-009',
    name: 'Abyssal Chart',
    timing: ['declaration'],
    effects: ['peek_shoal_top'],
    oneShot: true,
    description: 'Before choosing a shoal, peek at the top fish at your depth.'
  },
  {
    id: 'DINK-010',
    name: 'Lucky Clamshell',
    timing: ['roll'],
    effects: ['convert_one_to_six'],
    oneShot: true,
    description: 'After rolling dice, turn a single die to show a 6.'
  },
  {
    id: 'DINK-011',
    name: 'Tide Reader',
    timing: ['start'],
    effects: ['gain_extra_action'],
    oneShot: false,
    description: 'At the start of each day gain one additional action at sea.'
  },
  {
    id: 'DINK-012',
    name: 'Brass Fish Hook',
    timing: ['sell'],
    effects: ['sell_bonus_1'],
    oneShot: false,
    description: 'Whenever you sell a fish, gain +1 Fishbuck.'
  },
  {
    id: 'DINK-013',
    name: 'Merchant\'s Token',
    timing: ['port'],
    effects: ['shop_discount'],
    oneShot: true,
    description: 'Discard at Port to reduce the cost of a single Shop purchase by 2$.'
  }
];
