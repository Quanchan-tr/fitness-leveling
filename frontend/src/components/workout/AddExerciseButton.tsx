'use strict';
'use client';

import React from 'react';
import { Plus } from 'lucide-react';

interface AddExerciseButtonProps {
  onClick: () => void;
}

export const AddExerciseButton: React.FC<AddExerciseButtonProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="w-full py-3.5 px-4 rounded-xl border border-dashed border-slate-300 hover:border-[#FF5722] bg-white hover:bg-orange-50/30 text-slate-600 hover:text-[#FF5722] transition-colors flex items-center justify-center gap-2 font-bold text-xs sm:text-sm cursor-pointer"
    >
      <div className="w-6 h-6 rounded-md bg-slate-100 group-hover:bg-[#FF5722] text-slate-700 flex items-center justify-center transition-colors">
        <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
      </div>
      <span>Thêm bài tập từ ngân hàng</span>
    </button>
  );
};
