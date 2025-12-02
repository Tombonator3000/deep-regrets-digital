import { CharacterOption } from '../types/game';

export const CHARACTERS: CharacterOption[] = [
  {
    id: 'hugo',
    name: 'Hugo',
    title: 'The Veteran',
    description: 'A weathered fisherman with decades of experience in treacherous waters.',
    startingBonus: 'Start with an extra Rod and +2 Fishbucks',
    portrait: '/portraits/hugo.png'
  },
  {
    id: 'alba',
    name: 'Alba',
    title: 'The Beastmaster',
    description: 'A mysterious angler who shares a bond with the creatures of the sea.',
    startingBonus: 'Start with a Reel and ignore first Regret draw',
    portrait: '/portraits/alba.png'
  },
  {
    id: 'bert',
    name: 'Bert',
    title: 'The Hunter',
    description: 'A skilled hunter who brings his expertise to the deep waters.',
    startingBonus: 'Start at Depth II and draw an extra Dink',
    portrait: '/portraits/bert.png'
  },
  {
    id: 'isla',
    name: 'Isla',
    title: 'The Determined',
    description: 'A hardworking fisherwoman who never gives up on her catch.',
    startingBonus: 'Start with 3 extra Fishbucks and reroll 1s',
    portrait: '/portraits/isla.png'
  },
  {
    id: 'fred',
    name: 'Fred',
    title: 'The Sailor',
    description: 'A fearless sailor who knows every secret of the briny deep.',
    startingBonus: 'Start with max dice +1 and extra mount slot',
    portrait: '/portraits/fred.png'
  }
];