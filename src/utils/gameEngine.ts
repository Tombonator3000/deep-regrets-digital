import { GameState, Player, GameAction, CharacterOption, Depth } from '@/types/game';
import { ALL_FISH, DEPTH_1_FISH, DEPTH_2_FISH, DEPTH_3_FISH } from '@/data/fish';
import { REGRET_CARDS } from '@/data/regrets';
import { DINK_CARDS } from '@/data/dinks';
import { ALL_UPGRADES, RODS, REELS, SUPPLIES } from '@/data/upgrades';
import { TACKLE_DICE_LOOKUP } from '@/data/tackleDice';

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
      equippedRod: undefined,
      equippedReel: undefined,
      supplies: [],
      dinks: [],
      madnessLevel: 0,
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
      updated.fishbucks += 2;
      const startingRod = RODS[0];
      if (startingRod) {
        updated.equippedRod = startingRod;
      }
      break;
    }
    case 'nemo': {
      const startingReel = REELS[0];
      if (startingReel) {
        updated.equippedReel = startingReel;
      }
      updated.regretShields += 1;
      break;
    }
    case 'marina': {
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
      updated.fishbucks += 3;
      updated.rerollOnes = true;
      break;
    }
    case 'storm': {
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

export const gameReducer = (state: GameState, action: GameAction): GameState => {
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
        const { fish, depth, shoal, diceIndices } = action.payload;
        const fishDifficulty = fish.difficulty;
        const availableDiceTotal = player.freshDice.reduce((sum, die) => sum + die, 0);

        const requestedIndices = Array.isArray(diceIndices) ? diceIndices : [];
        const uniqueValidIndices = Array.from(
          new Set(
            requestedIndices.filter(
              (index: number) =>
                typeof index === 'number' && index >= 0 && index < player.freshDice.length
            )
          )
        );

        const selectedDiceValues = uniqueValidIndices.map(index => player.freshDice[index]);
        const hasUsableSelection =
          uniqueValidIndices.length > 0 && selectedDiceValues.length === uniqueValidIndices.length;
        const selectedTotal = selectedDiceValues.reduce((sum, die) => sum + die, 0);
        const meetsDifficulty = hasUsableSelection && selectedTotal >= fishDifficulty;

        if (meetsDifficulty) {
          const removalOrder = [...uniqueValidIndices].sort((a, b) => b - a);
          removalOrder.forEach(index => {
            player.freshDice.splice(index, 1);
          });
          player.spentDice = [...player.spentDice, ...selectedDiceValues];

          player.handFish.push(fish);

          const shoalArray = newState.sea.shoals[depth][shoal];
          const fishIndex = shoalArray.findIndex((f: any) => f.id === fish.id);
          if (fishIndex >= 0) {
            shoalArray.splice(fishIndex, 1);
          }

          if (fish.abilities.includes('regret_draw')) {
            drawRegret(player, newState);
          }
          if (fish.abilities.includes('regret_draw_2')) {
            drawRegret(player, newState);
            drawRegret(player, newState);
          }
          if (fish.id === 'FISH-D3-PLUG-003') {
            newState.sea.plugActive = true;
            player.hasPassed = true;
          }
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
          player.fishbucks += fish.value;
          player.handFish.splice(fishIndex, 1);
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
          const removed = player.regrets[player.regrets.length - 1];
          player.regrets = player.regrets.slice(0, -1);
          newState.port.regretsDiscard = [...newState.port.regretsDiscard, removed];
          recalculateMadness(player);
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
            multiplier: slot <= 2 ? 2 : 1, // Simplified multiplier system
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
        player.hasPassed = true;
        // Grant passing reward (simplified)
        player.fishbucks += 1;
      }
      // Check if all players passed
      if (newState.players.every(p => p.hasPassed)) {
        newState.phase = 'start';
        advanceDay(newState);
      }
      break;

    case 'NEXT_PHASE':
      advancePhase(newState);
      break;

    case 'END_TURN':
      // Move to next player
      do {
        newState.currentPlayerIndex = (newState.currentPlayerIndex + 1) % newState.players.length;
      } while (newState.players[newState.currentPlayerIndex].hasPassed && 
               newState.players.some(p => !p.hasPassed));
      break;

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
const drawRegret = (player: Player, gameState: GameState) => {
  if (player.regretShields > 0) {
    player.regretShields -= 1;
    return;
  }
  const { card, deck, discard } = drawCard(
    gameState.port.regretsDeck,
    gameState.port.regretsDiscard
  );
  if (card) {
    gameState.port.regretsDeck = deck;
    gameState.port.regretsDiscard = discard;
    player.regrets = [...player.regrets, card];
    recalculateMadness(player);
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

const recalculateMadness = (player: Player) => {
  player.madnessLevel = Math.min(player.regrets.length, 5);
  const baseMaxDice = player.baseMaxDice ?? 3;
  player.maxDice = Math.max(baseMaxDice - Math.floor(player.madnessLevel / 2), 1);
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
  
  // Rotate first player
  gameState.firstPlayerIndex = (gameState.firstPlayerIndex + 1) % gameState.players.length;
  gameState.currentPlayerIndex = gameState.firstPlayerIndex;
};

const endGame = (gameState: GameState) => {
  gameState.isGameOver = true;
  gameState.phase = 'endgame';
  
  // Calculate scores and determine winner
  const scores = gameState.players.map(player => {
    const regretValue = player.regrets.reduce((sum, regret) => sum + regret.value, 0) +
                       (player.lifeboatFlipped ? 10 : 0);
    const mountedScore = player.mountedFish.reduce((sum, mount) => 
      sum + (mount.fish.value * mount.multiplier), 0);
    
    return {
      player,
      regretValue,
      mountedScore,
      finalScore: mountedScore
    };
  });
  
  // Apply regret penalty to highest regret value player
  const highestRegretPlayer = scores.reduce((max, current) => 
    current.regretValue > max.regretValue ? current : max);
  
  if (highestRegretPlayer.player.mountedFish.length > 0) {
    // Remove highest value mounted fish
    const highestMount = highestRegretPlayer.player.mountedFish.reduce((max, current) => 
      (current.fish.value * current.multiplier) > (max.fish.value * max.multiplier) ? current : max);
    const mountIndex = highestRegretPlayer.player.mountedFish.indexOf(highestMount);
    highestRegretPlayer.player.mountedFish.splice(mountIndex, 1);
    highestRegretPlayer.finalScore -= (highestMount.fish.value * highestMount.multiplier);
  }
  
  // Determine winner
  const winner = scores.reduce((max, current) => 
    current.finalScore > max.finalScore ? current : max);
  
  gameState.winner = winner.player.name;
};