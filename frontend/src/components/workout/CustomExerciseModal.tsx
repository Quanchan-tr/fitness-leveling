'use strict';
'use client';

import React, { useState } from 'react';
import { Exercise, EquipmentType, ExerciseType } from '@/types/fitnessleveling.types';
import { X, Plus, Dumbbell } from 'lucide-react';

interface CustomExerciseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddCustomExercise: (newEx: Omit<Exercise, 'id'>) => Exercise;
}

export const CustomExerciseModal: React.FC<CustomExerciseModalProps> = ({
  isOpen,
  onClose,
  onAddCustomExercise,
}) => {
  const [name, setName] = useState('');
  const [nameVi, setNameVi] = useState('');
  const [muscleGroup, setMuscleGroup] = useState<string>('chest');
  const [equipment, setEquipment] = useState<EquipmentType>('dumbbell');
  const [type, setType] = useState<ExerciseType>('weight_reps');
  const [description, setDescription] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onAddCustomExercise({
      name: name.trim(),
      nameVi: nameVi.trim() || undefined,
      targetMuscles: [muscleGroup],
      equipment,
      type,
      description: description.trim() || undefined,
      gifPlaceholderUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=80',
    });

    onClose();
    setName('');
    setNameVi('');
    setDescription('');
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-orange-50 text-[#FF5722] flex items-center justify-center">
              <Dumbbell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900">
                Thêm bài tập tùy chỉnh
              </h3>
              <p className="text-xs text-slate-400">
                Tạo bài tập mới lưu vào ngân hàng bài tập cá nhân
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1">
              Tên bài tập (Tiếng Anh hoặc Quốc tế) *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ví dụ: Dumbbell Hammer Curl"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 outline-none focus:border-[#FF5722] bg-slate-50/50"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">
              Tên tiếng Việt (tùy chọn)
            </label>
            <input
              type="text"
              value={nameVi}
              onChange={(e) => setNameVi(e.target.value)}
              placeholder="Ví dụ: Cuốn tạ búa tay trước"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 outline-none focus:border-[#FF5722] bg-slate-50/50"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Nhóm cơ mục tiêu
              </label>
              <select
                value={muscleGroup}
                onChange={(e) => setMuscleGroup(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 outline-none focus:border-[#FF5722] bg-white cursor-pointer"
              >
                <option value="chest">Ngực (Chest)</option>
                <option value="back">Lưng xô (Back/Lats)</option>
                <option value="shoulders">Vai (Shoulders)</option>
                <option value="biceps">Tay trước (Biceps)</option>
                <option value="triceps">Tay sau (Triceps)</option>
                <option value="quads">Đùi trước (Quads)</option>
                <option value="hamstrings">Đùi sau (Hamstrings)</option>
                <option value="glutes">Cơ mông (Glutes)</option>
                <option value="abs">Cơ bụng (Abs/Core)</option>
                <option value="calves">Bắp chân (Calves)</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Thiết bị
              </label>
              <select
                value={equipment}
                onChange={(e) => setEquipment(e.target.value as EquipmentType)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 outline-none focus:border-[#FF5722] bg-white cursor-pointer"
              >
                <option value="dumbbell">Dumbbell (Tạ đơn)</option>
                <option value="barbell">Barbell (Tạ đòn)</option>
                <option value="machine">Machine (Máy tập)</option>
                <option value="cable">Cable (Dây cáp)</option>
                <option value="bodyweight">Bodyweight (Trọng lượng cơ thể)</option>
                <option value="cardio">Cardio</option>
              </select>
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">
              Hình thức bài tập (Loại thông số)
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as ExerciseType)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 outline-none focus:border-[#FF5722] bg-white cursor-pointer"
            >
              <option value="weight_reps">Khối lượng &amp; Số lần (Kg × Reps)</option>
              <option value="bodyweight_reps">Thể trọng &amp; Số lần (Bodyweight × Reps)</option>
              <option value="duration">Thời gian giữ (Timed / Plank)</option>
              <option value="distance_duration">Khoảng cách &amp; Thời gian (Km × Phút)</option>
            </select>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">
              Ghi chú kỹ thuật hướng dẫn
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Hướng dẫn chuyển động, tư thế an toàn..."
              className="w-full px-3 py-2 rounded-xl border border-slate-300 outline-none focus:border-[#FF5722] bg-slate-50/50"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-100 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#FF5722] hover:bg-[#E64A19] text-white font-bold transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm vào thư viện</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
