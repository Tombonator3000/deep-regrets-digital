export type GamePhase = 'start' | 'refresh' | 'declaration' | 'action' | 'endgame';
export type Day = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
export type Location = 'sea' | 'port';
export type Depth = 1 | 2 | 3;

export interface FishCard {
  id: string;
  name: string;
  depth: Depth;
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
  madnessLevel: number;
  lifeboatFlipped: boolean;
  canOfWormsFaceUp: boolean;
  hasPassed: boolean;
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
}

export interface GameAction {
  type: string;
  playerId: string;
  payload: any;
}

export interface CharacterOption {
  id: string;
  name: string;
  title: string;
  description: string;
  startingBonus: string;
  portrait: string;
}