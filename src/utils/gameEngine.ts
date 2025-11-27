import { GameState, Player, GameAction, CharacterOption, Depth, FishCard } from '@/types/game';
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
  const createShoals = (fishList: typeof ALL_FISH) => {
    const shuffled = shuffle(fishList);
    const shoals = [[], [], []] as any[];
    
    // Distribute 13 fish per shoal
    for (let i = 0; i < 39 && i < shuffled.length; i++) {
      const shoalIndex = i % 3;
      if (!shoals[shoalIndex]) shoals[shoalIndex] = [];
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
          // Reset make port benefits for this visit
          player.canOfWormsFaceUp = false;
        }
      }
      break;

    // Make Port benefits (rulebook p.17)
    case 'MAKE_PORT_REROLL':
      // Muster Your Courage again - reroll all dice when making port
      if (player && player.location === 'port') {
        const newDice = rollDice(player.maxDice);
        const processedDice = player.rerollOnes
          ? newDice.map(value => (value === 1 ? rollDice(1)[0] : value))
          : newDice;
        player.freshDice = processedDice;
        player.spentDice = [];
      }
      break;

    case 'FLIP_CAN_OF_WORMS':
      // Flip Can of Worms face-up (can be used later for bonus)
      if (player && player.location === 'port' && !player.canOfWormsFaceUp) {
        player.canOfWormsFaceUp = true;
      }
      break;

    case 'DISCARD_REGRET':
      // Optionally discard one Regret card when making port
      if (player && player.location === 'port' && player.regrets.length > 0) {
        const { regretId } = action.payload;
        const regretIndex = player.regrets.findIndex(r => r.id === regretId);
        if (regretIndex >= 0) {
          const previousRegretCount = player.regrets.length;
          const removed = player.regrets[regretIndex];
          player.regrets = [
            ...player.regrets.slice(0, regretIndex),
            ...player.regrets.slice(regretIndex + 1)
          ];
          newState.port.regretsDiscard = [...newState.port.regretsDiscard, removed];
          recalculateMadness(player, { previousRegretCount, gameState: newState });
        }
      }
      break;

    case 'REVEAL_FISH':
      // Simple reveal logic - fish is already visible in this implementation
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
          // Remove fresh dice
          const removalOrder = [...uniqueValidIndices].sort((a, b) => b - a);
          removalOrder.forEach(index => {
            player.freshDice.splice(index, 1);
          });
          player.spentDice = [...player.spentDice, ...selectedDiceValues];

          // Remove used tackle dice (they are consumed on use)
          const tackleRemovalOrder = [...uniqueTackleIndices].sort((a, b) => b - a);
          tackleRemovalOrder.forEach(index => {
            player.tackleDice.splice(index, 1);
          });

          player.handFish.push(fish);

          const shoalArray = newState.sea.shoals[depth][shoal];
          const fishIndex = shoalArray.findIndex((f: FishCard) => f.id === fish.id);
          if (fishIndex >= 0) {
            shoalArray.splice(fishIndex, 1);
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
                player.handFish.splice(smallFishIndex, 1);
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
              const penaltyDie = player.freshDice.shift();
              if (typeof penaltyDie === 'number') {
                player.spentDice = [...player.spentDice, penaltyDie];
              }
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
          const { adjustedValue } = calculateFishSaleValue(fish, player.madnessLevel);
          player.fishbucks += adjustedValue;
          player.handFish.splice(fishIndex, 1);
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
        if (upgrade && player.fishbucks >= upgrade.cost) {
          player.fishbucks -= upgrade.cost;
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
          player.mountedFish.push({
            slot,
            multiplier: getSlotMultiplier(slot),
            fish
          });
          player.handFish.splice(fishIndex, 1);
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

        // Grant passing rewards based on order (rulebook p.9)
        if (passedCount === 0) {
          // First to pass: 2 Fishbucks + Fish Coin (becomes next first player)
          player.fishbucks += 2;
          newState.fishCoinOwner = player.id;
        } else if (passedCount === 1) {
          // Second to pass: 1 Supply from the shop (if available)
          const availableSupply = newState.port.shops.supplies[0];
          if (availableSupply) {
            player.supplies = [...player.supplies, availableSupply];
            newState.port.shops.supplies = newState.port.shops.supplies.slice(1);
          } else {
            // Fallback: 1 Fishbuck if no supplies available
            player.fishbucks += 1;
          }
        } else {
          // Later players: 1 Fishbuck
          player.fishbucks += 1;
        }

        // Check for last-to-pass rule (rulebook p.9)
        const remainingPlayers = newState.players.filter(p => !p.hasPassed);
        if (remainingPlayers.length === 1) {
          // Last player gets limited turns: 2 at Sea, 4 at Port
          const lastPlayer = remainingPlayers[0];
          newState.lastPlayerTurnsRemaining = lastPlayer.location === 'sea' ? 2 : 4;
        }
      }
      // Check if all players passed
      if (newState.players.every(p => p.hasPassed)) {
        newState.phase = 'start';
        newState.lastPlayerTurnsRemaining = undefined;
        advanceDay(newState);
      }
      break;

    case 'NEXT_PHASE':
      advancePhase(newState);
      break;

    case 'END_TURN': {
      // Handle last-player turn limit (rulebook p.9)
      if (newState.lastPlayerTurnsRemaining !== undefined) {
        newState.lastPlayerTurnsRemaining -= 1;
        if (newState.lastPlayerTurnsRemaining <= 0) {
          // Force pass the last player
          const lastPlayer = newState.players.find(p => !p.hasPassed);
          if (lastPlayer) {
            lastPlayer.hasPassed = true;
          }
          newState.lastPlayerTurnsRemaining = undefined;
          // End the day
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
    }

    default:
      console.warn('Unknown action type:', action.type);
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

/**
 * Calculate fish value with madness modifiers according to rulebook (p.16-17, p.21)
 * Fair fish: value modified by Fair Value modifier from madness tracker
 * Foul fish: value modified by Foul Value modifier from madness tracker
 */
export const calculateFishValueWithMadness = (fish: FishCard, regretCount: number): number => {
  const baseValue = getFishCurrentValue(fish);
  const isFoul = fish.quality === 'foul';

  const modifier = isFoul
    ? getFoulValueModifier(regretCount)
    : getFairValueModifier(regretCount);

  return Math.max(0, baseValue + modifier);
};

export const calculateFishSaleValue = (fish: FishCard, madnessLevel: number, regretCount?: number) => {
  const baseValue = getFishBaseValue(fish);
  const currentValue = fish.value ?? baseValue;

  // Use new madness system if regret count is provided
  if (regretCount !== undefined) {
    const adjustedValue = calculateFishValueWithMadness(fish, regretCount);
    const isFoul = fish.quality === 'foul';
    const modifier = isFoul
      ? getFoulValueModifier(regretCount)
      : getFairValueModifier(regretCount);

    return {
      adjustedValue,
      baseValue,
      madnessPenalty: -modifier, // Negative because it's a modifier, not penalty
      modifier: currentValue - baseValue,
    };
  }

  // Legacy calculation for backwards compatibility
  const madnessPenalty = Math.min(Math.max(madnessLevel, 0), baseValue);
  const adjustedValue = Math.max(0, currentValue - madnessPenalty);

  return {
    adjustedValue,
    baseValue,
    madnessPenalty,
    modifier: currentValue - baseValue,
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

/**
 * Calculate hand fish score with proper madness modifiers (rulebook p.22)
 * Fish in hand are scored by their Value modified by madness tracker
 */
export const calculateHandFishScore = (player: Player) => {
  const regretCount = player.regrets.length;
  return player.handFish.reduce((sum, fish) => {
    const adjustedValue = calculateFishValueWithMadness(fish, regretCount);
    return sum + adjustedValue;
  }, 0);
};

/**
 * Calculate mounted fish score with proper madness modifiers (rulebook p.22)
 * Mounted fish are first modified by madness, then multiplied by mount slot
 */
export const calculateMountedFishScore = (player: Player) => {
  const regretCount = player.regrets.length;
  return player.mountedFish.reduce((sum, mount) => {
    const madnessAdjustedValue = calculateFishValueWithMadness(mount.fish, regretCount);
    const finalValue = madnessAdjustedValue * mount.multiplier;
    return sum + Math.max(0, finalValue);
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
    // Note: Regret VALUE doesn't subtract from score directly
    // Instead, highest regret value player loses a mounted fish (handled in endGame)
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

// Madness tracker from rulebook (p.20-21)
// Regrets | Fair Value | Foul Value | Max Dice
// 0       | +2         | -2         | 4
// 1-3     | +1         | -1         | 4
// 4-6     | +1         | =          | 5
// 7-9     | =          | +1         | 6
// 10-12   | -1         | +1         | 7
// 13+     | -2         | +2         | 8 (+ port discount)

interface MadnessTier {
  minRegrets: number;
  fairModifier: number;
  foulModifier: number;
  maxDice: number;
  portDiscount: boolean;
}

const MADNESS_TIERS: MadnessTier[] = [
  { minRegrets: 0, fairModifier: 2, foulModifier: -2, maxDice: 4, portDiscount: false },
  { minRegrets: 1, fairModifier: 1, foulModifier: -1, maxDice: 4, portDiscount: false },
  { minRegrets: 4, fairModifier: 1, foulModifier: 0, maxDice: 5, portDiscount: false },
  { minRegrets: 7, fairModifier: 0, foulModifier: 1, maxDice: 6, portDiscount: false },
  { minRegrets: 10, fairModifier: -1, foulModifier: 1, maxDice: 7, portDiscount: false },
  { minRegrets: 13, fairModifier: -2, foulModifier: 2, maxDice: 8, portDiscount: true },
];

export const getMadnessTier = (regretCount: number): MadnessTier => {
  for (let i = MADNESS_TIERS.length - 1; i >= 0; i--) {
    if (regretCount >= MADNESS_TIERS[i].minRegrets) {
      return MADNESS_TIERS[i];
    }
  }
  return MADNESS_TIERS[0];
};

export const getFairValueModifier = (regretCount: number): number => {
  return getMadnessTier(regretCount).fairModifier;
};

export const getFoulValueModifier = (regretCount: number): number => {
  return getMadnessTier(regretCount).foulModifier;
};

export const getMaxDiceFromMadness = (regretCount: number, baseMaxDice: number = 3): number => {
  const tier = getMadnessTier(regretCount);
  // The rulebook shows max dice increases with madness, starting from 4
  // Character bonuses (like Storm's +1) should add to this
  const characterBonus = baseMaxDice - 3;
  return tier.maxDice + characterBonus;
};

export const hasPortDiscount = (regretCount: number): boolean => {
  return getMadnessTier(regretCount).portDiscount;
};

// Legacy function for compatibility
const calculateMadnessLevelFromRegrets = (regretCount: number) => {
  // Map regret count to a madness level (0-6+)
  if (regretCount >= 13) return 6;
  if (regretCount >= 10) return 5;
  if (regretCount >= 7) return 4;
  if (regretCount >= 4) return 3;
  if (regretCount >= 1) return 1;
  return 0;
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
  player.freshDice.splice(highestIndex, 1);
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
  player.mountedFish.splice(highestIndex, 1);
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
  const gainedRegret = currentRegrets > previousRegretCount;

  const baseMadnessLevel = calculateMadnessLevelFromRegrets(currentRegrets);
  const modifier = player.madnessOffset ?? 0;
  const newMadnessLevel = Math.max(0, baseMadnessLevel + modifier);
  player.madnessLevel = newMadnessLevel;

  const baseMaxDice = player.baseMaxDice ?? 3;
  player.maxDice = Math.max(baseMaxDice - Math.floor(player.madnessLevel / 2), 1);

  if (previousLevel < 4 && player.madnessLevel >= 4) {
    removeHighestFreshDie(player);
  }

  if (previousLevel < 6 && player.madnessLevel >= 6) {
    discardHighestValueMount(player);
  }

  enforceFreshDiceLimit(player);

  if (gameState && gainedRegret && previousLevel >= 6) {
    if (player.mountedFish.length >= 2) {
      discardHighestValueMount(player);
      discardHighestValueMount(player);
    } else {
      endGame(gameState);
    }
  }
};

const advancePhase = (gameState: GameState) => {
  const phases = ['start', 'refresh', 'declaration', 'action'] as const;
  const currentIndex = phases.indexOf(gameState.phase as any);
  if (currentIndex < phases.length - 1) {
    gameState.phase = phases[currentIndex + 1];
  } else {
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
  }

  // Day effects
  if (gameState.day === 'Thursday') {
    // Payday - all players get 3 fishbucks
    gameState.players.forEach(p => p.fishbucks += 3);
  }

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

/**
 * End game scoring according to rulebook (p.22)
 * Highest Regret Penalty by player count:
 * - 2 players: discard LOWEST value mounted fish
 * - 3+ players: discard HIGHEST value mounted fish
 */
const endGame = (gameState: GameState) => {
  gameState.isGameOver = true;
  gameState.phase = 'endgame';

  const playerCount = gameState.players.length;

  if (playerCount === 0) {
    gameState.winner = undefined;
    return;
  }

  // Find player(s) with highest total Regret Value
  const playersWithRegretValue = gameState.players.map(player => ({
    player,
    regretValue: calculatePlayerRegretValue(player)
  }));

  const maxRegretValue = Math.max(...playersWithRegretValue.map(p => p.regretValue));

  // Apply penalty to player(s) with highest regret value
  playersWithRegretValue
    .filter(p => p.regretValue === maxRegretValue && maxRegretValue > 0)
    .forEach(({ player }) => {
      if (player.mountedFish.length > 0) {
        const regretCount = player.regrets.length;

        // Calculate actual values with madness for comparison
        const mountsWithValues = player.mountedFish.map((mount, index) => ({
          mount,
          index,
          value: calculateFishValueWithMadness(mount.fish, regretCount) * mount.multiplier
        }));

        // Sort by value
        mountsWithValues.sort((a, b) => a.value - b.value);

        // 2 players: discard lowest value, 3+ players: discard highest value
        const mountToDiscard = playerCount === 2
          ? mountsWithValues[0] // Lowest
          : mountsWithValues[mountsWithValues.length - 1]; // Highest

        if (mountToDiscard) {
          player.mountedFish.splice(mountToDiscard.index, 1);
        }
      }
    });

  // Calculate final scores after penalties
  const scores = gameState.players.map(player => ({
    player,
    ...calculatePlayerScoreBreakdown(player)
  }));

  // Determine winner (highest score, ties broken by lower regret value, then fewer regret cards)
  const sortedScores = [...scores].sort((a, b) => {
    if (b.totalScore !== a.totalScore) {
      return b.totalScore - a.totalScore;
    }
    if (a.regretValue !== b.regretValue) {
      return a.regretValue - b.regretValue; // Lower regret value wins tie
    }
    return a.player.regrets.length - b.player.regrets.length; // Fewer cards wins tie
  });

  gameState.winner = sortedScores[0]?.player.name;
};
