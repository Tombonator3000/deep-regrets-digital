import { useState } from 'react';
import { GameState, Player, FishCard } from '@/types/game';
import { SeaBoard } from './game/SeaBoard';
import { PortBoard } from './game/PortBoard';
import { PlayerPanel } from './game/PlayerPanel';
import { DayTracker } from './game/DayTracker';
import { ActionPanel } from './game/ActionPanel';
import { Button } from '@/components/ui/button';

interface GameBoardProps {
  gameState: GameState;
  onAction: (action: any) => void;
  onNewGame: () => void;
}

export const GameBoard = ({ gameState, onAction, onNewGame }: GameBoardProps) => {
  const [selectedShoal, setSelectedShoal] = useState<{depth: number, shoal: number} | null>(null);
  const [selectedCard, setSelectedCard] = useState<FishCard | null>(null);
  
  const currentPlayer = gameState.players[gameState.currentPlayerIndex];
  const isPlayerTurn = !currentPlayer.hasPassed;

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
            <div className="space-y-2">
              <h3 className="font-semibold">Final Scores:</h3>
              {gameState.players
                .sort((a, b) => calculateScore(b) - calculateScore(a))
                .map((player, index) => (
                  <div key={player.id} className="flex justify-between">
                    <span className={index === 0 ? 'text-primary-glow font-bold' : ''}>
                      {player.name}
                    </span>
                    <span className={index === 0 ? 'text-primary-glow font-bold' : ''}>
                      {calculateScore(player)} pts
                    </span>
                  </div>
                ))}
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
      <div className="relative z-10 h-screen flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-border">
          <DayTracker day={gameState.day} phase={gameState.phase} />
          <div className="text-center">
            <h1 className="text-2xl font-bold text-primary-glow">DEEP REGRETS</h1>
            <p className="text-sm text-muted-foreground">Digital Edition</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Current Player</p>
            <p className="font-bold text-primary">{currentPlayer.name}</p>
          </div>
        </div>
        
        {/* Game Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Side - Sea Board */}
          <div className="flex-1 p-4 overflow-auto">
            <SeaBoard 
              gameState={gameState}
              selectedShoal={selectedShoal}
              onShoalSelect={setSelectedShoal}
              onAction={onAction}
            />
          </div>
          
          {/* Right Side - Port and Player Info */}
          <div className="w-96 border-l border-border flex flex-col">
            {/* Port Board */}
            <div className="flex-1 p-4 overflow-auto">
              <PortBoard 
                gameState={gameState}
                onAction={onAction}
              />
            </div>
            
            {/* Player Panel */}
            <div className="border-t border-border">
              <PlayerPanel 
                player={currentPlayer}
                isCurrentPlayer={isPlayerTurn}
                onAction={onAction}
              />
            </div>
          </div>
        </div>
        
        {/* Bottom Action Panel */}
        <div className="border-t border-border">
          <ActionPanel 
            gameState={gameState}
            selectedShoal={selectedShoal}
            selectedCard={selectedCard}
            onAction={onAction}
          />
        </div>
      </div>
    </div>
  );
};

// Helper function to calculate player score
const calculateScore = (player: Player): number => {
  return player.mountedFish.reduce((total, mount) => {
    return total + (mount.fish.value * mount.multiplier);
  }, 0);
};