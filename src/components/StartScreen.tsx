import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import logoImage from '@/assets/deep-regrets-logo.jpg';
import { BubbleField } from '@/components/effects/BubbleField';
import { OptionsMenu, useDisplaySettings } from '@/components/OptionsMenu';
import { HelpSystem } from '@/components/HelpSystem';
import { useLanguage } from '@/context/LanguageContext';
import { GraduationCap, Lightbulb, X } from 'lucide-react';

export interface GameSetup {
  humanPlayers: number;
  aiPlayers: number;
  aiDifficulty: 'easy' | 'medium' | 'hard';
}

interface StartScreenProps {
  onStartGame: (playerCount: number, gameSetup?: GameSetup) => void;
}

const FIRST_TIME_KEY = 'deep-regrets-first-time';

export const StartScreen = ({ onStartGame }: StartScreenProps) => {
  const [humanPlayers, setHumanPlayers] = useState(1);
  const [aiPlayers, setAiPlayers] = useState(1);
  const [aiDifficulty, setAiDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [showFirstTimeBanner, setShowFirstTimeBanner] = useState(false);
  const displaySettings = useDisplaySettings();
  const { t } = useLanguage();

  useEffect(() => {
    const hasVisited = localStorage.getItem(FIRST_TIME_KEY);
    if (!hasVisited) {
      setShowFirstTimeBanner(true);
    }
  }, []);

  const dismissFirstTimeBanner = () => {
    localStorage.setItem(FIRST_TIME_KEY, 'true');
    setShowFirstTimeBanner(false);
  };

  const openTutorialAndDismiss = () => {
    localStorage.setItem(FIRST_TIME_KEY, 'true');
    setShowFirstTimeBanner(false);
    setIsHelpOpen(true);
  };

  const totalPlayers = humanPlayers + aiPlayers;
  const maxAiPlayers = 5 - humanPlayers;

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
      {displaySettings.particlesEnabled && (
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
      )}
      {displaySettings.bubblesEnabled && (
        <BubbleField bubbleCount={64} className="opacity-80" />
      )}

      {/* Tentacle shadows */}
      <div className="tentacle-shadow" />
      
      {/* First-time player banner */}
      {showFirstTimeBanner && (
        <div className="fixed inset-x-0 top-0 z-50 p-4">
          <Alert className="mx-auto max-w-2xl border-primary/50 bg-primary/10 backdrop-blur-md">
            <GraduationCap className="h-5 w-5 text-primary" />
            <AlertDescription className="flex items-center justify-between gap-4">
              <div className="space-y-1">
                <p className="font-semibold text-primary-glow">{t('startScreen.welcomeBanner.title')}</p>
                <p className="text-sm text-foreground/80">
                  {t('startScreen.welcomeBanner.message')}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Button
                  size="sm"
                  className="btn-ocean"
                  onClick={openTutorialAndDismiss}
                >
                  <Lightbulb className="mr-1 h-4 w-4" />
                  {t('startScreen.welcomeBanner.seeTutorial')}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0"
                  onClick={dismissFirstTimeBanner}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      )}

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
                {t('startScreen.title')}
              </h1>
              <p className="text-lg lg:text-xl text-muted-foreground italic">
                {t('startScreen.subtitle')}
              </p>
              <p className="text-base lg:text-lg text-foreground/80">
                {t('startScreen.description')}
              </p>
            </div>
            <div className="card-game w-full max-w-xl p-5 text-sm text-muted-foreground space-y-2">
              <p><strong>{t('startScreen.gameTime')}</strong> {t('startScreen.gameTimeValue')}</p>
              <p><strong>{t('startScreen.objective')}</strong> {t('startScreen.objectiveValue')}</p>
              <p><strong>{t('startScreen.warning')}</strong> {t('startScreen.warningValue')}</p>
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
                    onClick={() => onStartGame(totalPlayers, { humanPlayers, aiPlayers, aiDifficulty })}
                  >
                    {t('startScreen.newGame')}
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
                    {t('startScreen.options')}
                  </Button>
                </li>
                <li>
                  <Button
                    type="button"
                    variant="ghost"
                    size="lg"
                    className="w-full justify-center text-lg"
                    onClick={() => setIsHelpOpen(true)}
                  >
                    {t('startScreen.howToPlay')}
                  </Button>
                </li>
              </ul>
            </nav>

            <div className="card-game mx-auto lg:mx-0 w-full max-w-md p-6 space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-card-foreground">{t('startScreen.gameSetup')}</h3>
                <p className="text-sm text-muted-foreground">
                  {totalPlayers} {totalPlayers === 1 ? t('startScreen.player') : t('startScreen.players')} {t('startScreen.playersTotal').split(' ').slice(-1)[0]}
                </p>
              </div>

              {/* Human Players */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground/80">{t('startScreen.humanPlayers')}</label>
                <div className="flex flex-wrap justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((count) => (
                    <Button
                      key={count}
                      variant={humanPlayers === count ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        setHumanPlayers(count);
                        if (count + aiPlayers > 5) {
                          setAiPlayers(5 - count);
                        }
                      }}
                      className={`w-10 h-10 ${
                        humanPlayers === count
                          ? 'btn-ocean'
                          : 'border-primary/30 hover:border-primary'
                      }`}
                    >
                      {count}
                    </Button>
                  ))}
                </div>
              </div>

              {/* AI Opponents */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground/80">{t('startScreen.aiOpponents')}</label>
                <div className="flex flex-wrap justify-center gap-2">
                  {[0, 1, 2, 3, 4].filter(count => count <= maxAiPlayers).map((count) => (
                    <Button
                      key={count}
                      variant={aiPlayers === count ? "default" : "outline"}
                      size="sm"
                      onClick={() => setAiPlayers(count)}
                      className={`w-10 h-10 ${
                        aiPlayers === count
                          ? 'bg-purple-600 hover:bg-purple-700 text-white'
                          : 'border-purple-400/30 hover:border-purple-400'
                      }`}
                    >
                      {count}
                    </Button>
                  ))}
                </div>
              </div>

              {/* AI Difficulty */}
              {aiPlayers > 0 && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground/80">{t('startScreen.aiDifficulty')}</label>
                  <div className="flex justify-center gap-2">
                    {(['easy', 'medium', 'hard'] as const).map((diff) => (
                      <Button
                        key={diff}
                        variant={aiDifficulty === diff ? "default" : "outline"}
                        size="sm"
                        onClick={() => setAiDifficulty(diff)}
                        className={`px-4 h-9 ${
                          aiDifficulty === diff
                            ? diff === 'easy' ? 'bg-green-600 hover:bg-green-700' :
                              diff === 'medium' ? 'bg-yellow-600 hover:bg-yellow-700' :
                              'bg-red-600 hover:bg-red-700'
                            : 'border-primary/30 hover:border-primary'
                        }`}
                      >
                        {t(`startScreen.${diff}`)}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Game mode description */}
              <p className="text-xs text-center text-muted-foreground">
                {aiPlayers === 0
                  ? humanPlayers === 1
                    ? t('startScreen.soloPractice')
                    : t('startScreen.localMultiplayer')
                  : humanPlayers === 0
                    ? t('startScreen.spectatorMode')
                    : `${humanPlayers} ${humanPlayers > 1 ? t('startScreen.humans') : t('startScreen.human')} ${t('startScreen.vsAi')} ${aiPlayers} ${aiPlayers > 1 ? t('startScreen.aiOpponents2') : t('startScreen.aiOpponent')}`}
              </p>
            </div>
          </div>
        </div>

        <Dialog open={isOptionsOpen} onOpenChange={setIsOptionsOpen}>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-primary-glow">{t('options.title')}</DialogTitle>
              <DialogDescription>
                {t('options.description')}
              </DialogDescription>
            </DialogHeader>
            <div className="mt-4">
              <OptionsMenu />
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={isHelpOpen} onOpenChange={setIsHelpOpen}>
          <DialogContent className="flex max-h-[85vh] max-w-3xl flex-col overflow-hidden">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-primary-glow">{t('help.title')}</DialogTitle>
              <DialogDescription>
                {t('help.description')}
              </DialogDescription>
            </DialogHeader>
            <div className="mt-4 min-h-0 flex-1 overflow-hidden">
              <HelpSystem defaultTab="tutorial" />
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};