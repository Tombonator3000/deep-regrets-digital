import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Trophy,
  Fish,
  Coins,
  Skull,
  TrendingUp,
  TrendingDown,
  Star,
  Crown,
  Medal,
  Award
} from 'lucide-react';

interface TrophyFish {
  name: string;
  value: number;
  type: 'fair' | 'foul';
  multiplier: 1 | 2 | 3;
}

interface PlayerScore {
  playerId: string;
  playerName: string;
  fishbucks: number;
  trophyFish: TrophyFish[];
  regrets: number;
  fairModifier: number;
  foulModifier: number;
}

interface ScoringBreakdownProps {
  players: PlayerScore[];
  showDetailed?: boolean;
}

const calculateFishScore = (
  fish: TrophyFish,
  fairModifier: number,
  foulModifier: number
): number => {
  const baseValue = fish.value;
  const modifier = fish.type === 'fair' ? fairModifier : foulModifier;
  const modifiedValue = baseValue + modifier;
  return modifiedValue * fish.multiplier;
};

const calculateTotalScore = (player: PlayerScore): number => {
  const trophyScore = player.trophyFish.reduce(
    (sum, fish) => sum + calculateFishScore(fish, player.fairModifier, player.foulModifier),
    0
  );
  return player.fishbucks + trophyScore;
};

const getRankIcon = (rank: number) => {
  switch (rank) {
    case 1:
      return <Crown className="h-6 w-6 text-yellow-400" />;
    case 2:
      return <Medal className="h-5 w-5 text-slate-300" />;
    case 3:
      return <Award className="h-5 w-5 text-amber-600" />;
    default:
      return <span className="text-lg font-bold text-muted-foreground">#{rank}</span>;
  }
};

export const ScoringBreakdown = ({ players, showDetailed = true }: ScoringBreakdownProps) => {
  // Calculate and sort by total score
  const scoredPlayers = players
    .map(player => ({
      ...player,
      totalScore: calculateTotalScore(player),
      trophyScore: player.trophyFish.reduce(
        (sum, fish) => sum + calculateFishScore(fish, player.fairModifier, player.foulModifier),
        0
      ),
    }))
    .sort((a, b) => b.totalScore - a.totalScore);

  return (
    <div className="space-y-4">
      {/* Winner announcement */}
      {scoredPlayers.length > 0 && (
        <Card className="p-4 bg-gradient-to-br from-yellow-900/40 via-amber-900/30 to-orange-900/40 border-yellow-500/50">
          <div className="text-center space-y-2">
            <div className="flex justify-center">
              <Trophy className="h-12 w-12 text-yellow-400 animate-pulse" />
            </div>
            <h2 className="text-2xl font-black text-yellow-400">
              {scoredPlayers[0].playerName} vinner!
            </h2>
            <div className="text-4xl font-black text-fishbuck">
              ${scoredPlayers[0].totalScore}
            </div>
          </div>
        </Card>
      )}

      {/* All players breakdown */}
      <div className="space-y-3">
        {scoredPlayers.map((player, index) => (
          <Card
            key={player.playerId}
            className={`p-4 transition-all ${
              index === 0
                ? 'bg-gradient-to-r from-yellow-900/30 to-amber-900/20 border-yellow-500/40'
                : 'bg-slate-800/50 border-slate-600/40'
            }`}
          >
            {/* Player header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                {getRankIcon(index + 1)}
                <div>
                  <h3 className="font-bold text-lg">{player.playerName}</h3>
                  <div className="text-xs text-muted-foreground">
                    {player.regrets} regrets (Madness Tier {Math.min(5, Math.floor(player.regrets / 3))})
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-black text-fishbuck">${player.totalScore}</div>
                <div className="text-xs text-muted-foreground">Total</div>
              </div>
            </div>

            {showDetailed && (
              <>
                {/* Score breakdown */}
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div className="p-2 rounded bg-slate-900/50 border border-slate-700/50">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                      <Coins className="h-3 w-3" />
                      <span>Fishbucks</span>
                    </div>
                    <div className="text-lg font-bold text-fishbuck">${player.fishbucks}</div>
                  </div>
                  <div className="p-2 rounded bg-slate-900/50 border border-slate-700/50">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                      <Trophy className="h-3 w-3" />
                      <span>Trofeer</span>
                    </div>
                    <div className="text-lg font-bold text-primary">${player.trophyScore}</div>
                  </div>
                </div>

                {/* Modifiers */}
                <div className="flex gap-2 mb-3">
                  <Badge className={`flex items-center gap-1 ${
                    player.fairModifier > 0 ? 'bg-green-600' : player.fairModifier < 0 ? 'bg-red-600' : 'bg-slate-600'
                  }`}>
                    <TrendingUp className="h-3 w-3" />
                    Fair: {player.fairModifier > 0 ? '+' : ''}{player.fairModifier}
                  </Badge>
                  <Badge className={`flex items-center gap-1 ${
                    player.foulModifier > 0 ? 'bg-green-600' : player.foulModifier < 0 ? 'bg-red-600' : 'bg-slate-600'
                  }`}>
                    <TrendingDown className="h-3 w-3" />
                    Foul: {player.foulModifier > 0 ? '+' : ''}{player.foulModifier}
                  </Badge>
                </div>

                {/* Trophy fish list */}
                {player.trophyFish.length > 0 && (
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground mb-1">Troféveggen:</div>
                    {player.trophyFish.map((fish, fishIndex) => {
                      const fishScore = calculateFishScore(fish, player.fairModifier, player.foulModifier);
                      const modifier = fish.type === 'fair' ? player.fairModifier : player.foulModifier;

                      return (
                        <div
                          key={fishIndex}
                          className={`flex items-center justify-between p-2 rounded text-sm ${
                            fish.type === 'fair'
                              ? 'bg-green-900/20 border border-green-500/30'
                              : 'bg-red-900/20 border border-red-500/30'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <Fish className={`h-4 w-4 ${
                              fish.type === 'fair' ? 'text-green-400' : 'text-red-400'
                            }`} />
                            <span>{fish.name}</span>
                            {fish.multiplier > 1 && (
                              <Badge variant="outline" className="text-[10px]">
                                <Star className="h-2 w-2 mr-0.5" />
                                ×{fish.multiplier}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-xs">
                            <span className="text-muted-foreground">
                              ({fish.value}{modifier !== 0 ? (modifier > 0 ? '+' + modifier : modifier) : ''}) × {fish.multiplier}
                            </span>
                            <span className="font-bold text-fishbuck">${fishScore}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {player.trophyFish.length === 0 && (
                  <div className="text-center py-2 text-sm text-muted-foreground">
                    Ingen trofeer montert
                  </div>
                )}
              </>
            )}
          </Card>
        ))}
      </div>

      {/* Game summary stats */}
      <Card className="p-3 bg-primary/10 border-primary/30">
        <div className="text-center text-sm">
          <span className="text-muted-foreground">Totalt fanget: </span>
          <span className="font-bold text-primary">
            {scoredPlayers.reduce((sum, p) => sum + p.trophyFish.length, 0)} trofeer
          </span>
          <span className="text-muted-foreground"> • Totalt tjent: </span>
          <span className="font-bold text-fishbuck">
            ${scoredPlayers.reduce((sum, p) => sum + p.totalScore, 0)}
          </span>
        </div>
      </Card>
    </div>
  );
};

// Compact scoreboard for during-game display
interface CompactScoreboardProps {
  players: Array<{
    playerId: string;
    playerName: string;
    fishbucks: number;
    trophyCount: number;
    isCurrentPlayer: boolean;
  }>;
}

export const CompactScoreboard = ({ players }: CompactScoreboardProps) => {
  const sortedPlayers = [...players].sort((a, b) => b.fishbucks - a.fishbucks);

  return (
    <Card className="p-2 bg-slate-800/50 border-slate-600/40">
      <div className="text-xs text-muted-foreground mb-1">Stillingen:</div>
      <div className="space-y-1">
        {sortedPlayers.map((player, index) => (
          <div
            key={player.playerId}
            className={`flex items-center justify-between px-2 py-1 rounded ${
              player.isCurrentPlayer
                ? 'bg-primary/20 border border-primary/40'
                : 'bg-slate-700/30'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-muted-foreground">#{index + 1}</span>
              <span className={`text-sm ${player.isCurrentPlayer ? 'font-bold' : ''}`}>
                {player.playerName}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-fishbuck font-medium">${player.fishbucks}</span>
              {player.trophyCount > 0 && (
                <Badge variant="outline" className="text-[10px]">
                  <Trophy className="h-2 w-2 mr-0.5" />
                  {player.trophyCount}
                </Badge>
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
