// Dink/Trinket card illustrations
import luckyMinnow from '@/assets/dinks/lucky-minnow.png';
import pocketCompass from '@/assets/dinks/pocket-compass.png';
import sturdyNet from '@/assets/dinks/sturdy-net.png';
import coffeeThermos from '@/assets/dinks/coffee-thermos.png';
import fishermansTale from '@/assets/dinks/fishermans-tale.png';
import saltCuredWorms from '@/assets/dinks/salt-cured-worms.png';
import tinBallBearings from '@/assets/dinks/tin-ball-bearings.png';
import scrimshawToken from '@/assets/dinks/scrimshaw-token.png';
import abyssalChart from '@/assets/dinks/abyssal-chart.png';
import luckyClamshell from '@/assets/dinks/lucky-clamshell.png';
import tideReader from '@/assets/dinks/tide-reader.png';
import brassFishHook from '@/assets/dinks/brass-fish-hook.png';
import merchantsToken from '@/assets/dinks/merchants-token.png';

const dinkImageMap: Record<string, string> = {
  'DINK-001': luckyMinnow,
  'DINK-002': pocketCompass,
  'DINK-003': sturdyNet,
  'DINK-004': coffeeThermos,
  'DINK-005': fishermansTale,
  'DINK-006': saltCuredWorms,
  'DINK-007': tinBallBearings,
  'DINK-008': scrimshawToken,
  'DINK-009': abyssalChart,
  'DINK-010': luckyClamshell,
  'DINK-011': tideReader,
  'DINK-012': brassFishHook,
  'DINK-013': merchantsToken,
};

export const getDinkImage = (dinkId: string): string | undefined => {
  return dinkImageMap[dinkId];
};

export const getDefaultDinkImage = (): string => {
  return brassFishHook; // Default fallback
};
