'use strict';
'use client';

import React from 'react';
import { Plus, Dumbbell } from 'lucide-react';

interface AddExerciseButtonProps {
  onClick: () => void;
}

export const AddExerciseButton: React.FC<AddExerciseButtonProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="w-full py-4 px-4 rounded-2xl border-2 border-dashed border-[#B9A78E]/60 hover:border-[#FF6B35] bg-white/40 hover:bg-[#FFF8F3] text-[#76583E] hover:text-[#FF6B35] transition-all duration-200 flex items-center justify-center gap-2 font-black text-xs sm:text-sm shadow-2xs hover:shadow-sm cursor-pointer group"
    >
      <div className="w-7 h-7 rounded-xl bg-[#FAF8F5] group-hover:bg-[#FF6B35] text-[#76583E] group-hover:text-white flex items-center justify-center transition-all shadow-2xs">
        <Plus className="w-4 h-4 stroke-[2.5]" />
      </div>
      <span>Thêm bài tập từ ngân hàng bài tập</span>
    </button>
  );
};
