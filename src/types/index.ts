export type SkinRarity =
  | "Consumer"
  | "Industrial"
  | "Mil-Spec"
  | "Restricted"
  | "Classified"
  | "Covert"
  | "Contraband";

export interface Skin {
  id: string;
  name: string;
  weapon: string;
  image: string;
  price: number;
  rarity: SkinRarity;
  collection?: string;
}

export interface UpgradeResult {
  won: boolean;
  chance: number;
  roll: number;
  targetSkin: Skin;
  betSkin: Skin;
  serverSeed: string;
  clientSeed: string;
  nonce: number;
  hash: string;
}

export interface GameHistoryEntry {
  id: string;
  timestamp: number;
  betSkin: Skin;
  targetSkin: Skin;
  chance: number;
  won: boolean;
  roll: number;
}

export const RARITY_COLORS: Record<SkinRarity, string> = {
  Consumer: "#b0c3d9",
  Industrial: "#5e98d9",
  "Mil-Spec": "#4b69ff",
  Restricted: "#8847ff",
  Classified: "#d32ce6",
  Covert: "#eb4b4b",
  Contraband: "#e4ae39",
};
