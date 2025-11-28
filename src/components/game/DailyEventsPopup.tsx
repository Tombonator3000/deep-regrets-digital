import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Sunrise,
  Bug,
  Dices,
  RefreshCw,
  ShoppingBag,
  Skull,
  ArrowRight,
  Calendar
} from 'lucide-react';

type Day = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday';

interface DailyEvent {
  icon: React.ReactNode;
  title: string;
  description: string;
  type: 'good' | 'neutral' | 'warning';
}

const getDayEvents = (day: Day): DailyEvent[] => {
  const events: DailyEvent[] = [];

  // Always happening
  events.push({
    icon: <Sunrise className="h-5 w-5" />,
    title: 'Ny dag begynner',
    description: 'Alle avslørte fisk på havet blir kastet. Dagmarkøren flyttes.',
    type: 'neutral',
  });

  events.push({
    icon: <RefreshCw className="h-5 w-5" />,
    title: 'Terninger oppdateres',
    description: 'Alle brukte terninger blir friske igjen (opp til Max Dice).',
    type: 'good',
  });

  events.push({
    icon: <ShoppingBag className="h-5 w-5" />,
    title: 'Markedet roterer',
    description: 'Nederste rad i markedet forsvinner, nye varer avdekkes.',
    type: 'neutral',
  });

  // Special day events
  if (day === 'wednesday' || day === 'friday') {
    events.push({
      icon: <Bug className="h-5 w-5" />,
      title: 'Can of Worms flippes!',
      description: 'Alle spillere flipper Can of Worms med forsiden opp. Kan brukes til å kikke på fisk!',
      type: 'good',
    });
  }

  if (day === 'thursday' || day === 'saturday') {
    events.push({
      icon: <Dices className="h-5 w-5" />,
      title: 'Gratis Tackle-terning!',
      description: 'Alle spillere får én gratis blå/oransje terning (eller grønn hvis tom).',
      type: 'good',
    });
  }

  // The Plug warning
  events.push({
    icon: <Skull className="h-5 w-5" />,
    title: 'The Plug eroderer',
    description: 'Topp-fisken fra en tilfeldig shoal blir kastet. Havet krymper...',
    type: 'warning',
  });

  return events;
};

const getDayName = (day: Day): string => {
  const names: Record<Day, string> = {
    monday: 'Mandag',
    tuesday: 'Tirsdag',
    wednesday: 'Onsdag',
    thursday: 'Torsdag',
    friday: 'Fredag',
    saturday: 'Lørdag',
  };
  return names[day];
};

const getDayNumber = (day: Day): number => {
  const order: Day[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  return order.indexOf(day) + 1;
};

interface DailyEventsPopupProps {
  day: Day;
  isOpen: boolean;
  onClose: () => void;
  isFirstDay?: boolean;
}

export const DailyEventsPopup = ({ day, isOpen, onClose, isFirstDay }: DailyEventsPopupProps) => {
  const events = getDayEvents(day);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-primary/30">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/20">
              <Calendar className="h-6 w-6 text-primary" />
            </div>
            <div>
              <div className="text-xl font-bold text-primary-glow">{getDayName(day)}</div>
              <div className="text-sm font-normal text-muted-foreground">
                Dag {getDayNumber(day)} av 6
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 my-4">
          <p className="text-sm text-foreground/80">
            {isFirstDay
              ? 'Velkommen til en ny uke på havet! Her er hva som skjer:'
              : 'En ny dag gryr. Her er dagens hendelser:'}
          </p>

          <div className="space-y-2">
            {events.map((event, index) => (
              <Card
                key={index}
                className={`p-3 ${
                  event.type === 'good'
                    ? 'bg-green-900/30 border-green-500/40'
                    : event.type === 'warning'
                      ? 'bg-red-900/30 border-red-500/40'
                      : 'bg-slate-800/50 border-slate-600/40'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-1.5 rounded ${
                    event.type === 'good'
                      ? 'bg-green-500/20 text-green-400'
                      : event.type === 'warning'
                        ? 'bg-red-500/20 text-red-400'
                        : 'bg-slate-600/30 text-slate-300'
                  }`}>
                    {event.icon}
                  </div>
                  <div className="flex-1">
                    <h4 className={`font-medium text-sm ${
                      event.type === 'good'
                        ? 'text-green-400'
                        : event.type === 'warning'
                          ? 'text-red-400'
                          : 'text-slate-200'
                    }`}>
                      {event.title}
                    </h4>
                    <p className="text-xs text-foreground/70 mt-0.5">{event.description}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Day-specific special badges */}
          <div className="flex flex-wrap gap-2 pt-2">
            {(day === 'wednesday' || day === 'friday') && (
              <Badge className="bg-green-600">
                <Bug className="h-3 w-3 mr-1" />
                Worms-dag
              </Badge>
            )}
            {(day === 'thursday' || day === 'saturday') && (
              <Badge className="bg-blue-600">
                <Dices className="h-3 w-3 mr-1" />
                Terning-dag
              </Badge>
            )}
            {day === 'saturday' && (
              <Badge className="bg-red-600">
                <Skull className="h-3 w-3 mr-1" />
                Siste dag!
              </Badge>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button onClick={onClose} className="w-full btn-ocean">
            <ArrowRight className="h-4 w-4 mr-2" />
            {isFirstDay ? 'Start fisking!' : 'Fortsett'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
