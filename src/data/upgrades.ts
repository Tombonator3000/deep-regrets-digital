import { UpgradeCard } from '../types/game';

export const RODS: UpgradeCard[] = [
  {
    id: 'ROD-001',
    name: 'Trolling Rod',
    type: 'rod',
    cost: 0,
    effects: ['large_fish_discount'],
    equipSlot: 'rod',
    description: 'Large Fish cost 1$ less to catch.',
    flavorText: 'Great for those who like to stay on the move.'
  },
  {
    id: 'ROD-002',
    name: 'Rod of the Dead',
    type: 'rod',
    cost: 0,
    effects: ['ignore_reveal_catch_abilities'],
    equipSlot: 'rod',
    description: 'You may choose to ignore reveal and/or catch abilities on the Fish you reveal and/or catch.',
    flavorText: 'Are these human bones?'
  },
  {
    id: 'ROD-003',
    name: 'Rod of Fortune',
    type: 'rod',
    cost: 0,
    effects: ['fair_fish_discount'],
    equipSlot: 'rod',
    description: 'Fair Fish cost 1$ less to catch.',
    flavorText: 'Its length is adorned with mother-of-pearl inlay.'
  },
  {
    id: 'ROD-004',
    name: 'Lucky Pole',
    type: 'rod',
    cost: 0,
    effects: ['first_fish_discount'],
    equipSlot: 'rod',
    description: 'Your first Fish each Day costs 2$ less to catch.',
    flavorText: "If it won't break, go fishing."
  },
  {
    id: 'ROD-005',
    name: 'Rod of the Deep',
    type: 'rod',
    cost: 0,
    effects: ['peek_top_two'],
    equipSlot: 'rod',
    description: 'When you cast, peek at the top two Fish of the Shoal and place them back in any order, before revealing the top Fish.',
    flavorText: 'It knows its own. It calls to them.'
  },
  {
    id: 'ROD-006',
    name: 'Rod of the Infinite',
    type: 'rod',
    cost: 0,
    effects: ['peek_top_three'],
    equipSlot: 'rod',
    description: 'When you cast, peek at the top three Fish of the Shoal and place them back in any order, before revealing the top Fish.',
    flavorText: 'A nightmare to wield, but undeniably efficient.'
  },
  {
    id: 'ROD-007',
    name: 'Split Bamboo Pole',
    type: 'rod',
    cost: 0,
    effects: ['small_fish_discount'],
    equipSlot: 'rod',
    description: 'Small Fish cost 1$ less to catch.',
    flavorText: 'Affordable, sturdy, and lightweight.'
  },
  {
    id: 'ROD-008',
    name: 'Wood and Brass Rod',
    type: 'rod',
    cost: 0,
    effects: ['middling_fish_discount'],
    equipSlot: 'rod',
    description: 'Middling Fish cost 1$ less to catch.',
    flavorText: 'You can see the craft and care that went into its construction.'
  },
  {
    id: 'ROD-009',
    name: 'Rod of Manchineel',
    type: 'rod',
    cost: 0,
    effects: ['foul_fish_discount'],
    equipSlot: 'rod',
    description: 'Foul Fish cost 1$ less to catch.',
    flavorText: 'Constructed from wood of the death apple tree, every part of it is toxic.'
  },
  {
    id: 'ROD-010',
    name: 'Narwhal Rod',
    type: 'rod',
    cost: 0,
    effects: ['all_fish_discount'],
    equipSlot: 'rod',
    description: 'All Fish cost 1$ less to catch.',
    flavorText: 'Made from the tusk and bones of a beast that beached in a storm.'
  }
];

export const REELS: UpgradeCard[] = [
  {
    id: 'REEL-001',
    name: 'Centerpin Reel',
    type: 'reel',
    cost: 0,
    effects: ['draw_three_dinks'],
    equipSlot: 'reel',
    description: 'When you would draw a Dink card as part of a fishing action, draw three instead.',
    flavorText: "The latest in fishing technology, I don't trust it."
  },
  {
    id: 'REEL-002',
    name: 'Wood and Brass Reel',
    type: 'reel',
    cost: 0,
    effects: ['reroll_two_dice'],
    equipSlot: 'reel',
    description: 'Once per day, you may reroll up to two of your Fresh dice.',
    flavorText: 'The classic instrument.'
  },
  {
    id: 'REEL-003',
    name: 'Abyssal Reel',
    type: 'reel',
    cost: 0,
    effects: ['set_three_dice_max'],
    equipSlot: 'reel',
    description: 'Once per day, you may set any three Fresh dice to their highest Value.',
    flavorText: 'Absolutely abhorrent.'
  },
  {
    id: 'REEL-004',
    name: 'Reel of Fortune',
    type: 'reel',
    cost: 0,
    effects: ['reroll_until_greater_than_one'],
    equipSlot: 'reel',
    description: 'Once per day, you may reroll any of your Fresh dice until they each have a Value greater than one.',
    flavorText: 'Made of stone and bone, and covered in strange runes.'
  },
  {
    id: 'REEL-005',
    name: 'Stop-Latch',
    type: 'reel',
    cost: 0,
    effects: ['set_one_die_max'],
    equipSlot: 'reel',
    description: 'Once per day, you may set any one Fresh die to its highest Value.',
    flavorText: 'An older design, but it does the trick.'
  },
  {
    id: 'REEL-006',
    name: 'Solid Brass Reel',
    type: 'reel',
    cost: 0,
    effects: ['reroll_any_dice'],
    equipSlot: 'reel',
    description: 'Once per day, you may reroll any number of your Fresh dice.',
    flavorText: 'A beautiful and trustworthy implement.'
  },
  {
    id: 'REEL-007',
    name: 'Bone Wheel',
    type: 'reel',
    cost: 0,
    effects: ['retain_unspent_points'],
    equipSlot: 'reel',
    description: 'Retain unspent points on dice.',
    flavorText: 'It cracks and grinds as it spins.'
  },
  {
    id: 'REEL-008',
    name: 'Manifold Reel',
    type: 'reel',
    cost: 0,
    effects: ['set_two_dice_max'],
    equipSlot: 'reel',
    description: 'Once per day, you may set any two Fresh dice to their highest Value.',
    flavorText: 'A convoluted tangle of nonsense.'
  },
  {
    id: 'REEL-009',
    name: 'Reel of the Deep',
    type: 'reel',
    cost: 0,
    effects: ['place_boat_depth_2'],
    equipSlot: 'reel',
    description: 'Once per day, if you are at Sea, you may place your boat at Depth II.',
    flavorText: 'More animal than tool.'
  },
  {
    id: 'REEL-010',
    name: 'Reel of the Infinite',
    type: 'reel',
    cost: 0,
    effects: ['move_down_one_depth'],
    equipSlot: 'reel',
    description: 'Once per day, if you are at Sea, you may move your Boat down one Depth.',
    flavorText: 'A device almost too dangerous to wield.'
  }
];

export const SUPPLIES: UpgradeCard[] = [
  {
    id: 'SUPPLY-001',
    name: 'Mermaid Eyes',
    type: 'supply',
    cost: 0,
    effects: ['peek_two_fish'],
    equipSlot: 'supply',
    description: 'Peek at two Fish.',
    flavorText: 'Let me see the world through their eyes!'
  },
  {
    id: 'SUPPLY-002',
    name: 'Cloche',
    type: 'supply',
    cost: 0,
    effects: ['mount_small_fish'],
    equipSlot: 'supply',
    description: 'You may mount a small Fish on this card. At the end of the game, if you have the highest Regret Value, discard it. Otherwise, double its Value.',
    flavorText: 'Keeping things is important.'
  },
  {
    id: 'SUPPLY-003',
    name: 'Restless Stone',
    type: 'supply',
    cost: 0,
    effects: ['plus_minus_one'],
    equipSlot: 'supply',
    description: '+1, -1 to dice.',
    flavorText: 'I swear this, while I hold it, but it vibrates as I sleep.'
  },
  {
    id: 'SUPPLY-004',
    name: 'Heart of the Fathoms',
    type: 'supply',
    cost: 0,
    effects: ['reveal_all_fish'],
    equipSlot: 'supply',
    description: 'Reveal all Fish in any order.',
    flavorText: 'Ironically filled. They do what remains? Why would someone desire that much?'
  },
  {
    id: 'SUPPLY-005',
    name: 'Bucket of Chum',
    type: 'supply',
    cost: 0,
    effects: ['reduce_difficulty_2'],
    equipSlot: 'supply',
    description: 'Reduce a Fish Difficulty by 2.',
    flavorText: "It's what we're all doing things we regret."
  },
  {
    id: 'SUPPLY-006',
    name: 'Black Tea',
    type: 'supply',
    cost: 0,
    effects: ['ignore_regret'],
    equipSlot: 'supply',
    description: 'Ignore a Regret effect.',
    flavorText: 'Routine helps. Routine helps. Routine helps.'
  },
  {
    id: 'SUPPLY-007',
    name: "Halley's Diving Bell",
    type: 'supply',
    cost: 0,
    effects: ['move_down_depth'],
    equipSlot: 'supply',
    description: 'Move your Boat down one Depth.',
    flavorText: "It's not much, give me a little confidence."
  },
  {
    id: 'SUPPLY-008',
    name: 'Book of the Deep',
    type: 'supply',
    cost: 0,
    effects: ['peek_one_row'],
    equipSlot: 'supply',
    description: 'Peek at one row.',
    flavorText: 'You cannot unlearn what you read.'
  },
  {
    id: 'SUPPLY-009',
    name: 'Moonshine',
    type: 'supply',
    cost: 0,
    effects: ['ignore_regret', 'random'],
    equipSlot: 'supply',
    description: 'Ignore a Regret effect + Random.',
    flavorText: 'A mistake, to be sure, but better than the alternative.'
  },
  {
    id: 'SUPPLY-010',
    name: 'Barbadian Dark Rum',
    type: 'supply',
    cost: 0,
    effects: ['ignore_regret'],
    equipSlot: 'supply',
    description: 'Ignore a Regret effect.',
    flavorText: 'I find cold comfort at the bottom of the bottle.'
  },
  {
    id: 'SUPPLY-011',
    name: 'Scotch Egg',
    type: 'supply',
    cost: 0,
    effects: ['reduce_regret_2'],
    equipSlot: 'supply',
    description: '-2 Regret.',
    flavorText: 'The best this land has to offer.'
  },
  {
    id: 'SUPPLY-012',
    name: 'Absinthe',
    type: 'supply',
    cost: 0,
    effects: ['ignore_regret', 'random'],
    equipSlot: 'supply',
    description: 'Ignore a Regret effect + Random.',
    flavorText: 'Supposedly it has hallucinogenic properties. Please God, let them be hallucinations.'
  },
  {
    id: 'SUPPLY-013',
    name: 'Jar of Leeches',
    type: 'supply',
    cost: 0,
    effects: ['reduce_difficulty_4'],
    equipSlot: 'supply',
    description: 'Reduce a Fish Difficulty by 4.',
    flavorText: "They take away the bad blood. It's a purely scientific swelling or ill humors."
  },
  {
    id: 'SUPPLY-014',
    name: 'Claw Hammer',
    type: 'supply',
    cost: 0,
    effects: ['return_mounted_fish'],
    equipSlot: 'supply',
    description: 'Use only at Port. Return all of your mounted Fish to your hand.',
    flavorText: 'Two-sided, like a human.'
  },
  {
    id: 'SUPPLY-015',
    name: "Sea Monkey's Paw",
    type: 'supply',
    cost: 0,
    effects: ['anchor', 'reduce_regret_2'],
    equipSlot: 'supply',
    description: 'Anchor, -2 Regret.',
    flavorText: 'All gifts come at a high price.'
  },
  {
    id: 'SUPPLY-016',
    name: 'Bag of Maggots',
    type: 'supply',
    cost: 0,
    effects: ['reduce_difficulty_2'],
    equipSlot: 'supply',
    description: 'Reduce a Fish Difficulty by 2.',
    flavorText: 'Sometimes they are all you can hear, wriggling inside the bag.'
  },
  {
    id: 'SUPPLY-017',
    name: 'Curious Spyglass',
    type: 'supply',
    cost: 0,
    effects: ['peek_one_column'],
    equipSlot: 'supply',
    description: 'Peek at one column.',
    flavorText: 'See what others cannot.'
  },
  {
    id: 'SUPPLY-018',
    name: 'Cullen Skink',
    type: 'supply',
    cost: 0,
    effects: ['reduce_regret_2'],
    equipSlot: 'supply',
    description: '-2 Regret.',
    flavorText: 'A hearty soup of smoked haddock, potatoes and onions.'
  },
  {
    id: 'SUPPLY-019',
    name: 'Cask Ale',
    type: 'supply',
    cost: 0,
    effects: ['reduce_regret_2'],
    equipSlot: 'supply',
    description: '-2 Regret.',
    flavorText: 'Just drink the ale and force a smile.'
  },
  {
    id: 'SUPPLY-020',
    name: 'Diving Lantern',
    type: 'supply',
    cost: 0,
    effects: ['reveal_three_fish'],
    equipSlot: 'supply',
    description: 'Reveal three Fish in any order.',
    flavorText: "Sometimes seeing isn't believing."
  }
];

export const ALL_UPGRADES = [...RODS, ...REELS, ...SUPPLIES];
