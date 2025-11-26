// Human-readable descriptions for fish abilities
export const ABILITY_DESCRIPTIONS: Record<string, string> = {
  // Regret abilities
  'regret_draw': 'Draw 1 Regret',
  'regret_draw_2': 'Draw 2 Regrets',

  // Madness abilities
  'madness_+1': '+1 Madness',
  'madness_+2': '+2 Madness',
  'madness_-1': '-1 Madness',

  // Combat/Catch abilities
  'strong': 'Strong (hard to reel in)',
  'quick': 'Quick (elusive)',
  'shark': 'Shark',
  'discard_small': 'Discard a small fish',
  'tentacles': 'Tentacles',
  'beast': 'Beast',
  'intelligence': 'Intelligent',

  // Special abilities
  'dink_on_catch': 'Draw a Dink when caught',
  'glide': 'Glide',
  'curse': 'Cursed',
  'lure': 'Lure',
  'horror': 'Horror',
  'legendary': 'Legendary',
  'ancient': 'Ancient',
  'special': 'Special',
  'end_turn': 'Ends your turn',
  'start_erosion': 'Starts shoal erosion',
};

// Get human-readable description for an ability
export const getAbilityDescription = (ability: string): string => {
  // Check for exact match
  if (ABILITY_DESCRIPTIONS[ability]) {
    return ABILITY_DESCRIPTIONS[ability];
  }

  // Check for madness pattern (madness_+X or madness_-X)
  const madnessMatch = ability.match(/^madness_([+-])(\d+)$/);
  if (madnessMatch) {
    const sign = madnessMatch[1];
    const value = madnessMatch[2];
    return `${sign}${value} Madness`;
  }

  // Fallback: capitalize and replace underscores
  return ability
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// Get all abilities as readable strings
export const getAbilitiesDescription = (abilities: string[]): string[] => {
  return abilities.map(getAbilityDescription);
};

// Get a combined description string
export const getAbilitiesSummary = (abilities: string[]): string => {
  const descriptions = getAbilitiesDescription(abilities);
  return descriptions.join(', ');
};
