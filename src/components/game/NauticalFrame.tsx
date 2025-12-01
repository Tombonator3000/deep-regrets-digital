import woodBorderHorizontal from '@/assets/ui/wood-border-horizontal.png';
import woodBorderVertical from '@/assets/ui/wood-border-vertical.png';
import woodCorner from '@/assets/ui/wood-corner.png';
import fishingNetOverlay from '@/assets/ui/fishing-net-overlay.png';
import ropeDecoration from '@/assets/ui/rope-decoration.png';

interface NauticalFrameProps {
  children: React.ReactNode;
  className?: string;
  showNet?: boolean;
  variant?: 'full' | 'subtle' | 'corners-only';
}

export const NauticalFrame = ({ 
  children, 
  className = '', 
  showNet = false,
  variant = 'full' 
}: NauticalFrameProps) => {
  return (
    <div className={`relative ${className}`}>
      {/* Corner decorations - z-[-1] to appear behind content */}
      <div className="pointer-events-none absolute inset-0 z-[-1]">
        {/* Top-left corner */}
        <img 
          src={woodCorner} 
          alt="" 
          className="absolute -left-1 -top-1 h-12 w-12 opacity-80 sm:h-16 sm:w-16 lg:h-20 lg:w-20"
        />
        {/* Top-right corner */}
        <img 
          src={woodCorner} 
          alt="" 
          className="absolute -right-1 -top-1 h-12 w-12 -scale-x-100 opacity-80 sm:h-16 sm:w-16 lg:h-20 lg:w-20"
        />
        {/* Bottom-left corner */}
        <img 
          src={woodCorner} 
          alt="" 
          className="absolute -bottom-1 -left-1 h-12 w-12 -scale-y-100 opacity-80 sm:h-16 sm:w-16 lg:h-20 lg:w-20"
        />
        {/* Bottom-right corner */}
        <img 
          src={woodCorner} 
          alt="" 
          className="absolute -bottom-1 -right-1 h-12 w-12 scale-x-[-1] scale-y-[-1] opacity-80 sm:h-16 sm:w-16 lg:h-20 lg:w-20"
        />
      </div>

      {variant === 'full' && (
        <div className="pointer-events-none absolute inset-0 z-[-2]">
          {/* Top border */}
          <div 
            className="absolute left-12 right-12 top-0 h-6 opacity-60 sm:left-16 sm:right-16 sm:h-8 lg:left-20 lg:right-20"
            style={{
              backgroundImage: `url(${woodBorderHorizontal})`,
              backgroundSize: 'auto 100%',
              backgroundRepeat: 'repeat-x',
            }}
          />
          {/* Bottom border */}
          <div 
            className="absolute bottom-0 left-12 right-12 h-6 rotate-180 opacity-60 sm:left-16 sm:right-16 sm:h-8 lg:left-20 lg:right-20"
            style={{
              backgroundImage: `url(${woodBorderHorizontal})`,
              backgroundSize: 'auto 100%',
              backgroundRepeat: 'repeat-x',
            }}
          />
          {/* Left border */}
          <div 
            className="absolute bottom-12 left-0 top-12 w-6 opacity-60 sm:bottom-16 sm:top-16 sm:w-8 lg:bottom-20 lg:top-20"
            style={{
              backgroundImage: `url(${woodBorderVertical})`,
              backgroundSize: '100% auto',
              backgroundRepeat: 'repeat-y',
            }}
          />
          {/* Right border */}
          <div 
            className="absolute bottom-12 right-0 top-12 w-6 rotate-180 opacity-60 sm:bottom-16 sm:top-16 sm:w-8 lg:bottom-20 lg:top-20"
            style={{
              backgroundImage: `url(${woodBorderVertical})`,
              backgroundSize: '100% auto',
              backgroundRepeat: 'repeat-y',
            }}
          />
        </div>
      )}

      {/* Fishing net overlay in corners - z-[-3] to appear behind content */}
      {showNet && (
        <div className="pointer-events-none absolute inset-0 z-[-3] overflow-hidden">
          <img 
            src={fishingNetOverlay} 
            alt="" 
            className="absolute -left-8 -top-8 h-32 w-32 opacity-20 sm:h-48 sm:w-48"
          />
          <img 
            src={fishingNetOverlay} 
            alt="" 
            className="absolute -bottom-8 -right-8 h-32 w-32 rotate-180 opacity-20 sm:h-48 sm:w-48"
          />
        </div>
      )}

      {/* Content */}
      <div className="relative z-0 h-full">
        {children}
      </div>
    </div>
  );
};

// Smaller rope accent for panels
export const RopeAccent = ({ className = '' }: { className?: string }) => (
  <div 
    className={`h-8 w-full opacity-40 ${className}`}
    style={{
      backgroundImage: `url(${ropeDecoration})`,
      backgroundSize: 'contain',
      backgroundRepeat: 'repeat-x',
      backgroundPosition: 'center',
    }}
  />
);

// Small corner accent for cards/panels  
export const WoodCornerAccent = ({ position = 'top-left', size = 'sm' }: { 
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  size?: 'sm' | 'md' | 'lg';
}) => {
  const sizeClasses = {
    sm: 'h-6 w-6 sm:h-8 sm:w-8',
    md: 'h-8 w-8 sm:h-10 sm:w-10',
    lg: 'h-10 w-10 sm:h-12 sm:w-12',
  };

  const positionClasses = {
    'top-left': '-left-1 -top-1',
    'top-right': '-right-1 -top-1 -scale-x-100',
    'bottom-left': '-bottom-1 -left-1 -scale-y-100',
    'bottom-right': '-bottom-1 -right-1 scale-x-[-1] scale-y-[-1]',
  };

  return (
    <img 
      src={woodCorner} 
      alt="" 
      className={`pointer-events-none absolute opacity-70 ${sizeClasses[size]} ${positionClasses[position]}`}
    />
  );
};
