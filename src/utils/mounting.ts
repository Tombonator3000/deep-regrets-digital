export const SLOT_MULTIPLIERS = [1, 2, 3] as const;

export const getSlotMultiplier = (slot: number): number => {
  return SLOT_MULTIPLIERS[slot] ?? 1;
};
