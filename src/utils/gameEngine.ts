import { GameState, Player, GameAction, CharacterOption, Depth, FishCard, GamePhase, MAX_FISHBUCKS, ShopType } from '@/types/game';
import { ALL_FISH, DEPTH_1_FISH, DEPTH_2_FISH, DEPTH_3_FISH } from '@/data/fish';
import { REGRET_CARDS } from '@/data/regrets';
import { DINK_CARDS } from '@/data/dinks';
import { ALL_UPGRADES, RODS, REELS, SUPPLIES } from '@/data/upgrades';
import { TACKLE_DICE_LOOKUP, ALL_TACKLE_DIE_IDS, getTackleDieColor } from '@/data/tackleDice';
import { getSlotMultiplier } from './mounting';

// Shuffle utility
const shuffle = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Per rulebook (p.17): "You cannot have more than 10$ at one time. Any additional income is lost."
const addFishbucks = (player: Player, amount: number): number => {
  const newTotal = Math.min(player.fishbucks + amount, MAX_FISHBUCKS);
  const actualGain = newTotal - player.fishbucks;
  player.fishbucks = newTotal;
  return actualGain; // Returns actual amount gained (for UI feedback)
};

// Check if player has already visited a shop this turn
const hasVisitedShop = (player: Player, shopType: ShopType): boolean => {
  return player.shopVisits?.includes(shopType) ?? false;
};

// Record a shop visit
const recordShopVisit = (player: Player, shopType: ShopType): void => {
  if (!player.shopVisits) {
    player.shopVisits = [];
  }
  if (!player.shopVisits.includes(shopType)) {
    player.shopVisits.push(shopType);
  }
};

// Reset shop visits (called at end of turn or when leaving port)
const resetShopVisits = (player: Player): void => {
  player.shopVisits = [];
};

// Initialize new game
export const initializeGame = (selectedCharacters: CharacterOption[]): GameState => {
  // Per rulebook (p.6): Place all Tackle Dice into the dice bag, randomly draw 4 for the Market
  const shuffledTackleDice = shuffle([...ALL_TACKLE_DIE_IDS]);
  const tackleDiceMarket = shuffledTackleDice.slice(0, 4);
  const tackleDiceBag = shuffledTackleDice.slice(4);

  const port: GameState['port'] = {
    shops: {
      rods: shuffle([...RODS]).slice(0, 3),
      reels: shuffle([...REELS]).slice(0, 3),
      supplies: shuffle([...SUPPLIES]).slice(0, 3)
    },
    tackleDiceMarket,
    tackleDiceBag,
    dinksDeck: shuffle(DINK_CARDS),
    regretsDeck: shuffle(REGRET_CARDS),
    regretsDiscard: []
  };

  const players: Player[] = selectedCharacters.map((character, index) => {
    // All players start with basic equipment per rules
    const basicRod = RODS[0]; // Glass Rod
    const basicReel = REELS[0]; // Quick Release Reel

    // Get max dice from madness tier (player starts with 0 regrets)
    const startingMaxDice = getMaxDiceFromMadness(0);

    const basePlayer: Player = {
      id: `player-${index + 1}`,
      name: character.name,
      character: character.id,
      location: 'sea',
      currentDepth: 1,
      freshDice: rollDice(startingMaxDice), // Starting dice based on tier
      spentDice: [],
      tackleDice: [],
      maxDice: startingMaxDice,
      baseMaxDice: 3,
      maxMountSlots: 3,
      regretShields: 0,
      rerollOnes: false,
      fishbucks: 3, // Starting money
      handFish: [],
      mountedFish: [],
      regrets: [],
      equippedRod: basicRod, // All players start with basic rod
      equippedReel: basicReel, // All players start with basic reel
      supplies: [], // Starting supplies handled by character bonuses
      dinks: [],
      activeEffects: [],
      madnessLevel: 0,
      madnessOffset: 0,
      lifeboatFlipped: false,
      canOfWormsFaceUp: false,
      hasPassed: false,
      shopVisits: [] // Per rulebook (p.17): Track which shops visited this turn
    };

    return applyCharacterBonuses(basePlayer, character.id, { port });
  });

  // Create shoals for each depth
  const createShoals = (fishList: typeof ALL_FISH): FishCard[][] => {
    const shuffled = shuffle(fishList);
    const shoals: FishCard[][] = [[], [], []];

    // Distribute 13 fish per shoal
    for (let i = 0; i < 39 && i < shuffled.length; i++) {
      const shoalIndex = i % 3;
      shoals[shoalIndex].push(shuffled[i]);
    }

    return shoals;
  };

  const gameState: GameState = {
    gameId: `game-${Date.now()}`,
    players,
    currentPlayerIndex: 0,
    firstPlayerIndex: 0,
    day: 'Monday',
    phase: 'start',
    sea: {
      shoals: {
        1: createShoals(DEPTH_1_FISH),
        2: createShoals(DEPTH_2_FISH),
        3: createShoals(DEPTH_3_FISH)
      },
      graveyards: {
        1: [],
        2: [],
        3: []
      },
      revealedShoals: {},
      plugActive: false,
      plugCursor: { depth: 1, shoal: 0 }
    },
    port,
    lifePreserverOwner: undefined,
    fishCoinOwner: undefined,
    omenDieValue: 1,
    isGameOver: false,
    winner: undefined
  };

  return gameState;
};

interface BonusContext {
  port?: GameState['port'];
}

// Apply character starting bonuses
export const applyCharacterBonuses = (
  player: Player,
  characterId: string,
  context: BonusContext = {}
): Player => {
  const updated: Player = { ...player };

  switch (characterId) {
    case 'ahab': {
      // The Obsessed: +2 Fishbucks and upgrade to better rod (Carbon Fiber Rod)
      updated.fishbucks += 2;
      const betterRod = RODS[1]; // Carbon Fiber Rod (index 1)
      if (betterRod) {
        updated.equippedRod = betterRod;
      }
      break;
    }
    case 'nemo': {
      // The Engineer: Upgrade to better reel (Deep Sea Reel) and ignore first Regret
      const betterReel = REELS[1]; // Deep Sea Reel (index 1)
      if (betterReel) {
        updated.equippedReel = betterReel;
      }
      updated.regretShields += 1;
      break;
    }
    case 'marina': {
      // The Mystic: Start at Depth II and draw an extra Dink
      updated.currentDepth = 2;
      if (context.port) {
        const { card, deck } = drawCard(context.port.dinksDeck);
        context.port.dinksDeck = deck;
        if (card) {
          updated.dinks = [...updated.dinks, card];
        }
      }
      break;
    }
    case 'finn': {
      // The Lucky: +3 Fishbucks and reroll 1s
      updated.fishbucks += 3;
      updated.rerollOnes = true;
      break;
    }
    case 'storm': {
      // The Daredevil: +1 max dice and extra mount slot
      updated.maxDice += 1;
      updated.baseMaxDice += 1;
      updated.maxMountSlots += 1;
      break;
    }
  }

  if (updated.freshDice.length > updated.maxDice) {
    updated.freshDice = updated.freshDice.slice(0, updated.maxDice);
  }
  while (updated.freshDice.length < updated.maxDice) {
    updated.freshDice = [...updated.freshDice, 1];
  }

  return updated;
};

// Dice rolling utility
export const rollDice = (count: number): number[] => {
  return Array.from({ length: count }, () => Math.floor(Math.random() * 6) + 1);
};

// Game action reducer
const hasEffect = (effects: string[] | undefined, effect: string) => {
  return Array.isArray(effects) && effects.includes(effect);
};

const playerHasEquippedEffect = (player: Player | undefined, effect: string) => {
  if (!player) {
    return false;
  }

  if (hasEffect(player.equippedRod?.effects, effect)) {
    return true;
  }

  if (hasEffect(player.equippedReel?.effects, effect)) {
    return true;
  }

  if (player.supplies.some(supply => hasEffect(supply.effects, effect))) {
    return true;
  }

  return false;
};

const hasActiveEffect = (player: Player, effect: string) => {
  return Array.isArray(player.activeEffects) && player.activeEffects.includes(effect);
};

const removeActiveEffect = (player: Player, effect: string) => {
  if (!Array.isArray(player.activeEffects)) {
    player.activeEffects = [];
    return;
  }

  player.activeEffects = player.activeEffects.filter(activeEffect => activeEffect !== effect);
};

const MADNESS_REGEX = /^madness_([+-]\d+)$/;

const parseMadnessAbility = (ability: string): number | null => {
  const match = ability.match(MADNESS_REGEX);
  if (!match) {
    return null;
  }

  const value = Number.parseInt(match[1], 10);
  return Number.isNaN(value) ? null : value;
};

const hasPersistentMadnessImmunity = (player: Player) => {
  return playerHasEquippedEffect(player, 'madness_immune') || hasActiveEffect(player, 'madness_immune');
};

const consumeMadnessPrevention = (player: Player) => {
  if (hasActiveEffect(player, 'ignore_madness_increase')) {
    removeActiveEffect(player, 'ignore_madness_increase');
    return true;
  }

  const preventionIndex = player.dinks.findIndex(dink => hasEffect(dink.effects, 'ignore_madness_increase'));
  if (preventionIndex >= 0) {
    player.dinks = [
      ...player.dinks.slice(0, preventionIndex),
      ...player.dinks.slice(preventionIndex + 1)
    ];
    return true;
  }

  return false;
};

const applyMadnessAdjustment = (player: Player, delta: number, gameState: GameState) => {
  if (delta === 0) {
    return;
  }

  if (delta > 0) {
    if (hasPersistentMadnessImmunity(player)) {
      return;
    }

    if (consumeMadnessPrevention(player)) {
      return;
    }
  }

  const baseMadness = calculateMadnessLevelFromRegrets(player.regrets.length);
  const currentOffset = player.madnessOffset ?? 0;
  let newOffset = currentOffset + delta;

  if (baseMadness + newOffset < 0) {
    newOffset = -baseMadness;
  }

  player.madnessOffset = newOffset;
  recalculateMadness(player, { gameState });
};

const applyMadnessAbilities = (player: Player, fish: FishCard, gameState: GameState) => {
  if (!fish.abilities || fish.abilities.length === 0) {
    return;
  }

  fish.abilities.forEach(ability => {
    const delta = parseMadnessAbility(ability);
    if (delta !== null) {
      applyMadnessAdjustment(player, delta, gameState);
    }
  });
};

const getDescendRequirement = (player: Player): number => {
  const baseRequirement = 3;
  let reduction = 0;

  if (hasEffect(player.equippedReel?.effects, 'descend_cost_-1')) {
    reduction += 1;
  }

  reduction += player.dinks.filter(dink => hasEffect(dink.effects, 'descend_cost_-1')).length;
  reduction += player.supplies.filter(supply => hasEffect(supply.effects, 'descend_cost_-1')).length;

  return Math.max(1, baseRequirement - reduction);
};

const spendDiceForDescent = (player: Player, steps: number): number[] | null => {
  if (steps <= 0) {
    return [];
  }

  const requirement = getDescendRequirement(player);
  const indicesToSpend: number[] = [];

  player.freshDice.forEach((die, index) => {
    if (die >= requirement && indicesToSpend.length < steps) {
      indicesToSpend.push(index);
    }
  });

  if (indicesToSpend.length !== steps) {
    return null;
  }

  const indexSet = new Set(indicesToSpend);
  const spentDice: number[] = [];
  const remainingDice: number[] = [];

  player.freshDice.forEach((die, index) => {
    if (indexSet.has(index)) {
      spentDice.push(die);
    } else {
      remainingDice.push(die);
    }
  });

  player.freshDice = remainingDice;
  player.spentDice = [...player.spentDice, ...spentDice];

  return spentDice;
};

export const gameReducer = (state: GameState | null, action: GameAction): GameState => {
  if (!state) {
    if (action.type === 'INIT_GAME') {
      return action.payload;
    }

    throw new Error('Game state has not been initialized.');
  }

  const newState = { ...state };
  const player = newState.players.find(p => p.id === action.playerId);
  
  if (!player && action.playerId !== 'system') {
    return state;
  }

  switch (action.type) {
    case 'INIT_GAME':
      return action.payload;
      
    case 'RESET_GAME':
      return state; // Keep current state for reset, handled by component
      
    case 'CHANGE_LOCATION':
      if (player) {
        player.location = action.payload.location;
        player.hasPassed = false;
        // Reset shoal position when changing location
        player.currentShoal = undefined;
      }
      break;

    case 'DECLARE_LOCATION':
      if (player && newState.phase === 'declaration') {
        player.location = action.payload.location;
        player.hasPassed = true; // Mark as having declared
        // Reset shoal position when declaring location
        player.currentShoal = undefined;

        if (player.location === 'port') {
          player.currentDepth = 1;
          // Make Port benefits per rulebook (p.17):
          // 1. Muster Your Courage again (reroll dice)
          // 2. Flip Can of Worms face-up
          // 3. Optionally discard one Regret (handled separately via DISCARD_REGRET action)

          // Flip Can of Worms face-up
          player.canOfWormsFaceUp = true;

          // Muster Your Courage - reroll all dice
          const totalDice = [...player.freshDice, ...player.spentDice];
          const maxDice = player.maxDice;
          let rerolledDice = rollDice(totalDice.length);

          // Apply reroll 1s ability if player has it
          if (player.rerollOnes) {
            rerolledDice = rerolledDice.map(value => (value === 1 ? rollDice(1)[0] : value));
          }

          // Keep up to maxDice in fresh pool, rest go to spent
          player.freshDice = rerolledDice.slice(0, Math.min(rerolledDice.length, maxDice));
          player.spentDice = rerolledDice.slice(maxDice);
        }

        // Check if all players have declared their location
        const allDeclared = newState.players.every(p => p.hasPassed);
        if (allDeclared) {
          // Advance to action phase
          newState.phase = 'action';
          // Reset hasPassed for action phase (players haven't passed yet)
          newState.players.forEach(p => p.hasPassed = false);
          // Set current player to first player
          newState.currentPlayerIndex = newState.firstPlayerIndex;
        } else {
          // Move to next player who hasn't declared yet
          let nextIndex = (newState.currentPlayerIndex + 1) % newState.players.length;
          while (newState.players[nextIndex].hasPassed && nextIndex !== newState.currentPlayerIndex) {
            nextIndex = (nextIndex + 1) % newState.players.length;
          }
          newState.currentPlayerIndex = nextIndex;
        }
      }
      break;

    case 'REVEAL_FISH':
      // Per rulebook (p.11): Revealing is FREE - the cost is in the PAY step when catching
      // However, player must have at least 1 fresh die to fish at all
      if (player && player.location === 'sea' && player.freshDice.length > 0) {
        const { depth, shoal } = action.payload;
        const shoalArray = newState.sea.shoals[depth]?.[shoal];
        const shoalKey = `${depth}-${shoal}`;

        // Track which shoal the player is interacting with
        player.currentShoal = shoal;

        // Reveal is free - just flip the top card if not already revealed
        if (shoalArray && shoalArray.length > 0 && !newState.sea.revealedShoals[shoalKey]) {
          // Mark the shoal as revealed (no die cost)
          newState.sea.revealedShoals = {
            ...newState.sea.revealedShoals,
            [shoalKey]: true
          };
        }
      }
      break;

    case 'DESCEND':
      if (player && player.location === 'sea') {
        const { targetDepth } = action.payload;
        if (typeof targetDepth === 'number' && targetDepth > player.currentDepth && targetDepth <= 3) {
          const steps = targetDepth - player.currentDepth;
          const spentDice = spendDiceForDescent(player, steps);
          if (spentDice) {
            player.currentDepth = targetDepth as Depth;
            // Reset shoal position when changing depth
            player.currentShoal = undefined;
          }
        }
      }
      break;

    case 'MOVE_DEEPER':
      if (player && player.location === 'sea') {
        const { newDepth } = action.payload;
        if (typeof newDepth === 'number' && newDepth === player.currentDepth + 1 && newDepth <= 3) {
          const spentDice = spendDiceForDescent(player, 1);
          if (spentDice) {
            player.currentDepth = newDepth as Depth;
            // Reset shoal position when changing depth
            player.currentShoal = undefined;
          }
        }
      }
      break;

    case 'CATCH_FISH':
      if (player && player.location === 'sea') {
        const { fish, depth, shoal, diceIndices, tackleDiceIndices } = action.payload;

        // Track which shoal the player is interacting with
        player.currentShoal = shoal;

        // Validate that the shoal has been revealed before allowing catch
        const catchShoalKey = `${depth}-${shoal}`;
        const isShoalRevealed = newState.sea.revealedShoals?.[catchShoalKey] ?? false;
        if (!isShoalRevealed) {
          // Cannot catch fish from unrevealed shoal - must reveal first
          console.warn('CATCH_FISH blocked: Shoal not revealed. Must use REVEAL_FISH action first.');
          break;
        }

        // Validate the fish being caught matches the top fish in the shoal
        const shoalArray = newState.sea.shoals[depth]?.[shoal];
        const topFish = shoalArray?.[0];
        if (!topFish || topFish.id !== fish.id) {
          console.warn('CATCH_FISH blocked: Fish does not match top of revealed shoal.');
          break;
        }

        // Apply Life Preserver difficulty reduction if active (rulebook p.9)
        const lifePreserverReduction = newState.lifePreserverDifficultyReduction ?? 0;
        const fishDifficulty = Math.max(0, fish.difficulty - lifePreserverReduction);
        const availableDiceTotal = player.freshDice.reduce((sum, die) => sum + die, 0);

        // Per rulebook (p.27): ALL EELS, ALL OCTOPUSES AND THE KRAKEN must spend required dice
        // even if difficulty is reduced to 0
        const fishNameLower = fish.name.toLowerCase();
        const requiresMinimumDice = fishNameLower.includes('eel') ||
                                    fishNameLower.includes('octopus') ||
                                    fishNameLower.includes('kraken');
        const minimumDiceRequired = requiresMinimumDice ? fish.difficulty : 0;

        // Per rulebook (p.10): "If a fish has no printed cost, its cost is 0$, you don't need to spend any dice in order to catch it"
        // But this doesn't apply to eels/octopuses/kraken per appendix
        const isZeroCostFish = fishDifficulty === 0 && !requiresMinimumDice;

        // Mechanical Reel effect - auto catch fish with difficulty 3 or less
        // Note: Auto-catch still requires meeting minimum dice for eels/octopuses/kraken
        const hasAutoCatch = playerHasEquippedEffect(player, 'auto_catch_difficulty_3');
        const isAutoCatch = hasAutoCatch && fishDifficulty <= 3 && !requiresMinimumDice;

        const requestedIndices = Array.isArray(diceIndices) ? diceIndices : [];
        const uniqueValidIndices = Array.from(
          new Set(
            requestedIndices.filter(
              (index: number) =>
                typeof index === 'number' && index >= 0 && index < player.freshDice.length
            )
          )
        );

        // Handle tackle dice selection
        const requestedTackleIndices = Array.isArray(tackleDiceIndices) ? tackleDiceIndices : [];
        const uniqueTackleIndices = Array.from(
          new Set(
            requestedTackleIndices.filter(
              (index: number) =>
                typeof index === 'number' && index >= 0 && index < player.tackleDice.length
            )
          )
        );

        // Roll tackle dice and calculate their values
        const tackleDiceValues: number[] = uniqueTackleIndices.map(index => {
          const tackleDieId = player.tackleDice[index];
          const tackleDie = TACKLE_DICE_LOOKUP[tackleDieId];
          if (tackleDie) {
            const faceIndex = Math.floor(Math.random() * tackleDie.faces.length);
            return tackleDie.faces[faceIndex];
          }
          return 0;
        });
        const tackleTotal = tackleDiceValues.reduce((sum, val) => sum + val, 0);

        const selectedDiceValues = uniqueValidIndices.map(index => player.freshDice[index]);
        const totalDiceUsed = uniqueValidIndices.length + uniqueTackleIndices.length;
        const hasUsableSelection =
          (uniqueValidIndices.length > 0 && selectedDiceValues.length === uniqueValidIndices.length) ||
          uniqueTackleIndices.length > 0 ||
          isAutoCatch ||
          isZeroCostFish;
        const selectedTotal = selectedDiceValues.reduce((sum, die) => sum + die, 0) + tackleTotal;

        // Per rulebook (p.27): Eels/Octopuses/Kraken require spending dice equal to their printed difficulty
        const meetsMinimumDiceRequirement = !requiresMinimumDice || selectedTotal >= minimumDiceRequired;
        const meetsDifficulty = (isZeroCostFish || isAutoCatch || (hasUsableSelection && selectedTotal >= fishDifficulty)) && meetsMinimumDiceRequirement;

        if (meetsDifficulty) {
          // Remove fresh dice (immutable)
          const indexSetToRemove = new Set(uniqueValidIndices);
          player.freshDice = player.freshDice.filter((_, idx) => !indexSetToRemove.has(idx));
          player.spentDice = [...player.spentDice, ...selectedDiceValues];

          // Per rulebook (p.17): "Tackle Dice are returned to the bag when they are spent"
          const tackleIndexSetToRemove = new Set(uniqueTackleIndices);
          const returnedTackleDice = player.tackleDice.filter((_, idx) => tackleIndexSetToRemove.has(idx));
          player.tackleDice = player.tackleDice.filter((_, idx) => !tackleIndexSetToRemove.has(idx));
          // Return spent tackle dice to the bag
          newState.port.tackleDiceBag = [...newState.port.tackleDiceBag, ...returnedTackleDice];

          player.handFish = [...player.handFish, fish];

          // Remove caught fish from shoal
          const fishIndex = shoalArray.findIndex((f: FishCard) => f.id === fish.id);
          if (fishIndex >= 0) {
            newState.sea.shoals[depth][shoal] = [
              ...shoalArray.slice(0, fishIndex),
              ...shoalArray.slice(fishIndex + 1)
            ];
          }

          // Reset revealed state for this shoal - new top fish is hidden
          if (newState.sea.revealedShoals[catchShoalKey]) {
            const { [catchShoalKey]: _, ...rest } = newState.sea.revealedShoals;
            newState.sea.revealedShoals = rest;
          }

          // OVERFISHING: Per rulebook (p.10) - If you catch the last Fish in a Shoal, immediately draw one Regret
          const updatedShoalArray = newState.sea.shoals[depth][shoal];
          if (updatedShoalArray.length === 0) {
            drawRegret(player, newState);

            // Check if all shoals at all depths are empty - game ends immediately
            const allShoalsEmpty = [1, 2, 3].every(d => {
              const depthShoals = newState.sea.shoals[d];
              return depthShoals.every((shoalArr: FishCard[]) => shoalArr.length === 0);
            });

            if (allShoalsEmpty) {
              // "If the Sea is ever empty, the game ends immediately"
              endGame(newState);
            }
          }

          // Process fish abilities
          if (fish.abilities.includes('regret_draw')) {
            drawRegret(player, newState);
          }
          if (fish.abilities.includes('regret_draw_2')) {
            drawRegret(player, newState);
            drawRegret(player, newState);
          }

          // dink_on_catch - Draw a dink when catching this fish
          if (fish.abilities.includes('dink_on_catch')) {
            const { card: dinkCard, deck: dinkDeck } = drawCard(newState.port.dinksDeck);
            if (dinkCard) {
              player.dinks = [...player.dinks, dinkCard];
            }
            newState.port.dinksDeck = dinkDeck;
          }

          // discard_small - Discard a small fish from hand (if player has one)
          // Check if player has Ancient Harpoon which ignores this penalty
          if (fish.abilities.includes('discard_small') || fish.abilities.includes('shark')) {
            const hasHarpoon = playerHasEquippedEffect(player, 'ignore_shark_penalty');
            if (!hasHarpoon) {
              const smallFishIndex = player.handFish.findIndex(f =>
                f.tags.includes('small') && f.id !== fish.id
              );
              if (smallFishIndex >= 0) {
                player.handFish = [
                  ...player.handFish.slice(0, smallFishIndex),
                  ...player.handFish.slice(smallFishIndex + 1)
                ];
              }
            }
          }

          // The Plug special handling
          if (fish.id === 'FISH-D3-PLUG-003') {
            newState.sea.plugActive = true;
            player.hasPassed = true;
          }

          // Quick Release Reel effect - draw dink on successful catch
          if (playerHasEquippedEffect(player, 'draw_dink_on_catch')) {
            const { card: reelDink, deck: reelDinkDeck } = drawCard(newState.port.dinksDeck);
            if (reelDink) {
              player.dinks = [...player.dinks, reelDink];
            }
            newState.port.dinksDeck = reelDinkDeck;
          }

          // Reset regret reduction effect for next catch
          removeActiveEffect(player, 'regret_reduction_used');

          applyMadnessAbilities(player, fish, newState);

          // Clear Life Preserver difficulty reduction after use
          if (newState.lifePreserverDifficultyReduction) {
            newState.lifePreserverDifficultyReduction = undefined;
          }
        } else {
          const shouldTakeDink =
            availableDiceTotal < fishDifficulty || !hasUsableSelection || selectedTotal < fishDifficulty;

          if (shouldTakeDink) {
            if (player.freshDice.length > 0) {
              const penaltyDie = player.freshDice[0];
              player.freshDice = player.freshDice.slice(1);
              player.spentDice = [...player.spentDice, penaltyDie];
            }

            const { card, deck } = drawCard(newState.port.dinksDeck);
            if (card) {
              player.dinks = [...player.dinks, card];
            }
            newState.port.dinksDeck = deck;
          }
        }
      }
      break;

    case 'SELL_FISH':
      if (player && player.location === 'port') {
        const { fishId } = action.payload;
        const fishIndex = player.handFish.findIndex(f => f.id === fishId);
        if (fishIndex >= 0) {
          const fish = player.handFish[fishIndex];
          // Use regret count for madness-based value calculation per rulebook
          const { adjustedValue } = calculateFishSaleValue(fish, player.regrets.length);
          // Per rulebook (p.17): "You cannot have more than 10$ at one time. Any additional income is lost."
          addFishbucks(player, adjustedValue);
          player.handFish = [
            ...player.handFish.slice(0, fishIndex),
            ...player.handFish.slice(fishIndex + 1)
          ];
          if (fish.quality === 'foul') {
            drawRegret(player, newState);
          }
        }
      }
      break;

    case 'BUY_UPGRADE':
      if (player && player.location === 'port') {
        const { upgradeId } = action.payload;
        const upgrade = ALL_UPGRADES.find(item => item.id === upgradeId);
        if (upgrade) {
          // Per rulebook (p.17): "You may only visit each shop once on this turn"
          const shopTypeMap: Record<string, ShopType> = {
            'rod': 'rods',
            'reel': 'reels',
            'supply': 'supplies'
          };
          const shopType = shopTypeMap[upgrade.type];

          if (hasVisitedShop(player, shopType)) {
            console.warn(`BUY_UPGRADE blocked: Already visited ${shopType} shop this turn`);
            break;
          }

          // Apply port discount for 13+ regrets per rulebook (p.21)
          let discount = hasPortDiscount(player.regrets.length) ? 1 : 0;

          // Apply Life Preserver shop discount (2$) per rulebook (p.9)
          if (hasActiveEffect(player, 'life_preserver_shop_discount')) {
            discount += 2;
            removeActiveEffect(player, 'life_preserver_shop_discount');
          }

          // Apply Dinks shop discount per rulebook (p.17)
          const dinkDiscountIndex = player.dinks.findIndex(dink =>
            hasEffect(dink.effects, 'shop_discount') && dink.timing.includes('port')
          );
          if (dinkDiscountIndex >= 0) {
            discount += 2;
            // Remove the used dink (one-shot)
            player.dinks = [
              ...player.dinks.slice(0, dinkDiscountIndex),
              ...player.dinks.slice(dinkDiscountIndex + 1)
            ];
          }

          const effectiveCost = Math.max(0, upgrade.cost - discount);

          if (player.fishbucks >= effectiveCost) {
            player.fishbucks -= effectiveCost;
            if (upgrade.type === 'rod') {
              player.equippedRod = upgrade;
            } else if (upgrade.type === 'reel') {
              player.equippedReel = upgrade;
            } else if (upgrade.type === 'supply') {
              player.supplies = [...player.supplies, upgrade];
            }

            (['rods', 'reels', 'supplies'] as const).forEach(category => {
              newState.port.shops[category] = newState.port.shops[category].filter(item => item.id !== upgrade.id);
            });

            // Record shop visit
            recordShopVisit(player, shopType);
          }
        }
      }
      break;

    case 'BUY_TACKLE_DICE':
      // Per rulebook (p.17): Buy from the visible Market dice, refill from bag
      // Per rulebook (p.21): Port discount does NOT apply to Tackle Dice
      if (player && player.location === 'port') {
        const { dieId, count = 1 } = action.payload;

        // Per rulebook (p.17): "You may only visit each shop once on this turn"
        if (hasVisitedShop(player, 'tackle_dice')) {
          console.warn('BUY_TACKLE_DICE blocked: Already visited tackle dice shop this turn');
          break;
        }

        const tackleDie = typeof dieId === 'string' ? TACKLE_DICE_LOOKUP[dieId] : undefined;
        if (!tackleDie) {
          break;
        }

        // Per rulebook (p.21): Port discount does NOT apply to Tackle Dice
        // Only Life Preserver discount applies (applied once per visit)
        let discount = 0;
        if (hasActiveEffect(player, 'life_preserver_shop_discount')) {
          discount += 2;
          removeActiveEffect(player, 'life_preserver_shop_discount');
        }

        // Calculate total cost for all dice (discount only applies to first die)
        const firstDieCost = Math.max(0, tackleDie.cost - discount);
        const remainingDiceCost = tackleDie.cost * (count - 1);
        const totalCost = firstDieCost + remainingDiceCost;

        // Check if enough dice are available in market
        const availableCount = newState.port.tackleDiceMarket.filter(id => id === dieId).length;
        const purchaseCount = Math.min(count, availableCount);

        if (purchaseCount > 0 && player.fishbucks >= (firstDieCost + tackleDie.cost * (purchaseCount - 1))) {
          const actualCost = firstDieCost + tackleDie.cost * (purchaseCount - 1);
          player.fishbucks -= actualCost;

          // Remove purchased dice from market and add to player
          for (let i = 0; i < purchaseCount; i++) {
            const marketIndex = newState.port.tackleDiceMarket.indexOf(dieId);
            if (marketIndex !== -1) {
              newState.port.tackleDiceMarket = [
                ...newState.port.tackleDiceMarket.slice(0, marketIndex),
                ...newState.port.tackleDiceMarket.slice(marketIndex + 1)
              ];
              player.tackleDice = [...player.tackleDice, dieId];

              // Refill market from bag after each die
              if (newState.port.tackleDiceBag.length > 0) {
                const newDie = newState.port.tackleDiceBag[0];
                newState.port.tackleDiceBag = newState.port.tackleDiceBag.slice(1);
                newState.port.tackleDiceMarket = [...newState.port.tackleDiceMarket, newDie];
              }
            }
          }

          // Record shop visit
          recordShopVisit(player, 'tackle_dice');
        }
      }
      break;

    case 'USE_LIFE_PRESERVER':
      // Per rulebook (p.9): Life Preserver can be discarded at Sea to reduce Fish Difficulty by 2♠,
      // or at Port to reduce shop cost by 2$
      if (player && newState.lifePreserverOwner === player.id) {
        const { useType } = action.payload;

        if (useType === 'reduce_fish_difficulty' && player.location === 'sea') {
          // At Sea: Reduce fish difficulty by 2 for the next catch
          newState.lifePreserverDifficultyReduction = 2;
          newState.lifePreserverOwner = undefined;
        } else if (useType === 'reduce_shop_cost' && player.location === 'port') {
          // At Port: This is handled when buying - we just mark that LP is used for discount
          // The discount is applied in BUY_UPGRADE
          newState.lifePreserverOwner = undefined;
          // Give player a temporary 2$ discount marker
          player.activeEffects = [...(player.activeEffects || []), 'life_preserver_shop_discount'];
        } else if (!useType) {
          // Legacy behavior: at port, discard regret with penalty
          newState.lifePreserverOwner = player.id;
          player.lifeboatFlipped = true;

          if (player.regrets.length > 0) {
            const previousRegretCount = player.regrets.length;
            const removed = player.regrets[player.regrets.length - 1];
            player.regrets = player.regrets.slice(0, -1);
            newState.port.regretsDiscard = [...newState.port.regretsDiscard, removed];
            recalculateMadness(player, { previousRegretCount, gameState: newState });
          }
        }
      }
      break;

    case 'GIVE_LIFE_PRESERVER':
      // Per rulebook (p.9): Player with highest dice total must give Life Preserver to another player
      if (player && newState.pendingLifePreserverGift?.fromPlayerId === player.id) {
        const { targetPlayerId } = action.payload;
        const targetPlayer = newState.players.find(p => p.id === targetPlayerId);

        if (targetPlayer && targetPlayer.id !== player.id) {
          newState.lifePreserverOwner = targetPlayerId;
          newState.pendingLifePreserverGift = undefined;
        }
      }
      break;

    case 'DRAW_DINK':
      if (player && player.location === 'port') {
        const { card, deck } = drawCard(newState.port.dinksDeck);
        if (card) {
          player.dinks = [...player.dinks, card];
        }
        newState.port.dinksDeck = deck;
      }
      break;

    case 'DISCARD_REGRET':
      // Per rulebook (p.17): When making port, player may optionally discard one Regret
      // This is a free action available when arriving at port
      if (player && player.location === 'port' && player.regrets.length > 0) {
        const previousRegretCount = player.regrets.length;
        const discardedRegret = player.regrets.pop();
        if (discardedRegret) {
          newState.port.regretsDiscard = [...newState.port.regretsDiscard, discardedRegret];
          recalculateMadness(player, { previousRegretCount, gameState: newState });
        }
      }
      break;

    case 'DISCARD_RANDOM_REGRET':
      // Per rulebook (p.9): Passing reward - discard one random Regret card
      if (player && player.regrets.length > 0) {
        const previousRegretCount = player.regrets.length;
        // Pick a random regret to discard
        const randomIndex = Math.floor(Math.random() * player.regrets.length);
        const discardedRegret = player.regrets[randomIndex];
        player.regrets = [
          ...player.regrets.slice(0, randomIndex),
          ...player.regrets.slice(randomIndex + 1)
        ];
        newState.port.regretsDiscard = [...newState.port.regretsDiscard, discardedRegret];
        recalculateMadness(player, { previousRegretCount, gameState: newState });
        // Clear pending reward if this was from passing
        if (newState.pendingPassingReward?.playerId === player.id) {
          newState.pendingPassingReward = undefined;
        }
      }
      break;

    case 'CLAIM_PASSING_REWARD':
      // Per rulebook (p.9): When skipped first in turn order, player may draw a Dink or discard random Regret
      if (player && newState.pendingPassingReward?.playerId === player.id) {
        const { choice } = action.payload;

        if (choice === 'draw_dink') {
          const { card, deck } = drawCard(newState.port.dinksDeck);
          if (card) {
            player.dinks = [...player.dinks, card];
          }
          newState.port.dinksDeck = deck;
        } else if (choice === 'discard_regret' && player.regrets.length > 0) {
          const previousRegretCount = player.regrets.length;
          const randomIndex = Math.floor(Math.random() * player.regrets.length);
          const discardedRegret = player.regrets[randomIndex];
          player.regrets = [
            ...player.regrets.slice(0, randomIndex),
            ...player.regrets.slice(randomIndex + 1)
          ];
          newState.port.regretsDiscard = [...newState.port.regretsDiscard, discardedRegret];
          recalculateMadness(player, { previousRegretCount, gameState: newState });
        }

        newState.pendingPassingReward = undefined;

        // Process next player in skipped rewards queue
        if (newState.pendingSkippedRewards && newState.pendingSkippedRewards.length > 0) {
          const nextPlayerId = newState.pendingSkippedRewards.shift();
          if (nextPlayerId) {
            newState.pendingPassingReward = {
              playerId: nextPlayerId,
              isFirstPass: false
            };
          }
        }
      }
      break;

    case 'MOUNT_FISH':
      // Per rulebook (p.17): "Permanently place one of your Fish under any empty slot
      // at the top of your Angler Board." - No cost mentioned, mounting is free.
      if (player && player.location === 'port') {
        const { fishId, slot } = action.payload;
        if (typeof slot !== 'number' || slot < 0 || slot >= player.maxMountSlots) {
          break;
        }

        const fishIndex = player.handFish.findIndex(f => f.id === fishId);
        const slotOccupied = player.mountedFish.some(mount => mount.slot === slot);
        if (fishIndex >= 0 && !slotOccupied) {
          const fish = player.handFish[fishIndex];

          player.mountedFish = [
            ...player.mountedFish,
            {
              slot,
              multiplier: getSlotMultiplier(slot),
              fish
            }
          ];
          player.handFish = [
            ...player.handFish.slice(0, fishIndex),
            ...player.handFish.slice(fishIndex + 1)
          ];
        }
      }
      break;

    case 'ROLL_DICE':
      if (player) {
        const newDice = rollDice(player.maxDice);
        const processedDice = player.rerollOnes
          ? newDice.map(value => (value === 1 ? rollDice(1)[0] : value))
          : newDice;
        player.freshDice = processedDice;
        player.spentDice = [];
      }
      break;

    case 'PASS':
      if (player) {
        // Count how many players have already passed (before this player)
        const passedCount = newState.players.filter(p => p.hasPassed).length;
        player.hasPassed = true;

        // Reset shop visits when passing
        resetShopVisits(player);

        // Grant passing rewards based on order per rulebook (p.9)
        if (passedCount === 0) {
          // First to pass: Gets the Fishcoin (becomes next first player)
          newState.fishCoinOwner = player.id;

          // Per rulebook (p.9): "When a player first passes... they may either draw
          // a Dink or discard one random Regret card"
          // Set pending reward so player can choose
          newState.pendingPassingReward = {
            playerId: player.id,
            isFirstPass: true
          };
        }

        // Check if only one player remains (Last-to-Pass rule, p.9)
        const remainingPlayers = newState.players.filter(p => !p.hasPassed);
        if (remainingPlayers.length === 1) {
          const lastPlayer = remainingPlayers[0];
          // Per rulebook: Sea = 2 turns, Port = 4 turns
          newState.lastPlayerTurnsRemaining = lastPlayer.location === 'sea' ? 2 : 4;
        }
      }
      // Check if all players passed
      if (newState.players.every(p => p.hasPassed)) {
        newState.lastPlayerTurnsRemaining = undefined;
        newState.pendingPassingReward = undefined; // Clear any pending reward
        newState.pendingSkippedRewards = undefined; // Clear any skipped rewards queue
        newState.phase = 'start';
        advanceDay(newState);
      }
      break;

    case 'NEXT_PHASE':
      advancePhase(newState);
      break;

    case 'END_TURN':
      // Reset shop visits for the current player at end of their turn
      if (player) {
        resetShopVisits(player);
      }

      // Check if this is the last player with limited turns per rulebook (p.9)
      if (newState.lastPlayerTurnsRemaining !== undefined && newState.lastPlayerTurnsRemaining > 0) {
        newState.lastPlayerTurnsRemaining -= 1;

        // If turns exhausted, force the last player to pass
        if (newState.lastPlayerTurnsRemaining <= 0) {
          const lastPlayer = newState.players.find(p => !p.hasPassed);
          if (lastPlayer) {
            lastPlayer.hasPassed = true;
            resetShopVisits(lastPlayer);
          }
          newState.lastPlayerTurnsRemaining = undefined;
          newState.pendingSkippedRewards = undefined; // Clear any skipped rewards queue
          // All players have now passed, advance to next day
          newState.phase = 'start';
          advanceDay(newState);
          break;
        }
      }

      // Move to next player, tracking skipped players for passing rewards
      // Per rulebook (p.9): "each time they are skipped in the turn order, they may either draw
      // a Dink or discard one random Regret card"
      const skippedPlayers: string[] = [];
      do {
        newState.currentPlayerIndex = (newState.currentPlayerIndex + 1) % newState.players.length;
        const nextPlayer = newState.players[newState.currentPlayerIndex];
        // If this player has passed and we're skipping them, they get a reward
        if (nextPlayer.hasPassed && newState.players.some(p => !p.hasPassed)) {
          skippedPlayers.push(nextPlayer.id);
        }
      } while (newState.players[newState.currentPlayerIndex].hasPassed &&
               newState.players.some(p => !p.hasPassed));

      // Add skipped players to the reward queue
      if (skippedPlayers.length > 0) {
        const existingQueue = newState.pendingSkippedRewards || [];
        newState.pendingSkippedRewards = [...existingQueue, ...skippedPlayers];

        // If no pending reward is being processed, start processing the queue
        if (!newState.pendingPassingReward && newState.pendingSkippedRewards.length > 0) {
          const nextPlayerId = newState.pendingSkippedRewards.shift();
          if (nextPlayerId) {
            newState.pendingPassingReward = {
              playerId: nextPlayerId,
              isFirstPass: false
            };
          }
        }
      }
      break;

    case 'REMOVE_DIE':
      // Player chooses which die to remove when dice limit is exceeded
      if (player && newState.pendingDiceRemoval?.playerId === player.id) {
        const { dieIndex } = action.payload;

        // Validate the index
        if (dieIndex >= 0 && dieIndex < player.freshDice.length) {
          // Remove the selected die
          player.freshDice = [
            ...player.freshDice.slice(0, dieIndex),
            ...player.freshDice.slice(dieIndex + 1)
          ];

          // Decrement the count of dice to remove
          newState.pendingDiceRemoval.count -= 1;

          // If all dice have been removed, clear the pending state
          if (newState.pendingDiceRemoval.count <= 0) {
            newState.pendingDiceRemoval = undefined;
          }
        }
      }
      break;

    case 'EAT_FISH':
      // Per rulebook (p.10): "If a Fish has an eat ability, it may be discarded at any stage
      // of the fishing process by discarding the Fish from your hand"
      // This is a FREE ACTION available at sea
      if (player && player.location === 'sea') {
        const { fishId } = action.payload;
        const fishIndex = player.handFish.findIndex(f => f.id === fishId);

        if (fishIndex >= 0) {
          const fish = player.handFish[fishIndex];

          // Check if fish has an 'eat' ability
          if (fish.abilities.some(ability => ability.startsWith('eat'))) {
            // Process eat ability effects before discarding
            // (specific eat effects can be added here based on fish abilities)

            // Remove from hand and add to graveyard at its depth
            player.handFish = [
              ...player.handFish.slice(0, fishIndex),
              ...player.handFish.slice(fishIndex + 1)
            ];
            newState.sea.graveyards[fish.depth] = [
              ...newState.sea.graveyards[fish.depth],
              fish
            ];
          }
        }
      }
      break;

    case 'USE_CAN_OF_WORMS':
      // Per rulebook (p.10): "Before revealing, you can flip your worms to peek at a Fish
      // and decide to put it back on either the top or bottom of the Shoal"
      // This is a FREE ACTION that requires canOfWormsFaceUp to be true
      if (player && player.location === 'sea' && player.canOfWormsFaceUp) {
        const { depth, shoal, moveToBottom } = action.payload;
        const targetShoalKey = `${depth}-${shoal}`;
        const targetShoalArray = newState.sea.shoals[depth]?.[shoal];

        // Can only use on unrevealed shoals (before revealing)
        if (targetShoalArray && targetShoalArray.length > 0 && !newState.sea.revealedShoals[targetShoalKey]) {
          // Flip Can of Worms face-down (used)
          player.canOfWormsFaceUp = false;

          // The player has peeked and chosen where to place the top fish
          if (moveToBottom && targetShoalArray.length > 1) {
            // Move top fish to bottom of shoal
            const topFish = targetShoalArray[0];
            newState.sea.shoals[depth][shoal] = [
              ...targetShoalArray.slice(1),
              topFish
            ];
          }
          // If moveToBottom is false, fish stays on top (no change needed)
        }
      }
      break;

    case 'CYCLE_MARKET':
      // Per rulebook (p.17): Pay $1 to cycle items or dice in the market
      if (player && player.location === 'port' && player.fishbucks >= 1) {
        const { targetType } = action.payload;

        if (targetType === 'tackle_dice') {
          // Per rulebook: Place all dice in Market back in bag and draw 4 new ones
          player.fishbucks -= 1;
          const allDice = [...newState.port.tackleDiceMarket, ...newState.port.tackleDiceBag];
          const shuffled = shuffle(allDice);
          newState.port.tackleDiceMarket = shuffled.slice(0, 4);
          newState.port.tackleDiceBag = shuffled.slice(4);
        } else if (targetType === 'rods' || targetType === 'reels' || targetType === 'supplies') {
          // Per rulebook: Place all revealed items of type on bottom of deck and reveal 2 new
          player.fishbucks -= 1;
          const currentItems = newState.port.shops[targetType];
          // Move current visible items to end (bottom of deck) and take 2 new from "top"
          // Since we're simulating a deck, rotate the array
          if (currentItems.length >= 2) {
            // Put visible items at end, get "new" items from remaining pool
            const allItems = targetType === 'rods' ? [...RODS] :
                           targetType === 'reels' ? [...REELS] :
                           [...SUPPLIES];
            // Remove already visible items and shuffle remainder
            const remainingItems = allItems.filter(item =>
              !currentItems.some(visible => visible.id === item.id)
            );
            const shuffledRemaining = shuffle(remainingItems);
            // Take 2 new items (or all if less than 2 available)
            const newVisible = shuffledRemaining.slice(0, 2);
            newState.port.shops[targetType] = newVisible;
          }
        }
      }
      break;

    case 'ABANDON_SHIP':
      // Per rulebook (p.10): Flip lifeboat to immediately Make Port
      // Per rulebook (p.10): "You cannot abandon ship once you have passed."
      if (player && player.location === 'sea' && !player.lifeboatFlipped && !player.hasPassed) {
        player.lifeboatFlipped = true;
        player.location = 'port';
        player.currentDepth = 1;
        // Reset shoal position when abandoning ship
        player.currentShoal = undefined;

        // Make Port benefits per rulebook (p.17):
        // 1. Muster Your Courage again (reroll dice)
        player.canOfWormsFaceUp = true;
        const totalDice = [...player.freshDice, ...player.spentDice];
        let rerolledDice = rollDice(totalDice.length);
        if (player.rerollOnes) {
          rerolledDice = rerolledDice.map(value => (value === 1 ? rollDice(1)[0] : value));
        }
        player.freshDice = rerolledDice.slice(0, Math.min(rerolledDice.length, player.maxDice));
        player.spentDice = rerolledDice.slice(player.maxDice);

        // Per rulebook (p.10): "If all other players have passed when a player uses their
        // lifeboat, they may still take FOUR actions at Port."
        const remainingPlayers = newState.players.filter(p => !p.hasPassed);
        if (remainingPlayers.length === 1 && remainingPlayers[0].id === player.id) {
          newState.lastPlayerTurnsRemaining = 4;
        }
      }
      break;

    case 'PLAY_DINK':
      // Play a DINK card from hand, triggering its effect
      if (player) {
        const { dinkId, effect } = action.payload;
        const dinkIndex = player.dinks.findIndex(d => d.id === dinkId);
        if (dinkIndex !== -1) {
          const dink = player.dinks[dinkIndex];

          // Apply the effect based on the effect type
          switch (effect) {
            case 'gain_1_fishbuck':
              addFishbucks(player, 1);
              break;
            case 'peek_shoal_top':
              // Reveal all shoals at current depth
              const depth = player.currentDepth;
              const shoals = newState.sea.shoals[depth] ?? [];
              shoals.forEach((_, shoalIndex) => {
                const shoalKey = `${depth}-${shoalIndex}`;
                newState.sea.revealedShoals[shoalKey] = true;
              });
              break;
            // Add more effect handlers as needed
            default:
              // For effects that are passive or handled elsewhere, just log
              console.log(`Playing DINK effect: ${effect}`);
          }

          // Remove one-shot cards from hand after use
          if (dink.oneShot) {
            player.dinks = player.dinks.filter((_, i) => i !== dinkIndex);
          }
        }
      }
      break;

    default:
      console.warn('Unknown action type:', (action as { type: string }).type);
  }

  // Check win condition
  if (newState.day === 'Saturday' && newState.phase === 'start' && newState.players.every(p => p.hasPassed)) {
    endGame(newState);
  }

  return newState;
};

// Helper functions
const getFishBaseValue = (fish: FishCard) => fish.baseValue ?? fish.value;
const getFishCurrentValue = (fish: FishCard) => fish.value ?? getFishBaseValue(fish);

// Updated to use regret count and proper Fair/Foul modifiers from rulebook
export const calculateFishSaleValue = (fish: FishCard, regretCount: number) => {
  const baseValue = getFishBaseValue(fish);
  const modifier = fish.quality === 'foul'
    ? getFoulValueModifier(regretCount)
    : getFairValueModifier(regretCount);
  const adjustedValue = Math.max(0, baseValue + modifier);

  return {
    adjustedValue,
    baseValue,
    modifier,
    regretCount,
  };
};

export interface PlayerScoreBreakdown {
  handScore: number;
  mountedScore: number;
  fishbuckScore: number;
  totalScore: number;
  regretValue: number;
}

export const calculatePlayerRegretValue = (player: Player) => {
  const regretValue = player.regrets.reduce((sum, regret) => sum + regret.value, 0);
  return regretValue + (player.lifeboatFlipped ? 10 : 0);
};

export const calculateHandFishScore = (player: Player) => {
  return player.handFish.reduce((sum, fish) => {
    // Use regret count for madness-based value calculation per rulebook
    const { adjustedValue } = calculateFishSaleValue(fish, player.regrets.length);
    return sum + adjustedValue;
  }, 0);
};

export const calculateMountedFishScore = (player: Player) => {
  // Per rulebook (p.22): Mounted fish are scored by their value
  // FIRST modified by madness, THEN multiplied by mount modifier (x2 or x3)
  return player.mountedFish.reduce((sum, mount) => {
    const baseValue = mount.fish.baseValue ?? mount.fish.value;
    const modifier = mount.fish.quality === 'foul'
      ? getFoulValueModifier(player.regrets.length)
      : getFairValueModifier(player.regrets.length);
    const madnessAdjustedValue = Math.max(0, baseValue + modifier);
    const finalValue = madnessAdjustedValue * mount.multiplier;
    return sum + finalValue;
  }, 0);
};

export const calculateFishbuckScore = (player: Player) => player.fishbucks;

export const calculatePlayerScoreBreakdown = (player: Player): PlayerScoreBreakdown => {
  const handScore = calculateHandFishScore(player);
  const mountedScore = calculateMountedFishScore(player);
  const fishbuckScore = calculateFishbuckScore(player);
  const regretValue = calculatePlayerRegretValue(player);
  // Per rulebook (p.22): Score = Fish in hand + Mounted Fish + Fishbucks
  // Regret value is NOT subtracted - the penalty is only losing a mounted fish at game end
  return {
    handScore,
    mountedScore,
    fishbuckScore,
    totalScore: handScore + mountedScore + fishbuckScore,
    regretValue
  };
};

const drawRegret = (player: Player, gameState: GameState) => {
  // Check for regret shields first
  if (player.regretShields > 0) {
    player.regretShields -= 1;
    return;
  }

  // Check for Blessed Rod effect (reduce_regrets_1) - reduces regret draws by 1
  if (playerHasEquippedEffect(player, 'reduce_regrets_1')) {
    // Use the effect once per regret draw trigger
    if (hasActiveEffect(player, 'regret_reduction_used')) {
      // Effect already used this turn, proceed with draw
    } else {
      // Mark effect as used and skip this draw
      player.activeEffects = [...(player.activeEffects || []), 'regret_reduction_used'];
      return;
    }
  }

  const { card, deck, discard } = drawCard(
    gameState.port.regretsDeck,
    gameState.port.regretsDiscard
  );

  if (card) {
    // Drew from deck/discard pile
    gameState.port.regretsDeck = deck;
    gameState.port.regretsDiscard = discard;
    const previousRegretCount = player.regrets.length;
    player.regrets = [...player.regrets, card];
    recalculateMadness(player, { previousRegretCount, gameState });
  } else {
    // Per rulebook (p.20): "If the draw pile is empty, you must draw from another player"
    // Find another player with regrets to draw from
    const otherPlayersWithRegrets = gameState.players.filter(
      p => p.id !== player.id && p.regrets.length > 0
    );

    if (otherPlayersWithRegrets.length > 0) {
      // Draw from the player with the most regrets (or random among tied)
      otherPlayersWithRegrets.sort((a, b) => b.regrets.length - a.regrets.length);
      const targetPlayer = otherPlayersWithRegrets[0];

      // Take a random regret from the target player
      const randomIndex = Math.floor(Math.random() * targetPlayer.regrets.length);
      const stolenRegret = targetPlayer.regrets[randomIndex];

      // Remove from target player
      const targetPreviousCount = targetPlayer.regrets.length;
      targetPlayer.regrets = [
        ...targetPlayer.regrets.slice(0, randomIndex),
        ...targetPlayer.regrets.slice(randomIndex + 1)
      ];
      recalculateMadness(targetPlayer, { previousRegretCount: targetPreviousCount, gameState });

      // Add to current player
      const previousRegretCount = player.regrets.length;
      player.regrets = [...player.regrets, stolenRegret];
      recalculateMadness(player, { previousRegretCount, gameState });
    }
    // If no other players have regrets either, no regret is drawn (all regrets are distributed)
  }
};

function drawCard<T>(
  deck: T[],
  discard: T[] = []
): { card?: T; deck: T[]; discard: T[] } {
  let workingDeck = [...deck];
  let workingDiscard = [...discard];

  if (workingDeck.length === 0 && workingDiscard.length > 0) {
    workingDeck = shuffle(workingDiscard);
    workingDiscard = [];
  }

  if (workingDeck.length === 0) {
    return { deck: workingDeck, discard: workingDiscard };
  }

  const card = workingDeck[workingDeck.length - 1];
  workingDeck = workingDeck.slice(0, -1);

  return { card, deck: workingDeck, discard: workingDiscard };
}

interface MadnessContext {
  previousRegretCount?: number;
  gameState?: GameState;
}

// Madness tiers from the rulebook (p.20-21)
// | Regret Cards | Fair Value | Foul Value | Max Dice | Port Discount |
// |--------------|------------|------------|----------|---------------|
// | 0            | +2         | -2         | 4        | No            |
// | 1-3          | +1         | -1         | 4        | No            |
// | 4-6          | +1         | =          | 5        | No            |
// | 7-9          | =          | +1         | 6        | No            |
// | 10-12        | -1         | +1         | 7        | No            |
// | 13+          | -2         | +2         | 8        | Yes (-$1)     |

interface MadnessTier {
  minRegrets: number;
  maxRegrets: number;
  fairModifier: number;
  foulModifier: number;
  maxDice: number;
  portDiscount: boolean;
}

// Madness tier values per rulebook p.20-21
// As regrets increase: Fair modifier decreases, Foul modifier increases, Max Dice INCREASES
const MADNESS_TIERS: MadnessTier[] = [
  { minRegrets: 0, maxRegrets: 0, fairModifier: 2, foulModifier: -2, maxDice: 4, portDiscount: false },
  { minRegrets: 1, maxRegrets: 3, fairModifier: 1, foulModifier: -1, maxDice: 4, portDiscount: false },
  { minRegrets: 4, maxRegrets: 6, fairModifier: 1, foulModifier: 0, maxDice: 5, portDiscount: false },
  { minRegrets: 7, maxRegrets: 9, fairModifier: 0, foulModifier: 1, maxDice: 6, portDiscount: false },
  { minRegrets: 10, maxRegrets: 12, fairModifier: -1, foulModifier: 1, maxDice: 7, portDiscount: false },
  { minRegrets: 13, maxRegrets: Infinity, fairModifier: -2, foulModifier: 2, maxDice: 8, portDiscount: true },
];

export const getMadnessTier = (regretCount: number): MadnessTier => {
  return MADNESS_TIERS.find(tier => regretCount >= tier.minRegrets && regretCount <= tier.maxRegrets) || MADNESS_TIERS[0];
};

export const getFairValueModifier = (regretCount: number): number => {
  return getMadnessTier(regretCount).fairModifier;
};

export const getFoulValueModifier = (regretCount: number): number => {
  return getMadnessTier(regretCount).foulModifier;
};

export const getMaxDiceFromMadness = (regretCount: number): number => {
  return getMadnessTier(regretCount).maxDice;
};

export const hasPortDiscount = (regretCount: number): boolean => {
  return getMadnessTier(regretCount).portDiscount;
};

// Calculate fish value with madness modifiers (for selling and scoring)
export const calculateFishValueWithMadness = (fish: FishCard, regretCount: number): number => {
  const baseValue = fish.baseValue ?? fish.value;
  const modifier = fish.quality === 'foul'
    ? getFoulValueModifier(regretCount)
    : getFairValueModifier(regretCount);
  return Math.max(0, baseValue + modifier);
};

// Legacy function for backwards compatibility - maps to tier index
const calculateMadnessLevelFromRegrets = (regretCount: number): number => {
  const tierIndex = MADNESS_TIERS.findIndex(tier => regretCount >= tier.minRegrets && regretCount <= tier.maxRegrets);
  return tierIndex >= 0 ? tierIndex : 0;
};

const removeHighestFreshDie = (player: Player) => {
  if (player.freshDice.length === 0) {
    return;
  }
  let highestIndex = 0;
  for (let i = 1; i < player.freshDice.length; i++) {
    if (player.freshDice[i] > player.freshDice[highestIndex]) {
      highestIndex = i;
    }
  }
  player.freshDice = [
    ...player.freshDice.slice(0, highestIndex),
    ...player.freshDice.slice(highestIndex + 1)
  ];
};

const discardHighestValueMount = (player: Player) => {
  if (player.mountedFish.length === 0) {
    return;
  }
  let highestIndex = 0;
  let highestValue = getFishCurrentValue(player.mountedFish[0].fish) * player.mountedFish[0].multiplier;
  for (let i = 1; i < player.mountedFish.length; i++) {
    const value = getFishCurrentValue(player.mountedFish[i].fish) * player.mountedFish[i].multiplier;
    if (value > highestValue) {
      highestIndex = i;
      highestValue = value;
    }
  }
  player.mountedFish = [
    ...player.mountedFish.slice(0, highestIndex),
    ...player.mountedFish.slice(highestIndex + 1)
  ];
};

const enforceFreshDiceLimit = (player: Player, gameState?: GameState) => {
  const excessDice = player.freshDice.length - player.maxDice;
  if (excessDice <= 0) return;

  // For AI players, auto-remove highest dice
  if (player.isAI) {
    while (player.freshDice.length > player.maxDice) {
      removeHighestFreshDie(player);
    }
    return;
  }

  // For human players, set pending state so they can choose which dice to remove
  if (gameState) {
    gameState.pendingDiceRemoval = {
      playerId: player.id,
      count: excessDice,
    };
  } else {
    // Fallback to auto-remove if no gameState available
    while (player.freshDice.length > player.maxDice) {
      removeHighestFreshDie(player);
    }
  }
};

const recalculateMadness = (player: Player, context: MadnessContext = {}) => {
  const { previousRegretCount = player.regrets.length, gameState } = context;
  const previousLevel = player.madnessLevel ?? 0;
  const currentRegrets = player.regrets.length;

  // Calculate new madness level (tier index) from regret count
  const newMadnessLevel = calculateMadnessLevelFromRegrets(currentRegrets);
  player.madnessLevel = newMadnessLevel;

  // Get max dice from the madness tier per rulebook p.18-19
  // Note: Max dice DECREASES with more regrets (5 -> 3) per rulebook
  const tierMaxDice = getMaxDiceFromMadness(currentRegrets);
  // Apply character bonus (Storm gets +1 base max dice)
  const characterBonus = (player.baseMaxDice ?? 3) - 3;
  player.maxDice = tierMaxDice + characterBonus;

  // The rulebook doesn't have the "lose die at madness 4" or "lose mount at madness 6" penalties
  // The madness system only affects:
  // 1. Fair/Foul value modifiers (Fair decreases, Foul increases with more regrets)
  // 2. Max dice (DECREASES with more regrets: 5 -> 3)
  // 3. Port discount at 13+ regrets ($1 off all shop items)

  // Per rulebook p.19: "You never need to remove dice from your Fresh Pool."
  // The max dice limit is only enforced when:
  // 1. Acquiring new dice (excess goes to spent pool on madness tracker)
  // 2. Refreshing dice from spent pool during Refresh phase
  // NOT when madness level changes - players keep their existing fresh dice
};

const advancePhase = (gameState: GameState) => {
  const phases: readonly GamePhase[] = ['start', 'refresh', 'declaration', 'action'];
  const currentIndex = phases.indexOf(gameState.phase);
  if (currentIndex >= 0 && currentIndex < phases.length - 1) {
    gameState.phase = phases[currentIndex + 1];
  } else if (gameState.phase !== 'endgame') {
    gameState.phase = 'start';
    advanceDay(gameState);
  }

  // Reset player states for new phase
  gameState.players.forEach(p => p.hasPassed = false);
  gameState.currentPlayerIndex = gameState.firstPlayerIndex;

  // Phase-specific logic
  if (gameState.phase === 'refresh') {
    // REEL IN (from START phase per rulebook p.9):
    // All players at Sea must move their Boat up one Depth, if they are not already at Depth 1
    gameState.players.forEach(player => {
      if (player.location === 'sea' && player.currentDepth > 1) {
        player.currentDepth = (player.currentDepth - 1) as 1 | 2 | 3;
      }
    });

    // Refresh Phase: Move spent dice back to fresh and reroll (Muster Your Courage)
    gameState.players.forEach(player => {
      // Combine all dice
      const totalDiceCount = player.freshDice.length + player.spentDice.length;
      // Roll new dice up to maxDice limit
      const diceToRoll = Math.min(totalDiceCount, player.maxDice);
      let newDice = rollDice(diceToRoll);

      // Apply reroll 1s ability if player has it (Finn - The Lucky)
      if (player.rerollOnes) {
        newDice = newDice.map(value => (value === 1 ? rollDice(1)[0] : value));
      }

      player.freshDice = newDice;
      player.spentDice = [];
    });

    // THROW THE LIFE PRESERVER (rulebook p.9):
    // Player with highest total of Fresh dice values takes Life Preserver and gives it to another player
    assignLifePreserver(gameState);
  }

  // Declaration Phase: All players start at sea by default, will choose in phase
  if (gameState.phase === 'declaration') {
    // Reset all players to sea (default) - they will choose during the phase
    gameState.players.forEach(player => {
      player.location = 'sea';
      player.currentDepth = 1;
    });
  }
};

// Assign Life Preserver to player with highest fresh dice total
const assignLifePreserver = (gameState: GameState) => {
  // Calculate fresh dice totals for each player
  const playersWithTotals = gameState.players.map((player, index) => ({
    player,
    index,
    total: player.freshDice.reduce((sum, die) => sum + die, 0)
  }));

  // Sort by total (descending), then by turn order (ascending) for ties
  playersWithTotals.sort((a, b) => {
    if (b.total !== a.total) return b.total - a.total;
    // For ties, earliest in turn order wins (relative to first player)
    const firstPlayerIndex = gameState.firstPlayerIndex;
    const aOrder = (a.index - firstPlayerIndex + gameState.players.length) % gameState.players.length;
    const bOrder = (b.index - firstPlayerIndex + gameState.players.length) % gameState.players.length;
    return aOrder - bOrder;
  });

  const winner = playersWithTotals[0];
  if (winner && gameState.players.length > 1) {
    // The winner must give the Life Preserver to another player
    gameState.lifePreserverOwner = winner.player.id;
    gameState.pendingLifePreserverGift = {
      fromPlayerId: winner.player.id
    };
  }
};

const advanceDay = (gameState: GameState) => {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const;
  const currentIndex = days.indexOf(gameState.day);
  if (currentIndex < days.length - 1) {
    gameState.day = days[currentIndex + 1];
  } else {
    endGame(gameState);
    return;
  }

  // Reset player states for new day
  gameState.players.forEach(p => {
    p.hasPassed = false;
  });

  // Reset revealed shoals at day change - fish "swim away" and new ones appear
  gameState.sea.revealedShoals = {};

  // Day effects per rulebook (p.8)
  const newDay = gameState.day;

  // Wed/Fri: All players flip their Can of Worms face-up
  if (newDay === 'Wednesday' || newDay === 'Friday') {
    gameState.players.forEach(p => {
      p.canOfWormsFaceUp = true;
    });
  }

  // Thu/Sat: All players take one blue/orange die from bag (or Market)
  // Per rulebook (p.8): If not enough available, all players take green dice instead
  if (newDay === 'Thursday' || newDay === 'Saturday') {
    const playerCount = gameState.players.length;

    // Count available blue/orange dice in bag and market combined
    const allAvailableDice = [...gameState.port.tackleDiceBag, ...gameState.port.tackleDiceMarket];
    const blueOrangeDice = allAvailableDice.filter(id =>
      getTackleDieColor(id) === 'blue' || getTackleDieColor(id) === 'orange'
    );

    if (blueOrangeDice.length >= playerCount) {
      // Enough blue/orange dice - give one to each player
      gameState.players.forEach((p, idx) => {
        const dieToGive = blueOrangeDice[idx];
        // Remove from bag or market
        const bagIdx = gameState.port.tackleDiceBag.indexOf(dieToGive);
        if (bagIdx >= 0) {
          gameState.port.tackleDiceBag = [
            ...gameState.port.tackleDiceBag.slice(0, bagIdx),
            ...gameState.port.tackleDiceBag.slice(bagIdx + 1)
          ];
        } else {
          const marketIdx = gameState.port.tackleDiceMarket.indexOf(dieToGive);
          if (marketIdx >= 0) {
            gameState.port.tackleDiceMarket = [
              ...gameState.port.tackleDiceMarket.slice(0, marketIdx),
              ...gameState.port.tackleDiceMarket.slice(marketIdx + 1)
            ];
            // Refill market from bag
            if (gameState.port.tackleDiceBag.length > 0) {
              const newMarketDie = gameState.port.tackleDiceBag[0];
              gameState.port.tackleDiceBag = gameState.port.tackleDiceBag.slice(1);
              gameState.port.tackleDiceMarket = [...gameState.port.tackleDiceMarket, newMarketDie];
            }
          }
        }
        p.tackleDice = [...p.tackleDice, dieToGive];
      });
    } else {
      // Not enough blue/orange - all players get green dice instead
      const greenDice = allAvailableDice.filter(id => getTackleDieColor(id) === 'green');
      gameState.players.forEach((p, idx) => {
        if (idx < greenDice.length) {
          const dieToGive = greenDice[idx];
          // Remove from bag or market
          const bagIdx = gameState.port.tackleDiceBag.indexOf(dieToGive);
          if (bagIdx >= 0) {
            gameState.port.tackleDiceBag = [
              ...gameState.port.tackleDiceBag.slice(0, bagIdx),
              ...gameState.port.tackleDiceBag.slice(bagIdx + 1)
            ];
          } else {
            const marketIdx = gameState.port.tackleDiceMarket.indexOf(dieToGive);
            if (marketIdx >= 0) {
              gameState.port.tackleDiceMarket = [
                ...gameState.port.tackleDiceMarket.slice(0, marketIdx),
                ...gameState.port.tackleDiceMarket.slice(marketIdx + 1)
              ];
              // Refill market from bag
              if (gameState.port.tackleDiceBag.length > 0) {
                const newMarketDie = gameState.port.tackleDiceBag[0];
                gameState.port.tackleDiceBag = gameState.port.tackleDiceBag.slice(1);
                gameState.port.tackleDiceMarket = [...gameState.port.tackleDiceMarket, newMarketDie];
              }
            }
          }
          p.tackleDice = [...p.tackleDice, dieToGive];
        }
        // If no dice available at all, player doesn't get one
      });
    }
  }

  // Market fluctuations per rulebook (p.8):
  // Discard bottom Market row to bottom of decks, move top card down
  // (This rotates the market items)
  const { shops } = gameState.port;
  (['rods', 'reels', 'supplies'] as const).forEach(category => {
    if (shops[category].length > 1) {
      // Move first item to the end (simulating market rotation) - immutable
      const first = shops[category][0];
      shops[category] = [...shops[category].slice(1), first];
    }
  });

  // Discard all revealed Fish at Sea (they swim away)
  // This is handled by clearing revealed fish - in our implementation,
  // the shoals are already face-down decks, so this is automatic

  // Fish Coin owner becomes next first player (if set), otherwise rotate
  if (gameState.fishCoinOwner) {
    const fishCoinPlayerIndex = gameState.players.findIndex(p => p.id === gameState.fishCoinOwner);
    if (fishCoinPlayerIndex >= 0) {
      gameState.firstPlayerIndex = fishCoinPlayerIndex;
    } else {
      gameState.firstPlayerIndex = (gameState.firstPlayerIndex + 1) % gameState.players.length;
    }
    gameState.fishCoinOwner = undefined;
  } else {
    gameState.firstPlayerIndex = (gameState.firstPlayerIndex + 1) % gameState.players.length;
  }
  gameState.currentPlayerIndex = gameState.firstPlayerIndex;
};

const endGame = (gameState: GameState) => {
  gameState.isGameOver = true;
  gameState.phase = 'endgame';

  // Calculate scores and determine winner
  const scores = gameState.players.map(player => ({
    player,
    ...calculatePlayerScoreBreakdown(player)
  }));

  if (scores.length === 0) {
    gameState.winner = undefined;
    return;
  }

  // Apply regret penalty to highest regret VALUE player per rulebook (p.22)
  const highestRegretPlayer = scores.reduce((max, current) =>
    current.regretValue > max.regretValue ? current : max
  , scores[0]);

  const playerCount = gameState.players.length;

  if (highestRegretPlayer.player.mountedFish.length > 0) {
    // Calculate mounted fish values with madness modifiers
    const mountsWithValues = highestRegretPlayer.player.mountedFish.map((mount, index) => {
      const baseValue = mount.fish.baseValue ?? mount.fish.value;
      const modifier = mount.fish.quality === 'foul'
        ? getFoulValueModifier(highestRegretPlayer.player.regrets.length)
        : getFairValueModifier(highestRegretPlayer.player.regrets.length);
      const madnessAdjustedValue = Math.max(0, baseValue + modifier);
      const finalValue = madnessAdjustedValue * mount.multiplier;
      return { mount, index, value: finalValue };
    }).sort((a, b) => a.value - b.value); // Sort by value ascending

    // Per rulebook (p.22): 2 players = discard LOWEST, 3+ players = discard HIGHEST
    const mountToDiscard = playerCount === 2
      ? mountsWithValues[0] // Lowest value for 2 players
      : mountsWithValues[mountsWithValues.length - 1]; // Highest value for 3+ players

    if (mountToDiscard) {
      const penaltyValue = mountToDiscard.value;
      highestRegretPlayer.player.mountedFish = [
        ...highestRegretPlayer.player.mountedFish.slice(0, mountToDiscard.index),
        ...highestRegretPlayer.player.mountedFish.slice(mountToDiscard.index + 1)
      ];
      highestRegretPlayer.mountedScore = Math.max(0, highestRegretPlayer.mountedScore - penaltyValue);
      highestRegretPlayer.totalScore = Math.max(0, highestRegretPlayer.totalScore - penaltyValue);
    }
  }

  // Recalculate scores after penalty
  const finalScores = gameState.players.map(player => ({
    player,
    ...calculatePlayerScoreBreakdown(player)
  }));

  // Determine winner - highest score wins
  // Tiebreaker 1: Lower total Regret Value wins
  // Tiebreaker 2: Fewer Regret Cards wins
  const winner = finalScores.reduce((best, current) => {
    if (current.totalScore > best.totalScore) return current;
    if (current.totalScore < best.totalScore) return best;
    // Tie on score - use regret value as tiebreaker
    if (current.regretValue < best.regretValue) return current;
    if (current.regretValue > best.regretValue) return best;
    // Tie on regret value - use regret card count as tiebreaker
    if (current.player.regrets.length < best.player.regrets.length) return current;
    return best;
  }, finalScores[0]);

  gameState.winner = winner.player.name;
};
