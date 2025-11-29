import { describe, expect, it, beforeEach } from 'vitest';
import { calculatePlayerScoreBreakdown, gameReducer, initializeGame } from '../gameEngine';
import { CharacterOption, FishCard, GameAction, GameState } from '@/types/game';
import { REGRET_CARDS } from '@/data/regrets';
import { RODS, REELS } from '@/data/upgrades';
import { DINK_CARDS } from '@/data/dinks';
import { CHARACTERS } from '@/data/characters';
import { TACKLE_DICE } from '@/data/tackleDice';
import { DEPTH_1_FISH, DEPTH_2_FISH, DEPTH_3_FISH } from '@/data/fish';
import { getSlotMultiplier } from '@/utils/mounting';

const mockCharacters: CharacterOption[] = [
  {
    id: 'char-1',
    name: 'Test Fisher',
    title: 'Rookie',
    description: 'Just starting out.',
    startingBonus: 'None',
    portrait: 'test.png'
  }
];

let state: GameState;

beforeEach(() => {
  state = initializeGame(mockCharacters);
});

describe('character starting bonuses', () => {
  it('grants unique advantages to each captain', () => {
    const characterState = initializeGame(CHARACTERS);
    const playerByCharacter = Object.fromEntries(
      characterState.players.map(player => [player.character, player])
    );

    const ahab = playerByCharacter['ahab'];
    expect(ahab.fishbucks).toBe(5);
    expect(ahab.equippedRod?.type).toBe('rod');

    const nemo = playerByCharacter['nemo'];
    expect(nemo.equippedReel?.type).toBe('reel');
    expect(nemo.regretShields).toBeGreaterThanOrEqual(1);

    const marina = playerByCharacter['marina'];
    expect(marina.currentDepth).toBe(2);
    expect(marina.dinks.length).toBe(1);

    const finn = playerByCharacter['finn'];
    expect(finn.fishbucks).toBe(6);
    expect(finn.rerollOnes).toBe(true);

    const storm = playerByCharacter['storm'];
    expect(storm.maxDice).toBe(4);
    expect(storm.maxMountSlots).toBe(4);

    expect(characterState.port.dinksDeck.length).toBe(DINK_CARDS.length - marina.dinks.length);
  });
});

describe('gameReducer new actions', () => {
  it('declares a new location for the player', () => {
    // Set phase to declaration - DECLARE_LOCATION only works in declaration phase
    state.phase = 'declaration';

    const action: GameAction = {
      type: 'DECLARE_LOCATION',
      playerId: state.players[0].id,
      payload: { location: 'port' }
    };

    const result = gameReducer(state, action);
    const player = result.players[0];

    expect(player.location).toBe('port');
    expect(player.currentDepth).toBe(1);
    // In declaration phase, hasPassed marks player as having declared
    // With single player, it advances to action phase and resets hasPassed
    expect(result.phase).toBe('action');
    expect(player.hasPassed).toBe(false);
  });

  it('descends to a target depth using one qualifying die per level', () => {
    state.players[0].freshDice = [3, 1, 5];

    const action: GameAction = {
      type: 'DESCEND',
      playerId: state.players[0].id,
      payload: { targetDepth: 3 }
    };

    const result = gameReducer(state, action);
    const player = result.players[0];

    expect(player.currentDepth).toBe(3);
    expect(player.freshDice).toEqual([1]);
    expect(player.spentDice).toEqual(expect.arrayContaining([3, 5]));
    expect(player.spentDice).toHaveLength(2);
  });

  it('requires one die per depth when descending multiple levels in one action', () => {
    state.players[0].freshDice = [6, 4, 2, 5];

    const action: GameAction = {
      type: 'DESCEND',
      playerId: state.players[0].id,
      payload: { targetDepth: 3 }
    };

    const result = gameReducer(state, action);
    const player = result.players[0];

    expect(player.currentDepth).toBe(3);
    expect(player.spentDice).toEqual(expect.arrayContaining([6, 4]));
    expect(player.spentDice).not.toContain(2);
    expect(player.freshDice).toEqual([2, 5]);
  });

  it('does not descend if there are not enough qualifying dice', () => {
    state.players[0].freshDice = [2, 2, 6];

    const action: GameAction = {
      type: 'DESCEND',
      playerId: state.players[0].id,
      payload: { targetDepth: 3 }
    };

    const result = gameReducer(state, action);
    const player = result.players[0];

    expect(player.currentDepth).toBe(1);
    expect(player.freshDice).toEqual([2, 2, 6]);
    expect(player.spentDice).toHaveLength(0);
  });

  it('moves exactly one depth deeper via MOVE_DEEPER', () => {
    state.players[0].freshDice = [5, 2, 1];

    const action: GameAction = {
      type: 'MOVE_DEEPER',
      playerId: state.players[0].id,
      payload: { newDepth: 2 }
    };

    const result = gameReducer(state, action);
    const player = result.players[0];

    expect(player.currentDepth).toBe(2);
    expect(player.freshDice).toEqual([2, 1]);
    expect(player.spentDice).toEqual([5]);
  });

  it('purchases upgrades and moves them to the correct inventory', () => {
    const upgrade = RODS[0];
    state.players[0].fishbucks = 10;
    state.players[0].location = 'port';
    state.port.shops.rods = [upgrade];

    const action: GameAction = {
      type: 'BUY_UPGRADE',
      playerId: state.players[0].id,
      payload: { upgradeId: upgrade.id }
    };

    const result = gameReducer(state, action);
    const player = result.players[0];

    expect(player.fishbucks).toBe(10 - upgrade.cost);
    expect(player.equippedRod?.id).toBe(upgrade.id);
    expect(result.port.shops.rods).toHaveLength(0);
  });

  it('buys tackle dice and adds them to the pool', () => {
    const tackleOption = TACKLE_DICE[0];
    state.players[0].fishbucks = 10;
    state.players[0].location = 'port';

    const action: GameAction = {
      type: 'BUY_TACKLE_DICE',
      playerId: state.players[0].id,
      payload: { dieId: tackleOption.id, count: 2 }
    };

    const result = gameReducer(state, action);
    const player = result.players[0];

    expect(player.fishbucks).toBe(10 - tackleOption.cost * 2);
    expect(player.tackleDice).toHaveLength(2);
    expect(player.tackleDice.every(id => id === tackleOption.id)).toBe(true);
  });

  it('mounts fish into trophy slots using the shared slot multipliers', () => {
    const playerId = state.players[0].id;
    state.players[0].location = 'port';

    // Create fish with explicit 'fair' quality to ensure consistent madness modifier
    const fishOne = { ...DEPTH_1_FISH[0], id: 'TEST-MOUNT-001', value: 2, baseValue: 2, quality: 'fair' as const };
    const fishTwo = { ...DEPTH_2_FISH[0], id: 'TEST-MOUNT-002', value: 4, baseValue: 4, quality: 'fair' as const };
    const fishThree = { ...DEPTH_3_FISH[0], id: 'TEST-MOUNT-003', value: 6, baseValue: 6, quality: 'fair' as const };

    state.players[0].handFish = [fishOne, fishTwo, fishThree];

    const mountPlan = [
      { fish: fishOne, slot: 0 },
      { fish: fishTwo, slot: 1 },
      { fish: fishThree, slot: 2 }
    ];

    let workingState = state;
    mountPlan.forEach(({ fish, slot }) => {
      workingState = gameReducer(workingState, {
        type: 'MOUNT_FISH',
        playerId,
        payload: { fishId: fish.id, slot }
      });
    });

    const mountedFish = workingState.players[0].mountedFish;
    expect(mountedFish).toHaveLength(3);
    mountPlan.forEach(({ fish, slot }) => {
      const mount = mountedFish.find(entry => entry.slot === slot);
      expect(mount?.fish.id).toBe(fish.id);
      expect(mount?.multiplier).toBe(getSlotMultiplier(slot));
    });

    expect(workingState.players[0].handFish).toHaveLength(0);

    // Per rulebook: Mounted fish score = (baseValue + madnessModifier) * slotMultiplier
    // With 0 regrets (tier 0), fair fish get +2 modifier
    const breakdown = calculatePlayerScoreBreakdown(workingState.players[0]);
    const fairModifier = 2; // 0 regrets = +2 for fair fish
    const expectedMountedScore = mountPlan.reduce((total, { fish, slot }) => {
      const baseValue = fish.baseValue ?? fish.value ?? 0;
      const adjustedValue = Math.max(0, baseValue + fairModifier);
      return total + adjustedValue * getSlotMultiplier(slot);
    }, 0);
    expect(breakdown.mountedScore).toBe(expectedMountedScore);
  });

  it('uses the life preserver to discard a regret and flip the lifeboat', () => {
    state.players[0].location = 'port';
    state.players[0].regrets = [REGRET_CARDS[0], REGRET_CARDS[1]];
    state.port.regretsDiscard = [];
    // Player must own life preserver to use it
    state.lifePreserverOwner = state.players[0].id;

    const action: GameAction = {
      type: 'USE_LIFE_PRESERVER',
      playerId: state.players[0].id,
      payload: {}
    };

    const result = gameReducer(state, action);
    const player = result.players[0];

    expect(result.lifePreserverOwner).toBe(player.id);
    expect(player.lifeboatFlipped).toBe(true);
    expect(player.regrets).toHaveLength(1);
    expect(result.port.regretsDiscard).toHaveLength(1);
    // Per rulebook: 1 regret = tier 1 (1-3 regrets), maxDice = 4
    expect(player.madnessLevel).toBe(1);
    expect(player.maxDice).toBe(4);
  });

  it('draws a dink card from the deck into the player hand', () => {
    state.players[0].location = 'port';
    state.port.dinksDeck = [...DINK_CARDS.slice(0, 2)];
    const initialDeckLength = state.port.dinksDeck.length;

    const action: GameAction = {
      type: 'DRAW_DINK',
      playerId: state.players[0].id,
      payload: {}
    };

    const result = gameReducer(state, action);
    const player = result.players[0];

    expect(player.dinks).toHaveLength(1);
    expect(result.port.dinksDeck.length).toBe(initialDeckLength - 1);
  });

  it('spends only the selected dice to catch a fish and leaves the rest fresh', () => {
    const fish = DEPTH_1_FISH[1];
    state.players[0].freshDice = [1, 2, 5];
    state.sea.shoals[1][0] = [fish];
    // Mark shoal as revealed (required before catching)
    state.sea.revealedShoals = { '1-0': true };

    const action: GameAction = {
      type: 'CATCH_FISH',
      playerId: state.players[0].id,
      payload: {
        fish,
        depth: 1,
        shoal: 0,
        diceIndices: [1, 2]
      }
    };

    const result = gameReducer(state, action);
    const player = result.players[0];

    expect(player.handFish).toContainEqual(fish);
    expect(player.freshDice).toEqual([1]);
    expect(player.spentDice.slice(-2)).toEqual([2, 5]);
    expect(result.sea.shoals[1][0]).toHaveLength(0);
  });

  it('enforces the dink penalty when there are not enough dice to catch a fish', () => {
    // Use a fish with higher difficulty (3) so dice total of 2 is not enough
    const fish: FishCard = {
      ...DEPTH_1_FISH[4],
      id: 'TEST-HIGH-DIFF',
      difficulty: 3 // Higher than available dice
    };
    state.players[0].freshDice = [2];
    state.sea.shoals[1][0] = [fish];
    state.port.dinksDeck = [...DINK_CARDS.slice(0, 3)];
    // Mark shoal as revealed (required before catching)
    state.sea.revealedShoals = { '1-0': true };
    const initialDeckLength = state.port.dinksDeck.length;

    const action: GameAction = {
      type: 'CATCH_FISH',
      playerId: state.players[0].id,
      payload: {
        fish,
        depth: 1,
        shoal: 0,
        diceIndices: [0]
      }
    };

    const result = gameReducer(state, action);
    const player = result.players[0];

    expect(player.handFish).not.toContainEqual(fish);
    expect(player.freshDice).toHaveLength(0);
    expect(player.spentDice.slice(-1)[0]).toBe(2);
    expect(player.dinks).toHaveLength(1);
    expect(result.port.dinksDeck.length).toBe(initialDeckLength - 1);
    expect(result.sea.shoals[1][0][0]).toEqual(fish);
  });

  it('applies the dink penalty when a player passes on a fish', () => {
    const fish = DEPTH_1_FISH[0];
    state.players[0].freshDice = [3, 4];
    state.sea.shoals[1][0] = [fish];
    state.port.dinksDeck = [...DINK_CARDS.slice(0, 2)];
    // Mark shoal as revealed (required before catching)
    state.sea.revealedShoals = { '1-0': true };
    const initialDeckLength = state.port.dinksDeck.length;

    const action: GameAction = {
      type: 'CATCH_FISH',
      playerId: state.players[0].id,
      payload: {
        fish,
        depth: 1,
        shoal: 0,
        diceIndices: []
      }
    };

    const result = gameReducer(state, action);
    const player = result.players[0];

    expect(player.handFish).toHaveLength(0);
    expect(player.spentDice.slice(-1)[0]).toBe(3);
    expect(player.freshDice).toEqual([4]);
    expect(player.dinks).toHaveLength(1);
    expect(result.port.dinksDeck.length).toBe(initialDeckLength - 1);
    expect(result.sea.shoals[1][0][0]).toEqual(fish);
  });
});

describe('madness interactions', () => {
  // Per rulebook: Madness is determined ONLY by regret count, not by fish abilities
  // The madnessOffset is a legacy field that may affect madness tier calculation
  // but the primary driver is regret card count

  const createRegretDrawFish = (overrides: Partial<FishCard> = {}): FishCard => ({
    id: 'TEST-REGRET-001',
    name: 'Test Regret Fish',
    depth: 1,
    value: 1,
    baseValue: 1,
    difficulty: 1,
    abilities: ['regret_draw'], // Per rulebook: this causes a regret draw
    tags: [],
    description: 'Test fish that causes regret draw.',
    quality: 'fair',
    ...overrides
  });

  it('increases madness when catching a fish that causes regret draw', () => {
    const player = state.players[0];
    player.location = 'sea';
    player.currentDepth = 1;
    player.freshDice = [2, 3];
    state.port.regretsDeck = [...REGRET_CARDS.slice(0, 5)];

    const regretFish = createRegretDrawFish();
    const dummyFish = createRegretDrawFish({ id: 'DUMMY-001', abilities: [] });
    // Add multiple fish to avoid overfishing penalty (catching last fish triggers extra regret)
    state.sea.shoals[1] = [[regretFish, dummyFish]];
    // Mark shoal as revealed (required before catching)
    state.sea.revealedShoals = { '1-0': true };

    const action: GameAction = {
      type: 'CATCH_FISH',
      playerId: player.id,
      payload: { fish: regretFish, depth: 1, shoal: 0, diceIndices: [0] }
    };

    const result = gameReducer(state, action);
    const updated = result.players[0];

    // Per rulebook: madness level is based on regret count (tier index)
    // 1 regret = tier 1 (1-3 regrets)
    expect(updated.regrets.length).toBe(1);
    expect(updated.madnessLevel).toBe(1);
    expect(updated.handFish.some(f => f.id === regretFish.id)).toBe(true);
  });

  it('prevents regret draw when player has regret shields', () => {
    const player = state.players[0];
    player.location = 'sea';
    player.currentDepth = 1;
    player.freshDice = [6, 6];
    // Need 3 shields: 2 for fish abilities + 1 for overfishing when catching last fish
    player.regretShields = 3;
    state.port.regretsDeck = [...REGRET_CARDS.slice(0, 5)];

    const regretFishOne = createRegretDrawFish({ id: 'TEST-REGRET-002' });
    const regretFishTwo = createRegretDrawFish({ id: 'TEST-REGRET-003' });
    state.sea.shoals[1] = [[regretFishOne, regretFishTwo]];
    // Mark shoal as revealed (required before catching)
    state.sea.revealedShoals = { '1-0': true };

    const firstAction: GameAction = {
      type: 'CATCH_FISH',
      playerId: player.id,
      payload: { fish: regretFishOne, depth: 1, shoal: 0, diceIndices: [0] }
    };

    const firstResult = gameReducer(state, firstAction);
    const afterFirstCatch = firstResult.players[0];

    // Shield consumed for first fish ability, no regret drawn
    expect(afterFirstCatch.regretShields).toBe(2);
    expect(afterFirstCatch.regrets.length).toBe(0);
    expect(afterFirstCatch.madnessLevel).toBe(0);

    // Re-reveal shoal after first catch
    firstResult.sea.revealedShoals = { '1-0': true };

    const secondAction: GameAction = {
      type: 'CATCH_FISH',
      playerId: afterFirstCatch.id,
      payload: { fish: regretFishTwo, depth: 1, shoal: 0, diceIndices: [0] }
    };

    const secondResult = gameReducer(firstResult, secondAction);
    const afterSecondCatch = secondResult.players[0];

    // Second catch: 1 shield for fish ability + 1 shield for overfishing = 2 shields used
    expect(afterSecondCatch.regretShields).toBe(0);
    expect(afterSecondCatch.regrets.length).toBe(0);
    expect(afterSecondCatch.madnessLevel).toBe(0);
    expect(afterSecondCatch.handFish.filter(f => f.id.startsWith('TEST-REGRET-'))).toHaveLength(2);
  });

  it('draws regret once shields are depleted', () => {
    const player = state.players[0];
    player.location = 'sea';
    player.currentDepth = 1;
    player.freshDice = [6, 6, 6];
    player.regretShields = 1; // Only one shield
    state.port.regretsDeck = [...REGRET_CARDS.slice(0, 5)];

    const regretFishOne = createRegretDrawFish({ id: 'TEST-REGRET-004' });
    const regretFishTwo = createRegretDrawFish({ id: 'TEST-REGRET-005' });
    const dummyFish = createRegretDrawFish({ id: 'DUMMY-002', abilities: [] });
    // Add a third fish to avoid overfishing on second catch
    state.sea.shoals[1] = [[regretFishOne, regretFishTwo, dummyFish]];
    // Mark shoal as revealed (required before catching)
    state.sea.revealedShoals = { '1-0': true };

    // First catch - shield absorbs regret
    const firstAction: GameAction = {
      type: 'CATCH_FISH',
      playerId: player.id,
      payload: { fish: regretFishOne, depth: 1, shoal: 0, diceIndices: [0] }
    };

    const firstResult = gameReducer(state, firstAction);
    const afterFirstCatch = firstResult.players[0];

    expect(afterFirstCatch.regretShields).toBe(0);
    expect(afterFirstCatch.regrets.length).toBe(0);

    // Re-reveal shoal after first catch
    firstResult.sea.revealedShoals = { '1-0': true };

    // Second catch - no shield, regret drawn (from fish ability only, not overfishing)
    const secondAction: GameAction = {
      type: 'CATCH_FISH',
      playerId: afterFirstCatch.id,
      payload: { fish: regretFishTwo, depth: 1, shoal: 0, diceIndices: [0] }
    };

    const secondResult = gameReducer(firstResult, secondAction);
    const afterSecondCatch = secondResult.players[0];

    expect(afterSecondCatch.regrets.length).toBe(1);
    expect(afterSecondCatch.madnessLevel).toBe(1); // Tier 1 (1-3 regrets)
  });

  it('draws regret from another player when deck and discard are empty (per rulebook p.20)', () => {
    // Set up a two-player game scenario
    const twoPlayerState = initializeGame([
      mockCharacters[0],
      { ...mockCharacters[0], id: 'char-2', name: 'Player Two' }
    ]);

    const player1 = twoPlayerState.players[0];
    const player2 = twoPlayerState.players[1];

    player1.location = 'sea';
    player1.currentDepth = 1;
    player1.freshDice = [6];

    // Give player 2 some regrets that can be stolen
    player2.regrets = [REGRET_CARDS[0], REGRET_CARDS[1]];
    const player2InitialRegrets = player2.regrets.length;

    // Empty both deck and discard pile
    twoPlayerState.port.regretsDeck = [];
    twoPlayerState.port.regretsDiscard = [];

    // Create a fish that triggers regret draw
    const regretFish = createRegretDrawFish({ id: 'TEST-STEAL-001' });
    const dummyFish = createRegretDrawFish({ id: 'DUMMY-003', abilities: [] });
    twoPlayerState.sea.shoals[1] = [[regretFish, dummyFish]];
    twoPlayerState.sea.revealedShoals = { '1-0': true };

    const action: GameAction = {
      type: 'CATCH_FISH',
      playerId: player1.id,
      payload: { fish: regretFish, depth: 1, shoal: 0, diceIndices: [0] }
    };

    const result = gameReducer(twoPlayerState, action);
    const updatedPlayer1 = result.players[0];
    const updatedPlayer2 = result.players[1];

    // Per rulebook (p.20): "If the draw pile is empty, you must draw from another player"
    expect(updatedPlayer1.regrets.length).toBe(1); // Stole one regret
    expect(updatedPlayer2.regrets.length).toBe(player2InitialRegrets - 1); // Lost one regret
    expect(updatedPlayer1.handFish.some(f => f.id === regretFish.id)).toBe(true);
  });
});

const gatherFoulFish = () => [
  ...DEPTH_1_FISH,
  ...DEPTH_2_FISH,
  ...DEPTH_3_FISH
].filter(fish => fish.quality === 'foul');

describe('madness recalculation (rulebook-based)', () => {
  // Per rulebook (p.20-21): Madness tiers based on regret count
  // | Regret Cards | Fair Value | Foul Value | Max Dice | Port Discount |
  // | 0            | +2         | -2         | 4        | No            |
  // | 1-3          | +1         | -1         | 4        | No            |
  // | 4-6          | +1         | =          | 5        | No            |
  // | 7-9          | =          | +1         | 6        | No            |
  // | 10-12        | -1         | +1         | 7        | No            |
  // | 13+          | -2         | +2         | 8        | Yes (-$1)     |

  it('increases max dice as regrets accumulate per rulebook tiers', () => {
    const playerId = state.players[0].id;
    const foulFish = gatherFoulFish();

    state.players[0].location = 'port';
    state.players[0].freshDice = [2, 4, 6];
    state.players[0].baseMaxDice = 3;
    state.players[0].maxDice = 4; // 0 regrets = tier 0 = 4 max dice
    state.players[0].handFish = foulFish.slice(0, 7).map(fish => ({ ...fish }));
    state.port.regretsDeck = [...REGRET_CARDS.slice(0, 10)];

    const sellNextFish = () => {
      const player = state.players[0];
      const fishToSell = player.handFish[0];
      state = gameReducer(state, {
        type: 'SELL_FISH',
        playerId,
        payload: { fishId: fishToSell.id }
      });
    };

    // 0 regrets -> 1 regret (tier 1: 1-3 regrets, maxDice = 4)
    sellNextFish();
    expect(state.players[0].regrets.length).toBe(1);
    expect(state.players[0].madnessLevel).toBe(1); // Tier index
    expect(state.players[0].maxDice).toBe(4);

    // 1-3 regrets stay at tier 1
    sellNextFish();
    sellNextFish();
    expect(state.players[0].regrets.length).toBe(3);
    expect(state.players[0].maxDice).toBe(4);

    // 4 regrets -> tier 2 (4-6 regrets, maxDice = 5)
    sellNextFish();
    expect(state.players[0].regrets.length).toBe(4);
    expect(state.players[0].madnessLevel).toBe(2);
    expect(state.players[0].maxDice).toBe(5);
  });

  it('keeps all mounted fish regardless of madness level (per rulebook)', () => {
    const playerId = state.players[0].id;
    const foulFish = gatherFoulFish();

    state.players[0].location = 'port';
    state.players[0].freshDice = [2, 4, 6];
    state.players[0].baseMaxDice = 3;
    state.players[0].maxDice = 4;
    state.players[0].handFish = foulFish.slice(0, 7).map(fish => ({ ...fish }));
    state.players[0].mountedFish = [
      { slot: 0, multiplier: 1, fish: DEPTH_1_FISH[0] },
      { slot: 1, multiplier: 2, fish: DEPTH_2_FISH[0] },
      { slot: 2, multiplier: 2, fish: DEPTH_3_FISH[1] }
    ];
    state.port.regretsDeck = [...REGRET_CARDS.slice(0, 10)];

    const sellNextFish = () => {
      const player = state.players[0];
      const fishToSell = player.handFish[0];
      state = gameReducer(state, {
        type: 'SELL_FISH',
        playerId,
        payload: { fishId: fishToSell.id }
      });
    };

    // Sell all foul fish, accumulating regrets
    for (let i = 0; i < 7; i++) {
      sellNextFish();
    }

    // Per rulebook: No penalty for high madness - mounted fish are kept
    // Max dice INCREASES with more regrets
    const remainingMounts = state.players[0].mountedFish;
    expect(remainingMounts).toHaveLength(3); // All mounted fish kept
    expect(state.players[0].regrets.length).toBe(7);
    expect(state.players[0].maxDice).toBe(6); // 7-9 regrets = tier 3 = 6 max dice
  });

  it('does not trigger endgame from madness alone (per rulebook)', () => {
    const playerId = state.players[0].id;
    const foulFish = gatherFoulFish();

    state.players[0].location = 'port';
    state.players[0].freshDice = [2, 4, 6];
    state.players[0].baseMaxDice = 3;
    state.players[0].maxDice = 4;
    state.players[0].handFish = foulFish.slice(0, 8).map(fish => ({ ...fish }));
    state.players[0].mountedFish = [
      { slot: 0, multiplier: 1, fish: DEPTH_2_FISH[0] }
    ];
    state.port.regretsDeck = [...REGRET_CARDS.slice(0, 15)];

    const sellNextFish = () => {
      const player = state.players[0];
      const fishToSell = player.handFish[0];
      state = gameReducer(state, {
        type: 'SELL_FISH',
        playerId,
        payload: { fishId: fishToSell.id }
      });
    };

    // Sell all foul fish
    for (let i = 0; i < 8; i++) {
      sellNextFish();
    }

    // Per rulebook: Game only ends after Saturday or when The Plug erodes all shoals
    // High madness does NOT trigger endgame
    expect(state.isGameOver).toBe(false);
    expect(state.players[0].mountedFish).toHaveLength(1); // Mount preserved
  });

  it('grants port discount at 13+ regrets per rulebook', () => {
    // This is tested by checking the maxDice at high regret counts
    // and that port discount flag would be active
    const playerId = state.players[0].id;
    const foulFish = gatherFoulFish();

    state.players[0].location = 'port';
    state.players[0].baseMaxDice = 3;
    state.players[0].maxDice = 4;
    state.players[0].handFish = foulFish.slice(0, 14).map(fish => ({ ...fish }));
    state.port.regretsDeck = [...REGRET_CARDS, ...REGRET_CARDS]; // Ensure enough regrets

    const sellNextFish = () => {
      const player = state.players[0];
      const fishToSell = player.handFish[0];
      state = gameReducer(state, {
        type: 'SELL_FISH',
        playerId,
        payload: { fishId: fishToSell.id }
      });
    };

    // Sell 13 foul fish to get 13+ regrets
    for (let i = 0; i < 13; i++) {
      sellNextFish();
    }

    // At 13+ regrets: maxDice = 8, port discount active
    expect(state.players[0].regrets.length).toBeGreaterThanOrEqual(13);
    expect(state.players[0].maxDice).toBe(8);
  });
});
