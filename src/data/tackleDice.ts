import { TackleDie } from '@/types/game';

export const TACKLE_DICE: TackleDie[] = [
  {
    id: 'tackle-standard',
    name: 'Standard Lead',
    color: 'slate',
    cost: 2,
    faces: [1, 2, 3, 4, 5, 6],
    description: 'Reliable and well-balanced—no surprises beneath the waves.'
  },
  {
    id: 'tackle-luminous',
    name: 'Luminous Jig',
    color: 'emerald',
    cost: 3,
    faces: [2, 3, 3, 4, 5, 6],
    description: 'Glows with eldritch light to tempt wary fish into striking.'
  },
  {
    id: 'tackle-barbed',
    name: 'Barbed Sinkline',
    color: 'rose',
    cost: 3,
    faces: [1, 2, 4, 4, 5, 6],
    description: 'Jagged hooks dig deep, trading finesse for raw stopping power.'
  },
  {
    id: 'tackle-abyssal',
    name: 'Abyssal Weight',
    color: 'violet',
    cost: 4,
    faces: [3, 3, 4, 5, 6, 6],
    description: 'Heavy rune-etched tackle ideal for wrangling horrors at Depth III.'
  }
];

export const TACKLE_DICE_LOOKUP: Record<string, TackleDie> = Object.fromEntries(
  TACKLE_DICE.map(die => [die.id, die])
);
