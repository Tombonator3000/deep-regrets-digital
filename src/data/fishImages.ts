// Fish card illustration imports
import sardineSchool from '@/assets/fish/sardine-school.png';
import atlanticMackerel from '@/assets/fish/atlantic-mackerel.png';
import seaBass from '@/assets/fish/sea-bass.png';
import ancientCod from '@/assets/fish/ancient-cod.png';
import stingingMedusa from '@/assets/fish/stinging-medusa.png';
import bluefinTuna from '@/assets/fish/bluefin-tuna.png';
import reefShark from '@/assets/fish/reef-shark.png';
import giantOctopus from '@/assets/fish/giant-octopus.png';
import lesserKraken from '@/assets/fish/lesser-kraken.png';
import deepLeviathan from '@/assets/fish/deep-leviathan.png';
import abyssalAnglerfish from '@/assets/fish/abyssal-anglerfish.png';
import ghostWhale from '@/assets/fish/ghost-whale.png';
import seaSerpent from '@/assets/fish/sea-serpent.png';
import bronzeSwordfish from '@/assets/fish/bronze-swordfish.png';
import shadowManta from '@/assets/fish/shadow-manta.png';
import colossalSquid from '@/assets/fish/colossal-squid.png';
import abyssalDragon from '@/assets/fish/abyssal-dragon.png';
import thePlug from '@/assets/fish/the-plug.png';
import rainbowTrout from '@/assets/fish/rainbow-trout.png';
import redSnapper from '@/assets/fish/red-snapper.png';
import giantLobster from '@/assets/fish/giant-lobster.png';
import stoneCrab from '@/assets/fish/stone-crab.png';
import inkSquid from '@/assets/fish/ink-squid.png';
import hypnoticCuttlefish from '@/assets/fish/hypnotic-cuttlefish.png';
import eldritchBlobfish from '@/assets/fish/eldritch-blobfish.png';
import livingFossil from '@/assets/fish/living-fossil.png';
import voidOrca from '@/assets/fish/void-orca.png';
import doomOarfish from '@/assets/fish/doom-oarfish.png';
import cursedBarracuda from '@/assets/fish/cursed-barracuda.png';
import stripedMarlin from '@/assets/fish/striped-marlin.png';
import whaleOfRocabarraigh from '@/assets/fish/whale-of-rocabarraigh.png';

// Map fish IDs to their illustration images
export const FISH_IMAGE_MAP: Record<string, string> = {
  // Depth 1 - Small
  'FISH-D1-SARDINE-001': sardineSchool,
  'FISH-D1-HERRING-006': sardineSchool, // Similar silver fish
  'FISH-D1-ANCHOVY-009': sardineSchool, // Similar small fish
  'FISH-D1-PERCH-007': rainbowTrout, // Similar colorful fish
  'FISH-D1-FLOUNDER-004': ancientCod, // Flatfish

  // Depth 1 - Mid
  'FISH-D1-MACKEREL-002': atlanticMackerel,
  'FISH-D1-SQUID-012': inkSquid,
  'FISH-D1-CRAB-010': stoneCrab,
  'FISH-D1-BASS-003': seaBass,
  'FISH-D1-TROUT-008': rainbowTrout,

  // Depth 1 - Large
  'FISH-D1-COD-005': ancientCod,
  'FISH-D1-SNAPPER-011': redSnapper,
  'FISH-D1-HALIBUT-013': ancientCod, // Flatfish

  // Depth 2 - Small
  'FISH-D2-JELLYFISH-009': stingingMedusa,
  'FISH-D2-CUTTLEFISH-011': hypnoticCuttlefish,

  // Depth 2 - Mid
  'FISH-D2-MANTA-004': shadowManta,
  'FISH-D2-MORAY-007': seaSerpent, // Eel-like
  'FISH-D2-BARRACUDA-005': cursedBarracuda,
  'FISH-D2-TUNA-001': bluefinTuna,
  'FISH-D2-GROUPER-008': seaBass, // Similar large fish
  'FISH-D2-WAHOO-012': stripedMarlin, // Similar game fish

  // Depth 2 - Large
  'FISH-D2-SHARK-002': reefShark,
  'FISH-D2-LOBSTER-013': giantLobster,
  'FISH-D2-SWORDFISH-006': bronzeSwordfish,
  'FISH-D2-OCTOPUS-003': giantOctopus,
  'FISH-D2-MARLIN-010': stripedMarlin,

  // Depth 3 - Small
  'FISH-D3-BLOBFISH-012': eldritchBlobfish,
  'FISH-D3-ISOPOD-011': stoneCrab, // Crustacean

  // Depth 3 - Mid
  'FISH-D3-ANGLER-005': abyssalAnglerfish,
  'FISH-D3-COELACANTH-009': livingFossil,
  'FISH-D3-ORCA-004': voidOrca,
  'FISH-D3-OARFISH-010': doomOarfish,

  // Depth 3 - Large
  'FISH-D3-PLUG-003': thePlug,
  'FISH-D3-KRAKEN-001': lesserKraken,
  'FISH-D3-SQUID-006': colossalSquid,
  'FISH-D3-SERPENT-008': seaSerpent,
  'FISH-D3-WHALE-007': ghostWhale,
  'FISH-D3-WHALE-014': whaleOfRocabarraigh,
  'FISH-D3-LEVIATHAN-002': deepLeviathan,
  'FISH-D3-DRAGON-013': abyssalDragon,
};

// Get fish image by ID, with fallback
export const getFishImage = (fishId: string): string | undefined => {
  return FISH_IMAGE_MAP[fishId];
};

// Default fish image placeholder based on depth
export const getDefaultFishImage = (depth: number): string => {
  switch (depth) {
    case 1:
      return sardineSchool;
    case 2:
      return bluefinTuna;
    case 3:
      return lesserKraken;
    default:
      return sardineSchool;
  }
};
