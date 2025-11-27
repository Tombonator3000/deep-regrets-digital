import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  rotation: number;
  opacity: number;
}

interface ParticleBurstProps {
  active: boolean;
  type: 'success' | 'failure' | 'coins' | 'bubbles' | 'sparkle';
  originX?: number;
  originY?: number;
  onComplete?: () => void;
  className?: string;
}

const PARTICLE_COLORS = {
  success: ['#10b981', '#34d399', '#6ee7b7', '#a7f3d0', '#fbbf24'],
  failure: ['#ef4444', '#f87171', '#fca5a5', '#7f1d1d', '#991b1b'],
  coins: ['#fbbf24', '#f59e0b', '#d97706', '#fcd34d', '#fef3c7'],
  bubbles: ['#22d3ee', '#67e8f9', '#a5f3fc', '#cffafe', '#0891b2'],
  sparkle: ['#f472b6', '#c084fc', '#a78bfa', '#60a5fa', '#fbbf24'],
};

export const ParticleBurst = ({
  active,
  type,
  originX = 50,
  originY = 50,
  onComplete,
  className,
}: ParticleBurstProps) => {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (!active) {
      setParticles([]);
      return;
    }

    const colors = PARTICLE_COLORS[type];
    const particleCount = type === 'coins' ? 15 : 25;
    const newParticles: Particle[] = [];

    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 * i) / particleCount + Math.random() * 0.5;
      const speed = 3 + Math.random() * 5;

      newParticles.push({
        id: i,
        x: originX,
        y: originY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - (type === 'bubbles' ? 5 : 0),
        size: 4 + Math.random() * 8,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        opacity: 1,
      });
    }

    setParticles(newParticles);

    // Animate particles
    let frame = 0;
    const maxFrames = 40;
    const gravity = type === 'bubbles' ? -0.1 : 0.3;
    const friction = 0.95;

    const animate = () => {
      frame++;
      if (frame > maxFrames) {
        setParticles([]);
        onComplete?.();
        return;
      }

      setParticles((prev) =>
        prev.map((p) => ({
          ...p,
          x: p.x + p.vx,
          y: p.y + p.vy,
          vx: p.vx * friction,
          vy: p.vy * friction + gravity,
          rotation: p.rotation + p.vx * 3,
          opacity: 1 - frame / maxFrames,
        }))
      );

      requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  }, [active, type, originX, originY, onComplete]);

  if (!active && particles.length === 0) return null;

  return (
    <div className={cn('absolute inset-0 pointer-events-none overflow-hidden z-50', className)}>
      {particles.map((p) => (
        <div
          key={p.id}
          className={cn(
            'absolute rounded-full',
            type === 'coins' && 'rounded-sm',
            type === 'sparkle' && 'rounded-none'
          )}
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            opacity: p.opacity,
            transform: `translate(-50%, -50%) rotate(${p.rotation}deg)`,
            boxShadow: `0 0 ${p.size}px ${p.color}80`,
            clipPath: type === 'sparkle' ? 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)' : undefined,
          }}
        />
      ))}
    </div>
  );
};

// Confetti burst for victories
interface ConfettiProps {
  active: boolean;
  onComplete?: () => void;
}

interface ConfettiPiece {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  color: string;
  rotation: number;
  rotationSpeed: number;
}

export const ConfettiBurst = ({ active, onComplete }: ConfettiProps) => {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);

  useEffect(() => {
    if (!active) {
      setPieces([]);
      return;
    }

    const colors = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899'];
    const pieceCount = 60;
    const newPieces: ConfettiPiece[] = [];

    for (let i = 0; i < pieceCount; i++) {
      newPieces.push({
        id: i,
        x: 40 + Math.random() * 20,
        y: -10,
        vx: (Math.random() - 0.5) * 8,
        vy: 2 + Math.random() * 4,
        width: 6 + Math.random() * 6,
        height: 10 + Math.random() * 10,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 15,
      });
    }

    setPieces(newPieces);

    let frame = 0;
    const maxFrames = 120;

    const animate = () => {
      frame++;
      if (frame > maxFrames) {
        setPieces([]);
        onComplete?.();
        return;
      }

      setPieces((prev) =>
        prev.map((p) => ({
          ...p,
          x: p.x + p.vx * 0.3,
          y: p.y + p.vy,
          vy: p.vy + 0.1,
          vx: p.vx * 0.99,
          rotation: p.rotation + p.rotationSpeed,
        }))
      );

      requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  }, [active, onComplete]);

  if (!active && pieces.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
      {pieces.map((p) => (
        <div
          key={p.id}
          className="absolute"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.width,
            height: p.height,
            backgroundColor: p.color,
            transform: `translate(-50%, -50%) rotate(${p.rotation}deg)`,
          }}
        />
      ))}
    </div>
  );
};

// Floating score indicator
interface ScorePopupProps {
  value: number | string;
  x: number;
  y: number;
  type?: 'gain' | 'loss' | 'neutral';
  onComplete?: () => void;
}

export const ScorePopup = ({ value, x, y, type = 'neutral', onComplete }: ScorePopupProps) => {
  const [position, setPosition] = useState({ y, opacity: 1 });

  useEffect(() => {
    let frame = 0;
    const maxFrames = 40;

    const animate = () => {
      frame++;
      if (frame > maxFrames) {
        onComplete?.();
        return;
      }

      setPosition({
        y: y - frame * 1.5,
        opacity: 1 - frame / maxFrames,
      });

      requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  }, [y, onComplete]);

  return (
    <div
      className={cn(
        'absolute pointer-events-none font-bold text-lg z-50',
        type === 'gain' && 'text-green-400',
        type === 'loss' && 'text-red-400',
        type === 'neutral' && 'text-white'
      )}
      style={{
        left: `${x}%`,
        top: `${position.y}%`,
        opacity: position.opacity,
        transform: 'translate(-50%, -50%)',
        textShadow: '0 0 10px currentColor',
      }}
    >
      {type === 'gain' && '+'}
      {type === 'loss' && '-'}
      {value}
    </div>
  );
};

// Screen shake effect
interface ScreenShakeProps {
  active: boolean;
  intensity?: 'light' | 'medium' | 'heavy';
  children: React.ReactNode;
}

export const ScreenShake = ({ active, intensity = 'medium', children }: ScreenShakeProps) => {
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!active) {
      setOffset({ x: 0, y: 0 });
      return;
    }

    const intensityMap = {
      light: 3,
      medium: 6,
      heavy: 12,
    };

    const maxOffset = intensityMap[intensity];
    let frame = 0;
    const maxFrames = 15;

    const shake = () => {
      frame++;
      if (frame > maxFrames) {
        setOffset({ x: 0, y: 0 });
        return;
      }

      const decay = 1 - frame / maxFrames;
      setOffset({
        x: (Math.random() - 0.5) * maxOffset * decay,
        y: (Math.random() - 0.5) * maxOffset * decay,
      });

      requestAnimationFrame(shake);
    };

    shake();
  }, [active, intensity]);

  return (
    <div
      style={{
        transform: `translate(${offset.x}px, ${offset.y}px)`,
      }}
    >
      {children}
    </div>
  );
};

// Ripple effect on click
interface RippleEffectProps {
  color?: string;
  className?: string;
}

export const RippleEffect = ({ color = 'hsl(var(--primary))', className }: RippleEffectProps) => {
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([]);

  const addRipple = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const id = Date.now();
    setRipples((prev) => [...prev, { id, x, y }]);

    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== id));
    }, 600);
  };

  return (
    <div
      className={cn('absolute inset-0 overflow-hidden', className)}
      onClick={addRipple}
    >
      {ripples.map((ripple) => (
        <span
          key={ripple.id}
          className="absolute rounded-full animate-[ripple_0.6s_ease-out]"
          style={{
            left: `${ripple.x}%`,
            top: `${ripple.y}%`,
            backgroundColor: color,
            transform: 'translate(-50%, -50%)',
          }}
        />
      ))}
    </div>
  );
};

// Glowing pulse effect
interface GlowPulseProps {
  color?: string;
  active?: boolean;
  children: React.ReactNode;
  className?: string;
}

export const GlowPulse = ({
  color = 'hsl(var(--primary))',
  active = true,
  children,
  className,
}: GlowPulseProps) => {
  return (
    <div
      className={cn(
        'relative',
        active && 'animate-[glow-pulse_2s_ease-in-out_infinite]',
        className
      )}
      style={{
        '--glow-color': color,
      } as React.CSSProperties}
    >
      {children}
    </div>
  );
};
