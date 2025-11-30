import { Player } from '@/types/game';
import { Brain, Skull, Dice6, TrendingUp, TrendingDown } from 'lucide-react';
import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { RegretCard } from './RegretCard';

// Hook to load ocean madness background (video with PNG fallback)
const useOceanMadnessBackground = () => {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    // Try to load video first by checking if it exists
    const videoPath = '/ocean-madness.mp4';
    fetch(videoPath, { method: 'HEAD' })
      .then((response) => {
        if (response.ok) {
          setVideoUrl(videoPath);
        }
      })
      .catch(() => {
        // Video doesn't exist, will use image fallback
      });

    // Always load image as fallback
    import('@/assets/ocean-madness.png')
      .then((module) => {
        setImageUrl(module.default);
      })
      .catch(() => {
        setImageUrl(null);
      });
  }, []);

  return { videoUrl, imageUrl };
};

interface MadnessTrackerProps {
  player: Player;
  compact?: boolean;
}

interface MadnessTierInfo {
  level: number;
  minRegrets: number;
  maxRegrets: number;
  fairModifier: number;
  foulModifier: number;
  maxDice: number;
  portDiscount: boolean;
  name: string;
}

// Madness tier values per rulebook p.18-19
const MADNESS_TIERS: MadnessTierInfo[] = [
  { level: 0, minRegrets: 0, maxRegrets: 0, fairModifier: 2, foulModifier: -2, maxDice: 5, portDiscount: false, name: 'Calm' },
  { level: 1, minRegrets: 1, maxRegrets: 3, fairModifier: 1, foulModifier: -2, maxDice: 5, portDiscount: false, name: 'Uneasy' },
  { level: 2, minRegrets: 4, maxRegrets: 6, fairModifier: 1, foulModifier: -1, maxDice: 4, portDiscount: false, name: 'Disturbed' },
  { level: 3, minRegrets: 7, maxRegrets: 9, fairModifier: 0, foulModifier: 0, maxDice: 4, portDiscount: false, name: 'Unhinged' },
  { level: 4, minRegrets: 10, maxRegrets: 12, fairModifier: -1, foulModifier: 1, maxDice: 3, portDiscount: false, name: 'Deranged' },
  { level: 5, minRegrets: 13, maxRegrets: 999, fairModifier: -2, foulModifier: 2, maxDice: 3, portDiscount: true, name: 'Lost' },
];

const getTierFromRegrets = (regretCount: number): MadnessTierInfo => {
  return MADNESS_TIERS.find(tier => regretCount >= tier.minRegrets && regretCount <= tier.maxRegrets) || MADNESS_TIERS[0];
};

export const MadnessTracker = ({ player, compact = false }: MadnessTrackerProps) => {
  const [showRegrets, setShowRegrets] = useState(false);
  const regretCount = player.regrets.length;
  const tier = getTierFromRegrets(regretCount);
  const effectiveMadness = Math.min(5, Math.max(0, tier.level + player.madnessOffset));
  const { videoUrl, imageUrl } = useOceanMadnessBackground();

  // Calculate progress to next tier
  const progressToNext = tier.level < 5
    ? ((regretCount - tier.minRegrets) / (tier.maxRegrets - tier.minRegrets + 1)) * 100
    : 100;

  // Check if close to next tier threshold (1 regret away)
  const isNearThreshold = tier.level < 5 && regretCount === tier.maxRegrets;
  // Check if at high madness (tier 4 or 5)
  const isHighMadness = effectiveMadness >= 4;

  if (compact) {
    return (
      <>
        <div
          className={`madness-tracker-compact relative overflow-hidden rounded-lg border bg-gradient-to-br from-purple-950/80 via-slate-900/90 to-red-950/60 cursor-pointer hover:border-madness/60 transition-colors ${
            isNearThreshold ? 'animate-madness-warning border-destructive/60' : 'border-madness/40'
          } ${isHighMadness ? 'ring-1 ring-destructive/30' : ''}`}
          onClick={() => setShowRegrets(true)}
        >
          {/* Background video or image */}
          {videoUrl ? (
            <video
              autoPlay
              loop
              muted
              playsInline
              className="absolute inset-0 w-full h-full object-cover opacity-30 pointer-events-none"
            >
              <source src={videoUrl} type="video/mp4" />
            </video>
          ) : imageUrl && (
            <div
              className="absolute inset-0 opacity-30 bg-cover bg-center"
              style={{ backgroundImage: `url(${imageUrl})` }}
            />
          )}
          <div className="relative z-10 flex items-center gap-2 p-2">
            <Brain className="h-4 w-4 text-madness animate-pulse" style={{ filter: 'drop-shadow(0 0 4px rgba(168, 85, 247, 0.5))' }} />
            <div className="flex-1">
              <div className="text-xs font-bold text-madness" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>{tier.name}</div>
              <div className="h-1.5 w-full rounded-full bg-black/40 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 via-red-500 to-orange-500 transition-all duration-500"
                  style={{ width: `${(effectiveMadness / 5) * 100}%` }}
                />
              </div>
            </div>
            <span className="text-sm font-bold text-madness" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>{effectiveMadness}</span>
          </div>
        </div>

        {/* Regrets Dialog */}
        <Dialog open={showRegrets} onOpenChange={setShowRegrets}>
          <DialogContent className="border-madness/30 bg-gradient-to-br from-purple-950/95 via-slate-900 to-red-950/90">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-madness">
                <Brain className="h-5 w-5" />
                Dine Regrets ({regretCount})
              </DialogTitle>
              <DialogDescription>
                Regrets påvirker ditt Madness-nivå og gir minuspoeng ved spillets slutt.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              {player.regrets.length === 0 ? (
                <p className="text-center text-muted-foreground italic py-4">
                  Ingen regrets ennå...
                </p>
              ) : (
                <div className="grid grid-cols-2 gap-2 max-h-[300px] overflow-y-auto pr-1">
                  {player.regrets.map((regret, index) => (
                    <div key={`${regret.id}-${index}`} className="flex flex-col items-center gap-1 p-2 rounded-lg bg-black/30 border border-white/10">
                      <RegretCard regret={regret} faceUp={true} size="sm" />
                      <div className="text-xs text-center text-white/80 line-clamp-2">{regret.frontText}</div>
                      <div className="text-sm font-bold text-destructive">-{regret.value} poeng</div>
                    </div>
                  ))}
                </div>
              )}
              <div className="pt-2 border-t border-white/10 text-sm text-center text-white/60">
                Nåværende tier: <span className="font-bold text-madness">{tier.name}</span> (Tier {effectiveMadness}/5)
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return (
    <>
      <div
        className={`madness-tracker relative overflow-hidden rounded-xl border bg-gradient-to-br from-purple-950/90 via-slate-900 to-red-950/70 shadow-lg shadow-madness/20 cursor-pointer hover:border-madness/50 transition-colors ${
          isNearThreshold ? 'animate-madness-warning border-destructive/50' : 'border-madness/30'
        } ${isHighMadness ? 'ring-2 ring-destructive/40' : ''}`}
        onClick={() => setShowRegrets(true)}
      >
        {/* Background video or image with swirling eyes effect */}
        {videoUrl ? (
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover opacity-40 pointer-events-none"
          >
            <source src={videoUrl} type="video/mp4" />
          </video>
        ) : imageUrl && (
          <div
            className="absolute inset-0 opacity-40 bg-cover bg-center"
            style={{ backgroundImage: `url(${imageUrl})` }}
          />
        )}

        {/* Animated overlay - stronger for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/50" />

        {/* Content */}
        <div className="relative z-10 p-3">
          {/* Header with title */}
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-madness animate-pulse" style={{ filter: 'drop-shadow(0 0 6px rgba(168, 85, 247, 0.6))' }} />
              <span className="text-sm font-bold tracking-wide text-white" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.9), 0 0 10px rgba(0,0,0,0.5)' }}>OCEAN MADNESS</span>
            </div>
            <div className="flex items-center gap-1 rounded-full bg-madness/30 px-2 py-0.5 border border-madness/20">
              <Skull className="h-3 w-3 text-destructive" style={{ filter: 'drop-shadow(0 0 4px rgba(239, 68, 68, 0.5))' }} />
              <span className="text-xs font-bold text-destructive" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>{regretCount}</span>
            </div>
          </div>

          {/* Tier name and level */}
          <div className="mb-2 text-center">
            <div className="text-2xl font-black text-madness tracking-wider" style={{ textShadow: '0 0 20px rgba(168, 85, 247, 0.6), 0 2px 4px rgba(0,0,0,0.9)' }}>
              {tier.name.toUpperCase()}
            </div>
            <div className="text-xs text-white/80" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>Tier {effectiveMadness} / 5</div>
          </div>

        {/* Progress bar */}
        <div className="mb-3">
          <div className="flex gap-1">
            {MADNESS_TIERS.map((t, i) => (
              <div
                key={i}
                className={`h-2 flex-1 rounded-sm transition-all duration-300 ${
                  i < effectiveMadness
                    ? 'bg-gradient-to-r from-purple-500 to-red-500 shadow-sm shadow-madness/50'
                    : i === effectiveMadness
                      ? 'bg-gradient-to-r from-purple-500/50 to-red-500/50'
                      : 'bg-white/10'
                }`}
              />
            ))}
          </div>
          {tier.level < 5 && (
            <div className="mt-1 text-center text-[10px] text-white/60" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>
              {tier.maxRegrets - regretCount + 1} regrets to next tier
            </div>
          )}
        </div>

        {/* Effects display */}
        <div className="grid grid-cols-3 gap-1 text-center">
          <div className="rounded border border-white/10 bg-black/30 p-1.5">
            <div className="flex items-center justify-center gap-0.5 text-[10px] text-white/60">
              <TrendingUp className="h-3 w-3 text-green-400" />
              Fair
            </div>
            <div className={`text-sm font-bold ${tier.fairModifier > 0 ? 'text-green-400' : tier.fairModifier < 0 ? 'text-red-400' : 'text-white/50'}`}>
              {tier.fairModifier > 0 ? '+' : ''}{tier.fairModifier}
            </div>
          </div>
          <div className="rounded border border-white/10 bg-black/30 p-1.5">
            <div className="flex items-center justify-center gap-0.5 text-[10px] text-white/60">
              <TrendingDown className="h-3 w-3 text-red-400" />
              Foul
            </div>
            <div className={`text-sm font-bold ${tier.foulModifier > 0 ? 'text-green-400' : tier.foulModifier < 0 ? 'text-red-400' : 'text-white/50'}`}>
              {tier.foulModifier > 0 ? '+' : ''}{tier.foulModifier}
            </div>
          </div>
          <div className="rounded border border-white/10 bg-black/30 p-1.5">
            <div className="flex items-center justify-center gap-0.5 text-[10px] text-white/60">
              <Dice6 className="h-3 w-3 text-primary" />
              Dice
            </div>
            <div className="text-sm font-bold text-primary">
              {tier.maxDice}
            </div>
          </div>
        </div>

        {/* Port discount indicator */}
        {tier.portDiscount && (
          <div className="mt-2 rounded bg-fishbuck/20 p-1 text-center text-xs font-medium text-fishbuck" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.6)' }}>
            Port Discount Active!
          </div>
        )}
        </div>
      </div>

      {/* Regrets Dialog */}
      <Dialog open={showRegrets} onOpenChange={setShowRegrets}>
        <DialogContent className="border-madness/30 bg-gradient-to-br from-purple-950/95 via-slate-900 to-red-950/90">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-madness">
              <Brain className="h-5 w-5" />
              Dine Regrets ({regretCount})
            </DialogTitle>
            <DialogDescription>
              Regrets påvirker ditt Madness-nivå og gir minuspoeng ved spillets slutt.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {player.regrets.length === 0 ? (
              <p className="text-center text-muted-foreground italic py-4">
                Ingen regrets ennå...
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-2 max-h-[300px] overflow-y-auto pr-1">
                {player.regrets.map((regret, index) => (
                  <div key={`${regret.id}-${index}`} className="flex flex-col items-center gap-1 p-2 rounded-lg bg-black/30 border border-white/10">
                    <RegretCard regret={regret} faceUp={true} size="sm" />
                    <div className="text-xs text-center text-white/80 line-clamp-2">{regret.frontText}</div>
                    <div className="text-sm font-bold text-destructive">-{regret.value} poeng</div>
                  </div>
                ))}
              </div>
            )}
            <div className="pt-2 border-t border-white/10 text-sm text-center text-white/60">
              Nåværende tier: <span className="font-bold text-madness">{tier.name}</span> (Tier {effectiveMadness}/5)
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
