import { CharacterOption } from '../types/game';

export const CHARACTERS: CharacterOption[] = [
  {
    id: 'ahab',
    name: 'Captain Ahab',
    title: 'The Obsessed',
    description: 'A weathered captain driven by an ancient vendetta against the depths.',
    startingBonus: 'Start with an extra Rod and +2 Fishbucks',
    portrait: '/portraits/ahab.jpg'
  },
  {
    id: 'nemo',
    name: 'Captain Nemo',
    title: 'The Engineer',
    description: 'A brilliant inventor with advanced fishing technology.',
    startingBonus: 'Start with a Reel and ignore first Regret draw',
    portrait: '/portraits/nemo.jpg'
  },
  {
    id: 'marina',
    name: 'Marina Deepcurrent',
    title: 'The Mystic',
    description: 'A sea witch who speaks to the creatures of the deep.',
    startingBonus: 'Start at Depth II and draw an extra Dink',
    portrait: '/portraits/marina.jpg'
  },
  {
    id: 'finn',
    name: 'Finn Saltwater',
    title: 'The Lucky',
    description: 'A charming sailor whose luck often outweighs his skill.',
    startingBonus: 'Start with 3 extra Fishbucks and reroll 1s',
    portrait: '/portraits/finn.jpg'
  },
  {
    id: 'storm',
    name: 'Storm Blackwater',
    title: 'The Daredevil',
    description: 'A fearless angler who thrives in the most dangerous waters.',
    startingBonus: 'Start with max dice +1 and extra mount slot',
    portrait: '/portraits/storm.jpg'
  }
];