'use strict';
'use client';

import React, { useState } from 'react';
import { X, Sparkles, Check, Shirt, RotateCcw } from 'lucide-react';
import { CharacterOutfit } from './3d/Character';

interface OutfitModalProps {
  isOpen: boolean;
  onClose: () => void;
  outfit: CharacterOutfit;
  onSaveOutfit: (newOutfit: CharacterOutfit) => void;
}

interface OutfitPreset {
  name: string;
  shirtColor: string;
  shortsColor: string;
  headbandColor: string;
  shoesColor: string;
}

const PRESETS: OutfitPreset[] = [
  {
    name: 'Blaze Classic',
    shirtColor: '#FF5722',
    shortsColor: '#1E293B',
    headbandColor: '#1E293B',
    shoesColor: '#FF5722',
  },
  {
    name: 'Midnight Stealth',
    shirtColor: '#0F172A',
    shortsColor: '#1E293B',
    headbandColor: '#0F172A',
    shoesColor: '#F8FAFC',
  },
  {
    name: 'Ocean Striker',
    shirtColor: '#0284C7',
    shortsColor: '#0F172A',
    headbandColor: '#0284C7',
    shoesColor: '#0284C7',
  },
  {
    name: 'Forest Athlete',
    shirtColor: '#10B981',
    shortsColor: '#1E293B',
    headbandColor: '#10B981',
    shoesColor: '#10B981',
  },
  {
    name: 'Crimson Power',
    shirtColor: '#EF4444',
    shortsColor: '#1E293B',
    headbandColor: '#EF4444',
    shoesColor: '#EF4444',
  },
];

const COLOR_PALETTE = [
  '#FF5722',
  '#0F172A',
  '#0284C7',
  '#10B981',
  '#EF4444',
  '#F59E0B',
  '#8B5CF6',
  '#F8FAFC',
  '#475569',
];

export const OutfitModal: React.FC<OutfitModalProps> = ({
  isOpen,
  onClose,
  outfit,
  onSaveOutfit,
}) => {
  const [currentOutfit, setCurrentOutfit] = useState<CharacterOutfit>(outfit);

  if (!isOpen) return null;

  const handleSelectPreset = (preset: OutfitPreset) => {
    const updated: CharacterOutfit = {
      shirtColor: preset.shirtColor,
      shortsColor: preset.shortsColor,
      headbandColor: preset.headbandColor,
      shoesColor: preset.shoesColor,
    };
    setCurrentOutfit(updated);
    onSaveOutfit(updated);
  };

  const handleColorChange = (key: keyof CharacterOutfit, color: string) => {
    const updated = { ...currentOutfit, [key]: color };
    setCurrentOutfit(updated);
    onSaveOutfit(updated);
  };

  const handleReset = () => {
    const defaultOutfit: CharacterOutfit = {
      shirtColor: '#FF5722',
      shortsColor: '#1E293B',
      headbandColor: '#1E293B',
      shoesColor: '#FF5722',
    };
    setCurrentOutfit(defaultOutfit);
    onSaveOutfit(defaultOutfit);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity">
      <div className="bg-white w-full max-w-lg rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#FF5722] text-white shadow-sm">
              <Shirt className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                Tủ Đồ &amp; Trang Phục 3D
              </h2>
              <p className="text-xs text-slate-500">
                Tùy chỉnh màu sắc áo thể thao, quần và phụ kiện
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
            aria-label="Đóng cửa sổ"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Presets Grid */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#FF5722]" />
                <span>Bộ trang phục mẫu</span>
              </h3>
              <button
                onClick={handleReset}
                className="text-xs font-semibold text-slate-500 hover:text-[#FF5722] flex items-center gap-1 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Mặc định</span>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {PRESETS.map((preset) => {
                const isSelected =
                  currentOutfit.shirtColor === preset.shirtColor &&
                  currentOutfit.shortsColor === preset.shortsColor;
                return (
                  <button
                    key={preset.name}
                    onClick={() => handleSelectPreset(preset)}
                    className={`p-3 rounded-2xl border text-left transition-all relative cursor-pointer ${
                      isSelected
                        ? 'bg-orange-50/50 border-[#FF5722] shadow-xs ring-1 ring-[#FF5722]'
                        : 'bg-slate-50 border-slate-200 hover:bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-2">
                      <div
                        className="w-4 h-4 rounded-full border border-black/10"
                        style={{ backgroundColor: preset.shirtColor }}
                      />
                      <div
                        className="w-4 h-4 rounded-full border border-black/10"
                        style={{ backgroundColor: preset.shortsColor }}
                      />
                      <div
                        className="w-4 h-4 rounded-full border border-black/10"
                        style={{ backgroundColor: preset.shoesColor }}
                      />
                    </div>
                    <div className="font-bold text-xs text-slate-900 leading-tight">
                      {preset.name}
                    </div>
                    {isSelected && (
                      <Check className="w-3.5 h-3.5 text-[#FF5722] absolute top-2.5 right-2.5" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Color Customizer */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-4">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Tùy chỉnh từng chi tiết
            </h3>

            {/* Shirt Color */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1.5">
                Màu áo tập (Jersey)
              </label>
              <div className="flex flex-wrap gap-2">
                {COLOR_PALETTE.map((c) => (
                  <button
                    key={`shirt-${c}`}
                    onClick={() => handleColorChange('shirtColor', c)}
                    className={`w-7 h-7 rounded-lg border-2 transition-transform cursor-pointer ${
                      currentOutfit.shirtColor === c
                        ? 'border-[#FF5722] scale-110 shadow-sm'
                        : 'border-transparent hover:scale-105'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>

            {/* Shorts Color */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1.5">
                Màu quần tập (Shorts)
              </label>
              <div className="flex flex-wrap gap-2">
                {COLOR_PALETTE.map((c) => (
                  <button
                    key={`shorts-${c}`}
                    onClick={() => handleColorChange('shortsColor', c)}
                    className={`w-7 h-7 rounded-lg border-2 transition-transform cursor-pointer ${
                      currentOutfit.shortsColor === c
                        ? 'border-[#FF5722] scale-110 shadow-sm'
                        : 'border-transparent hover:scale-105'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>

            {/* Headband & Shoes Color */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1.5">
                  Băng đô / Mũ
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {COLOR_PALETTE.slice(0, 6).map((c) => (
                    <button
                      key={`headband-${c}`}
                      onClick={() => handleColorChange('headbandColor', c)}
                      className={`w-6 h-6 rounded-md border-2 transition-transform cursor-pointer ${
                        currentOutfit.headbandColor === c
                          ? 'border-[#FF5722] scale-110 shadow-xs'
                          : 'border-transparent hover:scale-105'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1.5">
                  Giày tập thể thao
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {COLOR_PALETTE.slice(0, 6).map((c) => (
                    <button
                      key={`shoes-${c}`}
                      onClick={() => handleColorChange('shoesColor', c)}
                      className={`w-6 h-6 rounded-md border-2 transition-transform cursor-pointer ${
                        currentOutfit.shoesColor === c
                          ? 'border-[#FF5722] scale-110 shadow-xs'
                          : 'border-transparent hover:scale-105'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Áp dụng trang phục
          </button>
        </div>
      </div>
    </div>
  );
};
