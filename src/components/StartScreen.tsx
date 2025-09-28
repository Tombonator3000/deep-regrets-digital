import { useState } from 'react';
import { Button } from '@/components/ui/button';
import logoImage from '@/assets/deep-regrets-logo.jpg';

interface StartScreenProps {
  onStartGame: (playerCount: number) => void;
}

export const StartScreen = ({ onStartGame }: StartScreenProps) => {
  const [playerCount, setPlayerCount] = useState(2);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative">
      {/* Animated background particles */}
      <div className="ocean-particles">
        {Array.from({ length: 20 }).map((_, i) => (
          <div 
            key={i}
            className="particle animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 8}s`
            }}
          />
        ))}
      </div>
      
      {/* Tentacle shadows */}
      <div className="tentacle-shadow" />
      
      {/* Main content */}
      <div className="relative z-10 text-center space-y-8 max-w-2xl mx-auto px-6">
        {/* Logo - Clickable */}
        <div className="mb-8 relative group">
          <img 
            src={logoImage} 
            alt="Deep Regrets - An Unfortunate Fishing Game"
            className="w-full max-w-md mx-auto rounded-xl shadow-2xl animate-tentacle-sway cursor-pointer hover:scale-105 transition-transform duration-300"
            onClick={() => onStartGame(2)} // Default to 2 players when clicking logo
            title="Click to start with 2 players"
          />
          <div className="absolute inset-0 border-2 border-primary/0 group-hover:border-primary/50 rounded-xl transition-colors duration-300 pointer-events-none" />
          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="bg-primary text-primary-foreground px-3 py-1 rounded-lg text-xs font-medium shadow-lg">
              Click to Quick Start! ⚡
            </div>
          </div>
        </div>
        
        {/* Title and subtitle */}
        <div className="space-y-4">
          <h1 className="text-6xl font-bold bg-gradient-to-b from-primary-glow to-primary bg-clip-text text-transparent">
            DEEP REGRETS
          </h1>
          <p className="text-xl text-muted-foreground italic">
            An Unfortunate Fishing Game
          </p>
          <p className="text-lg text-foreground/80 max-w-lg mx-auto">
            Venture into the dark depths of the ocean, catch eldritch fish, and manage your growing regrets 
            in this push-your-luck fishing adventure.
          </p>
          <p className="text-sm text-primary-glow italic">
            💡 Tip: Click the logo above to quick-start with 2 players!
          </p>
        </div>
        
        {/* Player count selection */}
        <div className="card-game p-6 space-y-4">
          <h3 className="text-xl font-semibold text-card-foreground">Select Players</h3>
          <div className="flex justify-center space-x-4">
            {[1, 2, 3, 4, 5].map((count) => (
              <Button
                key={count}
                variant={playerCount === count ? "default" : "outline"}
                size="lg"
                onClick={() => setPlayerCount(count)}
                className={`w-12 h-12 ${
                  playerCount === count 
                    ? 'btn-ocean' 
                    : 'border-primary/30 hover:border-primary'
                }`}
              >
                {count}
              </Button>
            ))}
          </div>
          <p className="text-sm text-muted-foreground">
            {playerCount === 1 ? 'Solo Mode' : `${playerCount} Players`}
          </p>
        </div>
        
        {/* Start button */}
        <Button 
          size="lg"
          onClick={() => onStartGame(playerCount)}
          className="btn-ocean text-lg px-8 py-4 font-bold"
        >
          Begin Your Voyage
        </Button>
        
        {/* Game info */}
        <div className="card-game p-4 text-sm text-muted-foreground space-y-2">
          <p><strong>Game Time:</strong> ~30 minutes per player</p>
          <p><strong>Objective:</strong> Catch valuable fish while managing regrets</p>
          <p><strong>Warning:</strong> The deeper you go, the greater the rewards... and the horror</p>
        </div>
      </div>
    </div>
  );
};