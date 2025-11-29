import { cn } from '@/lib/utils';

interface TokenProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
  highlight?: boolean;
  onClick?: () => void;
}

export type BoatColor = 'primary' | 'red' | 'blue' | 'green' | 'orange';

const sizeClasses = {
  sm: 'w-6 h-6',
  md: 'w-10 h-10',
  lg: 'w-14 h-14',
};

// Lifebuoy / Livbøye - redningstokenet
export const LifebuoyToken = ({
  className,
  size = 'md',
  animated = false,
  highlight = false,
  onClick,
}: TokenProps) => (
  <div
    onClick={onClick}
    className={cn(
      'relative flex items-center justify-center rounded-full cursor-default',
      sizeClasses[size],
      animated && 'animate-pulse',
      highlight && 'ring-2 ring-primary ring-offset-2 ring-offset-background',
      onClick && 'cursor-pointer hover:scale-110 transition-transform',
      className
    )}
  >
    {/* Outer ring */}
    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-red-500 to-red-700 shadow-lg" />
    {/* White stripes */}
    <div className="absolute inset-[15%] rounded-full bg-white/90" />
    {/* Inner hole */}
    <div className="absolute inset-[35%] rounded-full bg-slate-900/80" />
    {/* Stripe accents */}
    <div className="absolute top-[10%] left-1/2 -translate-x-1/2 w-[12%] h-[30%] bg-white/90 rounded-full" />
    <div className="absolute bottom-[10%] left-1/2 -translate-x-1/2 w-[12%] h-[30%] bg-white/90 rounded-full" />
    <div className="absolute left-[10%] top-1/2 -translate-y-1/2 w-[30%] h-[12%] bg-white/90 rounded-full" />
    <div className="absolute right-[10%] top-1/2 -translate-y-1/2 w-[30%] h-[12%] bg-white/90 rounded-full" />
  </div>
);

// Anchor / Anker - port/havn-token
export const AnchorToken = ({
  className,
  size = 'md',
  animated = false,
  highlight = false,
  onClick,
}: TokenProps) => (
  <div
    onClick={onClick}
    className={cn(
      'relative flex items-center justify-center',
      sizeClasses[size],
      animated && 'animate-bounce',
      highlight && 'drop-shadow-[0_0_8px_hsl(var(--primary))]',
      onClick && 'cursor-pointer hover:scale-110 transition-transform',
      className
    )}
  >
    <svg viewBox="0 0 24 24" className="w-full h-full" fill="none">
      {/* Main anchor body */}
      <path
        d="M12 3a2 2 0 100 4 2 2 0 000-4z"
        className="fill-slate-300"
      />
      <path
        d="M12 7v13M12 20c-4 0-6-2-6-4h2c0 1 2 2 4 2s4-1 4-2h2c0 2-2 4-6 4z"
        className="stroke-slate-300"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9 10h6"
        className="stroke-slate-300"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  </div>
);

// Lighthouse / Fyrtårn - navigasjonstoken
export const LighthouseToken = ({
  className,
  size = 'md',
  animated = false,
  highlight = false,
  onClick,
}: TokenProps) => (
  <div
    onClick={onClick}
    className={cn(
      'relative flex items-center justify-center',
      sizeClasses[size],
      highlight && 'drop-shadow-[0_0_12px_hsl(45,85%,55%)]',
      onClick && 'cursor-pointer hover:scale-110 transition-transform',
      className
    )}
  >
    <svg viewBox="0 0 24 24" className="w-full h-full">
      {/* Tower base */}
      <path
        d="M8 22h8l-1-8H9l-1 8z"
        className="fill-slate-400"
      />
      {/* Tower middle */}
      <path
        d="M9 14h6l-0.5-4h-5l-0.5 4z"
        className="fill-red-500"
      />
      {/* Tower top */}
      <path
        d="M9.5 10h5l-0.5-3h-4l-0.5 3z"
        className="fill-slate-300"
      />
      {/* Light housing */}
      <path
        d="M10 7h4v-2h-4v2z"
        className="fill-slate-600"
      />
      {/* Light beacon */}
      <circle
        cx="12"
        cy="6"
        r="1.5"
        className={cn(
          'fill-yellow-400',
          animated && 'animate-pulse'
        )}
      />
      {/* Light rays when animated */}
      {animated && (
        <>
          <path
            d="M12 4l0-2M14 6l2-1M10 6l-2-1"
            className="stroke-yellow-400/60"
            strokeWidth="1"
            strokeLinecap="round"
          />
        </>
      )}
      {/* Roof */}
      <path
        d="M10 5l2-3 2 3"
        className="fill-slate-700"
      />
      {/* Red stripes */}
      <rect x="9" y="11" width="6" height="1" className="fill-red-500/60" />
    </svg>
  </div>
);

// Boat / Båt - spillerposisjon på sjøen
export const BoatToken = ({
  className,
  size = 'md',
  animated = false,
  highlight = false,
  color = 'primary',
  onClick,
}: TokenProps & { color?: BoatColor }) => (
  <div
    onClick={onClick}
    className={cn(
      'relative flex items-center justify-center',
      sizeClasses[size],
      animated && 'animate-[boat-bob_2s_ease-in-out_infinite]',
      highlight && 'drop-shadow-[0_0_10px_hsl(var(--primary))]',
      onClick && 'cursor-pointer hover:scale-110 transition-transform',
      className
    )}
  >
    <svg viewBox="0 0 24 24" className="w-full h-full">
      {/* Hull */}
      <path
        d="M2 16l2 4h16l2-4c-4-1-7-1-11-1s-6 0-9 1z"
        className={cn(
          color === 'primary' && 'fill-primary',
          color === 'red' && 'fill-red-500',
          color === 'blue' && 'fill-blue-500',
          color === 'green' && 'fill-green-500',
          color === 'orange' && 'fill-orange-500'
        )}
      />
      {/* Cabin */}
      <rect
        x="8"
        y="11"
        width="8"
        height="5"
        rx="1"
        className="fill-slate-700"
      />
      {/* Mast */}
      <rect x="11" y="4" width="2" height="8" className="fill-slate-600" />
      {/* Sail */}
      <path
        d="M13 5l6 5h-6V5z"
        className="fill-slate-300"
      />
      {/* Flag */}
      <path
        d="M12 4l-3 1.5L12 7V4z"
        className="fill-red-400"
      />
    </svg>
  </div>
);

// Numbered Marker / Nummerert brikke - for spillerrekkefølge/aksjon
interface NumberedMarkerProps extends TokenProps {
  number: number;
  variant?: 'primary' | 'secondary' | 'accent' | 'danger';
}

const variantClasses = {
  primary: 'from-cyan-500 to-cyan-700 text-white',
  secondary: 'from-slate-500 to-slate-700 text-white',
  accent: 'from-green-500 to-green-700 text-white',
  danger: 'from-red-500 to-red-700 text-white',
};

export const NumberedMarker = ({
  number,
  className,
  size = 'md',
  variant = 'primary',
  animated = false,
  highlight = false,
  onClick,
}: NumberedMarkerProps) => (
  <div
    onClick={onClick}
    className={cn(
      'relative flex items-center justify-center rounded-lg shadow-lg font-bold',
      sizeClasses[size],
      `bg-gradient-to-br ${variantClasses[variant]}`,
      size === 'sm' && 'text-xs',
      size === 'md' && 'text-sm',
      size === 'lg' && 'text-lg',
      animated && 'animate-pulse',
      highlight && 'ring-2 ring-white ring-offset-2 ring-offset-background',
      onClick && 'cursor-pointer hover:scale-110 transition-transform',
      className
    )}
  >
    {number}
  </div>
);

// Fish Coin / Fisk-mynt - spesiell token
export const FishCoinToken = ({
  className,
  size = 'md',
  animated = false,
  highlight = false,
  onClick,
}: TokenProps) => (
  <div
    onClick={onClick}
    className={cn(
      'relative flex items-center justify-center rounded-full',
      sizeClasses[size],
      animated && 'animate-[coin-spin_3s_ease-in-out_infinite]',
      highlight && 'drop-shadow-[0_0_15px_hsl(45,85%,55%)]',
      onClick && 'cursor-pointer hover:scale-110 transition-transform',
      className
    )}
  >
    {/* Coin base */}
    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-700 shadow-lg" />
    {/* Inner rim */}
    <div className="absolute inset-[8%] rounded-full bg-gradient-to-br from-yellow-300 via-yellow-500 to-yellow-600" />
    {/* Fish emblem */}
    <svg viewBox="0 0 24 24" className="absolute inset-[20%] w-[60%] h-[60%]">
      <path
        d="M12 6c-4 0-7 3-7 6s3 6 7 6c2 0 4-1 5-2l2 2v-4h-2c0-3-2-6-5-6l2-2h-2z"
        className="fill-yellow-800"
      />
      <circle cx="9" cy="12" r="1" className="fill-yellow-400" />
    </svg>
    {/* Shine effect */}
    <div className="absolute top-[15%] left-[20%] w-[25%] h-[15%] bg-white/40 rounded-full blur-[1px]" />
  </div>
);

// Plug Marker / Plugg-markør - faresone
export const PlugMarker = ({
  className,
  size = 'md',
  animated = true,
  highlight = false,
  onClick,
}: TokenProps) => (
  <div
    onClick={onClick}
    className={cn(
      'relative flex items-center justify-center',
      sizeClasses[size],
      animated && 'animate-pulse',
      highlight && 'drop-shadow-[0_0_15px_hsl(0,70%,50%)]',
      onClick && 'cursor-pointer hover:scale-110 transition-transform',
      className
    )}
  >
    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-red-600 to-red-900 shadow-lg border-2 border-red-400/50" />
    <svg viewBox="0 0 24 24" className="absolute inset-[15%] w-[70%] h-[70%]">
      {/* Skull */}
      <circle cx="12" cy="10" r="6" className="fill-slate-200" />
      <circle cx="10" cy="9" r="1.5" className="fill-red-900" />
      <circle cx="14" cy="9" r="1.5" className="fill-red-900" />
      <path
        d="M10 13h4M11 13v2M13 13v2"
        className="stroke-red-900"
        strokeWidth="1"
        strokeLinecap="round"
      />
      {/* Crossbones */}
      <path
        d="M6 18l12-4M6 14l12 4"
        className="stroke-slate-200"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  </div>
);

// Depth Marker / Dybdemarkør
interface DepthMarkerProps extends TokenProps {
  depth: 1 | 2 | 3;
  active?: boolean;
}

const depthColors = {
  1: 'from-cyan-400 to-cyan-600',
  2: 'from-blue-500 to-blue-700',
  3: 'from-purple-600 to-purple-900',
};

export const DepthMarker = ({
  depth,
  className,
  size = 'md',
  active = false,
  animated = false,
  onClick,
}: DepthMarkerProps) => (
  <div
    onClick={onClick}
    className={cn(
      'relative flex items-center justify-center rounded-lg font-bold text-white shadow-lg',
      sizeClasses[size],
      `bg-gradient-to-br ${depthColors[depth]}`,
      size === 'sm' && 'text-xs',
      size === 'md' && 'text-sm',
      size === 'lg' && 'text-lg',
      active && 'ring-2 ring-white ring-offset-2 ring-offset-background',
      animated && 'animate-pulse',
      onClick && 'cursor-pointer hover:scale-110 transition-transform',
      className
    )}
  >
    {depth}
  </div>
);

// Day Marker / Dagmarkør
interface DayMarkerProps extends TokenProps {
  day: number;
  completed?: boolean;
  current?: boolean;
}

export const DayMarker = ({
  day,
  className,
  size = 'md',
  completed = false,
  current = false,
  onClick,
}: DayMarkerProps) => (
  <div
    onClick={onClick}
    className={cn(
      'relative flex items-center justify-center rounded font-bold shadow-md transition-all',
      sizeClasses[size],
      completed
        ? 'bg-gradient-to-br from-green-500 to-green-700 text-white'
        : current
        ? 'bg-gradient-to-br from-primary to-primary-glow text-slate-900 ring-2 ring-primary/50'
        : 'bg-gradient-to-br from-slate-600 to-slate-800 text-slate-300',
      size === 'sm' && 'text-xs',
      size === 'md' && 'text-sm',
      size === 'lg' && 'text-lg',
      current && 'animate-pulse',
      onClick && 'cursor-pointer hover:scale-110',
      className
    )}
  >
    {completed ? '✓' : day}
  </div>
);
