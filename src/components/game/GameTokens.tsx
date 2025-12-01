import { cn } from '@/lib/utils';
import boatImage from '@/assets/boat.png';

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

// Lifebuoy / Livbøye - redningstokenet (matches the physical game piece)
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
      'relative flex items-center justify-center cursor-default',
      sizeClasses[size],
      animated && 'animate-pulse',
      highlight && 'drop-shadow-[0_0_10px_hsl(var(--primary))]',
      onClick && 'cursor-pointer hover:scale-110 transition-transform',
      className
    )}
  >
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <defs>
        {/* Weathered texture filter */}
        <filter id="lifebuoy-texture" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="3" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="2" />
        </filter>
        {/* Brownish-red gradient for the ring */}
        <linearGradient id="lifebuoy-red" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#9B5049" />
          <stop offset="50%" stopColor="#7B3B35" />
          <stop offset="100%" stopColor="#6B2F2A" />
        </linearGradient>
        {/* Light blue-white for stripes */}
        <linearGradient id="lifebuoy-stripe" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#E8F0F8" />
          <stop offset="100%" stopColor="#C8D8E8" />
        </linearGradient>
      </defs>

      {/* Main ring - outer circle */}
      <circle cx="50" cy="50" r="46" fill="url(#lifebuoy-red)" filter="url(#lifebuoy-texture)" />

      {/* Inner hole */}
      <circle cx="50" cy="50" r="22" fill="transparent" stroke="#1a1a2e" strokeWidth="2" />
      <circle cx="50" cy="50" r="20" fill="#1a1a2e" opacity="0.9" />

      {/* White/light blue stripes - 4 sections */}
      {/* Top stripe */}
      <path
        d="M 38 10 A 40 40 0 0 1 62 10 L 56 26 A 24 24 0 0 0 44 26 Z"
        fill="url(#lifebuoy-stripe)"
        filter="url(#lifebuoy-texture)"
      />
      {/* Right stripe */}
      <path
        d="M 90 38 A 40 40 0 0 1 90 62 L 74 56 A 24 24 0 0 0 74 44 Z"
        fill="url(#lifebuoy-stripe)"
        filter="url(#lifebuoy-texture)"
      />
      {/* Bottom stripe */}
      <path
        d="M 62 90 A 40 40 0 0 1 38 90 L 44 74 A 24 24 0 0 0 56 74 Z"
        fill="url(#lifebuoy-stripe)"
        filter="url(#lifebuoy-texture)"
      />
      {/* Left stripe */}
      <path
        d="M 10 62 A 40 40 0 0 1 10 38 L 26 44 A 24 24 0 0 0 26 56 Z"
        fill="url(#lifebuoy-stripe)"
        filter="url(#lifebuoy-texture)"
      />

      {/* Highlight lines (rope texture) */}
      <circle cx="50" cy="50" r="44" fill="none" stroke="#ffffff" strokeWidth="0.5" opacity="0.3" />
      <circle cx="50" cy="50" r="24" fill="none" stroke="#ffffff" strokeWidth="0.5" opacity="0.3" />

      {/* -2 text on the ring */}
      <text
        x="50"
        y="82"
        textAnchor="middle"
        fontSize="12"
        fontWeight="bold"
        fill="#C8D8E8"
        fontFamily="sans-serif"
      >
        -2
      </text>
    </svg>
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

// Color filter values to shift the cyan boat to other colors
const boatColorFilters = {
  primary: '', // Original cyan color
  blue: 'hue-rotate(30deg)',
  red: 'hue-rotate(150deg) saturate(1.5)',
  green: 'hue-rotate(-60deg)',
  orange: 'hue-rotate(180deg) saturate(1.3)',
};

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
    <img
      src={boatImage}
      alt="Boat"
      className="w-full h-full object-contain"
      style={{ filter: boatColorFilters[color] }}
    />
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
      animated && 'animate-plug-erosion',
      highlight && 'drop-shadow-[0_0_15px_hsl(0,70%,50%)]',
      onClick && 'cursor-pointer hover:scale-110 transition-transform',
      className
    )}
  >
    {/* Pulsing danger ring */}
    {animated && (
      <div className="absolute inset-[-4px] rounded-full bg-gradient-to-br from-red-500/50 to-orange-500/30 animate-pulse" />
    )}
    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-red-600 to-red-900 shadow-lg border-2 border-red-400/50" />
    {/* Inner glow effect */}
    <div className="absolute inset-[5%] rounded-full bg-gradient-radial from-red-400/20 to-transparent animate-pulse" />
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
