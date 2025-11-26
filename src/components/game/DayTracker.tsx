import { Day, GamePhase } from '@/types/game';
import { Calendar, Sun, Sunset, Clock, Anchor, Waves } from 'lucide-react';

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
    <div className="day-tracker rounded-xl border-2 border-primary/20 bg-gradient-to-b from-slate-900/80 to-slate-950/90 p-4 shadow-lg">
      {/* Header - Like Port Board in physical game */}
      <div className="mb-4 flex items-center justify-center gap-2 border-b border-primary/20 pb-3">
        <Calendar className="h-4 w-4 text-primary" />
        <span className="text-sm font-bold uppercase tracking-wider text-primary-glow">
          The Fishing Week
        </span>
      </div>

      {/* Day Boxes - Visual representation like board game */}
      <div className="mb-4 grid grid-cols-6 gap-1">
        {DAYS.map((dayName, index) => {
          const isCurrentDay = index === currentDayIndex;
          const isPastDay = index < currentDayIndex;
          const isFutureDay = index > currentDayIndex;

          return (
            <div
              key={dayName}
              className={`relative flex flex-col items-center justify-center rounded-lg border-2 p-2 transition-all ${
                isCurrentDay
                  ? 'border-primary bg-primary/20 ring-2 ring-primary/50 ring-offset-1 ring-offset-slate-950'
                  : isPastDay
                    ? 'border-white/10 bg-white/5'
                    : 'border-white/20 bg-black/30'
              }`}
            >
              {/* Day number marker */}
              <div
                className={`mb-1 flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                  isCurrentDay
                    ? 'bg-primary text-slate-900'
                    : isPastDay
                      ? 'bg-white/20 text-white/50'
                      : 'bg-white/10 text-white/70'
                }`}
              >
                {index + 1}
              </div>

              {/* Day abbreviation */}
              <span
                className={`text-xs font-medium ${
                  isCurrentDay
                    ? 'text-primary-glow'
                    : isPastDay
                      ? 'text-white/40 line-through'
                      : 'text-white/60'
                }`}
              >
                {dayName.slice(0, 3)}
              </span>

              {/* Current day indicator */}
              {isCurrentDay && (
                <div className="absolute -bottom-1 left-1/2 h-1 w-4 -translate-x-1/2 rounded-full bg-primary" />
              )}

              {/* Completed checkmark */}
              {isPastDay && (
                <div className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-green-500/80 text-xs text-white">
                  ✓
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Current Phase Display */}
      <div className={`flex items-center justify-center gap-3 rounded-lg ${phaseInfo.bg} p-3`}>
        <PhaseIcon className={`h-5 w-5 ${phaseInfo.color}`} />
        <div className="text-center">
          <div className={`text-sm font-bold ${phaseInfo.color}`}>
            {phaseInfo.label} Phase
          </div>
          <div className="text-xs text-muted-foreground">
            {day} • Day {currentDayIndex + 1} of 6
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-3">
        <div className="h-2 w-full overflow-hidden rounded-full bg-black/40">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary to-primary-glow transition-all duration-500"
            style={{ width: `${((currentDayIndex + 1) / 6) * 100}%` }}
          />
        </div>
        <div className="mt-1 flex justify-between text-xs text-muted-foreground">
          <span>Week Start</span>
          <span>Final Reckoning</span>
        </div>
      </div>
    </div>
  );
};