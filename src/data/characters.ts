import { CharacterOption } from '../types/game';

// Character-specific color themes inspired by the physical board game
// Each character has a unique color palette that affects their Captain Info panel
export interface CharacterTheme {
  primary: string;      // Main accent color (HSL values)
  primaryGlow: string;  // Glow/highlight version
  secondary: string;    // Secondary accent
  background: string;   // Panel background tint
  border: string;       // Border color
}

export const CHARACTER_THEMES: Record<string, CharacterTheme> = {
  hugo: {
    primary: '45 85% 55%',      // Gold/yellow-orange - warm veteran tones
    primaryGlow: '45 90% 65%',
    secondary: '35 70% 45%',
    background: '40 30% 12%',
    border: '45 60% 40%',
  },
  alba: {
    primary: '280 60% 55%',     // Purple - mystical beastmaster
    primaryGlow: '280 70% 65%',
    secondary: '260 50% 45%',
    background: '280 25% 12%',
    border: '280 50% 40%',
  },
  bert: {
    primary: '180 55% 45%',     // Teal/blue-green - hunter/sea theme
    primaryGlow: '180 65% 55%',
    secondary: '190 45% 35%',
    background: '185 30% 11%',
    border: '180 45% 35%',
  },
  isla: {
    primary: '0 65% 50%',       // Red/coral - determined, fiery spirit
    primaryGlow: '0 70% 60%',
    secondary: '15 55% 45%',
    background: '5 25% 12%',
    border: '0 50% 40%',
  },
  fred: {
    primary: '140 50% 45%',     // Green/seafoam - sailor/nautical
    primaryGlow: '140 60% 55%',
    secondary: '160 45% 40%',
    background: '145 25% 11%',
    border: '140 40% 35%',
  },
};

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