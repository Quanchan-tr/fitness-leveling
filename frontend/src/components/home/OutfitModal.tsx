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
    shirtColor: '#FF6B35',
    shortsColor: '#303238',
    headbandColor: '#303238',
    shoesColor: '#FF6B35',
  },
  {
    name: 'Midnight Stealth',
    shirtColor: '#2B2D31',
    shortsColor: '#1A1B1E',
    headbandColor: '#1A1B1E',
    shoesColor: '#E8E2D5',
  },
  {
    name: 'Ocean Striker',
    shirtColor: '#4D96FF',
    shortsColor: '#2B323D',
    headbandColor: '#4D96FF',
    shoesColor: '#4D96FF',
  },
  {
    name: 'Forest Runner',
    shirtColor: '#7FB069',
    shortsColor: '#303238',
    headbandColor: '#7FB069',
    shoesColor: '#7FB069',
  },
  {
    name: 'Crimson Power',
    shirtColor: '#E63946',
    shortsColor: '#222428',
    headbandColor: '#E63946',
    shoesColor: '#E63946',
  },
];

const COLOR_PALETTE = [
  '#FF6B35',
  '#303238',
  '#4D96FF',
  '#7FB069',
  '#E63946',
  '#F4C95D',
  '#8338EC',
  '#F7F3EA',
  '#2B2D31',
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
      shirtColor: '#FF6B35',
      shortsColor: '#303238',
      headbandColor: '#303238',
      shoesColor: '#FF6B35',
    };
    setCurrentOutfit(defaultOutfit);
    onSaveOutfit(defaultOutfit);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#F7F3EA] w-full max-w-lg rounded-2xl border border-[#B9A78E]/40 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-[#E8E1D5] border-b border-[#B9A78E]/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#FF6B35] text-white shadow-sm">
              <Shirt className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#1F2328]">Gymmer Wardrobe & Outfit</h2>
              <p className="text-xs text-[#76583E]">Customize Avatar Apparel & Style</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-[#76583E] hover:bg-[#F7F3EA] hover:text-[#1F2328] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Presets Grid */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <h3 className="text-xs font-bold text-[#1F2328] uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#FF6B35]" />
                <span>Outfit Presets</span>
              </h3>
              <button
                onClick={handleReset}
                className="text-[11px] font-semibold text-[#76583E] hover:text-[#FF6B35] flex items-center gap-1 transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Default</span>
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
                    className={`p-3 rounded-xl border text-left transition-all relative ${
                      isSelected
                        ? 'bg-white border-[#FF6B35] shadow-sm ring-1 ring-[#FF6B35]'
                        : 'bg-white/70 border-[#B9A78E]/30 hover:bg-white hover:border-[#B9A78E]/60'
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
                    <div className="font-bold text-xs text-[#1F2328] leading-tight">
                      {preset.name}
                    </div>
                    {isSelected && (
                      <Check className="w-3.5 h-3.5 text-[#FF6B35] absolute top-2 right-2" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Color Customizer */}
          <div className="bg-white p-4 rounded-xl border border-[#B9A78E]/30 space-y-4">
            <h3 className="text-xs font-bold text-[#1F2328] uppercase tracking-wider">
              Piece Customization
            </h3>

            {/* Shirt Color */}
            <div>
              <label className="block text-[11px] font-bold text-[#76583E] mb-1.5">
                Jersey / Shirt Color
              </label>
              <div className="flex flex-wrap gap-2">
                {COLOR_PALETTE.map((c) => (
                  <button
                    key={`shirt-${c}`}
                    onClick={() => handleColorChange('shirtColor', c)}
                    className={`w-7 h-7 rounded-lg border-2 transition-transform ${
                      currentOutfit.shirtColor === c
                        ? 'border-[#FF6B35] scale-110 shadow-sm'
                        : 'border-transparent hover:scale-105'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>

            {/* Shorts Color */}
            <div>
              <label className="block text-[11px] font-bold text-[#76583E] mb-1.5">
                Athletic Shorts Color
              </label>
              <div className="flex flex-wrap gap-2">
                {COLOR_PALETTE.map((c) => (
                  <button
                    key={`shorts-${c}`}
                    onClick={() => handleColorChange('shortsColor', c)}
                    className={`w-7 h-7 rounded-lg border-2 transition-transform ${
                      currentOutfit.shortsColor === c
                        ? 'border-[#FF6B35] scale-110 shadow-sm'
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
                <label className="block text-[11px] font-bold text-[#76583E] mb-1.5">
                  Headband Color
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {COLOR_PALETTE.slice(0, 6).map((c) => (
                    <button
                      key={`headband-${c}`}
                      onClick={() => handleColorChange('headbandColor', c)}
                      className={`w-6 h-6 rounded-md border-2 transition-transform ${
                        currentOutfit.headbandColor === c
                          ? 'border-[#FF6B35] scale-110'
                          : 'border-transparent'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#76583E] mb-1.5">
                  Sneakers Color
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {COLOR_PALETTE.slice(0, 6).map((c) => (
                    <button
                      key={`shoes-${c}`}
                      onClick={() => handleColorChange('shoesColor', c)}
                      className={`w-6 h-6 rounded-md border-2 transition-transform ${
                        currentOutfit.shoesColor === c
                          ? 'border-[#FF6B35] scale-110'
                          : 'border-transparent'
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
        <div className="px-6 py-3.5 bg-[#E8E1D5]/60 border-t border-[#B9A78E]/30 flex justify-end">
          <button
            onClick={onClose}
            className="bg-[#FF6B35] hover:bg-[#FF6B35]/90 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-sm"
          >
            Apply & Close
          </button>
        </div>
      </div>
    </div>
  );
};
