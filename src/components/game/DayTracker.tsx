import { Day, GamePhase } from '@/types/game';
import { Sun, Sunset, Clock, Anchor, Waves } from 'lucide-react';

interface DayTrackerProps {
  day: Day;
  phase: GamePhase;
}

const DAYS: Day[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const PHASE_INFO = {
  start: { label: 'Dawn', icon: Sun, color: 'text-yellow-400', bg: 'bg-yellow-500/20' },
  refresh: { label: 'Refresh', icon: Waves, color: 'text-primary', bg: 'bg-primary/20' },
  declaration: { label: 'Set Sail', icon: Anchor, color: 'text-blue-400', bg: 'bg-blue-500/20' },
  action: { label: 'At Work', icon: Clock, color: 'text-orange-400', bg: 'bg-orange-500/20' },
  endgame: { label: 'Week End', icon: Sunset, color: 'text-purple-400', bg: 'bg-purple-500/20' }
};

export const DayTracker = ({ day, phase }: DayTrackerProps) => {
  const currentDayIndex = DAYS.indexOf(day);
  const phaseInfo = PHASE_INFO[phase];
  const PhaseIcon = phaseInfo.icon;

  return (
    <div className="day-tracker rounded-lg border border-primary/20 bg-gradient-to-b from-slate-900/80 to-slate-950/90 p-1.5 sm:p-2 shadow-lg">
      {/* Compact Day Boxes */}
      <div className="flex items-center gap-0.5 sm:gap-1 mb-1 sm:mb-2">
        {DAYS.map((dayName, index) => {
          const isCurrentDay = index === currentDayIndex;
          const isPastDay = index < currentDayIndex;

          return (
            <div
              key={dayName}
              className={`flex-1 flex flex-col items-center justify-center rounded border p-0.5 sm:p-1 transition-all ${
                isCurrentDay
                  ? 'border-primary bg-primary/20'
                  : isPastDay
                    ? 'border-white/10 bg-white/5'
                    : 'border-white/20 bg-black/30'
              }`}
            >
              <span className={`text-[9px] sm:text-[10px] font-medium ${
                isCurrentDay ? 'text-primary-glow' : isPastDay ? 'text-white/40' : 'text-white/60'
              }`}>
                {dayName.slice(0, 2)}
              </span>
            </div>
          );
        })}
      </div>

      {/* Compact Current Phase */}
      <div className={`flex items-center justify-center gap-1 sm:gap-2 rounded ${phaseInfo.bg} p-1 sm:p-1.5`}>
        <PhaseIcon className={`h-3 w-3 ${phaseInfo.color}`} />
        <span className={`text-[10px] sm:text-xs font-medium ${phaseInfo.color}`}>
          {phaseInfo.label} • Day {currentDayIndex + 1}/6
        </span>
      </div>
    </div>
  );
};