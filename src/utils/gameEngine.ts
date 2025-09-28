import { GameState, Player, GameAction, CharacterOption } from '@/types/game';
import { ALL_FISH, DEPTH_1_FISH, DEPTH_2_FISH, DEPTH_3_FISH } from '@/data/fish';
import { REGRET_CARDS } from '@/data/regrets';

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
  const players: Player[] = selectedCharacters.map((character, index) => ({
    id: `player-${index + 1}`,
    name: character.name,
    character: character.id,
    location: 'sea',
    currentDepth: 1,
    freshDice: [1, 2, 3], // Starting dice
    spentDice: [],
    tackleDice: [],
    maxDice: 3,
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
  }));

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
    port: {
      shops: {
        rods: [],
        reels: [],
        supplies: []
      },
      dinksDeck: [],
      regretsDeck: shuffle(REGRET_CARDS),
      regretsDiscard: []
    },
    lifePreserverOwner: undefined,
    fishCoinOwner: undefined,
    omenDieValue: 1,
    isGameOver: false,
    winner: undefined
  };

  return gameState;
};

// Apply character starting bonuses
export const applyCharacterBonuses = (player: Player, characterId: string): Player => {
  const updated = { ...player };
  
  switch (characterId) {
    case 'ahab':
      updated.fishbucks += 2;
      // Add starting rod (simplified)
      break;
    case 'nemo':
      // Add starting reel (simplified)
      break;
    case 'marina':
      updated.currentDepth = 2;
      // Add extra dink (simplified)
      break;
    case 'finn':
      updated.fishbucks += 3;
      // Reroll 1s ability (simplified)
      break;
    case 'storm':
      updated.maxDice += 1;
      // Extra mount slot (simplified)
      break;
  }
  
  return updated;
};

// Dice rolling utility
export const rollDice = (count: number): number[] => {
  return Array.from({ length: count }, () => Math.floor(Math.random() * 6) + 1);
};

// Game action reducer
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

    case 'REVEAL_FISH':
      // Simple reveal logic - fish is already visible in this implementation
      break;

    case 'CATCH_FISH':
      if (player && player.location === 'sea') {
        const { fish, depth, shoal } = action.payload;
        const fishDifficulty = fish.difficulty;
        const availableDice = player.freshDice.reduce((sum, die) => sum + die, 0);
        
        if (availableDice >= fishDifficulty) {
          // Successful catch
          player.handFish.push(fish);
          player.freshDice = []; // Simplified - all dice used
          
          // Remove fish from shoal
          const shoalArray = newState.sea.shoals[depth][shoal];
          const fishIndex = shoalArray.findIndex((f: any) => f.id === fish.id);
          if (fishIndex >= 0) {
            shoalArray.splice(fishIndex, 1);
          }
          
          // Handle special abilities
          if (fish.abilities.includes('regret_draw')) {
            drawRegret(player, newState);
          }
          if (fish.abilities.includes('regret_draw_2')) {
            drawRegret(player, newState);
            drawRegret(player, newState);
          }
          if (fish.id === 'FISH-D3-PLUG-003') {
            newState.sea.plugActive = true;
            player.hasPassed = true; // End turn immediately
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

    case 'MOUNT_FISH':
      if (player && player.location === 'port') {
        const { fishId, slot } = action.payload;
        const fishIndex = player.handFish.findIndex(f => f.id === fishId);
        if (fishIndex >= 0) {
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
        const newDice = rollDice(3);
        player.freshDice = newDice;
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
  if (gameState.port.regretsDeck.length > 0) {
    const regret = gameState.port.regretsDeck.pop()!;
    player.regrets.push(regret);
    player.madnessLevel = Math.min(player.regrets.length, 5);
    player.maxDice = Math.max(3 - Math.floor(player.madnessLevel / 2), 1);
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