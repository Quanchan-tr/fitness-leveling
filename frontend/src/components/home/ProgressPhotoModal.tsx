'use strict';
'use client';

import React, { useState } from 'react';
import { X, Camera, Plus, Trash2, Calendar, Scale, Sparkles, ArrowRightLeft } from 'lucide-react';
import { ProgressPhotoItem } from '@/lib/fitnessData';

interface ProgressPhotoModalProps {
  isOpen: boolean;
  onClose: () => void;
  photos: ProgressPhotoItem[];
  onAddPhoto: (photo: ProgressPhotoItem) => void;
  onDeletePhoto: (id: string) => void;
}

export const ProgressPhotoModal: React.FC<ProgressPhotoModalProps> = ({
  isOpen,
  onClose,
  photos,
  onAddPhoto,
  onDeletePhoto,
}) => {
  const [activeTab, setActiveTab] = useState<'timeline' | 'compare'>('timeline');
  const [label, setLabel] = useState('');
  const [weight, setWeight] = useState('');
  const [bodyFat, setBodyFat] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  // Compare selection
  const [beforeIndex, setBeforeIndex] = useState(0);
  const [afterIndex, setAfterIndex] = useState(photos.length - 1);

  if (!isOpen) return null;

  const handleCreatePhoto = (e: React.FormEvent) => {
    e.preventDefault();
    if (label.trim()) {
      onAddPhoto({
        id: `photo-${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        label: label.trim(),
        weight: parseFloat(weight) || 68.4,
        bodyFat: parseFloat(bodyFat) || 15.2,
      });
      setLabel('');
      setWeight('');
      setBodyFat('');
      setShowAddForm(false);
    }
  };

  const beforePhoto = photos[beforeIndex] || photos[0];
  const afterPhoto = photos[afterIndex] || photos[photos.length - 1];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#F7F3EA] w-full max-w-3xl rounded-2xl border border-[#B9A78E]/40 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-[#E8E1D5] border-b border-[#B9A78E]/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#303238] text-white shadow-sm">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#1F2328]">Progress Photo Album</h2>
              <p className="text-xs text-[#76583E]">Interactive Photo Timeline & Comparison</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-1 bg-[#FF6B35] text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-[#FF6B35]/90 transition-all shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Add Photo</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-[#76583E] hover:bg-[#F7F3EA] hover:text-[#1F2328] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 pt-3 flex gap-2 border-b border-[#B9A78E]/30 bg-[#F7F3EA]">
          <button
            onClick={() => setActiveTab('timeline')}
            className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 ${
              activeTab === 'timeline'
                ? 'border-[#FF6B35] text-[#FF6B35]'
                : 'border-transparent text-[#76583E] hover:text-[#1F2328]'
            }`}
          >
            Photo Timeline ({photos.length})
          </button>
          <button
            onClick={() => setActiveTab('compare')}
            className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
              activeTab === 'compare'
                ? 'border-[#FF6B35] text-[#FF6B35]'
                : 'border-transparent text-[#76583E] hover:text-[#1F2328]'
            }`}
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            Before / After Comparison
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Add Photo Collapsible Form */}
          {showAddForm && (
            <form
              onSubmit={handleCreatePhoto}
              className="bg-[#E8E1D5]/70 p-4 rounded-xl border border-[#B9A78E]/40 space-y-3"
            >
              <h3 className="text-xs font-bold text-[#1F2328] uppercase tracking-wide">
                Upload New Progress Snap
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#76583E] mb-1">
                    Label / Title
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 6-Week Cut"
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    className="w-full bg-white px-3 py-2 rounded-lg border border-[#B9A78E]/40 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#76583E] mb-1">
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="68.4"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    className="w-full bg-white px-3 py-2 rounded-lg border border-[#B9A78E]/40 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#76583E] mb-1">
                    Body Fat (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="15.2"
                    value={bodyFat}
                    onChange={(e) => setBodyFat(e.target.value)}
                    className="w-full bg-white px-3 py-2 rounded-lg border border-[#B9A78E]/40 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-[#76583E] hover:bg-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#FF6B35] text-white px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-[#FF6B35]/90"
                >
                  Confirm & Save
                </button>
              </div>
            </form>
          )}

          {/* Tab 1: Timeline View */}
          {activeTab === 'timeline' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {photos.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-xl border border-[#B9A78E]/30 overflow-hidden shadow-sm flex flex-col justify-between"
                >
                  {/* Photo Canvas Silhouette Placeholder */}
                  <div className="h-44 bg-gradient-to-b from-[#E8E1D5] to-[#B9A78E]/40 flex flex-col items-center justify-center p-4 relative">
                    <div className="w-20 h-28 bg-[#303238] rounded-xl flex items-center justify-center text-white shadow-inner opacity-80">
                      <Camera className="w-8 h-8 text-[#FF6B35]" />
                    </div>
                    <span className="text-[10px] text-[#76583E] font-bold mt-2 uppercase tracking-wider">
                      Progress Polaroid
                    </span>
                    <button
                      onClick={() => onDeletePhoto(item.id)}
                      className="absolute top-3 right-3 p-1.5 bg-white/80 rounded-lg text-red-500 hover:bg-red-500 hover:text-white transition-colors"
                      title="Delete Photo"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Details Footer */}
                  <div className="p-3.5 bg-white border-t border-[#B9A78E]/20">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-xs text-[#1F2328]">{item.label}</h4>
                      <div className="flex items-center gap-1 text-[11px] text-[#76583E]">
                        <Calendar className="w-3 h-3" />
                        <span>{item.date}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 mt-2 text-xs font-semibold">
                      <div className="flex items-center gap-1 text-[#1F2328]">
                        <Scale className="w-3.5 h-3.5 text-[#FF6B35]" />
                        <span>{item.weight} kg</span>
                      </div>
                      <div className="text-[#4D96FF]">{item.bodyFat}% BF</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Tab 2: Before / After Comparison */}
          {activeTab === 'compare' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {/* Before Card */}
                <div className="bg-white rounded-xl border border-[#B9A78E]/30 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-[#303238] text-white">
                      BEFORE
                    </span>
                    <select
                      value={beforeIndex}
                      onChange={(e) => setBeforeIndex(Number(e.target.value))}
                      className="bg-[#E8E1D5] text-xs font-medium px-2 py-1 rounded-md border border-[#B9A78E]/40"
                    >
                      {photos.map((p, idx) => (
                        <option key={p.id} value={idx}>
                          {p.date} — {p.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="h-48 bg-[#E8E1D5] rounded-xl flex items-center justify-center">
                    <div className="text-center">
                      <Camera className="w-10 h-10 text-[#76583E] mx-auto mb-1" />
                      <span className="text-xs font-bold text-[#1F2328]">{beforePhoto?.label}</span>
                    </div>
                  </div>
                  <div className="text-xs font-semibold text-[#1F2328] space-y-1">
                    <div>Date: <span className="font-normal text-[#76583E]">{beforePhoto?.date}</span></div>
                    <div>Weight: <span className="text-[#FF6B35] font-bold">{beforePhoto?.weight} kg</span></div>
                    <div>Body Fat: <span className="text-[#4D96FF] font-bold">{beforePhoto?.bodyFat}%</span></div>
                  </div>
                </div>

                {/* After Card */}
                <div className="bg-white rounded-xl border border-[#B9A78E]/30 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-[#FF6B35] text-white">
                      AFTER
                    </span>
                    <select
                      value={afterIndex}
                      onChange={(e) => setAfterIndex(Number(e.target.value))}
                      className="bg-[#E8E1D5] text-xs font-medium px-2 py-1 rounded-md border border-[#B9A78E]/40"
                    >
                      {photos.map((p, idx) => (
                        <option key={p.id} value={idx}>
                          {p.date} — {p.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="h-48 bg-[#E8E1D5] rounded-xl flex items-center justify-center">
                    <div className="text-center">
                      <Sparkles className="w-10 h-10 text-[#FF6B35] mx-auto mb-1" />
                      <span className="text-xs font-bold text-[#1F2328]">{afterPhoto?.label}</span>
                    </div>
                  </div>
                  <div className="text-xs font-semibold text-[#1F2328] space-y-1">
                    <div>Date: <span className="font-normal text-[#76583E]">{afterPhoto?.date}</span></div>
                    <div>Weight: <span className="text-[#FF6B35] font-bold">{afterPhoto?.weight} kg</span></div>
                    <div>Body Fat: <span className="text-[#4D96FF] font-bold">{afterPhoto?.bodyFat}%</span></div>
                  </div>
                </div>
              </div>

              {/* Transformation Delta Summary */}
              {beforePhoto && afterPhoto && (
                <div className="bg-[#7FB069]/15 border border-[#7FB069]/30 rounded-xl p-3 flex items-center justify-around text-xs font-bold text-[#1F2328]">
                  <div>
                    Weight Delta:{' '}
                    <span className="text-[#FF6B35]">
                      {(afterPhoto.weight - beforePhoto.weight).toFixed(1)} kg
                    </span>
                  </div>
                  <div>
                    Body Fat Delta:{' '}
                    <span className="text-[#7FB069]">
                      {(afterPhoto.bodyFat - beforePhoto.bodyFat).toFixed(1)}%
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
