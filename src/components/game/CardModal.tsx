import { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { FishCard, DinkCard, UpgradeCard } from '@/types/game';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Fish, Sparkles, Package, Skull, Star, Zap, X, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getFishImage, getDefaultFishImage } from '@/data/fishImages';
import { getDinkImage } from '@/data/dinkImages';
import rodCardBack from '@/assets/rod-card-back.png';
import supplyCardBack from '@/assets/supply-card-back.png';

type CardType = 'fish' | 'dink' | 'supply';
type AnyCard = FishCard | DinkCard | UpgradeCard;

interface CardModalContextType {
  openCard: (card: AnyCard, type: CardType, rotation?: number, canPlay?: boolean) => void;
  closeCard: () => void;
  isOpen: boolean;
  setOnPlayDink: (callback: ((dinkId: string, effect: string) => void) | null) => void;
}

const CardModalContext = createContext<CardModalContextType | null>(null);

export const useCardModal = () => {
  const context = useContext(CardModalContext);
  if (!context) {
    throw new Error('useCardModal must be used within a CardModalProvider');
  }
  return context;
};

interface CardModalProviderProps {
  children: ReactNode;
}

export const CardModalProvider = ({ children }: CardModalProviderProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState<AnyCard | null>(null);
  const [cardType, setCardType] = useState<CardType>('fish');
  const [cardRotation, setCardRotation] = useState(0);
  const [canPlay, setCanPlay] = useState(false);
  const [onPlayDinkCallback, setOnPlayDinkCallback] = useState<((dinkId: string, effect: string) => void) | null>(null);

  const openCard = useCallback((card: AnyCard, type: CardType, rotation: number = 0, canPlayCard: boolean = false) => {
    setSelectedCard(card);
    setCardType(type);
    setCardRotation(rotation);
    setCanPlay(canPlayCard);
    setIsOpen(true);
  }, []);

  const closeCard = useCallback(() => {
    setIsOpen(false);
    setSelectedCard(null);
    setCanPlay(false);
  }, []);

  const setOnPlayDink = useCallback((callback: ((dinkId: string, effect: string) => void) | null) => {
    setOnPlayDinkCallback(() => callback);
  }, []);

  const handlePlayDink = useCallback((dinkId: string, effect: string) => {
    if (onPlayDinkCallback) {
      onPlayDinkCallback(dinkId, effect);
      closeCard();
    }
  }, [onPlayDinkCallback, closeCard]);

  return (
    <CardModalContext.Provider value={{ openCard, closeCard, isOpen, setOnPlayDink }}>
      {children}
      <Dialog open={isOpen} onOpenChange={(open) => !open && closeCard()}>
        <DialogContent className="max-w-md p-0 overflow-hidden bg-transparent border-none shadow-none">
          {selectedCard && (
            <EnlargedCard
              card={selectedCard}
              type={cardType}
              onClose={closeCard}
              rotation={cardRotation}
              canPlay={canPlay}
              onPlayDink={handlePlayDink}
            />
          )}
        </DialogContent>
      </Dialog>
    </CardModalContext.Provider>
  );
};

interface EnlargedCardProps {
  card: AnyCard;
  type: CardType;
  onClose: () => void;
  rotation?: number;
  canPlay?: boolean;
  onPlayDink?: (dinkId: string, effect: string) => void;
}

const EnlargedCard = ({ card, type, onClose, rotation = 0, canPlay = false, onPlayDink }: EnlargedCardProps) => {
  if (type === 'fish') {
    return <EnlargedFishCard fish={card as FishCard} onClose={onClose} rotation={rotation} />;
  }
  if (type === 'dink') {
    return <EnlargedDinkCard dink={card as DinkCard} onClose={onClose} rotation={rotation} canPlay={canPlay} onPlayDink={onPlayDink} />;
  }
  return <EnlargedSupplyCard supply={card as UpgradeCard} onClose={onClose} rotation={rotation} />;
};

const EnlargedFishCard = ({ fish, onClose, rotation = 0 }: { fish: FishCard; onClose: () => void; rotation?: number }) => {
  const isFoul = fish.quality === 'foul';
  const bgGradient = isFoul
    ? 'from-purple-900 via-purple-800 to-purple-950'
    : 'from-cyan-900 via-cyan-800 to-cyan-950';
  const borderColor = isFoul ? 'border-purple-400' : 'border-cyan-400';
  const accentColor = isFoul ? 'text-purple-300' : 'text-cyan-300';
  
  // Get fish illustration image
  const fishImage = getFishImage(fish.id) || getDefaultFishImage(fish.depth);

  const rotationStyle: React.CSSProperties = rotation !== 0 ? { transform: `rotate(${rotation}deg)` } : {};

  return (
    <div className={`relative w-80 rounded-2xl border-4 ${borderColor} bg-gradient-to-br ${bgGradient} shadow-2xl overflow-hidden transition-transform`} style={rotationStyle}>
      {/* Close button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 z-10 h-8 w-8 rounded-full bg-black/40 hover:bg-black/60"
        onClick={onClose}
      >
        <X className="h-4 w-4" />
      </Button>

      {/* Card header */}
      <div className="relative p-4 pb-2">
        <div className="flex items-center justify-between">
          <Badge className={`${isFoul ? 'bg-purple-500/30 text-purple-200' : 'bg-cyan-500/30 text-cyan-200'} uppercase text-xs`}>
            {isFoul ? 'Foul' : 'Fair'} Quality
          </Badge>
          <Badge variant="outline" className="border-white/30 text-white">
            Depth {fish.depth}
          </Badge>
        </div>
      </div>

      {/* Fish illustration area */}
      <div className="relative h-48 flex items-center justify-center bg-black/20 overflow-hidden">
        {fishImage ? (
          <img 
            src={fishImage} 
            alt={fish.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <Fish className={`h-24 w-24 ${accentColor} drop-shadow-lg`} />
        )}
        {isFoul && (
          <Skull className="absolute top-2 left-2 h-6 w-6 text-purple-400/60 drop-shadow-md" />
        )}
        {/* Overlay gradient for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
      </div>

      {/* Card body */}
      <div className="p-4 space-y-3">
        <DialogHeader className="space-y-1">
          <DialogTitle className={`text-2xl font-bold ${accentColor}`}>
            {fish.name}
          </DialogTitle>
          <DialogDescription className="text-white/80 text-sm">
            {fish.description}
          </DialogDescription>
        </DialogHeader>

        {/* Stats */}
        <div className="flex gap-2 flex-wrap">
          <Badge className="bg-fishbuck/30 text-fishbuck text-sm px-3 py-1">
            <span className="font-bold">${fish.value}</span>
            <span className="text-xs ml-1 opacity-80">value</span>
          </Badge>
          <Badge variant="outline" className="border-red-400/50 text-red-300 text-sm px-3 py-1">
            <Zap className="h-3 w-3 mr-1" />
            <span className="font-bold">{fish.difficulty}</span>
            <span className="text-xs ml-1 opacity-80">difficulty</span>
          </Badge>
        </div>

        {/* Abilities */}
        {fish.abilities.length > 0 && (
          <div className="space-y-1.5">
            <div className="flex items-center gap-1 text-xs uppercase tracking-wide text-white/60">
              <Star className="h-3 w-3" />
              <span>Abilities</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {fish.abilities.map((ability) => (
                <Badge key={ability} variant="secondary" className="bg-white/10 text-white text-xs">
                  {ability}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Tags */}
        {fish.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-1 border-t border-white/10">
            {fish.tags.map((tag) => (
              <span key={tag} className="text-xs text-white/50">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const EnlargedDinkCard = ({ dink, onClose, rotation = 0, canPlay = false, onPlayDink }: { dink: DinkCard; onClose: () => void; rotation?: number; canPlay?: boolean; onPlayDink?: (dinkId: string, effect: string) => void }) => {
  const rotationStyle: React.CSSProperties = rotation !== 0 ? { transform: `rotate(${rotation}deg)` } : {};
  const dinkImage = getDinkImage(dink.id);

  const handlePlayEffect = (effect: string) => {
    if (onPlayDink && canPlay) {
      onPlayDink(dink.id, effect);
    }
  };

  return (
    <div className="relative w-80 rounded-2xl border-4 border-amber-400 bg-gradient-to-br from-amber-900 via-amber-800 to-amber-950 shadow-2xl overflow-hidden transition-transform" style={rotationStyle}>
      {/* Close button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 z-10 h-8 w-8 rounded-full bg-black/40 hover:bg-black/60"
        onClick={onClose}
      >
        <X className="h-4 w-4" />
      </Button>

      {/* Card header */}
      <div className="relative p-4 pb-2">
        <div className="flex items-center justify-between">
          <Badge className="bg-amber-500/30 text-amber-200 uppercase text-xs">
            Trinket
          </Badge>
          <Badge variant="outline" className={`border-white/30 ${dink.oneShot ? 'text-red-300' : 'text-green-300'}`}>
            {dink.oneShot ? 'One-Shot' : 'Reusable'}
          </Badge>
        </div>
      </div>

      {/* Illustration area */}
      <div className="relative h-40 flex items-center justify-center bg-black/20 overflow-hidden">
        {dinkImage ? (
          <img 
            src={dinkImage} 
            alt={dink.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <>
            <Sparkles className="h-24 w-24 text-amber-300 drop-shadow-lg" />
            {/* Decorative sparkles */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {[...Array(6)].map((_, i) => (
                <Sparkles
                  key={i}
                  className="absolute h-4 w-4 text-amber-400/40 animate-pulse"
                  style={{
                    left: `${10 + i * 15}%`,
                    top: `${20 + (i % 3) * 25}%`,
                    animationDelay: `${i * 0.2}s`
                  }}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Card body */}
      <div className="p-4 space-y-3">
        <DialogHeader className="space-y-1">
          <DialogTitle className="text-2xl font-bold text-amber-300">
            {dink.name}
          </DialogTitle>
          <DialogDescription className="text-white/80 text-sm">
            {dink.description}
          </DialogDescription>
        </DialogHeader>

        {/* Timing */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-1 text-xs uppercase tracking-wide text-white/60">
            <Zap className="h-3 w-3" />
            <span>Timing</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {dink.timing.map((t) => (
              <Badge key={t} variant="secondary" className="bg-white/10 text-white text-xs">
                {t}
              </Badge>
            ))}
          </div>
        </div>

        {/* Effects - Clickable when canPlay is true */}
        {dink.effects.length > 0 && (
          <div className="space-y-1.5">
            <div className="flex items-center gap-1 text-xs uppercase tracking-wide text-white/60">
              <Star className="h-3 w-3" />
              <span>Effects</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {dink.effects.map((effect) => (
                canPlay ? (
                  <Button
                    key={effect}
                    variant="secondary"
                    size="sm"
                    className="bg-amber-500/30 hover:bg-amber-500/50 text-amber-200 text-xs px-2 py-1 h-auto gap-1 transition-all active:scale-95"
                    onClick={() => handlePlayEffect(effect)}
                  >
                    <Play className="h-3 w-3" />
                    {effect}
                  </Button>
                ) : (
                  <Badge key={effect} variant="secondary" className="bg-amber-500/20 text-amber-200 text-xs">
                    {effect}
                  </Badge>
                )
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const EnlargedSupplyCard = ({ supply, onClose, rotation = 0 }: { supply: UpgradeCard; onClose: () => void; rotation?: number }) => {
  const typeColors = {
    rod: { border: 'border-blue-400', bg: 'from-blue-900 via-blue-800 to-blue-950', accent: 'text-blue-300' },
    reel: { border: 'border-indigo-400', bg: 'from-indigo-900 via-indigo-800 to-indigo-950', accent: 'text-indigo-300' },
    supply: { border: 'border-emerald-400', bg: 'from-emerald-900 via-emerald-800 to-emerald-950', accent: 'text-emerald-300' },
  };
  const colors = typeColors[supply.type] || typeColors.supply;
  const isRod = supply.type === 'rod';
  const isSupply = supply.type === 'supply';

  const rotationStyle: React.CSSProperties = rotation !== 0 ? { transform: `rotate(${rotation}deg)` } : {};
  const getBackgroundImage = () => {
    if (isRod) return rodCardBack;
    if (isSupply) return supplyCardBack;
    return null;
  };
  const backgroundImage = getBackgroundImage();
  const cardStyle: React.CSSProperties = {
    ...rotationStyle,
    ...(backgroundImage ? { backgroundImage: `url(${backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}),
  };

  return (
    <div className={`relative w-80 rounded-2xl border-4 ${colors.border} ${!backgroundImage ? `bg-gradient-to-br ${colors.bg}` : ''} shadow-2xl overflow-hidden transition-transform`} style={cardStyle}>
      {/* Close button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 z-10 h-8 w-8 rounded-full bg-black/40 hover:bg-black/60"
        onClick={onClose}
      >
        <X className="h-4 w-4" />
      </Button>

      {/* Card header */}
      <div className={`relative p-4 pb-2 ${backgroundImage ? 'bg-slate-900/60' : ''}`}>
        <div className="flex items-center justify-between">
          <Badge className={`${isRod ? 'bg-blue-500/30 text-blue-200' : isSupply ? 'bg-emerald-500/30 text-emerald-200' : 'bg-indigo-500/30 text-indigo-200'} uppercase text-xs`}>
            {supply.type}
          </Badge>
          <Badge variant="outline" className="border-white/30 text-white">
            {supply.equipSlot}
          </Badge>
        </div>
      </div>

      {/* Illustration area */}
      <div className={`relative h-40 flex items-center justify-center ${backgroundImage ? 'bg-transparent' : 'bg-black/20'}`}>
        {!backgroundImage && <Package className={`h-24 w-24 ${colors.accent} drop-shadow-lg`} />}
      </div>

      {/* Card body */}
      <div className={`p-4 space-y-3 ${backgroundImage ? 'bg-slate-900/80 backdrop-blur-sm' : ''}`}>
        <DialogHeader className="space-y-1">
          <DialogTitle className={`text-2xl font-bold ${colors.accent}`}>
            {supply.name}
          </DialogTitle>
          <DialogDescription className="text-white/80 text-sm">
            {supply.description}
          </DialogDescription>
        </DialogHeader>

        {/* Cost */}
        <div className="flex gap-2">
          <Badge className="bg-fishbuck/30 text-fishbuck text-sm px-3 py-1">
            <span className="font-bold">${supply.cost}</span>
            <span className="text-xs ml-1 opacity-80">cost</span>
          </Badge>
        </div>

        {/* Effects */}
        {supply.effects.length > 0 && (
          <div className="space-y-1.5">
            <div className="flex items-center gap-1 text-xs uppercase tracking-wide text-white/60">
              <Star className="h-3 w-3" />
              <span>Effects</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {supply.effects.map((effect) => (
                <Badge key={effect} variant="secondary" className="bg-white/10 text-white text-xs">
                  {effect}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
