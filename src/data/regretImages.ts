// Regret card illustrations
import lamentableIncident from '@/assets/regrets/lamentable-incident.png';
import fishGotAway from '@/assets/regrets/fish-got-away.png';
import cursedEquipment from '@/assets/regrets/cursed-equipment.png';
import nightmaresDeep from '@/assets/regrets/nightmares-deep.png';
import whispersFog from '@/assets/regrets/whispers-fog.png';
import captainsWords from '@/assets/regrets/captains-words.png';
import lostAtSea from '@/assets/regrets/lost-at-sea.png';
import tentaclesNet from '@/assets/regrets/tentacles-net.png';
import sunkenVessel from '@/assets/regrets/sunken-vessel.png';
import madnessHolds from '@/assets/regrets/madness-holds.png';
import bloodWater from '@/assets/regrets/blood-water.png';
import deepCalls from '@/assets/regrets/deep-calls.png';
import eldritchVisions from '@/assets/regrets/eldritch-visions.png';
import sailorsSuperstition from '@/assets/regrets/sailors-superstition.png';
import krakensEye from '@/assets/regrets/krakens-eye.png';
import cursedWaters from '@/assets/regrets/cursed-waters.png';
import lighthouseKeeper from '@/assets/regrets/lighthouse-keeper.png';
import stormSouls from '@/assets/regrets/storm-souls.png';
import finalCast from '@/assets/regrets/final-cast.png';
import ancientGrudge from '@/assets/regrets/ancient-grudge.png';

const regretImageMap: Record<string, string> = {
  'REG-001': lamentableIncident,
  'REG-002': fishGotAway,
  'REG-003': cursedEquipment,
  'REG-004': nightmaresDeep,
  'REG-005': whispersFog,
  'REG-006': captainsWords,
  'REG-007': lostAtSea,
  'REG-008': tentaclesNet,
  'REG-009': sunkenVessel,
  'REG-010': madnessHolds,
  'REG-011': bloodWater,
  'REG-012': deepCalls,
  'REG-013': eldritchVisions,
  'REG-014': sailorsSuperstition,
  'REG-015': krakensEye,
  'REG-016': cursedWaters,
  'REG-017': lighthouseKeeper,
  'REG-018': stormSouls,
  'REG-019': finalCast,
  'REG-020': ancientGrudge,
};

export const getRegretImage = (regretId: string): string | undefined => {
  return regretImageMap[regretId];
};

export const getDefaultRegretImage = (): string => {
  return lamentableIncident; // Default fallback
};
