import { describe, expect, it, beforeEach } from 'vitest';
import { gameReducer, initializeGame } from '../gameEngine';
import { CharacterOption, GameState } from '@/types/game';
import { REGRET_CARDS } from '@/data/regrets';
import { RODS } from '@/data/upgrades';
import { DINK_CARDS } from '@/data/dinks';
import { CHARACTERS } from '@/data/characters';
import { TACKLE_DICE } from '@/data/tackleDice';
import { DEPTH_1_FISH, DEPTH_2_FISH, DEPTH_3_FISH } from '@/data/fish';

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
    const action = {
      type: 'DECLARE_LOCATION',
      playerId: state.players[0].id,
      payload: { location: 'port' }
    };

    const result = gameReducer(state, action);
    const player = result.players[0];

    expect(player.location).toBe('port');
    expect(player.currentDepth).toBe(1);
    expect(player.hasPassed).toBe(false);
  });

  it('descends to a target depth using one qualifying die per level', () => {
    state.players[0].freshDice = [3, 1, 5];

    const action = {
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

    const action = {
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

    const action = {
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

    const action = {
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

    const action = {
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

    const action = {
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

  it('uses the life preserver to discard a regret and flip the lifeboat', () => {
    state.players[0].location = 'port';
    state.players[0].regrets = [REGRET_CARDS[0], REGRET_CARDS[1]];
    state.port.regretsDiscard = [];

    const action = {
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
    expect(player.madnessLevel).toBe(0);
    expect(player.maxDice).toBe(3);
  });

  it('draws a dink card from the deck into the player hand', () => {
    state.players[0].location = 'port';
    state.port.dinksDeck = [...DINK_CARDS.slice(0, 2)];
    const initialDeckLength = state.port.dinksDeck.length;

    const action = {
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

    const action = {
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
    const fish = DEPTH_1_FISH[4];
    state.players[0].freshDice = [2];
    state.sea.shoals[1][0] = [fish];
    state.port.dinksDeck = [...DINK_CARDS.slice(0, 3)];
    const initialDeckLength = state.port.dinksDeck.length;

    const action = {
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
    const initialDeckLength = state.port.dinksDeck.length;

    const action = {
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

const gatherFoulFish = () => [
  ...DEPTH_1_FISH,
  ...DEPTH_2_FISH,
  ...DEPTH_3_FISH
].filter(fish => fish.quality === 'foul');

describe('madness recalculation', () => {
  it('applies madness thresholds and trims dice as regrets accumulate', () => {
    const playerId = state.players[0].id;
    const foulFish = gatherFoulFish();

    state.players[0].location = 'port';
    state.players[0].freshDice = [2, 4, 6];
    state.players[0].baseMaxDice = 3;
    state.players[0].maxDice = 3;
    state.players[0].handFish = foulFish.slice(0, 7).map(fish => ({ ...fish }));
    state.port.regretsDeck = [...REGRET_CARDS.slice(0, 7)];

    const sellNextFish = () => {
      const player = state.players[0];
      const fishToSell = player.handFish[0];
      state = gameReducer(state, {
        type: 'SELL_FISH',
        playerId,
        payload: { fishId: fishToSell.id }
      });
    };

    sellNextFish();
    sellNextFish();
    expect(state.players[0].madnessLevel).toBe(0);
    expect(state.players[0].freshDice).toEqual([2, 4, 6]);

    sellNextFish();
    expect(state.players[0].madnessLevel).toBe(2);
    expect(state.players[0].maxDice).toBe(2);
    expect(state.players[0].freshDice).toEqual([2, 4]);

    sellNextFish();
    sellNextFish();
    expect(state.players[0].madnessLevel).toBe(4);
    expect(state.players[0].maxDice).toBe(1);
    expect(state.players[0].freshDice).toEqual([2]);

    sellNextFish();
    sellNextFish();
    expect(state.players[0].madnessLevel).toBe(6);
    expect(state.players[0].maxDice).toBe(1);
    expect(state.players[0].freshDice).toEqual([2]);
  });

  it('discards the highest-value mounted fish on reaching madness level 6', () => {
    const playerId = state.players[0].id;
    const foulFish = gatherFoulFish();

    state.players[0].location = 'port';
    state.players[0].freshDice = [2, 4, 6];
    state.players[0].baseMaxDice = 3;
    state.players[0].maxDice = 3;
    state.players[0].handFish = foulFish.slice(0, 7).map(fish => ({ ...fish }));
    state.players[0].mountedFish = [
      { slot: 0, multiplier: 1, fish: DEPTH_1_FISH[0] },
      { slot: 1, multiplier: 2, fish: DEPTH_2_FISH[0] },
      { slot: 2, multiplier: 2, fish: DEPTH_3_FISH[1] }
    ];
    state.port.regretsDeck = [...REGRET_CARDS.slice(0, 7)];

    const sellNextFish = () => {
      const player = state.players[0];
      const fishToSell = player.handFish[0];
      state = gameReducer(state, {
        type: 'SELL_FISH',
        playerId,
        payload: { fishId: fishToSell.id }
      });
    };

    for (let i = 0; i < 7; i++) {
      sellNextFish();
    }

    const remainingMounts = state.players[0].mountedFish;
    expect(state.players[0].madnessLevel).toBe(6);
    expect(remainingMounts).toHaveLength(2);
    expect(remainingMounts.find(mount => mount.fish.id === DEPTH_3_FISH[1].id)).toBeUndefined();
  });

  it('forces mounted fish sacrifices instead of collapse when possible', () => {
    const playerId = state.players[0].id;
    const foulFish = gatherFoulFish();

    state.players[0].location = 'port';
    state.players[0].freshDice = [2, 4, 6];
    state.players[0].baseMaxDice = 3;
    state.players[0].maxDice = 3;
    state.players[0].handFish = foulFish.slice(0, 8).map(fish => ({ ...fish }));
    state.players[0].mountedFish = [
      { slot: 0, multiplier: 1, fish: DEPTH_1_FISH[0] },
      { slot: 1, multiplier: 1, fish: DEPTH_2_FISH[1] },
      { slot: 2, multiplier: 2, fish: DEPTH_3_FISH[0] }
    ];
    state.port.regretsDeck = [...REGRET_CARDS.slice(0, 8)];

    const sellNextFish = () => {
      const player = state.players[0];
      const fishToSell = player.handFish[0];
      state = gameReducer(state, {
        type: 'SELL_FISH',
        playerId,
        payload: { fishId: fishToSell.id }
      });
    };

    for (let i = 0; i < 8; i++) {
      sellNextFish();
    }

    expect(state.players[0].madnessLevel).toBe(6);
    expect(state.players[0].mountedFish).toHaveLength(0);
    expect(state.isGameOver).toBe(false);
  });

  it('triggers immediate endgame when collapse cannot discard enough trophies', () => {
    const playerId = state.players[0].id;
    const foulFish = gatherFoulFish();

    state.players[0].location = 'port';
    state.players[0].freshDice = [2, 4, 6];
    state.players[0].baseMaxDice = 3;
    state.players[0].maxDice = 3;
    state.players[0].handFish = foulFish.slice(0, 8).map(fish => ({ ...fish }));
    state.players[0].mountedFish = [
      { slot: 0, multiplier: 1, fish: DEPTH_2_FISH[0] }
    ];
    state.port.regretsDeck = [...REGRET_CARDS.slice(0, 8)];

    const sellNextFish = () => {
      const player = state.players[0];
      const fishToSell = player.handFish[0];
      state = gameReducer(state, {
        type: 'SELL_FISH',
        playerId,
        payload: { fishId: fishToSell.id }
      });
    };

    for (let i = 0; i < 8; i++) {
      sellNextFish();
    }

    expect(state.players[0].madnessLevel).toBe(6);
    expect(state.isGameOver).toBe(true);
    expect(state.phase).toBe('endgame');
  });
});
