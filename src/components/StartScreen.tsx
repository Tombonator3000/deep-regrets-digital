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
import { BubbleField } from '@/components/effects/BubbleField';
import { AudioSettingsPanel } from '@/components/AudioSettingsPanel';

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
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
      <div className="start-screen-scene" aria-hidden>
        <div className="start-screen-sky">
          <div className="start-screen-ship">
            <span className="start-screen-ship-mast" />
            <span className="start-screen-ship-sail" />
            <span className="start-screen-ship-sail start-screen-ship-sail--aft" />
          </div>
        </div>
        <div className="start-screen-waves">
          <div className="start-screen-wave start-screen-wave--front" />
          <div className="start-screen-wave start-screen-wave--mid" />
          <div className="start-screen-wave start-screen-wave--back" />
        </div>
      </div>
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
      <BubbleField bubbleCount={64} className="opacity-80" />

      {/* Tentacle shadows */}
      <div className="tentacle-shadow" />
      
      {/* Main content */}
      <div className="relative z-10 w-full max-w-6xl px-6 py-12 lg:py-16">
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:items-stretch">
          <div className="flex flex-col items-center lg:items-start gap-6 text-center lg:text-left">
            <div className="w-full max-w-lg">
              <img
                src={logoImage}
                alt="Deep Regrets - An Unfortunate Fishing Game"
                className="w-full rounded-xl shadow-2xl animate-tentacle-sway"
              />
            </div>
            <div className="space-y-3 max-w-xl">
              <h1 className="text-5xl lg:text-6xl font-bold bg-gradient-to-b from-primary-glow to-primary bg-clip-text text-transparent">
                DEEP REGRETS
              </h1>
              <p className="text-lg lg:text-xl text-muted-foreground italic">
                An Unfortunate Fishing Game
              </p>
              <p className="text-base lg:text-lg text-foreground/80">
                Venture into the dark depths of the ocean, catch eldritch fish, and manage your growing regrets in this push-your-luck fishing adventure.
              </p>
            </div>
            <div className="card-game w-full max-w-xl p-5 text-sm text-muted-foreground space-y-2">
              <p><strong>Game Time:</strong> ~30 minutes per player</p>
              <p><strong>Objective:</strong> Catch valuable fish while managing regrets</p>
              <p><strong>Warning:</strong> The deeper you go, the greater the rewards... and the horror</p>
            </div>
          </div>

          <div className="flex flex-col justify-center gap-6 lg:gap-8">
            <nav aria-label="Start screen menu" className="w-full max-w-md mx-auto lg:mx-0">
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

            <div className="card-game mx-auto lg:mx-0 w-full max-w-md p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-card-foreground">Select Players</h3>
                <p className="text-sm text-muted-foreground">
                  {playerCount === 1 ? 'Solo Mode' : `${playerCount} Players`}
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-3">
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
            </div>
          </div>
        </div>

        <Dialog open={isOptionsOpen} onOpenChange={setIsOptionsOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Options</DialogTitle>
              <DialogDescription>
                Fine tune your voyage before you descend. Configure music sourced from the muzak archives and test ambient effects.
              </DialogDescription>
            </DialogHeader>
            <div className="mt-6 space-y-6">
              <AudioSettingsPanel />
              <p className="text-xs text-muted-foreground italic">
                Tip: Place MP3 files inside <code>src/assets/muzak</code> to make them available as selectable soundtracks.
              </p>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};