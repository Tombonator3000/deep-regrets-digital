import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { calculatePlayerScoreBreakdown } from "@/utils/gameEngine";
import { GameState, RegretCard as RegretCardType, Player } from "@/types/game";
import { Trophy, RefreshCw, Home, Anchor, Skull, ChevronDown, ChevronUp } from "lucide-react";
import { ConfettiBurst, AnimatedCounter } from "./ParticleEffects";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { RegretCard } from "./RegretCard";

interface EndGameScreenProps {
  gameState: GameState;
  onRestartGame: () => void;
  onBackToStart: () => void;
}

export const EndGameScreen = ({ gameState, onRestartGame, onBackToStart }: EndGameScreenProps) => {
  const [showConfetti, setShowConfetti] = useState(false);
  const [expandedRegrets, setExpandedRegrets] = useState<string | null>(null);
  const [selectedRegret, setSelectedRegret] = useState<{ regret: RegretCardType; player: Player } | null>(null);

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
    <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-[100] p-4 overflow-y-auto">
      {/* Winner confetti celebration */}
      <ConfettiBurst active={showConfetti} />
      <div className="card-game w-full max-w-3xl space-y-5 p-6 sm:p-8 border border-primary/30 shadow-xl shadow-primary/20 my-4 max-h-[95vh] overflow-y-auto">
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

        {/* Regrets Section - The funny part! */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Skull className="h-5 w-5 text-destructive" />
              Regrets
            </h3>
            <p className="text-xs text-muted-foreground">Klikk for å se detaljene</p>
          </div>
          <div className="space-y-2">
            {sortedFinalScores.map(({ player, breakdown }) => {
              const isExpanded = expandedRegrets === player.id;
              const totalRegretValue = player.regrets.reduce((sum, r) => sum + r.value, 0);

              return (
                <div
                  key={`regrets-${player.id}`}
                  className="rounded-lg border border-destructive/30 bg-gradient-to-b from-slate-900/80 to-red-950/20 overflow-hidden"
                >
                  <button
                    onClick={() => setExpandedRegrets(isExpanded ? null : player.id)}
                    className="w-full flex items-center justify-between p-3 hover:bg-destructive/5 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground">{player.name}</span>
                      {player.isAI && (
                        <Badge variant="outline" className="border-purple-400/60 text-purple-200 text-xs">AI</Badge>
                      )}
                      <Badge variant="destructive" className="text-xs">
                        {player.regrets.length} {player.regrets.length === 1 ? 'regret' : 'regrets'}
                      </Badge>
                      {totalRegretValue > 0 && (
                        <span className="text-xs text-destructive">(-{totalRegretValue} poeng)</span>
                      )}
                    </div>
                    {player.regrets.length > 0 && (
                      isExpanded ? (
                        <ChevronUp className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      )
                    )}
                  </button>

                  {isExpanded && player.regrets.length > 0 && (
                    <div className="px-3 pb-3 border-t border-destructive/20">
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 pt-3">
                        {player.regrets.map((regret, index) => (
                          <div
                            key={`${regret.id}-${index}`}
                            onClick={() => setSelectedRegret({ regret, player })}
                            className="flex flex-col items-center gap-1 p-2 rounded-lg bg-black/30 border border-white/10 cursor-pointer hover:bg-destructive/10 hover:border-destructive/30 transition-colors"
                          >
                            <RegretCard regret={regret} faceUp={true} size="sm" />
                            <div className="text-[10px] text-center text-white/70 line-clamp-2">{regret.frontText}</div>
                            <div className="text-xs font-bold text-destructive">-{regret.value}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {isExpanded && player.regrets.length === 0 && (
                    <div className="px-3 pb-3 border-t border-destructive/20 pt-3">
                      <p className="text-center text-sm text-muted-foreground italic">
                        Ingen regrets! En ren samvittighet... eller bare flaks?
                      </p>
                    </div>
                  )}
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

      {/* Regret Detail Dialog */}
      <Dialog open={selectedRegret !== null} onOpenChange={(open) => !open && setSelectedRegret(null)}>
        <DialogContent className="sm:max-w-md bg-gradient-to-b from-slate-900 to-red-950/80 border-destructive/30">
          <DialogHeader>
            <DialogTitle className="text-xl text-destructive flex items-center gap-2">
              <Skull className="h-5 w-5" />
              {selectedRegret?.player.name}'s Regret
            </DialogTitle>
          </DialogHeader>
          {selectedRegret && (
            <div className="space-y-4 pt-2">
              <div className="flex justify-center">
                <RegretCard regret={selectedRegret.regret} faceUp={true} size="lg" />
              </div>
              <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4">
                <p className="text-base text-white/90 italic text-center">
                  "{selectedRegret.regret.frontText}"
                </p>
              </div>
              <DialogDescription className="text-sm text-muted-foreground text-center">
                Denne regret ga <span className="text-destructive font-bold">-{selectedRegret.regret.value}</span> poeng.
              </DialogDescription>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
