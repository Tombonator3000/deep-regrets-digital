import { DinkCard } from '@/types/game';

export const DINK_CARDS: DinkCard[] = [
  {
    id: 'DINK-001',
    name: 'Lucky Minnow',
    timing: ['immediate'],
    effects: ['gain_1_fishbuck'],
    oneShot: true,
    description: 'Gain 1 Fishbuck immediately.'
  },
  {
    id: 'DINK-002',
    name: 'Pocket Compass',
    timing: ['declaration'],
    effects: ['start_at_depth_2'],
    oneShot: false,
    description: 'You may start the day at depth II.'
  },
  {
    id: 'DINK-003',
    name: 'Sturdy Net',
    timing: ['catch'],
    effects: ['reroll_failed_catch'],
    oneShot: true,
    description: 'Reroll dice after a failed catch.'
  },
  {
    id: 'DINK-004',
    name: 'Coffee Thermos',
    timing: ['refresh'],
    effects: ['ready_spent_die'],
    oneShot: true,
    description: 'Move one spent die back to your fresh pool.'
  },
  {
    id: 'DINK-005',
    name: 'Fisherman\'s Tale',
    timing: ['end_of_day'],
    effects: ['score_bonus_2'],
    oneShot: false,
    description: 'Gain 2 bonus points at the end of the day.'
  }
];
