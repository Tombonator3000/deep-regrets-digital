export type GamePhase = 'start' | 'refresh' | 'declaration' | 'action' | 'endgame';
export type Day = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
export type Location = 'sea' | 'port';
export type Depth = 1 | 2 | 3;
export type FishSize = 'small' | 'mid' | 'large';

export interface FishCard {
  id: string;
  name: string;
  depth: Depth;
  size: FishSize;
  value: number;
  baseValue: number;
  difficulty: number;
  abilities: string[];
  tags: string[];
  description: string;
  image?: string;
  quality: 'fair' | 'foul';
}

export interface RegretCard {
  id: string;
  frontText: string;
  value: number; // 0-3, hidden from other players
}

export interface UpgradeCard {
  id: string;
  name: string;
  type: 'rod' | 'reel' | 'supply';
  cost: number;
  effects: string[];
  equipSlot: string;
  description: string;
}

export interface DinkCard {
  id: string;
  name: string;
  timing: string[];
  effects: string[];
  oneShot: boolean;
  description: string;
}

export interface TackleDie {
  id: string;
  name: string;
  color: string;
  cost: number;
  faces: number[];
  description: string;
}

export interface Player {
  id: string;
  name: string;
  character: string;
  location: Location;
  currentDepth: Depth;
  freshDice: number[];
  spentDice: number[];
  tackleDice: string[];
  maxDice: number;
  baseMaxDice: number;
  maxMountSlots: number;
  regretShields: number;
  rerollOnes: boolean;
  fishbucks: number;
  handFish: FishCard[];
  mountedFish: Array<{
    slot: number;
    multiplier: number;
    fish: FishCard;
  }>;
  regrets: RegretCard[];
  equippedRod?: UpgradeCard;
  equippedReel?: UpgradeCard;
  supplies: UpgradeCard[];
  dinks: DinkCard[];
  activeEffects: string[];
  madnessLevel: number;
  madnessOffset: number;
  lifeboatFlipped: boolean;
  canOfWormsFaceUp: boolean;
  hasPassed: boolean;
  isAI?: boolean;
  aiDifficulty?: 'easy' | 'medium' | 'hard';
}

export interface GameState {
  gameId: string;
  players: Player[];
  currentPlayerIndex: number;
  firstPlayerIndex: number;
  day: Day;
  phase: GamePhase;
  sea: {
    shoals: {
      [depth: number]: FishCard[][];
    };
    graveyards: {
      [depth: number]: FishCard[];
    };
    revealedShoals: {
      [key: string]: boolean; // key format: "depth-shoal" e.g. "1-0"
    };
    plugActive: boolean;
    plugCursor: {
      depth: number;
      shoal: number;
    };
  };
  port: {
    shops: {
      rods: UpgradeCard[];
      reels: UpgradeCard[];
      supplies: UpgradeCard[];
    };
    dinksDeck: DinkCard[];
    regretsDeck: RegretCard[];
    regretsDiscard: RegretCard[];
  };
  lifePreserverOwner?: string;
  fishCoinOwner?: string;
  omenDieValue: number;
  isGameOver: boolean;
  winner?: string;
  lastPlayerTurnsRemaining?: number; // For last-to-pass rule: 2 at sea, 4 at port
  pendingDiceRemoval?: {
    playerId: string;
    count: number; // Number of dice that need to be removed
  };
  pendingLifePreserverGift?: {
    fromPlayerId: string; // Player who must give away the Life Preserver
  };
  pendingPassingReward?: {
    playerId: string; // Player who can choose their passing reward
  };
  lifePreserverDifficultyReduction?: number; // Current difficulty reduction from Life Preserver (0 or 2)
}

// Specific action payload types for type safety
export interface InitGamePayload {
  gameId: string;
  players: Player[];
  currentPlayerIndex: number;
  firstPlayerIndex: number;
  day: Day;
  phase: GamePhase;
  sea: GameState['sea'];
  port: GameState['port'];
  lifePreserverOwner?: string;
  fishCoinOwner?: string;
  omenDieValue: number;
  isGameOver: boolean;
  winner?: string;
}

export interface ChangeLocationPayload {
  location: Location;
}

export interface RevealFishPayload {
  depth: number;
  shoal: number;
}

export interface DescendPayload {
  targetDepth: number;
}

export interface CatchFishPayload {
  fish: FishCard;
  depth: number;
  shoal: number;
  diceIndices: number[];
  tackleDiceIndices?: number[];
}

export interface SellFishPayload {
  fishId: string;
}

export interface BuyUpgradePayload {
  upgradeId: string;
}

export interface BuyTackleDicePayload {
  dieId: string;
  count: number;
}

export interface MountFishPayload {
  fishId: string;
  slot: number;
}

export interface MoveToDepthPayload {
  newDepth: number;
}

export interface RemoveDiePayload {
  dieIndex: number; // Index of the die to remove from freshDice
}

export interface EatFishPayload {
  fishId: string;
}

export interface UseCanOfWormsPayload {
  depth: number;
  shoal: number;
  moveToBottom: boolean; // true = move to bottom, false = keep on top
}

// Union type for all game actions
export interface UseLifePreserverPayload {
  targetPlayerId?: string; // For giving the Life Preserver to another player
  useType?: 'reduce_fish_difficulty' | 'reduce_shop_cost'; // How to use it
  fishId?: string; // Target fish when reducing difficulty
  upgradeId?: string; // Target upgrade when reducing shop cost
}

export interface PassingRewardPayload {
  choice: 'draw_dink' | 'discard_regret';
}

export type GameAction =
  | { type: 'INIT_GAME'; playerId: string; payload: GameState }
  | { type: 'RESET_GAME'; playerId: string; payload: Record<string, never> }
  | { type: 'CHANGE_LOCATION'; playerId: string; payload: ChangeLocationPayload }
  | { type: 'DECLARE_LOCATION'; playerId: string; payload: ChangeLocationPayload }
  | { type: 'REVEAL_FISH'; playerId: string; payload: RevealFishPayload }
  | { type: 'DESCEND'; playerId: string; payload: DescendPayload }
  | { type: 'MOVE_DEEPER'; playerId: string; payload: MoveToDepthPayload }
  | { type: 'CATCH_FISH'; playerId: string; payload: CatchFishPayload }
  | { type: 'SELL_FISH'; playerId: string; payload: SellFishPayload }
  | { type: 'BUY_UPGRADE'; playerId: string; payload: BuyUpgradePayload }
  | { type: 'BUY_TACKLE_DICE'; playerId: string; payload: BuyTackleDicePayload }
  | { type: 'USE_LIFE_PRESERVER'; playerId: string; payload: UseLifePreserverPayload }
  | { type: 'GIVE_LIFE_PRESERVER'; playerId: string; payload: { targetPlayerId: string } }
  | { type: 'DRAW_DINK'; playerId: string; payload: Record<string, never> }
  | { type: 'DISCARD_REGRET'; playerId: string; payload: Record<string, never> }
  | { type: 'DISCARD_RANDOM_REGRET'; playerId: string; payload: Record<string, never> }
  | { type: 'MOUNT_FISH'; playerId: string; payload: MountFishPayload }
  | { type: 'ROLL_DICE'; playerId: string; payload: Record<string, never> }
  | { type: 'PASS'; playerId: string; payload: Record<string, never> }
  | { type: 'CLAIM_PASSING_REWARD'; playerId: string; payload: PassingRewardPayload }
  | { type: 'NEXT_PHASE'; playerId: string; payload: Record<string, never> }
  | { type: 'END_TURN'; playerId: string; payload: Record<string, never> }
  | { type: 'REMOVE_DIE'; playerId: string; payload: RemoveDiePayload }
  | { type: 'EAT_FISH'; playerId: string; payload: EatFishPayload }
  | { type: 'USE_CAN_OF_WORMS'; playerId: string; payload: UseCanOfWormsPayload };

export interface CharacterOption {
  id: string;
  name: string;
  title: string;
  description: string;
  startingBonus: string;
  portrait: string;
}