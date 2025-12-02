// Regret card backgrounds based on value (0-3)
// These are used as the front background for regret cards

// Import backgrounds by regret value
// The images will be added as: regret-0-front.png, regret-1-front.png, etc.
const regretBackgroundMap: Record<number, string | null> = {
  0: null,
  1: null,
  2: null,
  3: null,
};

// Dynamically load regret backgrounds
const loadRegretBackground = async (value: number): Promise<string | null> => {
  try {
    const module = await import(`@/assets/regret-${value}-front.png`);
    return module.default;
  } catch {
    return null;
  }
};

// Initialize backgrounds on module load
const initializeBackgrounds = async () => {
  for (let i = 0; i <= 3; i++) {
    regretBackgroundMap[i] = await loadRegretBackground(i);
  }
};

// Start loading backgrounds
initializeBackgrounds();

export const getRegretBackground = (value: number): string | null => {
  return regretBackgroundMap[value] ?? null;
};

// Hook for React components to get regret background by value
import { useState, useEffect } from 'react';

export const useRegretBackground = (value: number): string | null => {
  const [background, setBackground] = useState<string | null>(regretBackgroundMap[value]);

  useEffect(() => {
    // If already loaded, use cached value
    if (regretBackgroundMap[value]) {
      setBackground(regretBackgroundMap[value]);
      return;
    }

    // Try to load the background
    loadRegretBackground(value).then((bg) => {
      regretBackgroundMap[value] = bg;
      setBackground(bg);
    });
  }, [value]);

  return background;
};
