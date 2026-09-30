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
  const [afterIndex, setAfterIndex] = useState(Math.max(0, photos.length - 1));

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity">
      <div className="bg-white w-full max-w-3xl rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-slate-900 text-white shadow-sm">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                Album Ảnh Tiến Độ &amp; So Sánh
              </h2>
              <p className="text-xs text-slate-500">
                Theo dõi sự thay đổi vóc dáng và so sánh Before / After
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-1 bg-[#FF5722] text-white px-3 py-1.5 rounded-xl text-xs font-bold hover:bg-[#E64A19] transition-all shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm ảnh</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer"
              aria-label="Đóng cửa sổ"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 pt-3 flex gap-4 border-b border-slate-200 bg-white">
          <button
            onClick={() => setActiveTab('timeline')}
            className={`pb-2.5 px-1 text-xs font-bold transition-all border-b-2 cursor-pointer ${
              activeTab === 'timeline'
                ? 'border-[#FF5722] text-[#FF5722]'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Dòng thời gian ({photos.length})
          </button>
          <button
            onClick={() => setActiveTab('compare')}
            className={`pb-2.5 px-1 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'compare'
                ? 'border-[#FF5722] text-[#FF5722]'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            So sánh Trước / Sau
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Add Photo Collapsible Form */}
          {showAddForm && (
            <form
              onSubmit={handleCreatePhoto}
              className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3"
            >
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                Ghi nhận ảnh tiến độ mới
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Ghi chú / Nhãn
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Vd: Tuần 6 Cutting"
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    className="w-full bg-white px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#FF5722]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Cân nặng (kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="68.4"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    className="w-full bg-white px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#FF5722]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Tỷ lệ mỡ (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="15.2"
                    value={bodyFat}
                    onChange={(e) => setBodyFat(e.target.value)}
                    className="w-full bg-white px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#FF5722]"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="bg-[#FF5722] text-white px-4 py-1.5 rounded-xl text-xs font-bold hover:bg-[#E64A19] transition-all cursor-pointer"
                >
                  Lưu ảnh
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
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
                >
                  <div className="h-44 bg-gradient-to-b from-slate-100 to-slate-200/80 flex flex-col items-center justify-center p-4 relative">
                    <div className="w-20 h-28 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-inner">
                      <Camera className="w-8 h-8 text-[#FF5722]" />
                    </div>
                    <span className="text-[10px] text-slate-500 font-bold mt-2 uppercase tracking-wider">
                      Ảnh Tiến Độ Thể Hình
                    </span>
                    <button
                      onClick={() => onDeletePhoto(item.id)}
                      className="absolute top-3 right-3 p-1.5 bg-white/90 rounded-lg text-rose-500 hover:bg-rose-500 hover:text-white transition-colors cursor-pointer"
                      title="Xóa ảnh"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="p-3.5 bg-white border-t border-slate-100">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-xs text-slate-900">{item.label}</h4>
                      <div className="flex items-center gap-1 text-[11px] text-slate-400 font-semibold">
                        <Calendar className="w-3 h-3" />
                        <span>{item.date}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 mt-2 text-xs font-bold">
                      <div className="flex items-center gap-1 text-slate-900 tabular-nums">
                        <Scale className="w-3.5 h-3.5 text-[#FF5722]" />
                        <span>{item.weight} kg</span>
                      </div>
                      <div className="text-sky-600 tabular-nums">{item.bodyFat}% Mỡ</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Tab 2: Before / After Comparison */}
          {activeTab === 'compare' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Before Card */}
                <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black px-2 py-0.5 rounded-md bg-slate-900 text-white">
                      TRƯỚC (BEFORE)
                    </span>
                    <select
                      value={beforeIndex}
                      onChange={(e) => setBeforeIndex(Number(e.target.value))}
                      className="bg-white text-xs font-semibold px-2 py-1 rounded-lg border border-slate-300"
                    >
                      {photos.map((p, idx) => (
                        <option key={p.id} value={idx}>
                          {p.date} — {p.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="h-48 bg-white border border-slate-200 rounded-xl flex items-center justify-center">
                    <div className="text-center">
                      <Camera className="w-10 h-10 text-slate-400 mx-auto mb-1" />
                      <span className="text-xs font-bold text-slate-900">{beforePhoto?.label}</span>
                    </div>
                  </div>
                  <div className="text-xs font-semibold text-slate-700 space-y-1">
                    <div>Ngày: <span className="font-normal text-slate-500">{beforePhoto?.date}</span></div>
                    <div>Cân nặng: <span className="text-[#FF5722] font-bold tabular-nums">{beforePhoto?.weight} kg</span></div>
                    <div>Tỷ lệ mỡ: <span className="text-sky-600 font-bold tabular-nums">{beforePhoto?.bodyFat}%</span></div>
                  </div>
                </div>

                {/* After Card */}
                <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black px-2 py-0.5 rounded-md bg-[#FF5722] text-white">
                      SAU (AFTER)
                    </span>
                    <select
                      value={afterIndex}
                      onChange={(e) => setAfterIndex(Number(e.target.value))}
                      className="bg-white text-xs font-semibold px-2 py-1 rounded-lg border border-slate-300"
                    >
                      {photos.map((p, idx) => (
                        <option key={p.id} value={idx}>
                          {p.date} — {p.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="h-48 bg-white border border-slate-200 rounded-xl flex items-center justify-center">
                    <div className="text-center">
                      <Sparkles className="w-10 h-10 text-amber-500 mx-auto mb-1" />
                      <span className="text-xs font-bold text-slate-900">{afterPhoto?.label}</span>
                    </div>
                  </div>
                  <div className="text-xs font-semibold text-slate-700 space-y-1">
                    <div>Ngày: <span className="font-normal text-slate-500">{afterPhoto?.date}</span></div>
                    <div>Cân nặng: <span className="text-[#FF5722] font-bold tabular-nums">{afterPhoto?.weight} kg</span></div>
                    <div>Tỷ lệ mỡ: <span className="text-sky-600 font-bold tabular-nums">{afterPhoto?.bodyFat}%</span></div>
                  </div>
                </div>
              </div>

              {/* Transformation Delta Summary */}
              {beforePhoto && afterPhoto && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center justify-around text-xs font-bold text-emerald-950">
                  <div>
                    Thay đổi cân nặng:{' '}
                    <span className="text-[#FF5722] font-black tabular-nums">
                      {(afterPhoto.weight - beforePhoto.weight).toFixed(1)} kg
                    </span>
                  </div>
                  <div>
                    Thay đổi tỷ lệ mỡ:{' '}
                    <span className="text-emerald-700 font-black tabular-nums">
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
