'use client';

import { create } from 'zustand';
import {
  AvatarItem,
  CharacterGender,
  EquipmentSlot,
  EquippedMap,
} from '@/types/avatar.types';
import { STARTER_AVATAR_CATALOG } from '@/data/avatarCatalog';
import { apiRequest } from '@/lib/api';

const STORAGE_KEY = 'fittrack_avatar_config_v2';

export interface AvatarState {
  characterGender: CharacterGender;
  customHairColor: string | null;
  equipped: EquippedMap;
  preview: EquippedMap;
  inventory: AvatarItem[];
  selectedSlot: EquipmentSlot;
  selectedItem: AvatarItem | null;
  isDirty: boolean;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;

  // Actions
  setGender: (gender: CharacterGender) => void;
  setCustomHairColor: (color: string | null) => void;
  setSelectedSlot: (slot: EquipmentSlot) => void;
  setSelectedItem: (item: AvatarItem | null) => void;
  previewItem: (slot: EquipmentSlot, item: AvatarItem | null) => void;
  revertPreview: () => void;
  equipPreview: (slot: EquipmentSlot, item: AvatarItem) => void;
  unequipPreview: (slot: EquipmentSlot) => void;
  saveOutfit: () => Promise<boolean>;
  loadAvatarData: () => Promise<void>;
  resetToDefaults: () => void;
  isItemUnlocked: (item: AvatarItem, userLevel?: number, streak?: number) => boolean;
}

// Generate default equipped outfit based on gender
export function getDefaultEquipped(gender: CharacterGender): EquippedMap {
  const byCode = (code: string) =>
    STARTER_AVATAR_CATALOG.find((it) => it.itemCode === code) || null;

  if (gender === 'female') {
    return {
      HEADWEAR: null,
      HAIR: byCode('female_braids'),
      TOP: byCode('female_tunic'),
      BOTTOM: byCode('blue_skirt'),
      SHOES: byCode('leather_boots'),
      ACCESSORIES: byCode('retro_glasses'),
      SPECIAL: null,
    };
  }

  return {
    HEADWEAR: null,
    HAIR: byCode('male_spiky'),
    TOP: byCode('orange_plaid'),
    BOTTOM: byCode('brown_cargo'),
    SHOES: byCode('combat_boots'),
    ACCESSORIES: null,
    SPECIAL: null,
  };
}

// Load persisted configuration from localStorage
function loadLocalConfig(): {
  gender: CharacterGender;
  customHairColor: string | null;
  equipped: EquippedMap;
} | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const gender: CharacterGender = parsed.gender === 'female' ? 'female' : 'male';
    const customHairColor: string | null = parsed.customHairColor || null;
    const equipped: EquippedMap = {};

    if (parsed.equippedIds) {
      Object.entries(parsed.equippedIds).forEach(([slot, itemId]) => {
        if (itemId) {
          const item = STARTER_AVATAR_CATALOG.find((it) => it.id === itemId);
          if (item) equipped[slot as EquipmentSlot] = item;
        }
      });
    }

    return { gender, customHairColor, equipped };
  } catch {
    return null;
  }
}

// Save persisted configuration to localStorage
function saveLocalConfig(
  gender: CharacterGender,
  customHairColor: string | null,
  equipped: EquippedMap
) {
  if (typeof window === 'undefined') return;
  try {
    const equippedIds: Record<string, string | null> = {};
    Object.entries(equipped).forEach(([slot, item]) => {
      equippedIds[slot] = item ? item.id : null;
    });
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        gender,
        customHairColor,
        equippedIds,
        updatedAt: new Date().toISOString(),
      })
    );
  } catch {
    // Ignore storage quota errors
  }
}

const initialLocal = loadLocalConfig();
const initialGender: CharacterGender = initialLocal?.gender || 'male';
const initialCustomHairColor: string | null = initialLocal?.customHairColor || null;
const initialEquipped: EquippedMap =
  initialLocal && Object.keys(initialLocal.equipped).length > 0
    ? initialLocal.equipped
    : getDefaultEquipped(initialGender);

// Initial unlocked items: all items for mock test buff
const initialUnlocked = STARTER_AVATAR_CATALOG;

export const useAvatarStore = create<AvatarState>((set, get) => ({
  characterGender: initialGender,
  customHairColor: initialCustomHairColor,
  equipped: initialEquipped,
  preview: { ...initialEquipped },
  inventory: initialUnlocked,
  selectedSlot: 'TOP',
  selectedItem: initialEquipped['TOP'] || null,
  isDirty: false,
  isLoading: false,
  isSaving: false,
  error: null,

  setGender: (gender) => {
    const current = get();
    if (current.characterGender === gender) return;

    // Default outfit for newly selected gender
    const newEquipped = getDefaultEquipped(gender);
    set({
      characterGender: gender,
      equipped: newEquipped,
      preview: { ...newEquipped },
      selectedItem: newEquipped[current.selectedSlot] || null,
      isDirty: false,
    });
    saveLocalConfig(gender, current.customHairColor, newEquipped);
  },

  setCustomHairColor: (color) => {
    const { characterGender, equipped } = get();
    set({ customHairColor: color, isDirty: true });
    saveLocalConfig(characterGender, color, equipped);
  },

  setSelectedSlot: (slot) => {
    const { preview } = get();
    set({
      selectedSlot: slot,
      selectedItem: preview[slot] || null,
    });
  },

  setSelectedItem: (item) => {
    set({ selectedItem: item });
  },

  previewItem: (slot, item) => {
    set((state) => ({
      preview: {
        ...state.preview,
        [slot]: item,
      },
      selectedItem: item,
      isDirty: true,
    }));
  },

  revertPreview: () => {
    const { equipped, selectedSlot } = get();
    set({
      preview: { ...equipped },
      selectedItem: equipped[selectedSlot] || null,
      isDirty: false,
    });
  },

  equipPreview: (slot, item) => {
    set((state) => {
      const nextEquipped = {
        ...state.equipped,
        [slot]: item,
      };
      return {
        equipped: nextEquipped,
        preview: { ...nextEquipped },
        selectedItem: item,
        isDirty: false,
      };
    });
    const { characterGender, customHairColor, equipped } = get();
    saveLocalConfig(characterGender, customHairColor, equipped);
  },

  unequipPreview: (slot) => {
    set((state) => ({
      preview: {
        ...state.preview,
        [slot]: null,
      },
      selectedItem: null,
      isDirty: true,
    }));
  },

  saveOutfit: async () => {
    const { characterGender, customHairColor, preview } = get();
    set({ isSaving: true, error: null });

    try {
      const newEquipped = { ...preview };

      // 1. Always update local storage first for instant feedback
      saveLocalConfig(characterGender, customHairColor, newEquipped);

      // 2. Synchronize with Backend Laravel API if available
      try {
        await apiRequest('/avatar/equip', {
          method: 'POST',
          body: JSON.stringify({
            gender: characterGender,
            headwear_id: newEquipped.HEADWEAR?.id || null,
            hair_id: newEquipped.HAIR?.id || null,
            top_id: newEquipped.TOP?.id || null,
            bottom_id: newEquipped.BOTTOM?.id || null,
            shoes_id: newEquipped.SHOES?.id || null,
            accessory_id: newEquipped.ACCESSORIES?.id || null,
            special_id: newEquipped.SPECIAL?.id || null,
          }),
        });
      } catch (err) {
        // Fallback to local persistence gracefully if backend endpoint is unavailable
        console.warn('Backend /avatar/equip offline, saved to local cache:', err);
      }

      set({
        equipped: newEquipped,
        preview: { ...newEquipped },
        isDirty: false,
        isSaving: false,
      });
      return true;
    } catch (err: any) {
      set({ error: err.message || 'Lỗi lưu trang phục', isSaving: false });
      return false;
    }
  },

  loadAvatarData: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await apiRequest<any>('/avatar', { timeoutMs: 3000 });
      if (res && res.data) {
        const serverGender: CharacterGender =
          res.data.gender === 'female' ? 'female' : 'male';
        const serverEquipped: EquippedMap = {};

        if (res.data.equipped) {
          Object.entries(res.data.equipped).forEach(([slot, item]: [string, any]) => {
            if (item) serverEquipped[slot as EquipmentSlot] = item;
          });
        }

        const serverInventory: AvatarItem[] = Array.isArray(res.data.inventory)
          ? res.data.inventory
          : initialUnlocked;

        set({
          characterGender: serverGender,
          equipped: serverEquipped,
          preview: { ...serverEquipped },
          inventory: serverInventory,
          isLoading: false,
        });
        saveLocalConfig(serverGender, get().customHairColor, serverEquipped);
        return;
      }
    } catch {
      // Backend not available, keep existing/local state
    }
    set({ isLoading: false });
  },

  resetToDefaults: () => {
    const { characterGender, customHairColor } = get();
    const defaults = getDefaultEquipped(characterGender);
    set({
      equipped: defaults,
      preview: { ...defaults },
      customHairColor: null,
      isDirty: false,
    });
    saveLocalConfig(characterGender, null, defaults);
  },

  // Mock Test Buff: Buff level to 50 & streak to 30 so ALL items in the entire catalog are unlocked!
  isItemUnlocked: (_item, userLevel = 50, streak = 30) => {
    if (userLevel >= 50 || streak >= 30) return true;
    if (_item.unlockType === 'DEFAULT') return true;
    if (_item.unlockType === 'LEVEL') return userLevel >= _item.unlockValue;
    if (_item.unlockType === 'STREAK') return streak >= _item.unlockValue;
    return true;
  },
}));
