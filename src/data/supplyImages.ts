// Supply card illustrations
// Import supply card images here as they become available
// import lifeboat from '@/assets/supplies/lifeboat.png';

const supplyImageMap: Record<string, string> = {
  // Uncomment when lifeboat.png is added:
  // 'SUPPLY-005': lifeboat, // Lifeboat - Make Port from Sea
};

export const getSupplyImage = (supplyId: string): string | undefined => {
  return supplyImageMap[supplyId];
};
