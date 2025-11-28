import { CharacterOption } from '@/types/game';
import { CHARACTERS } from '@/data/characters';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Anchor, Sparkles } from 'lucide-react';

interface CharacterCardModalProps {
  characterId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CharacterCardModal = ({ characterId, open, onOpenChange }: CharacterCardModalProps) => {
  const character = characterId ? CHARACTERS.find(c => c.id === characterId) : null;

  if (!character) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-gradient-to-b from-slate-900 to-slate-950 border-primary/30">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-primary/50 bg-gradient-to-br from-primary/20 to-primary/5 text-2xl font-bold text-primary-glow">
              {character.name.charAt(0)}
            </div>
            <div>
              <DialogTitle className="text-xl text-primary-glow">
                {character.name}
              </DialogTitle>
              <Badge variant="outline" className="mt-1 text-xs text-muted-foreground border-primary/30">
                {character.title}
              </Badge>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <Anchor className="h-4 w-4 text-primary" />
              <span>Backstory</span>
            </div>
            <DialogDescription className="text-sm text-white/80">
              {character.description}
            </DialogDescription>
          </div>

          <div className="rounded-lg border border-fishbuck/30 bg-fishbuck/10 p-3">
            <div className="flex items-center gap-2 text-sm text-fishbuck mb-1">
              <Sparkles className="h-4 w-4" />
              <span className="font-semibold">Starting Bonus</span>
            </div>
            <p className="text-sm text-fishbuck/90">
              {character.startingBonus}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
