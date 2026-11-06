'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import {
  X,
  RotateCw,
  Check,
  RotateCcw,
  Sparkles,
  Lock,
  Shirt,
  Footprints,
  Eye,
  Zap,
  Crown,
  Layers,
} from 'lucide-react';
import { useAvatarStore } from '@/stores/useAvatarStore';
import { STARTER_AVATAR_CATALOG } from '@/data/avatarCatalog';
import { EquipmentSlot, ItemRarity } from '@/types/avatar.types';
import { ItemVisualIcon } from '@/components/character/ItemVisualIcon';

// Lazy-load CharacterCanvas in modal
const CharacterCanvas = dynamic(
  () => import('./3d/CharacterCanvas').then((mod) => mod.CharacterCanvas),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex flex-col items-center justify-center animate-pulse">
        <div className="w-8 h-8 rounded-full border-2 border-[#FF5722] border-t-transparent animate-spin mb-2" />
        <span className="text-xs font-semibold text-slate-400">Đang tải...</span>
      </div>
    ),
  }
);

interface WardrobeModalProps {
  isOpen: boolean;
  onClose: () => void;
  userLevel?: number;
  userStats?: { str: number; end: number; mob: number };
}

const SLOTS_CONFIG: { slot: EquipmentSlot; label: string; icon: React.FC<{ className?: string }> }[] = [
  { slot: 'HEADWEAR', label: 'Nón', icon: Crown },
  { slot: 'HAIR', label: 'Tóc', icon: Sparkles },
  { slot: 'TOP', label: 'Áo', icon: Shirt },
  { slot: 'BOTTOM', label: 'Quần', icon: Layers },
  { slot: 'SHOES', label: 'Giày', icon: Footprints },
  { slot: 'ACCESSORIES', label: 'Phụ kiện', icon: Eye },
  { slot: 'SPECIAL', label: 'Hiệu ứng', icon: Zap },
];

const HAIR_COLOR_PALETTE = [
  { name: 'Nâu Tự Nhiên', color: '#78350F' },
  { name: 'Đen Mun', color: '#18181B' },
  { name: 'Vàng Kim', color: '#EAB308' },
  { name: 'Bạch Kim', color: '#E2E8F0' },
  { name: 'Đỏ Lửa', color: '#DC2626' },
  { name: 'Xanh Cyber', color: '#06B6D4' },
  { name: 'Tím Shadow', color: '#7C3AED' },
  { name: 'Hồng Sakura', color: '#EC4899' },
  { name: 'Lục Bảo', color: '#10B981' },
];

const RARITY_COLORS: Record<ItemRarity, { border: string; bg: string; text: string; badge: string }> = {
  COMMON: {
    border: 'border-slate-200',
    bg: 'bg-white',
    text: 'text-slate-700',
    badge: 'bg-slate-100 text-slate-600',
  },
  RARE: {
    border: 'border-sky-300',
    bg: 'bg-sky-50/30',
    text: 'text-sky-700',
    badge: 'bg-sky-100 text-sky-700',
  },
  EPIC: {
    border: 'border-purple-300',
    bg: 'bg-purple-50/30',
    text: 'text-purple-700',
    badge: 'bg-purple-100 text-purple-700',
  },
  LEGENDARY: {
    border: 'border-amber-300',
    bg: 'bg-amber-50/40',
    text: 'text-amber-700',
    badge: 'bg-amber-100 text-amber-800 font-bold',
  },
};

export const WardrobeModal: React.FC<WardrobeModalProps> = ({
  isOpen,
  onClose,
  userLevel = 50,
}) => {
  const {
    characterGender,
    customHairColor,
    preview,
    selectedSlot,
    isDirty,
    isSaving,
    setGender,
    setCustomHairColor,
    setSelectedSlot,
    previewItem,
    unequipPreview,
    revertPreview,
    saveOutfit,
    isItemUnlocked,
  } = useAvatarStore();

  const [isAutoRotating, setIsAutoRotating] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!isOpen) return null;

  // Filter items for current slot and gender
  const slotItems = STARTER_AVATAR_CATALOG.filter((it) => {
    if (it.slot !== selectedSlot) return false;
    if (it.gender === 'unisex') return true;
    return it.gender === characterGender;
  });

  const activePreviewItem = preview[selectedSlot] || null;

  const handleSave = async () => {
    const success = await saveOutfit();
    if (success) {
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        onClose();
      }, 600);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-5 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-white rounded-none sm:rounded-3xl border border-slate-200/90 shadow-2xl w-full max-w-5xl h-full sm:h-[92vh] max-h-[820px] flex flex-col overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ================= MODAL HEADER (Clean, no redundant subtitles) ================= */}
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-white z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-orange-500/10 flex items-center justify-center text-[#FF5722]">
              <Shirt className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                Phòng thay đồ
              </h2>
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1 ml-2">
              <Sparkles className="w-3 h-3 text-emerald-600" />
              LV. {userLevel} (Mở Khóa Toàn Bộ)
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Gender Toggle */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setGender('male')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  characterGender === 'male'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Nam
              </button>
              <button
                type="button"
                onClick={() => setGender('female')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  characterGender === 'female'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Nữ
              </button>
            </div>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-700 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ================= MODAL BODY: 2 COLUMNS ================= */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden">
          {/* LEFT: 3D CHARACTER PREVIEW STAGE (5 COLS) */}
          <div className="md:col-span-5 bg-gradient-to-b from-slate-50 via-slate-100/60 to-slate-50 border-b md:border-b-0 md:border-r border-slate-200/80 flex flex-col relative h-[210px] sm:h-[270px] md:h-auto shrink-0">
            {/* Stage Controls */}
            <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between pointer-events-none">
              <div className="flex items-center gap-1.5 pointer-events-auto">
                <button
                  type="button"
                  onClick={() => setIsAutoRotating(!isAutoRotating)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer ${
                    isAutoRotating
                      ? 'bg-[#FF5722] text-white'
                      : 'bg-white/90 backdrop-blur-xs text-slate-700 hover:bg-white'
                  }`}
                >
                  <RotateCw className={`w-3.5 h-3.5 ${isAutoRotating ? 'animate-spin' : ''}`} />
                  <span>Xoay 360°</span>
                </button>
              </div>

              {isDirty && (
                <button
                  type="button"
                  onClick={revertPreview}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-white/90 backdrop-blur-xs text-slate-700 hover:bg-white flex items-center gap-1.5 shadow-xs transition-colors pointer-events-auto cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Hoàn tác</span>
                </button>
              )}
            </div>

            {/* 3D Canvas Viewport */}
            <div className="w-full h-full flex-1">
              <CharacterCanvas
                gender={characterGender}
                equipped={preview}
                level={userLevel}
                autoRotate={isAutoRotating}
              />
            </div>

            {/* Hint bar */}
            <div className="p-2.5 text-center bg-white/60 backdrop-blur-xs border-t border-slate-200/60 text-[11px] text-slate-500 font-medium">
              Kéo chuột hoặc vuốt để xoay nhân vật 360°
            </div>
          </div>

          {/* RIGHT: EQUIPMENT SLOTS & INVENTORY GRID (7 COLS) */}
          <div className="md:col-span-7 flex flex-col h-full overflow-hidden bg-white">
            {/* Slots Horizontal Tabs */}
            <div className="p-3 border-b border-slate-100 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
              {SLOTS_CONFIG.map(({ slot, label, icon: Icon }) => {
                const isActive = selectedSlot === slot;
                const isEquippedInSlot = Boolean(preview[slot]);

                return (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setSelectedSlot(slot)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#FF5722] text-white shadow-xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{label}</span>
                    {isEquippedInSlot && (
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          isActive ? 'bg-white' : 'bg-[#FF5722]'
                        }`}
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Inventory Items Grid */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3">
              {/* Hair Color Palette (Rendered only when HAIR slot is selected) */}
              {selectedSlot === 'HAIR' && (
                <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3 mb-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#FF5722]" />
                      Bảng màu tóc tùy chọn
                    </span>
                    {customHairColor && (
                      <button
                        type="button"
                        onClick={() => setCustomHairColor(null)}
                        className="text-[11px] font-bold text-[#FF5722] hover:underline cursor-pointer"
                      >
                        Khôi phục gốc
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {HAIR_COLOR_PALETTE.map(({ name, color }) => {
                      const isSelected = customHairColor === color;
                      return (
                        <button
                          key={color}
                          type="button"
                          title={name}
                          onClick={() => setCustomHairColor(color)}
                          className={`w-7 h-7 rounded-full border-2 transition-transform cursor-pointer flex items-center justify-center shadow-xs ${
                            isSelected
                              ? 'border-[#FF5722] scale-110 ring-2 ring-orange-400/40'
                              : 'border-white hover:scale-105'
                          }`}
                          style={{ backgroundColor: color }}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5 text-white drop-shadow stroke-[3]" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between text-xs text-slate-500 font-semibold px-1">
                <span>Vật phẩm ({slotItems.length})</span>
                {activePreviewItem && (
                  <button
                    type="button"
                    onClick={() => unequipPreview(selectedSlot)}
                    className="text-red-500 hover:text-red-600 font-bold transition-colors cursor-pointer"
                  >
                    Tháo món này
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {slotItems.map((item) => {
                  const unlocked = isItemUnlocked(item, userLevel);
                  const isEquippedInPreview = activePreviewItem?.id === item.id;
                  const rarity = RARITY_COLORS[item.rarity];

                  return (
                    <div
                      key={item.id}
                      onClick={() => {
                        if (unlocked) {
                          if (isEquippedInPreview) {
                            unequipPreview(selectedSlot);
                          } else {
                            previewItem(selectedSlot, item);
                          }
                        }
                      }}
                      className={`relative rounded-2xl border-2 p-3 transition-all flex flex-col justify-between select-none ${
                        isEquippedInPreview
                          ? 'border-[#FF5722] bg-orange-50/40 shadow-sm ring-2 ring-orange-400/20'
                          : `${rarity.border} ${rarity.bg} hover:border-slate-400`
                      } ${unlocked ? 'cursor-pointer hover:-translate-y-0.5' : 'opacity-65 cursor-not-allowed'}`}
                    >
                      {/* Top Badges */}
                      <div className="flex items-center justify-between mb-1.5">
                        <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${rarity.badge}`}>
                          {item.rarity}
                        </span>
                        {isEquippedInPreview && (
                          <span className="flex items-center gap-1 text-[10px] font-extrabold text-[#FF5722] bg-white px-1.5 py-0.5 rounded-full shadow-2xs">
                            <Check className="w-3 h-3 stroke-[3]" />
                            Đang mặc
                          </span>
                        )}
                      </div>

                      {/* Item Visual Illustration: REAL GARMENT PREVIEW (Not just color boxes!) */}
                      <div className="h-24 rounded-xl bg-slate-50/80 border border-slate-200/60 flex items-center justify-center p-2 mb-2 relative overflow-hidden">
                        <ItemVisualIcon itemCode={item.itemCode} className="w-16 h-16 drop-shadow-xs" />

                        {/* Lock Overlay */}
                        {!unlocked && (
                          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-2xs flex flex-col items-center justify-center text-white p-1 text-center">
                            <Lock className="w-4 h-4 mb-1 text-amber-300" />
                            <span className="text-[10px] font-bold">
                              {item.unlockType === 'LEVEL' && `Cấp ${item.unlockValue}`}
                              {item.unlockType === 'STREAK' && `Chuỗi ${item.unlockValue} ngày`}
                              {item.unlockType === 'FITCOIN' && `${item.fitcoinPrice} FitCoin`}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Name & Theme */}
                      <div>
                        <h4 className="text-xs font-bold text-slate-800 line-clamp-1">
                          {item.name}
                        </h4>
                        <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                          {item.theme}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Modal Bottom Action Bar */}
            <div className="p-3.5 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="text-xs text-slate-500 font-medium">
                {isDirty ? (
                  <span className="text-[#FF5722] font-semibold">Chưa lưu thay đổi trang phục</span>
                ) : (
                  <span>Trang phục đã sẵn sàng</span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Đóng
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#FF5722] hover:bg-[#F4511E] shadow-sm transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                >
                  {isSaving ? (
                    <span>Đang lưu...</span>
                  ) : saveSuccess ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Đã lưu!</span>
                    </>
                  ) : (
                    <span>Lưu trang phục</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
