import { GameState, Player, GameAction, CharacterOption, Depth, FishCard, GamePhase } from '@/types/game';
import { ALL_FISH, DEPTH_1_FISH, DEPTH_2_FISH, DEPTH_3_FISH } from '@/data/fish';
import { REGRET_CARDS } from '@/data/regrets';
import { DINK_CARDS } from '@/data/dinks';
import { ALL_UPGRADES, RODS, REELS, SUPPLIES } from '@/data/upgrades';
import { TACKLE_DICE_LOOKUP } from '@/data/tackleDice';
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

// Initialize new game
export const initializeGame = (selectedCharacters: CharacterOption[]): GameState => {
  const port: GameState['port'] = {
    shops: {
      rods: shuffle([...RODS]).slice(0, 3),
      reels: shuffle([...REELS]).slice(0, 3),
      supplies: shuffle([...SUPPLIES]).slice(0, 3)
    },
    dinksDeck: shuffle(DINK_CARDS),
    regretsDeck: shuffle(REGRET_CARDS),
    regretsDiscard: []
  };

  const players: Player[] = selectedCharacters.map((character, index) => {
    // All players start with basic equipment per rules
    const basicRod = RODS[0]; // Glass Rod
    const basicReel = REELS[0]; // Quick Release Reel

    const basePlayer: Player = {
      id: `player-${index + 1}`,
      name: character.name,
      character: character.id,
      location: 'sea',
      currentDepth: 1,
      freshDice: [1, 2, 3], // Starting dice
      spentDice: [],
      tackleDice: [],
      maxDice: 3,
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
      hasPassed: false
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
      }
      break;

    case 'DECLARE_LOCATION':
      if (player) {
        player.location = action.payload.location;
        player.hasPassed = false;
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
          const rerolledDice = rollDice(totalDice.length);

          // Keep up to maxDice in fresh pool, rest go to spent
          player.freshDice = rerolledDice.slice(0, Math.min(rerolledDice.length, maxDice));
          player.spentDice = rerolledDice.slice(maxDice);
        }
      }
      break;

    case 'REVEAL_FISH':
      // Per rulebook: Revealing a fish costs 1 fresh die
      if (player && player.location === 'sea' && player.freshDice.length > 0) {
        const { depth, shoal } = action.payload;
        const shoalArray = newState.sea.shoals[depth]?.[shoal];
        const shoalKey = `${depth}-${shoal}`;

        // Only charge if there's a fish to reveal and it's not already revealed
        if (shoalArray && shoalArray.length > 0 && !newState.sea.revealedShoals[shoalKey]) {
          // Spend the lowest value die for reveal (player choice could be added later)
          const lowestIndex = player.freshDice.reduce(
            (minIdx, val, idx, arr) => val < arr[minIdx] ? idx : minIdx,
            0
          );
          const spentDie = player.freshDice[lowestIndex];
          player.freshDice = [
            ...player.freshDice.slice(0, lowestIndex),
            ...player.freshDice.slice(lowestIndex + 1)
          ];
          player.spentDice = [...player.spentDice, spentDie];

          // Mark the shoal as revealed
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
          }
        }
      }
      break;

    case 'CATCH_FISH':
      if (player && player.location === 'sea') {
        const { fish, depth, shoal, diceIndices, tackleDiceIndices } = action.payload;

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

        const fishDifficulty = fish.difficulty;
        const availableDiceTotal = player.freshDice.reduce((sum, die) => sum + die, 0);

        // Mechanical Reel effect - auto catch fish with difficulty 3 or less
        const hasAutoCatch = playerHasEquippedEffect(player, 'auto_catch_difficulty_3');
        const isAutoCatch = hasAutoCatch && fishDifficulty <= 3;

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
        const hasUsableSelection =
          (uniqueValidIndices.length > 0 && selectedDiceValues.length === uniqueValidIndices.length) ||
          uniqueTackleIndices.length > 0 ||
          isAutoCatch;
        const selectedTotal = selectedDiceValues.reduce((sum, die) => sum + die, 0) + tackleTotal;
        const meetsDifficulty = isAutoCatch || (hasUsableSelection && selectedTotal >= fishDifficulty);

        if (meetsDifficulty) {
          // Remove fresh dice (immutable)
          const indexSetToRemove = new Set(uniqueValidIndices);
          player.freshDice = player.freshDice.filter((_, idx) => !indexSetToRemove.has(idx));
          player.spentDice = [...player.spentDice, ...selectedDiceValues];

          // Remove used tackle dice (immutable - they are consumed on use)
          const tackleIndexSetToRemove = new Set(uniqueTackleIndices);
          player.tackleDice = player.tackleDice.filter((_, idx) => !tackleIndexSetToRemove.has(idx));

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
          player.fishbucks += adjustedValue;
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
          // Apply port discount for 13+ regrets per rulebook (p.21)
          const discount = hasPortDiscount(player.regrets.length) ? 1 : 0;
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
          }
        }
      }
      break;

    case 'BUY_TACKLE_DICE':
      if (player && player.location === 'port') {
        const { dieId, count } = action.payload;
        const tackleDie = typeof dieId === 'string' ? TACKLE_DICE_LOOKUP[dieId] : undefined;
        if (!tackleDie || typeof count !== 'number' || count <= 0) {
          break;
        }

        const totalCost = tackleDie.cost * count;
        if (player.fishbucks >= totalCost) {
          player.fishbucks -= totalCost;
          const newDice = Array.from({ length: count }, () => tackleDie.id);
          player.tackleDice = [...player.tackleDice, ...newDice];
        }
      }
      break;

    case 'USE_LIFE_PRESERVER':
      if (player && player.location === 'port') {
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

    case 'MOUNT_FISH':
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

        // Grant passing rewards based on order per rulebook (p.9)
        if (passedCount === 0) {
          // First to pass: Gets the Fishcoin (becomes next first player)
          // Note: Rulebook doesn't mention +2 Fishbucks for first to pass
          newState.fishCoinOwner = player.id;
        }
        // Note: Rulebook doesn't specify rewards for 2nd/3rd pass in competitive mode

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
        newState.phase = 'start';
        advanceDay(newState);
      }
      break;

    case 'NEXT_PHASE':
      advancePhase(newState);
      break;

    case 'END_TURN':
      // Check if this is the last player with limited turns per rulebook (p.9)
      if (newState.lastPlayerTurnsRemaining !== undefined && newState.lastPlayerTurnsRemaining > 0) {
        newState.lastPlayerTurnsRemaining -= 1;

        // If turns exhausted, force the last player to pass
        if (newState.lastPlayerTurnsRemaining <= 0) {
          const lastPlayer = newState.players.find(p => !p.hasPassed);
          if (lastPlayer) {
            lastPlayer.hasPassed = true;
          }
          newState.lastPlayerTurnsRemaining = undefined;
          // All players have now passed, advance to next day
          newState.phase = 'start';
          advanceDay(newState);
          break;
        }
      }

      // Move to next player
      do {
        newState.currentPlayerIndex = (newState.currentPlayerIndex + 1) % newState.players.length;
      } while (newState.players[newState.currentPlayerIndex].hasPassed &&
               newState.players.some(p => !p.hasPassed));
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
  return {
    handScore,
    mountedScore,
    fishbuckScore,
    totalScore: handScore + mountedScore + fishbuckScore - regretValue,
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
    gameState.port.regretsDeck = deck;
    gameState.port.regretsDiscard = discard;
    const previousRegretCount = player.regrets.length;
    player.regrets = [...player.regrets, card];
    recalculateMadness(player, { previousRegretCount, gameState });
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

const enforceFreshDiceLimit = (player: Player) => {
  while (player.freshDice.length > player.maxDice) {
    removeHighestFreshDie(player);
  }
};

const recalculateMadness = (player: Player, context: MadnessContext = {}) => {
  const { previousRegretCount = player.regrets.length, gameState } = context;
  const previousLevel = player.madnessLevel ?? 0;
  const currentRegrets = player.regrets.length;

  // Calculate new madness level (tier index) from regret count
  const newMadnessLevel = calculateMadnessLevelFromRegrets(currentRegrets);
  player.madnessLevel = newMadnessLevel;

  // Get max dice from the madness tier per rulebook
  // Note: Max dice INCREASES with more regrets (4 -> 8) per rulebook
  const tierMaxDice = getMaxDiceFromMadness(currentRegrets);
  // Apply character bonus (Storm gets +1 base max dice)
  const characterBonus = (player.baseMaxDice ?? 3) - 3;
  player.maxDice = tierMaxDice + characterBonus;

  // The rulebook doesn't have the "lose die at madness 4" or "lose mount at madness 6" penalties
  // Those were incorrect interpretations - the madness system only affects:
  // 1. Fair/Foul value modifiers
  // 2. Max dice (which increases, not decreases)
  // 3. Port discount at 13+ regrets

  enforceFreshDiceLimit(player);
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

  // Thu/Sat: All players take one tackle die from the bag
  // Per rulebook: blue/orange die, or green if not enough available
  if (newDay === 'Thursday' || newDay === 'Saturday') {
    // Give each player a tackle die (simplified: give them a standard tackle die ID)
    gameState.players.forEach(p => {
      // Add a standard tackle die to player's tackle dice
      // Using 'TACKLE-GREEN-001' as default per rulebook's fallback rule
      p.tackleDice = [...p.tackleDice, 'TACKLE-GREEN-001'];
    });
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
