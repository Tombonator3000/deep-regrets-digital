import { DinkCard } from '@/types/game';

export const DINK_CARDS: DinkCard[] = [
  {
    id: 'DINK-001',
    name: 'Lucky Minnow',
    timing: ['immediate'],
    effects: ['gain_1_fishbuck'],
    oneShot: true,
    description: 'PLAY anytime: Discard this card to immediately gain 1 Fishbuck.'
  },
  {
    id: 'DINK-002',
    name: 'Pocket Compass',
    timing: ['declaration'],
    effects: ['start_at_depth_2'],
    oneShot: false,
    description: 'PASSIVE: While you hold this card, you may choose to begin each day at Depth II instead of Depth I.'
  },
  {
    id: 'DINK-003',
    name: 'Sturdy Net',
    timing: ['catch'],
    effects: ['reroll_failed_catch'],
    oneShot: true,
    description: 'PLAY after failed catch: Discard this card to reroll any number of your spent dice and try again.'
  },
  {
    id: 'DINK-004',
    name: 'Coffee Thermos',
    timing: ['refresh'],
    effects: ['ready_spent_die'],
    oneShot: true,
    description: 'PLAY during Refresh: Discard this card to move one spent die back to your fresh pool.'
  },
  {
    id: 'DINK-005',
    name: 'Fisherman\'s Tale',
    timing: ['end_of_day'],
    effects: ['score_bonus_2'],
    oneShot: false,
    description: 'PASSIVE: While you hold this card, gain +2 glory at the end of each day.'
  },
  {
    id: 'DINK-006',
    name: 'Salt-Cured Worms',
    timing: ['catch'],
    effects: ['+1_die_value_once'],
    oneShot: true,
    description: 'PLAY during catch: Discard this card to treat one of your dice as +1 higher value.'
  },
  {
    id: 'DINK-007',
    name: 'Tin of Ball Bearings',
    timing: ['movement'],
    effects: ['descend_cost_-1'],
    oneShot: false,
    description: 'PASSIVE: While you hold this card, descending costs 1 less die value.'
  },
  {
    id: 'DINK-008',
    name: 'Scrimshaw Token',
    timing: ['madness'],
    effects: ['ignore_madness_increase'],
    oneShot: true,
    description: 'PLAY when gaining Madness: Discard this card to ignore a single Madness increase.'
  },
  {
    id: 'DINK-009',
    name: 'Abyssal Chart',
    timing: ['declaration'],
    effects: ['peek_shoal_top'],
    oneShot: true,
    description: 'PLAY during Declaration: Discard this card to peek at the top fish of each shoal at your depth before choosing where to fish.'
  },
  {
    id: 'DINK-010',
    name: 'Lucky Clamshell',
    timing: ['roll'],
    effects: ['convert_one_to_six'],
    oneShot: true,
    description: 'PLAY after rolling: Discard this card to change one of your rolled dice to show a 6.'
  },
  {
    id: 'DINK-011',
    name: 'Tide Reader',
    timing: ['start'],
    effects: ['gain_extra_action'],
    oneShot: false,
    description: 'PASSIVE: While you hold this card, gain one additional action at sea each day.'
  },
  {
    id: 'DINK-012',
    name: 'Brass Fish Hook',
    timing: ['sell'],
    effects: ['sell_bonus_1'],
    oneShot: false,
    description: 'PASSIVE: While you hold this card, gain +1 Fishbuck whenever you sell a fish.'
  },
  {
    id: 'DINK-013',
    name: 'Merchant\'s Token',
    timing: ['port'],
    effects: ['shop_discount'],
    oneShot: true,
    description: 'PLAY at Port Shop: Discard this card to reduce the cost of a single purchase by $2.'
  }
];
