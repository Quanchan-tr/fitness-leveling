/**
 * Modern Voxel Avatar & Modular Equipment Customization Types
 */

export type CharacterGender = 'male' | 'female';

export type EquipmentSlot =
  | 'HEADWEAR'
  | 'HAIR'
  | 'TOP'
  | 'BOTTOM'
  | 'SHOES'
  | 'ACCESSORIES'
  | 'SPECIAL';

export type ItemRarity = 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';

export type UnlockType =
  | 'DEFAULT'
  | 'LEVEL'
  | 'FITCOIN'
  | 'STREAK'
  | 'TOTAL_REPS'
  | 'CALORIES';

export interface AvatarItem {
  id: string;
  itemCode: string;
  name: string;
  slot: EquipmentSlot;
  gender: 'male' | 'female' | 'unisex';
  rarity: ItemRarity;
  theme: string;
  description?: string;
  meshUrl: string;
  iconUrl?: string;
  unlockType: UnlockType;
  unlockValue: number;
  fitcoinPrice?: number | null;
  /** Primary / secondary display colors for preview thumbnail */
  colors?: {
    primary: string;
    secondary?: string;
    accent?: string;
  };
  /** Compatibility flags: e.g. hides hair when equipped */
  hidesHair?: boolean;
  /** Whether the hat completely covers the top crown of the head (like beanies, caps) */
  coversCrown?: boolean;
}

export type EquippedMap = Partial<Record<EquipmentSlot, AvatarItem | null>>;

export interface UserAvatarConfig {
  userId: string;
  gender: CharacterGender;
  customHairColor?: string | null;
  headwearId?: string | null;
  hairId?: string | null;
  topId?: string | null;
  bottomId?: string | null;
  shoesId?: string | null;
  accessoryId?: string | null;
  specialId?: string | null;
  updatedAt?: string;
}

export interface AvatarApiResponse {
  config: UserAvatarConfig;
  equipped: EquippedMap;
  inventory: AvatarItem[];
  catalog: AvatarItem[];
}

