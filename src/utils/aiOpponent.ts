import { GameState, Player, GameAction, FishCard, Depth, Location, UpgradeCard } from '@/types/game';
import { AIDifficulty, AIDecision, FishCatchEvaluation, AIContext } from '@/types/ai';
import {
  calculatePlayerScoreBreakdown,
  calculateFishValueWithMadness,
  getFairValueModifier,
  getFoulValueModifier,
  getMadnessTier,
  hasPortDiscount
} from './gameEngine';
import { TACKLE_DICE_LOOKUP } from '@/data/tackleDice';

// Fish difficulty ranges by size and depth from rulebook (p.13)
// DEPTH | SMALL | MID | LARGE
// I     | 0-2   | 1-3 | 2-4
// II    | 1-3   | 2-4 | 3-5
// III   | 2-4   | 3-5 | 4-?
const FISH_DIFFICULTY_RANGES: Record<number, { small: [number, number], mid: [number, number], large: [number, number] }> = {
  1: { small: [0, 2], mid: [1, 3], large: [2, 4] },
  2: { small: [1, 3], mid: [2, 4], large: [3, 5] },
  3: { small: [2, 4], mid: [3, 5], large: [4, 7] }, // Large at depth 3 can go higher
};

// Fair:Foul ratio by depth from rulebook (p.14)
// Depth I: 3:1, Depth II: 1:1, Depth III: 1:3
const FOUL_PROBABILITY_BY_DEPTH: Record<number, number> = {
  1: 0.25, // 1 in 4 chance of foul
  2: 0.50, // 1 in 2 chance of foul
  3: 0.75, // 3 in 4 chance of foul
};

// Day order for calculating remaining days
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const;

/**
 * Main AI decision-making function
 * Returns the action the AI should take based on current game state
 */
export const generateAIAction = (
  gameState: GameState,
  player: Player,
  difficulty: AIDifficulty = 'medium'
): AIDecision => {
  const context = buildAIContext(gameState, player);

  // Handle different game phases
  switch (gameState.phase) {
    case 'declaration':
      return generateDeclarationAction(context, difficulty);
    case 'action':
      return generateActionPhaseDecision(context, difficulty);
    default:
      // For other phases, just pass or wait
      return {
        action: { type: 'PASS', playerId: player.id, payload: {} },
        confidence: 1.0,
        reasoning: 'Waiting for action phase'
      };
  }
};

/**
 * Build context object for AI decision making
 */
const buildAIContext = (gameState: GameState, player: Player): AIContext => {
  const playerIndex = gameState.players.findIndex(p => p.id === player.id);
  const currentDayIndex = DAYS.indexOf(gameState.day);
  const daysRemaining = DAYS.length - currentDayIndex - 1;

  const opponentScores = gameState.players
    .filter(p => p.id !== player.id)
    .map(p => calculatePlayerScoreBreakdown(p).totalScore);

  const playerScore = calculatePlayerScoreBreakdown(player).totalScore;
  const isLeading = opponentScores.every(score => playerScore >= score);

  return {
    gameState,
    player,
    playerIndex,
    isLeading,
    daysRemaining,
    opponentScores
  };
};

/**
 * Generate action for declaration phase (choose Sea or Port)
 */
const generateDeclarationAction = (
  context: AIContext,
  difficulty: AIDifficulty
): AIDecision => {
  const { player, daysRemaining, isLeading } = context;

  const seaScore = evaluateSeaValue(context, difficulty);
  const portScore = evaluatePortValue(context, difficulty);

  // Add randomness based on difficulty
  const randomFactor = difficulty === 'easy' ? 0.3 : difficulty === 'medium' ? 0.15 : 0.05;
  const adjustedSeaScore = seaScore + (Math.random() - 0.5) * randomFactor * 10;
  const adjustedPortScore = portScore + (Math.random() - 0.5) * randomFactor * 10;

  const choosePort = adjustedPortScore > adjustedSeaScore;
  const location: Location = choosePort ? 'port' : 'sea';

  return {
    action: {
      type: 'DECLARE_LOCATION',
      playerId: player.id,
      payload: { location }
    },
    confidence: Math.abs(adjustedSeaScore - adjustedPortScore) / 10,
    reasoning: `Chose ${location} (sea: ${seaScore.toFixed(1)}, port: ${portScore.toFixed(1)})`
  };
};

/**
 * Evaluate how valuable going to sea is
 */
const evaluateSeaValue = (context: AIContext, difficulty: AIDifficulty): number => {
  const { player, gameState, daysRemaining } = context;

  let score = 5; // Base score

  // More dice = better for fishing
  score += player.freshDice.length * 1.5;

  // Higher dice values = better catch potential
  const avgDiceValue = player.freshDice.reduce((a, b) => a + b, 0) / Math.max(player.freshDice.length, 1);
  score += avgDiceValue * 0.5;

  // Early game = more fishing
  score += daysRemaining * 0.5;

  // Low madness = safer fishing
  score += (6 - player.madnessLevel) * 0.3;

  // Available fish at current depth
  const shoals = gameState.sea.shoals[player.currentDepth] || [];
  const totalFish = shoals.reduce((sum, shoal) => sum + shoal.length, 0);
  score += Math.min(totalFish, 10) * 0.3;

  return score;
};

/**
 * Evaluate how valuable going to port is
 */
const evaluatePortValue = (context: AIContext, difficulty: AIDifficulty): number => {
  const { player, gameState, daysRemaining } = context;

  let score = 3; // Base score (slightly lower than sea)

  // Many fish in hand = should sell/mount
  score += player.handFish.length * 2;

  // Empty mount slots = good opportunity
  const emptySlots = player.maxMountSlots - player.mountedFish.length;
  if (player.handFish.length > 0 && emptySlots > 0) {
    score += emptySlots * 1.5;
  }

  // Need upgrades if early game
  if (daysRemaining >= 3) {
    if (!player.equippedRod || player.equippedRod.id === 'UPGRADE-ROD-001') {
      score += 2; // Basic rod, consider upgrading
    }
  }

  // High madness = should heal
  if (player.madnessLevel >= 4) {
    score += 3;
  }

  // Late game with fish = mount for points
  if (daysRemaining <= 1 && player.handFish.length > 0) {
    score += 5;
  }

  // Fishbucks to spend
  if (player.fishbucks >= 5) {
    score += 1.5;
  }

  return score;
};

/**
 * Generate action during action phase
 */
const generateActionPhaseDecision = (
  context: AIContext,
  difficulty: AIDifficulty
): AIDecision => {
  const { player, gameState } = context;

  if (player.location === 'sea') {
    return generateSeaAction(context, difficulty);
  } else {
    return generatePortAction(context, difficulty);
  }
};

/**
 * Generate action while at sea
 */
const generateSeaAction = (
  context: AIContext,
  difficulty: AIDifficulty
): AIDecision => {
  const { player, gameState, daysRemaining } = context;

  // No dice left = must pass
  if (player.freshDice.length === 0) {
    return createPassAction(player, 'No dice remaining');
  }

  // Evaluate possible fish catches
  const catchOptions = evaluateFishCatches(context, difficulty);
  const bestCatch = catchOptions.length > 0 ? catchOptions[0] : null;

  // Evaluate descending
  const descendValue = evaluateDescend(context, difficulty);

  // Decide: catch, descend, or pass
  if (bestCatch && bestCatch.expectedValue > 3) {
    // Good catch opportunity
    return createCatchAction(player, bestCatch);
  }

  if (descendValue > 5 && player.currentDepth < 3) {
    // Descending is valuable
    return createDescendAction(player, context);
  }

  if (bestCatch && bestCatch.expectedValue > 0) {
    // Okay catch, better than nothing
    return createCatchAction(player, bestCatch);
  }

  // Pass if nothing good to do
  return createPassAction(player, 'No valuable actions available');
};

/**
 * Evaluate all possible fish catches
 */
const evaluateFishCatches = (
  context: AIContext,
  difficulty: AIDifficulty
): FishCatchEvaluation[] => {
  const { player, gameState } = context;
  const evaluations: FishCatchEvaluation[] = [];

  const depth = player.currentDepth;
  const shoals = gameState.sea.shoals[depth] || [];

  shoals.forEach((shoal, shoalIndex) => {
    shoal.forEach(fish => {
      const evaluation = evaluateSingleFish(fish, depth, shoalIndex, player, difficulty);
      if (evaluation.successProbability > 0) {
        evaluations.push(evaluation);
      }
    });
  });

  // Sort by expected value descending
  return evaluations.sort((a, b) => b.expectedValue - a.expectedValue);
};

/**
 * Evaluate catching a single fish using rulebook mechanics
 */
const evaluateSingleFish = (
  fish: FishCard,
  depth: Depth,
  shoalIndex: number,
  player: Player,
  difficulty: AIDifficulty
): FishCatchEvaluation => {
  const fishDifficulty = fish.difficulty;
  const totalDice = player.freshDice.reduce((a, b) => a + b, 0);
  const regretCount = player.regrets.length;

  // Calculate success probability
  let successProbability = 0;
  const diceRequired: number[] = [];
  const tackleDiceRequired: number[] = [];

  // Find optimal dice combination to meet fish difficulty
  const sortedDiceIndices = player.freshDice
    .map((value, index) => ({ value, index }))
    .sort((a, b) => b.value - a.value);

  let runningTotal = 0;
  for (const { value, index } of sortedDiceIndices) {
    if (runningTotal >= fishDifficulty) break;
    runningTotal += value;
    diceRequired.push(index);
  }

  if (runningTotal >= fishDifficulty) {
    successProbability = 1.0;
  } else {
    // Check if tackle dice can help
    let tackleTotal = 0;
    player.tackleDice.forEach((dieId, index) => {
      const die = TACKLE_DICE_LOOKUP[dieId];
      if (die) {
        const avgValue = die.faces.reduce((a, b) => a + b, 0) / die.faces.length;
        tackleTotal += avgValue;
        tackleDiceRequired.push(index);
      }
    });

    if (runningTotal + tackleTotal >= fishDifficulty) {
      successProbability = 0.7; // Uncertainty with tackle dice
    }
  }

  // Calculate expected value using proper madness modifiers
  let expectedValue = 0;
  if (successProbability > 0) {
    // Use madness-adjusted value (rulebook p.16-17, p.21)
    const madnessAdjustedValue = calculateFishValueWithMadness(fish, regretCount);

    // Calculate regret risk penalty
    let regretPenalty = 0;
    if (fish.abilities.includes('regret_draw')) {
      regretPenalty = 1.5;
    } else if (fish.abilities.includes('regret_draw_2')) {
      regretPenalty = 3.0;
    }

    // Foul fish cause regret when sold (rulebook p.16)
    if (fish.quality === 'foul') {
      regretPenalty += 0.5;
    }

    // Risk adjustment based on AI difficulty
    const riskMod = difficulty === 'easy' ? 0.5 : difficulty === 'medium' ? 0.3 : 0.1;
    const adjustedRegretPenalty = regretPenalty * (1 + riskMod);

    expectedValue = successProbability * (madnessAdjustedValue - adjustedRegretPenalty);

    // Consider how fish value changes with more regrets
    // At low madness, fair fish are worth more (+2)
    // At high madness, foul fish are worth more (+2)
    if (fish.quality === 'foul' && regretCount >= 7) {
      expectedValue += 1; // Foul fish become more valuable at high madness
    } else if (fish.quality === 'fair' && regretCount < 4) {
      expectedValue += 0.5; // Fair fish are more valuable at low madness
    }
  }

  return {
    fish,
    depth,
    shoalIndex,
    successProbability,
    expectedValue,
    regretRisk: fish.abilities.includes('regret_draw') || fish.abilities.includes('regret_draw_2'),
    diceRequired,
    tackleDiceRequired: successProbability < 1 ? tackleDiceRequired : []
  };
};

/**
 * Evaluate value of descending to deeper waters
 */
const evaluateDescend = (context: AIContext, difficulty: AIDifficulty): number => {
  const { player, gameState, daysRemaining } = context;

  if (player.currentDepth >= 3) return -10; // Can't descend further

  const targetDepth = (player.currentDepth + 1) as Depth;
  const deeperShoals = gameState.sea.shoals[targetDepth] || [];
  const totalDeepFish = deeperShoals.reduce((sum, shoal) => sum + shoal.length, 0);

  // Need dice with value 3+ to descend
  const hasDescendDice = player.freshDice.some(d => d >= 3);
  if (!hasDescendDice) return -10;

  let value = 0;

  // More deep fish = more value
  value += totalDeepFish * 0.5;

  // Deeper fish are worth more
  value += targetDepth * 2;

  // Early game = worth descending
  value += daysRemaining * 0.5;

  // Risk based on difficulty
  const riskMod = difficulty === 'hard' ? 0.3 : difficulty === 'medium' ? 0.5 : 0.8;
  value *= riskMod;

  return value;
};

/**
 * Generate action while at port
 */
const generatePortAction = (
  context: AIContext,
  difficulty: AIDifficulty
): AIDecision => {
  const { player, gameState, daysRemaining } = context;

  // Priority: Make Port benefits > Mount fish > Sell fish > Buy upgrades > Pass

  // Try Make Port benefits first (rulebook p.17)
  const makePortAction = tryMakePortBenefits(context, difficulty);
  if (makePortAction) return makePortAction;

  // Try to mount valuable fish
  const mountAction = tryMountFish(context, difficulty);
  if (mountAction) return mountAction;

  // Try to sell fish
  const sellAction = trySellFish(context, difficulty);
  if (sellAction) return sellAction;

  // Try to buy upgrades
  const buyAction = tryBuyUpgrade(context, difficulty);
  if (buyAction) return buyAction;

  // Pass if nothing to do
  return createPassAction(player, 'No valuable port actions');
};

/**
 * Try to use Make Port benefits (rulebook p.17)
 * - Reroll dice if current roll is poor
 * - Flip Can of Worms if not already flipped
 * - Discard a regret if at high madness
 */
const tryMakePortBenefits = (
  context: AIContext,
  difficulty: AIDifficulty
): AIDecision | null => {
  const { player } = context;
  const regretCount = player.regrets.length;

  // Consider discarding a regret if at high madness (7+ regrets)
  if (regretCount >= 7 && player.regrets.length > 0) {
    // Find highest value regret to discard
    const sortedRegrets = [...player.regrets].sort((a, b) => b.value - a.value);
    const regretToDiscard = sortedRegrets[0];

    // Harder difficulties are more likely to discard strategically
    const discardThreshold = difficulty === 'easy' ? 0.3 : difficulty === 'medium' ? 0.6 : 0.9;
    if (Math.random() < discardThreshold) {
      return {
        action: {
          type: 'DISCARD_REGRET',
          playerId: player.id,
          payload: { regretId: regretToDiscard.id }
        },
        confidence: 0.8,
        reasoning: `Discarding regret to reduce madness (${regretCount} regrets)`
      };
    }
  }

  // Consider rerolling if dice values are poor
  const avgDiceValue = player.freshDice.length > 0
    ? player.freshDice.reduce((a, b) => a + b, 0) / player.freshDice.length
    : 0;

  // Reroll threshold based on difficulty
  const rerollThreshold = difficulty === 'easy' ? 2.0 : difficulty === 'medium' ? 2.5 : 3.0;

  if (avgDiceValue < rerollThreshold && player.freshDice.length > 0) {
    // Only reroll sometimes based on difficulty
    const rerollChance = difficulty === 'easy' ? 0.4 : difficulty === 'medium' ? 0.6 : 0.8;
    if (Math.random() < rerollChance) {
      return {
        action: {
          type: 'MAKE_PORT_REROLL',
          playerId: player.id,
          payload: {}
        },
        confidence: 0.7,
        reasoning: `Rerolling poor dice (avg: ${avgDiceValue.toFixed(1)})`
      };
    }
  }

  // Consider flipping Can of Worms if not already face up
  if (!player.canOfWormsFaceUp) {
    // Harder difficulties flip more strategically
    const flipChance = difficulty === 'easy' ? 0.2 : difficulty === 'medium' ? 0.4 : 0.6;
    if (Math.random() < flipChance) {
      return {
        action: {
          type: 'FLIP_CAN_OF_WORMS',
          playerId: player.id,
          payload: {}
        },
        confidence: 0.5,
        reasoning: 'Flipping Can of Worms for future benefit'
      };
    }
  }

  return null;
};

/**
 * Try to mount fish
 */
const tryMountFish = (
  context: AIContext,
  difficulty: AIDifficulty
): AIDecision | null => {
  const { player } = context;

  if (player.handFish.length === 0) return null;

  // Find empty mount slots
  const usedSlots = new Set(player.mountedFish.map(m => m.slot));
  const emptySlots: number[] = [];
  for (let i = 0; i < player.maxMountSlots; i++) {
    if (!usedSlots.has(i)) {
      emptySlots.push(i);
    }
  }

  if (emptySlots.length === 0) return null;

  // Mount the most valuable fish in the best slot
  const sortedFish = [...player.handFish].sort((a, b) => b.value - a.value);
  const bestFish = sortedFish[0];
  const bestSlot = emptySlots[0]; // Slot 0 typically has highest multiplier

  return {
    action: {
      type: 'MOUNT_FISH',
      playerId: player.id,
      payload: { fishId: bestFish.id, slot: bestSlot }
    },
    confidence: 0.9,
    reasoning: `Mounting ${bestFish.name} in slot ${bestSlot}`
  };
};

/**
 * Try to sell fish
 */
const trySellFish = (
  context: AIContext,
  difficulty: AIDifficulty
): AIDecision | null => {
  const { player, daysRemaining } = context;

  if (player.handFish.length === 0) return null;

  // Sell criteria:
  // - Low value fish
  // - Foul quality fish (if we need fishbucks)
  // - Any fish if mount slots are full

  const emptySlots = player.maxMountSlots - player.mountedFish.length;

  // Find a fish to sell
  const sortedFish = [...player.handFish].sort((a, b) => a.value - b.value);

  // Sell lowest value fish if we have more than mount slots
  if (player.handFish.length > emptySlots) {
    const fishToSell = sortedFish[0];
    return {
      action: {
        type: 'SELL_FISH',
        playerId: player.id,
        payload: { fishId: fishToSell.id }
      },
      confidence: 0.8,
      reasoning: `Selling ${fishToSell.name} (low value, mount slots limited)`
    };
  }

  // Sell foul fish if we need fishbucks
  if (player.fishbucks < 3) {
    const foulFish = player.handFish.find(f => f.quality === 'foul');
    if (foulFish) {
      return {
        action: {
          type: 'SELL_FISH',
          playerId: player.id,
          payload: { fishId: foulFish.id }
        },
        confidence: 0.6,
        reasoning: `Selling foul fish ${foulFish.name} for fishbucks`
      };
    }
  }

  return null;
};

/**
 * Try to buy upgrades
 */
const tryBuyUpgrade = (
  context: AIContext,
  difficulty: AIDifficulty
): AIDecision | null => {
  const { player, gameState, daysRemaining } = context;

  if (player.fishbucks < 2) return null; // Not enough to buy anything

  const shops = gameState.port.shops;

  // Prioritize based on game state
  const affordableUpgrades: UpgradeCard[] = [];

  // Check rods
  shops.rods.forEach(rod => {
    if (rod.cost <= player.fishbucks) {
      affordableUpgrades.push(rod);
    }
  });

  // Check reels
  shops.reels.forEach(reel => {
    if (reel.cost <= player.fishbucks) {
      affordableUpgrades.push(reel);
    }
  });

  // Check supplies
  shops.supplies.forEach(supply => {
    if (supply.cost <= player.fishbucks) {
      affordableUpgrades.push(supply);
    }
  });

  if (affordableUpgrades.length === 0) return null;

  // Pick the most expensive affordable upgrade (generally better)
  const bestUpgrade = affordableUpgrades.sort((a, b) => b.cost - a.cost)[0];

  // Only buy if it seems valuable
  if (daysRemaining < 2 && bestUpgrade.type !== 'supply') {
    return null; // Too late for equipment upgrades
  }

  return {
    action: {
      type: 'BUY_UPGRADE',
      playerId: player.id,
      payload: { upgradeId: bestUpgrade.id }
    },
    confidence: 0.7,
    reasoning: `Buying ${bestUpgrade.name} for ${bestUpgrade.cost} fishbucks`
  };
};

/**
 * Create a pass action
 */
const createPassAction = (player: Player, reasoning: string): AIDecision => {
  return {
    action: {
      type: 'PASS',
      playerId: player.id,
      payload: {}
    },
    confidence: 0.8,
    reasoning
  };
};

/**
 * Create a catch fish action
 */
const createCatchAction = (player: Player, evaluation: FishCatchEvaluation): AIDecision => {
  return {
    action: {
      type: 'CATCH_FISH',
      playerId: player.id,
      payload: {
        fish: evaluation.fish,
        depth: evaluation.depth,
        shoal: evaluation.shoalIndex,
        diceIndices: evaluation.diceRequired,
        tackleDiceIndices: evaluation.tackleDiceRequired
      }
    },
    confidence: evaluation.successProbability,
    reasoning: `Catching ${evaluation.fish.name} (EV: ${evaluation.expectedValue.toFixed(1)})`
  };
};

/**
 * Create a descend action
 */
const createDescendAction = (player: Player, context: AIContext): AIDecision => {
  const targetDepth = (player.currentDepth + 1) as Depth;

  return {
    action: {
      type: 'DESCEND',
      playerId: player.id,
      payload: { targetDepth }
    },
    confidence: 0.7,
    reasoning: `Descending to depth ${targetDepth}`
  };
};

/**
 * Check if current player is AI and should take action
 */
export const shouldAIAct = (gameState: GameState): boolean => {
  const currentPlayer = gameState.players[gameState.currentPlayerIndex];
  return currentPlayer?.isAI === true && !currentPlayer.hasPassed;
};

/**
 * Get the current AI player if it's their turn
 */
export const getCurrentAIPlayer = (gameState: GameState): Player | null => {
  if (!shouldAIAct(gameState)) return null;
  return gameState.players[gameState.currentPlayerIndex];
};
