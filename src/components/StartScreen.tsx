import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import logoImage from '@/assets/deep-regrets-logo.jpg';

interface StartScreenProps {
  onStartGame: (playerCount: number) => void;
}

export const StartScreen = ({ onStartGame }: StartScreenProps) => {
  const [playerCount, setPlayerCount] = useState(2);
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);

  const particles = useMemo(
    () =>
      Array.from({ length: 20 }).map((_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        delay: `${Math.random() * 8}s`,
      })),
    [],
  );

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative">
      {/* Animated background particles */}
      <div className="ocean-particles">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="particle animate-float"
            style={{
              left: particle.left,
              animationDelay: particle.delay,
            }}
          />
        ))}
      </div>
      
      {/* Tentacle shadows */}
      <div className="tentacle-shadow" />
      
      {/* Main content */}
      <div className="relative z-10 text-center space-y-10 max-w-3xl mx-auto px-6 py-12">
        {/* Logo */}
        <div className="mx-auto w-full max-w-lg">
          <img
            src={logoImage}
            alt="Deep Regrets - An Unfortunate Fishing Game"
            className="w-full rounded-xl shadow-2xl animate-tentacle-sway"
          />
        </div>

        {/* Primary menu */}
        <nav aria-label="Start screen menu" className="mx-auto w-full max-w-md">
          <ul className="flex flex-col items-stretch gap-3">
            <li>
              <Button
                type="button"
                size="lg"
                className="btn-ocean w-full justify-center text-lg font-semibold"
                onClick={() => onStartGame(playerCount)}
              >
                New Game
              </Button>
            </li>
            <li>
              <Button
                type="button"
                variant="outline"
                size="lg"
                className="w-full justify-center text-lg"
                onClick={() => setIsOptionsOpen(true)}
              >
                Options
              </Button>
            </li>
            <li>
              <Button asChild variant="ghost" size="lg" className="w-full justify-center text-lg">
                <a
                  href="/Deep%20Regrets%20Rulebook_EN.pdf"
                  target="_blank"
                  rel="noreferrer"
                >
                  How to Play
                </a>
              </Button>
            </li>
          </ul>
        </nav>
        
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
        </div>
        
        {/* Player count selection */}
        <div className="card-game mx-auto max-w-lg p-6 space-y-4">
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
        
        {/* Game info */}
        <div className="card-game mx-auto max-w-2xl p-4 text-sm text-muted-foreground space-y-2">
          <p><strong>Game Time:</strong> ~30 minutes per player</p>
          <p><strong>Objective:</strong> Catch valuable fish while managing regrets</p>
          <p><strong>Warning:</strong> The deeper you go, the greater the rewards... and the horror</p>
        </div>

        <Dialog open={isOptionsOpen} onOpenChange={setIsOptionsOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Options</DialogTitle>
              <DialogDescription>
                Additional configuration for Deep Regrets will live here. Adjust audio, accessibility, and gameplay tweaks once
                they become available.
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};