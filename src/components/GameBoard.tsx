import { useState } from 'react';
import { GameState, FishCard } from '@/types/game';
import { SeaBoard } from './game/SeaBoard';
import { PortBoard } from './game/PortBoard';
import { PlayerPanel } from './game/PlayerPanel';
import { ActionPanel } from './game/ActionPanel';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { calculatePlayerScoreBreakdown } from '@/utils/gameEngine';
import { BubbleField } from '@/components/effects/BubbleField';

interface GameBoardProps {
  gameState: GameState;
  onAction: (action: any) => void;
  onNewGame: () => void;
}

export const GameBoard = ({ gameState, onAction, onNewGame }: GameBoardProps) => {
  const [selectedShoal, setSelectedShoal] = useState<{depth: number, shoal: number} | null>(null);
  const [selectedCard, setSelectedCard] = useState<FishCard | null>(null);
  const [isPortOpen, setIsPortOpen] = useState(false);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  
  const currentPlayer = gameState.players[gameState.currentPlayerIndex];
  const isPlayerTurn = !currentPlayer.hasPassed;
  const phaseDisplay: Record<GameState['phase'], string> = {
    start: 'Start',
    refresh: 'Refresh',
    declaration: 'Declaration',
    action: 'Action',
    endgame: 'Game Over'
  };
  const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const currentDayIndex = dayOrder.indexOf(gameState.day);
  const dayLabel = currentDayIndex >= 0
    ? `Day ${currentDayIndex + 1}: ${gameState.day}`
    : gameState.day;
  const finalScores = gameState.players.map(player => ({
    player,
    breakdown: calculatePlayerScoreBreakdown(player)
  }));
  const sortedFinalScores = [...finalScores].sort((a, b) =>
    b.breakdown.totalScore - a.breakdown.totalScore
  );

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background effects */}
      <div className="ocean-particles">
        {Array.from({ length: 25 }).map((_, i) => (
          <div
            key={i}
            className="particle animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 8}s`,
              animationDuration: `${6 + Math.random() * 4}s`
            }}
          />
        ))}
      </div>
      <BubbleField bubbleCount={72} className="opacity-70" />
      <div className="tentacle-shadow" />
      
      {/* Game Over Overlay */}
      {gameState.isGameOver && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="card-game p-8 text-center space-y-6 max-w-md">
            <h2 className="text-3xl font-bold text-primary-glow">Game Over</h2>
            {gameState.winner && (
              <p className="text-xl">
                🏆 <span className="text-primary-glow font-bold">{gameState.winner}</span> wins!
              </p>
            )}
            <div className="space-y-3 text-left">
              <h3 className="font-semibold text-center">Final Scores:</h3>
              {sortedFinalScores.map(({ player, breakdown }) => {
                const isWinner = gameState.winner === player.name;
                return (
                  <div
                    key={player.id}
                    className={`rounded-md border border-border/40 p-3 transition ${
                      isWinner ? 'border-primary text-primary-glow' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`font-semibold ${isWinner ? 'text-primary-glow' : ''}`}>
                        {player.name}
                      </span>
                      <span className={`font-semibold ${isWinner ? 'text-primary-glow' : ''}`}>
                        {breakdown.totalScore} pts
                      </span>
                    </div>
                    <div className="mt-2 grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                      <div>
                        <span className="block font-semibold text-foreground/80">Hand (Madness)</span>
                        <span>{breakdown.handScore}</span>
                      </div>
                      <div>
                        <span className="block font-semibold text-foreground/80">Mounted</span>
                        <span>{breakdown.mountedScore}</span>
                      </div>
                      <div>
                        <span className="block font-semibold text-foreground/80">Fishbucks</span>
                        <span>{breakdown.fishbuckScore}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <Button onClick={onNewGame} className="btn-ocean">
              New Game
            </Button>
            <Button onClick={onNewGame} variant="outline" className="border-primary/30 hover:border-primary">
              Back to Start
            </Button>
          </div>
        </div>
      )}
      
      {/* Main Game Layout */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8 grid grid-cols-[1.6fr,minmax(320px,0.9fr)] grid-rows-[auto,minmax(0,1fr),auto] gap-6">
        {/* Header */}
        <div className="col-span-2 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/10 bg-background/70 px-6 py-4 backdrop-blur">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold leading-tight text-primary-glow">DEEP REGRETS</h1>
            <p className="text-sm text-muted-foreground">Digital Edition</p>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-3 text-sm">
            <Badge className="rounded-full border-primary/40 bg-primary/10 px-4 py-1 text-sm text-primary">
              Current: <span className="ml-1 font-semibold text-primary">{currentPlayer.name}</span>
            </Badge>
            <Badge variant="outline" className="rounded-full border-white/30 px-4 py-1 text-white">
              {phaseDisplay[gameState.phase]} Phase
            </Badge>
            <Badge variant="secondary" className="rounded-full bg-muted/30 px-4 py-1 text-sm">
              {dayLabel}
            </Badge>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button className="btn-ocean" onClick={() => setIsPortOpen(true)}>
              Open Harbor Port
            </Button>
            <Button variant="outline" className="border-white/30 bg-white/5 backdrop-blur" onClick={() => setIsPlayerOpen(true)}>
              View Captain Sheet
            </Button>
          </div>
        </div>

        {/* Sea Board Column */}
        <div className="row-span-1 overflow-hidden rounded-3xl border border-white/10 bg-background/60 backdrop-blur">
          <div className="h-full overflow-auto p-6">
            <SeaBoard
              gameState={gameState}
              selectedShoal={selectedShoal}
              onShoalSelect={setSelectedShoal}
              onAction={onAction}
            />
          </div>
        </div>

        {/* Status Column */}
        <div className="row-span-1 space-y-6 rounded-3xl border border-white/10 bg-background/50 p-6 backdrop-blur">
          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-primary">Captain's Log</h2>
            <p className="text-sm text-muted-foreground">
              Manage port business and your crew sheet through the modals. Keep your attention on the sea board to steer the day.
            </p>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Location</span>
              <span className="font-semibold text-foreground">
                {currentPlayer.location === 'sea' ? `🌊 At Sea (Depth ${currentPlayer.currentDepth})` : '⚓ In Port'}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Fishbucks</span>
              <span className="font-semibold text-fishbuck">${currentPlayer.fishbucks}</span>
            </div>
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Regrets</span>
              <span className="font-semibold text-destructive">{currentPlayer.regrets.length}</span>
            </div>
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Dice Ready</span>
              <span className="font-semibold text-foreground">
                {currentPlayer.freshDice.length}/{currentPlayer.maxDice}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Madness Level</span>
              <span className="font-semibold text-primary">{currentPlayer.madnessLevel}</span>
            </div>
          </div>
        </div>

        {/* Bottom Action Panel */}
        <div className="col-span-2 rounded-2xl border border-white/10 bg-background/70 p-6 backdrop-blur">
          <ActionPanel
            gameState={gameState}
            selectedShoal={selectedShoal}
            selectedCard={selectedCard}
            onAction={onAction}
          />
        </div>
      </div>

      <Dialog open={isPortOpen} onOpenChange={setIsPortOpen}>
        <DialogContent className="max-w-5xl bg-background/80 backdrop-blur-xl border border-white/20">
          <div className="max-h-[75vh] overflow-y-auto pr-2">
            <PortBoard
              gameState={gameState}
              onAction={onAction}
            />
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isPlayerOpen} onOpenChange={setIsPlayerOpen}>
        <DialogContent className="max-w-4xl bg-background/80 backdrop-blur-xl border border-white/20">
          <div className="max-h-[75vh] overflow-y-auto pr-2">
            <PlayerPanel
              player={currentPlayer}
              isCurrentPlayer={isPlayerTurn}
              onAction={onAction}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
