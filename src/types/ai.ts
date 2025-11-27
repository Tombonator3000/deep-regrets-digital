import { GameAction, GameState, Player, Location, FishCard, Depth } from './game';

export type AIDifficulty = 'easy' | 'medium' | 'hard';

export type AIStrategy = 'aggressive' | 'balanced' | 'conservative';

export interface AIConfig {
  difficulty: AIDifficulty;
  strategy: AIStrategy;
  thinkingDelay: number; // ms delay to simulate "thinking"
}

export interface AIDecision {
  action: GameAction;
  confidence: number; // 0-1, how confident the AI is in this decision
  reasoning?: string; // For debugging purposes
}

export interface AIEvaluation {
  expectedValue: number;
  riskLevel: number; // 0-1
  priority: number;
}

export interface FishCatchEvaluation {
  fish: FishCard;
  depth: Depth;
  shoalIndex: number;
  successProbability: number;
  expectedValue: number;
  regretRisk: boolean;
  diceRequired: number[];
  tackleDiceRequired: number[];
}

export interface LocationDecision {
  location: Location;
  score: number;
  reasoning: string;
}

export interface AIContext {
  gameState: GameState;
  player: Player;
  playerIndex: number;
  isLeading: boolean;
  daysRemaining: number;
  opponentScores: number[];
}

export const DEFAULT_AI_CONFIG: AIConfig = {
  difficulty: 'medium',
  strategy: 'balanced',
  thinkingDelay: 800
};

export const AI_DIFFICULTY_CONFIGS: Record<AIDifficulty, Partial<AIConfig>> = {
  easy: {
    thinkingDelay: 500
  },
  medium: {
    thinkingDelay: 800
  },
  hard: {
    thinkingDelay: 1000
  }
};
