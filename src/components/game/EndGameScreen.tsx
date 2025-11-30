import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { calculatePlayerScoreBreakdown } from "@/utils/gameEngine";
import { GameState } from "@/types/game";
import { Trophy, RefreshCw, Home, Anchor } from "lucide-react";
import { ConfettiBurst, AnimatedCounter } from "./ParticleEffects";

interface EndGameScreenProps {
  gameState: GameState;
  onRestartGame: () => void;
  onBackToStart: () => void;
}

export const EndGameScreen = ({ gameState, onRestartGame, onBackToStart }: EndGameScreenProps) => {
  const [showConfetti, setShowConfetti] = useState(false);

  const finalScores = gameState.players.map(player => ({
    player,
    breakdown: calculatePlayerScoreBreakdown(player)
  }));

  const sortedFinalScores = [...finalScores].sort((a, b) =>
    b.breakdown.totalScore - a.breakdown.totalScore
  );

  const winner = sortedFinalScores[0];

  // Trigger confetti on mount
  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(true), 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-[100] p-4">
      {/* Winner confetti celebration */}
      <ConfettiBurst active={showConfetti} />
      <div className="card-game w-full max-w-3xl space-y-5 p-6 sm:p-8 border border-primary/30 shadow-xl shadow-primary/20">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-primary">Expedition Complete</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-primary-glow">Game Over</h2>
            {gameState.winner && (
              <p className="text-muted-foreground mt-1">The crew sails home in glory.</p>
            )}
          </div>
          <Badge className="flex items-center gap-1 rounded-full bg-primary/10 text-primary border border-primary/40">
            <Anchor className="h-3.5 w-3.5" />
            Final Day: {gameState.day}
          </Badge>
        </div>

        {winner && (
          <div className="flex items-center gap-4 rounded-xl border border-primary/40 bg-primary/5 p-4 shadow-inner">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-background shadow-lg shadow-primary/40">
              <Trophy className="h-7 w-7" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Winner</p>
              <p className="text-xl font-bold text-primary-glow leading-tight">
                {winner.player.name}
                {winner.player.isAI && <span className="ml-2 text-xs font-semibold text-purple-200">(AI)</span>}
              </p>
              <p className="text-sm text-muted-foreground">
                Total Score: <span className="font-semibold text-foreground">{winner.breakdown.totalScore} pts</span>
              </p>
            </div>
          </div>
        )}

        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-lg font-semibold">Scoreboard</h3>
            <p className="text-xs text-muted-foreground">Sorted by total score</p>
          </div>
          <div className="space-y-2">
            {sortedFinalScores.map(({ player, breakdown }, index) => {
              const isWinner = winner?.player.id === player.id;
              return (
                <div
                  key={player.id}
                  className={`flex items-start justify-between gap-3 rounded-lg border p-3 sm:p-4 transition ${
                    isWinner
                      ? 'border-primary bg-primary/5 shadow-lg shadow-primary/20'
                      : 'border-border/40 bg-background/50'
                  } ${player.isAI ? 'bg-purple-900/10 border-purple-500/40' : ''}`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                      isWinner ? 'bg-primary text-background' : 'bg-white/10 text-foreground'
                    }`}>
                      #{index + 1}
                    </div>
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-base font-semibold text-foreground">{player.name}</span>
                        {player.isAI && (
                          <Badge variant="outline" className="border-purple-400/60 text-purple-200">AI</Badge>
                        )}
                        {isWinner && (
                          <Badge className="bg-primary text-background hover:bg-primary">Winner</Badge>
                        )}
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                        <div>
                          <p className="font-semibold text-foreground/80">Hand (Madness)</p>
                          <p>{breakdown.handScore}</p>
                        </div>
                        <div>
                          <p className="font-semibold text-foreground/80">Mounted</p>
                          <p>{breakdown.mountedScore}</p>
                        </div>
                        <div>
                          <p className="font-semibold text-foreground/80">Fishbucks</p>
                          <p>{breakdown.fishbuckScore}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary-glow">
                      <AnimatedCounter value={breakdown.totalScore} colorClass="text-primary-glow" />
                    </p>
                    <p className="text-xs text-muted-foreground">points</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Button
            onClick={onRestartGame}
            className="btn-ocean flex items-center justify-center gap-2 min-h-[44px] touch-manipulation active:scale-95"
          >
            <RefreshCw className="h-4 w-4" />
            Play Again
          </Button>
          <Button
            onClick={onBackToStart}
            variant="outline"
            className="border-primary/30 hover:border-primary flex items-center justify-center gap-2 min-h-[44px] touch-manipulation active:scale-95"
          >
            <Home className="h-4 w-4" />
            Back to Start
          </Button>
        </div>
      </div>
    </div>
  );
};
