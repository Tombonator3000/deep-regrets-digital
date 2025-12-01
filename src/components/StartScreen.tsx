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
import backgroundImage from '@/assets/tentacle-background.png';
import { BubbleField } from '@/components/effects/BubbleField';
import { OptionsMenu, useDisplaySettings } from '@/components/OptionsMenu';
import { HelpSystem } from '@/components/HelpSystem';
import { useLanguage } from '@/context/LanguageContext';
import { GraduationCap, Lightbulb, X, Anchor, Fish } from 'lucide-react';

export interface GameSetup {
  humanPlayers: number;
  aiPlayers: number;
  aiDifficulty: 'easy' | 'medium' | 'hard';
  aiSpeed: 'slow' | 'normal' | 'fast';
}

interface StartScreenProps {
  onStartGame: (playerCount: number, gameSetup?: GameSetup) => void;
}

const FIRST_TIME_KEY = 'deep-regrets-first-time';
const GAME_SETUP_STORAGE_KEY = 'deep-regrets-game-setup';

const getStoredSetup = (): GameSetup | null => {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem(GAME_SETUP_STORAGE_KEY);
  if (!stored) return null;

  try {
    const parsed = JSON.parse(stored) as Partial<GameSetup>;
    if (
      typeof parsed.humanPlayers === 'number' &&
      typeof parsed.aiPlayers === 'number' &&
      (parsed.aiDifficulty === 'easy' || parsed.aiDifficulty === 'medium' || parsed.aiDifficulty === 'hard') &&
      (parsed.aiSpeed === 'slow' || parsed.aiSpeed === 'normal' || parsed.aiSpeed === 'fast')
    ) {
      return {
        humanPlayers: parsed.humanPlayers,
        aiPlayers: parsed.aiPlayers,
        aiDifficulty: parsed.aiDifficulty,
        aiSpeed: parsed.aiSpeed,
      };
    }
  } catch (error) {
    console.warn('Failed to parse stored game setup', error);
  }

  return null;
};

export const StartScreen = ({ onStartGame }: StartScreenProps) => {
  const storedSetup = getStoredSetup();
  const [humanPlayers, setHumanPlayers] = useState(storedSetup?.humanPlayers ?? 1);
  const [aiPlayers, setAiPlayers] = useState(storedSetup?.aiPlayers ?? 1);
  const [aiDifficulty, setAiDifficulty] = useState<'easy' | 'medium' | 'hard'>(storedSetup?.aiDifficulty ?? 'medium');
  const [aiSpeed, setAiSpeed] = useState<GameSetup['aiSpeed']>(storedSetup?.aiSpeed ?? 'normal');
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

  useEffect(() => {
    const clampedAiPlayers = Math.min(aiPlayers, Math.max(0, 5 - humanPlayers));
    if (clampedAiPlayers !== aiPlayers) {
      setAiPlayers(clampedAiPlayers);
    }
  }, [aiPlayers, humanPlayers]);

  useEffect(() => {
    const setupToStore: GameSetup = {
      humanPlayers,
      aiPlayers,
      aiDifficulty,
      aiSpeed,
    };
    localStorage.setItem(GAME_SETUP_STORAGE_KEY, JSON.stringify(setupToStore));
  }, [aiDifficulty, aiPlayers, aiSpeed, humanPlayers]);

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
    <div className="h-screen flex flex-col relative overflow-hidden">
      {/* Full-screen background image */}
      <div className="absolute inset-0 z-0">
        <img
          src={backgroundImage}
          alt=""
          className="w-full h-full object-cover"
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[hsl(220,30%,8%)] via-[hsl(220,30%,8%)]/70 to-transparent" />
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
        <div className="fixed inset-x-0 top-0 z-50 p-2">
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

      {/* Main content - optimized for no-scroll, responsive layout */}
      <div className="relative z-10 flex-1 w-full max-w-2xl mx-auto px-3 sm:px-4 py-2 sm:py-3 flex flex-col justify-center overflow-hidden">
        <div className="flex flex-col items-center gap-2 sm:gap-4 lg:gap-6">
          {/* Compact animated title */}
          <div className="text-center space-y-1 sm:space-y-2 animate-fade-in">
            <div className="relative inline-block">
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight menu-title leading-none">
                <span className="block text-transparent bg-clip-text bg-gradient-to-b from-cyan-300 via-cyan-400 to-cyan-600 drop-shadow-[0_0_25px_rgba(34,211,238,0.4)] animate-pulse-slow">
                  DEEP
                </span>
                <span className="block text-transparent bg-clip-text bg-gradient-to-b from-teal-200 via-emerald-400 to-teal-600 drop-shadow-[0_0_25px_rgba(45,212,191,0.4)]">
                  REGRETS
                </span>
              </h1>
              <div className="absolute -top-2 sm:-top-4 -left-6 sm:-left-8 text-cyan-400/30 animate-float-slow">
                <Anchor className="w-5 h-5 sm:w-8 sm:h-8" />
              </div>
              <div className="absolute -bottom-1 sm:-bottom-2 -right-4 sm:-right-6 text-teal-400/30 animate-float-slow" style={{ animationDelay: '1s' }}>
                <Fish className="w-4 h-4 sm:w-6 sm:h-6" />
              </div>
            </div>
            <p className="text-sm sm:text-base md:text-lg text-cyan-200/80 italic font-light tracking-wide">
              {t('startScreen.subtitle')}
            </p>
            <p className="text-xs sm:text-sm text-foreground/60 max-w-md mx-auto hidden sm:block">
              {t('startScreen.description')}
            </p>
          </div>

          {/* Menu and game setup - compact layout */}
          <div className="flex flex-col gap-2 sm:gap-3 w-full max-w-md">
            <nav aria-label="Start screen menu" className="w-full">
              <ul className="flex flex-col items-stretch gap-2">
                <li className="menu-item" style={{ animationDelay: '0.1s' }}>
                  <Button
                    type="button"
                    size="lg"
                    className="menu-button-primary w-full justify-center text-base sm:text-lg md:text-xl font-bold py-3 sm:py-4 md:py-5 rounded-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                    onClick={() => onStartGame(totalPlayers, { humanPlayers, aiPlayers, aiDifficulty, aiSpeed })}
                  >
                    {t('startScreen.newGame')}
                  </Button>
                </li>
                <li className="menu-item" style={{ animationDelay: '0.2s' }}>
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    className="menu-button-secondary w-full justify-center text-sm sm:text-base md:text-lg py-2.5 sm:py-3 md:py-4 rounded-xl border-2 border-cyan-500/40 hover:border-cyan-400 hover:bg-cyan-950/50 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                    onClick={() => setIsOptionsOpen(true)}
                  >
                    {t('startScreen.options')}
                  </Button>
                </li>
                <li className="menu-item" style={{ animationDelay: '0.3s' }}>
                  <Button
                    type="button"
                    variant="ghost"
                    size="lg"
                    className="menu-button-tertiary w-full justify-center text-sm sm:text-base md:text-lg py-2 sm:py-3 rounded-xl hover:bg-cyan-950/30 text-cyan-200/70 hover:text-cyan-100 transition-all duration-300"
                    onClick={() => setIsHelpOpen(true)}
                  >
                    {t('startScreen.howToPlay')}
                  </Button>
                </li>
              </ul>
            </nav>

            <div className="card-game w-full p-3 sm:p-4 space-y-2 sm:space-y-3 backdrop-blur-sm bg-card/80 border-cyan-500/20 menu-item" style={{ animationDelay: '0.4s' }}>
              <div className="flex items-center justify-between">
                <h3 className="text-sm sm:text-base font-semibold text-card-foreground">{t('startScreen.gameSetup')}</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {totalPlayers} {totalPlayers === 1 ? t('startScreen.player') : t('startScreen.players')} {t('startScreen.playersTotal').split(' ').slice(-1)[0]}
                </p>
              </div>

              {/* Human Players and AI Opponents in a row on larger screens */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                {/* Human Players */}
                <div className="space-y-1">
                  <label className="text-xs sm:text-sm font-medium text-foreground/80">{t('startScreen.humanPlayers')}</label>
                  <div className="flex flex-wrap justify-center gap-1.5">
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
                        className={`w-8 h-8 sm:w-9 sm:h-9 text-xs sm:text-sm ${
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
                <div className="space-y-1">
                  <label className="text-xs sm:text-sm font-medium text-foreground/80">{t('startScreen.aiOpponents')}</label>
                  <div className="flex flex-wrap justify-center gap-1.5">
                    {[0, 1, 2, 3, 4].filter(count => count <= maxAiPlayers).map((count) => (
                      <Button
                        key={count}
                        variant={aiPlayers === count ? "default" : "outline"}
                        size="sm"
                        onClick={() => setAiPlayers(count)}
                        className={`w-8 h-8 sm:w-9 sm:h-9 text-xs sm:text-sm ${
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
              </div>

              {/* AI Difficulty and Speed in a row when AI is enabled */}
              {aiPlayers > 0 && (
                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  {/* AI Difficulty */}
                  <div className="space-y-1">
                    <label className="text-xs sm:text-sm font-medium text-foreground/80">{t('startScreen.aiDifficulty')}</label>
                    <div className="flex justify-center gap-1">
                      {(['easy', 'medium', 'hard'] as const).map((diff) => (
                        <Button
                          key={diff}
                          variant={aiDifficulty === diff ? "default" : "outline"}
                          size="sm"
                          onClick={() => setAiDifficulty(diff)}
                          className={`px-2 sm:px-3 h-7 sm:h-8 text-xs ${
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

                  {/* AI Speed */}
                  <div className="space-y-1">
                    <label className="text-xs sm:text-sm font-medium text-foreground/80">{t('startScreen.aiSpeed')}</label>
                    <div className="flex justify-center gap-1">
                      {(['slow', 'normal', 'fast'] as const).map((speed) => (
                        <Button
                          key={speed}
                          variant={aiSpeed === speed ? "default" : "outline"}
                          size="sm"
                          onClick={() => setAiSpeed(speed)}
                          className={`px-2 sm:px-3 h-7 sm:h-8 text-xs ${
                            aiSpeed === speed
                              ? speed === 'fast'
                                ? 'bg-blue-600 hover:bg-blue-700'
                                : speed === 'normal'
                                  ? 'bg-primary hover:bg-primary/90'
                                  : 'bg-slate-600 hover:bg-slate-700'
                              : 'border-primary/30 hover:border-primary'
                          }`}
                        >
                          {t(`startScreen.${speed}`)}
                        </Button>
                      ))}
                    </div>
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