import { Player } from '@/types/game';
import { Brain, Skull, Dice6, TrendingUp, TrendingDown } from 'lucide-react';
import { useState, useEffect } from 'react';

// Hook to load ocean madness background image
const useOceanMadnessBackground = () => {
  const [backgroundUrl, setBackgroundUrl] = useState<string | null>(null);

  useEffect(() => {
    import('@/assets/ocean-madness.png')
      .then((module) => {
        setBackgroundUrl(module.default);
      })
      .catch(() => {
        setBackgroundUrl(null);
      });
  }, []);

  return backgroundUrl;
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

const MADNESS_TIERS: MadnessTierInfo[] = [
  { level: 0, minRegrets: 0, maxRegrets: 0, fairModifier: 2, foulModifier: -2, maxDice: 4, portDiscount: false, name: 'Calm' },
  { level: 1, minRegrets: 1, maxRegrets: 3, fairModifier: 1, foulModifier: -1, maxDice: 4, portDiscount: false, name: 'Uneasy' },
  { level: 2, minRegrets: 4, maxRegrets: 6, fairModifier: 1, foulModifier: 0, maxDice: 5, portDiscount: false, name: 'Disturbed' },
  { level: 3, minRegrets: 7, maxRegrets: 9, fairModifier: 0, foulModifier: 1, maxDice: 6, portDiscount: false, name: 'Unhinged' },
  { level: 4, minRegrets: 10, maxRegrets: 12, fairModifier: -1, foulModifier: 1, maxDice: 7, portDiscount: false, name: 'Deranged' },
  { level: 5, minRegrets: 13, maxRegrets: 999, fairModifier: -2, foulModifier: 2, maxDice: 8, portDiscount: true, name: 'Lost' },
];

const getTierFromRegrets = (regretCount: number): MadnessTierInfo => {
  return MADNESS_TIERS.find(tier => regretCount >= tier.minRegrets && regretCount <= tier.maxRegrets) || MADNESS_TIERS[0];
};

export const MadnessTracker = ({ player, compact = false }: MadnessTrackerProps) => {
  const regretCount = player.regrets.length;
  const tier = getTierFromRegrets(regretCount);
  const effectiveMadness = Math.min(5, Math.max(0, tier.level + player.madnessOffset));
  const oceanMadnessBackground = useOceanMadnessBackground();

  // Calculate progress to next tier
  const progressToNext = tier.level < 5
    ? ((regretCount - tier.minRegrets) / (tier.maxRegrets - tier.minRegrets + 1)) * 100
    : 100;

  if (compact) {
    return (
      <div className="madness-tracker-compact relative overflow-hidden rounded-lg border border-madness/40 bg-gradient-to-br from-purple-950/80 via-slate-900/90 to-red-950/60">
        {/* Background image */}
        {oceanMadnessBackground && (
          <div
            className="absolute inset-0 opacity-30 bg-cover bg-center"
            style={{ backgroundImage: `url(${oceanMadnessBackground})` }}
          />
        )}
        <div className="relative z-10 flex items-center gap-2 p-2">
          <Brain className="h-4 w-4 text-madness animate-pulse" />
          <div className="flex-1">
            <div className="text-xs font-bold text-madness">{tier.name}</div>
            <div className="h-1.5 w-full rounded-full bg-black/40 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 via-red-500 to-orange-500 transition-all duration-500"
                style={{ width: `${(effectiveMadness / 5) * 100}%` }}
              />
            </div>
          </div>
          <span className="text-sm font-bold text-madness">{effectiveMadness}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="madness-tracker relative overflow-hidden rounded-xl border border-madness/30 bg-gradient-to-br from-purple-950/90 via-slate-900 to-red-950/70 shadow-lg shadow-madness/20">
      {/* Background image with swirling eyes effect */}
      {oceanMadnessBackground && (
        <div
          className="absolute inset-0 opacity-40 bg-cover bg-center"
          style={{ backgroundImage: `url(${oceanMadnessBackground})` }}
        />
      )}

      {/* Animated overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/40" />

      {/* Content */}
      <div className="relative z-10 p-3">
        {/* Header with title */}
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-madness animate-pulse" />
            <span className="text-sm font-bold tracking-wide text-white/90">OCEAN MADNESS</span>
          </div>
          <div className="flex items-center gap-1 rounded-full bg-madness/20 px-2 py-0.5">
            <Skull className="h-3 w-3 text-destructive" />
            <span className="text-xs font-bold text-destructive">{regretCount}</span>
          </div>
        </div>

        {/* Tier name and level */}
        <div className="mb-2 text-center">
          <div className="text-2xl font-black text-madness tracking-wider" style={{ textShadow: '0 0 20px rgba(168, 85, 247, 0.5)' }}>
            {tier.name.toUpperCase()}
          </div>
          <div className="text-xs text-white/60">Tier {effectiveMadness} / 5</div>
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
            <div className="mt-1 text-center text-[10px] text-white/40">
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
          <div className="mt-2 rounded bg-fishbuck/20 p-1 text-center text-xs font-medium text-fishbuck">
            Port Discount Active!
          </div>
        )}
      </div>
    </div>
  );
};
