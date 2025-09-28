import { Day, GamePhase } from '@/types/game';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface DayTrackerProps {
  day: Day;
  phase: GamePhase;
}

const DAYS: Day[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const PHASE_DISPLAY = {
  start: 'Start',
  refresh: 'Refresh',
  declaration: 'Declaration',
  action: 'Action',
  endgame: 'Game Over'
};

const PHASE_COLORS = {
  start: 'bg-blue-500',
  refresh: 'bg-green-500',
  declaration: 'bg-yellow-500',
  action: 'bg-red-500',
  endgame: 'bg-purple-500'
};

export const DayTracker = ({ day, phase }: DayTrackerProps) => {
  const currentDayIndex = DAYS.indexOf(day);

  return (
    <Card className="card-game p-3">
      <div className="space-y-3">
        {/* Phase Indicator */}
        <div className="text-center">
          <Badge className={`${PHASE_COLORS[phase]} text-white`}>
            {PHASE_DISPLAY[phase]} Phase
          </Badge>
        </div>

        {/* Day Progress */}
        <div>
          <div className="text-xs text-muted-foreground mb-2 text-center">Week Progress</div>
          <div className="flex space-x-1">
            {DAYS.map((dayName, index) => {
              const isCurrentDay = index === currentDayIndex;
              const isPastDay = index < currentDayIndex;
              
              return (
                <div 
                  key={dayName}
                  className={`flex-1 text-center py-1 px-1 rounded text-xs ${
                    isCurrentDay 
                      ? 'bg-primary text-primary-foreground font-bold' 
                      : isPastDay 
                        ? 'bg-muted text-muted-foreground line-through'
                        : 'bg-card text-card-foreground border border-border'
                  }`}
                >
                  {dayName.slice(0, 3)}
                </div>
              );
            })}
          </div>
        </div>

        {/* Current Day Details */}
        <div className="text-center">
          <div className="font-bold text-primary">{day}</div>
          <div className="text-xs text-muted-foreground">
            Day {currentDayIndex + 1} of 6
          </div>
        </div>
      </div>
    </Card>
  );
};