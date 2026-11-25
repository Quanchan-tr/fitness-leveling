'use strict';
'use client';

import React, { useState } from 'react';
import {
  calculateMuscleWorkload,
  getMuscleHeatmapColor,
  MUSCLE_LABELS_VI,
} from '@/lib/muscleHeatmap';
import { Exercise } from '@/types/fittrack.types';
import { Maximize2 } from 'lucide-react';

interface MuscleHeatmapSvgProps {
  exercises: { exercise: Exercise; sets: { isCompleted?: boolean }[] }[];
  onOpenDetailModal?: () => void;
  interactive?: boolean;
}

export const MuscleHeatmapSvg: React.FC<MuscleHeatmapSvgProps> = ({
  exercises,
  onOpenDetailModal,
  interactive = true,
}) => {
  const [hoveredMuscle, setHoveredMuscle] = useState<string | null>(null);

  const workload = calculateMuscleWorkload(exercises);

  const getColor = (muscleKey: string) => {
    const sets = workload[muscleKey] || 0;
    return getMuscleHeatmapColor(sets);
  };

  const getTooltipText = (muscleKey: string) => {
    const label = MUSCLE_LABELS_VI[muscleKey] || muscleKey;
    const sets = workload[muscleKey] || 0;
    return `${label}: ${sets} sets`;
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 relative flex flex-col justify-between">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h4 className="font-bold text-xs sm:text-sm text-slate-900 tracking-tight">
            Bản đồ nhiệt kích hoạt cơ (Heatmap)
          </h4>
          <p className="text-[11px] text-slate-400">
            Màu càng đậm thể hiện khối lượng set kích hoạt càng cao
          </p>
        </div>

        {onOpenDetailModal && (
          <button
            type="button"
            onClick={onOpenDetailModal}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
            title="Xem chi tiết phân bổ nhóm cơ"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Chi tiết</span>
          </button>
        )}
      </div>

      {/* SVG Canvas for Front & Back anatomy */}
      <div className="flex items-center justify-around gap-4 py-2 relative">
        {/* Front Body */}
        <div className="flex flex-col items-center">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Mặt trước
          </span>
          <svg
            viewBox="0 0 100 210"
            className="w-28 sm:w-32 h-52 sm:h-56 filter drop-shadow-xs"
          >
            {/* Body Silhouette Base */}
            <g fill="#F1F5F9" stroke="#E2E8F0" strokeWidth="1">
              {/* Head */}
              <circle cx="50" cy="18" r="10" />
              {/* Neck */}
              <rect x="47" y="27" width="6" height="7" rx="2" />
            </g>

            {/* Front Muscles with data-muscle attributes */}
            {/* Traps Front */}
            <path
              data-muscle="traps"
              d="M43 32 L47 30 L53 30 L57 32 L55 35 L45 35 Z"
              fill={getColor('traps').fill}
              opacity={getColor('traps').opacity}
              className="transition-all duration-300 cursor-pointer"
              onMouseEnter={() => setHoveredMuscle('traps')}
              onMouseLeave={() => setHoveredMuscle(null)}
            >
              <title>{getTooltipText('traps')}</title>
            </path>

            {/* Shoulders Left & Right */}
            <path
              data-muscle="shoulders"
              d="M33 37 C30 40 30 48 34 52 C37 49 38 41 40 37 Z"
              fill={getColor('shoulders').fill}
              opacity={getColor('shoulders').opacity}
              className="transition-all duration-300 cursor-pointer"
              onMouseEnter={() => setHoveredMuscle('shoulders')}
              onMouseLeave={() => setHoveredMuscle(null)}
            >
              <title>{getTooltipText('shoulders')}</title>
            </path>
            <path
              data-muscle="shoulders"
              d="M67 37 C70 40 70 48 66 52 C63 49 62 41 60 37 Z"
              fill={getColor('shoulders').fill}
              opacity={getColor('shoulders').opacity}
              className="transition-all duration-300 cursor-pointer"
              onMouseEnter={() => setHoveredMuscle('shoulders')}
              onMouseLeave={() => setHoveredMuscle(null)}
            >
              <title>{getTooltipText('shoulders')}</title>
            </path>

            {/* Chest Left & Right */}
            <path
              data-muscle="chest"
              d="M40 37 C44 37 48 40 49 46 C45 49 39 49 36 46 C37 41 39 38 40 37 Z"
              fill={getColor('chest').fill}
              opacity={getColor('chest').opacity}
              className="transition-all duration-300 cursor-pointer"
              onMouseEnter={() => setHoveredMuscle('chest')}
              onMouseLeave={() => setHoveredMuscle(null)}
            >
              <title>{getTooltipText('chest')}</title>
            </path>
            <path
              data-muscle="chest"
              d="M60 37 C56 37 52 40 51 46 C55 49 61 49 64 46 C63 41 61 38 60 37 Z"
              fill={getColor('chest').fill}
              opacity={getColor('chest').opacity}
              className="transition-all duration-300 cursor-pointer"
              onMouseEnter={() => setHoveredMuscle('chest')}
              onMouseLeave={() => setHoveredMuscle(null)}
            >
              <title>{getTooltipText('chest')}</title>
            </path>

            {/* Biceps Left & Right */}
            <rect
              data-muscle="biceps"
              x="28"
              y="53"
              width="7"
              height="16"
              rx="3.5"
              fill={getColor('biceps').fill}
              opacity={getColor('biceps').opacity}
              className="transition-all duration-300 cursor-pointer"
              onMouseEnter={() => setHoveredMuscle('biceps')}
              onMouseLeave={() => setHoveredMuscle(null)}
            >
              <title>{getTooltipText('biceps')}</title>
            </rect>
            <rect
              data-muscle="biceps"
              x="65"
              y="53"
              width="7"
              height="16"
              rx="3.5"
              fill={getColor('biceps').fill}
              opacity={getColor('biceps').opacity}
              className="transition-all duration-300 cursor-pointer"
              onMouseEnter={() => setHoveredMuscle('biceps')}
              onMouseLeave={() => setHoveredMuscle(null)}
            >
              <title>{getTooltipText('biceps')}</title>
            </rect>

            {/* Forearms Left & Right */}
            <rect
              data-muscle="forearms"
              x="24"
              y="71"
              width="6"
              height="20"
              rx="3"
              fill={getColor('forearms').fill}
              opacity={getColor('forearms').opacity}
              className="transition-all duration-300 cursor-pointer"
              onMouseEnter={() => setHoveredMuscle('forearms')}
              onMouseLeave={() => setHoveredMuscle(null)}
            >
              <title>{getTooltipText('forearms')}</title>
            </rect>
            <rect
              data-muscle="forearms"
              x="70"
              y="71"
              width="6"
              height="20"
              rx="3"
              fill={getColor('forearms').fill}
              opacity={getColor('forearms').opacity}
              className="transition-all duration-300 cursor-pointer"
              onMouseEnter={() => setHoveredMuscle('forearms')}
              onMouseLeave={() => setHoveredMuscle(null)}
            >
              <title>{getTooltipText('forearms')}</title>
            </rect>

            {/* Abs / Core */}
            <rect
              data-muscle="abs"
              x="45"
              y="50"
              width="10"
              height="26"
              rx="3"
              fill={getColor('abs').fill}
              opacity={getColor('abs').opacity}
              className="transition-all duration-300 cursor-pointer"
              onMouseEnter={() => setHoveredMuscle('abs')}
              onMouseLeave={() => setHoveredMuscle(null)}
            >
              <title>{getTooltipText('abs')}</title>
            </rect>

            {/* Obliques Left & Right */}
            <path
              data-muscle="obliques"
              d="M38 52 L43 52 L43 74 L38 68 Z"
              fill={getColor('obliques').fill}
              opacity={getColor('obliques').opacity}
              className="transition-all duration-300 cursor-pointer"
              onMouseEnter={() => setHoveredMuscle('obliques')}
              onMouseLeave={() => setHoveredMuscle(null)}
            >
              <title>{getTooltipText('obliques')}</title>
            </path>
            <path
              data-muscle="obliques"
              d="M62 52 L57 52 L57 74 L62 68 Z"
              fill={getColor('obliques').fill}
              opacity={getColor('obliques').opacity}
              className="transition-all duration-300 cursor-pointer"
              onMouseEnter={() => setHoveredMuscle('obliques')}
              onMouseLeave={() => setHoveredMuscle(null)}
            >
              <title>{getTooltipText('obliques')}</title>
            </path>

            {/* Quads Left & Right */}
            <rect
              data-muscle="quads"
              x="36"
              y="85"
              width="12"
              height="44"
              rx="5"
              fill={getColor('quads').fill}
              opacity={getColor('quads').opacity}
              className="transition-all duration-300 cursor-pointer"
              onMouseEnter={() => setHoveredMuscle('quads')}
              onMouseLeave={() => setHoveredMuscle(null)}
            >
              <title>{getTooltipText('quads')}</title>
            </rect>
            <rect
              data-muscle="quads"
              x="52"
              y="85"
              width="12"
              height="44"
              rx="5"
              fill={getColor('quads').fill}
              opacity={getColor('quads').opacity}
              className="transition-all duration-300 cursor-pointer"
              onMouseEnter={() => setHoveredMuscle('quads')}
              onMouseLeave={() => setHoveredMuscle(null)}
            >
              <title>{getTooltipText('quads')}</title>
            </rect>

            {/* Calves Front */}
            <rect
              data-muscle="calves"
              x="37"
              y="138"
              width="9"
              height="42"
              rx="4"
              fill={getColor('calves').fill}
              opacity={getColor('calves').opacity}
              className="transition-all duration-300 cursor-pointer"
              onMouseEnter={() => setHoveredMuscle('calves')}
              onMouseLeave={() => setHoveredMuscle(null)}
            >
              <title>{getTooltipText('calves')}</title>
            </rect>
            <rect
              data-muscle="calves"
              x="54"
              y="138"
              width="9"
              height="42"
              rx="4"
              fill={getColor('calves').fill}
              opacity={getColor('calves').opacity}
              className="transition-all duration-300 cursor-pointer"
              onMouseEnter={() => setHoveredMuscle('calves')}
              onMouseLeave={() => setHoveredMuscle(null)}
            >
              <title>{getTooltipText('calves')}</title>
            </rect>
          </svg>
        </div>

        {/* Back Body */}
        <div className="flex flex-col items-center">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Mặt sau
          </span>
          <svg
            viewBox="0 0 100 210"
            className="w-28 sm:w-32 h-52 sm:h-56 filter drop-shadow-xs"
          >
            {/* Body Silhouette Base */}
            <g fill="#F1F5F9" stroke="#E2E8F0" strokeWidth="1">
              <circle cx="50" cy="18" r="10" />
              <rect x="47" y="27" width="6" height="7" rx="2" />
            </g>

            {/* Traps Back */}
            <path
              data-muscle="traps"
              d="M44 31 L50 29 L56 31 L58 42 L50 48 L42 42 Z"
              fill={getColor('traps').fill}
              opacity={getColor('traps').opacity}
              className="transition-all duration-300 cursor-pointer"
              onMouseEnter={() => setHoveredMuscle('traps')}
              onMouseLeave={() => setHoveredMuscle(null)}
            >
              <title>{getTooltipText('traps')}</title>
            </path>

            {/* Rear Deltoids */}
            <path
              data-muscle="shoulders"
              d="M33 37 C31 41 31 48 35 52 C37 47 38 41 40 37 Z"
              fill={getColor('shoulders').fill}
              opacity={getColor('shoulders').opacity}
              className="transition-all duration-300 cursor-pointer"
              onMouseEnter={() => setHoveredMuscle('shoulders')}
              onMouseLeave={() => setHoveredMuscle(null)}
            >
              <title>{getTooltipText('shoulders')}</title>
            </path>
            <path
              data-muscle="shoulders"
              d="M67 37 C69 41 69 48 65 52 C63 47 62 41 60 37 Z"
              fill={getColor('shoulders').fill}
              opacity={getColor('shoulders').opacity}
              className="transition-all duration-300 cursor-pointer"
              onMouseEnter={() => setHoveredMuscle('shoulders')}
              onMouseLeave={() => setHoveredMuscle(null)}
            >
              <title>{getTooltipText('shoulders')}</title>
            </path>

            {/* Lats (Xô lưng) */}
            <path
              data-muscle="lats"
              d="M38 46 L47 48 L46 66 L38 58 Z"
              fill={getColor('lats').fill}
              opacity={getColor('lats').opacity}
              className="transition-all duration-300 cursor-pointer"
              onMouseEnter={() => setHoveredMuscle('lats')}
              onMouseLeave={() => setHoveredMuscle(null)}
            >
              <title>{getTooltipText('lats')}</title>
            </path>
            <path
              data-muscle="lats"
              d="M62 46 L53 48 L54 66 L62 58 Z"
              fill={getColor('lats').fill}
              opacity={getColor('lats').opacity}
              className="transition-all duration-300 cursor-pointer"
              onMouseEnter={() => setHoveredMuscle('lats')}
              onMouseLeave={() => setHoveredMuscle(null)}
            >
              <title>{getTooltipText('lats')}</title>
            </path>

            {/* Lower Back */}
            <rect
              data-muscle="back"
              x="46"
              y="55"
              width="8"
              height="18"
              rx="2"
              fill={getColor('back').fill}
              opacity={getColor('back').opacity}
              className="transition-all duration-300 cursor-pointer"
              onMouseEnter={() => setHoveredMuscle('back')}
              onMouseLeave={() => setHoveredMuscle(null)}
            >
              <title>{getTooltipText('back')}</title>
            </rect>

            {/* Triceps Left & Right */}
            <rect
              data-muscle="triceps"
              x="28"
              y="52"
              width="7"
              height="17"
              rx="3.5"
              fill={getColor('triceps').fill}
              opacity={getColor('triceps').opacity}
              className="transition-all duration-300 cursor-pointer"
              onMouseEnter={() => setHoveredMuscle('triceps')}
              onMouseLeave={() => setHoveredMuscle(null)}
            >
              <title>{getTooltipText('triceps')}</title>
            </rect>
            <rect
              data-muscle="triceps"
              x="65"
              y="52"
              width="7"
              height="17"
              rx="3.5"
              fill={getColor('triceps').fill}
              opacity={getColor('triceps').opacity}
              className="transition-all duration-300 cursor-pointer"
              onMouseEnter={() => setHoveredMuscle('triceps')}
              onMouseLeave={() => setHoveredMuscle(null)}
            >
              <title>{getTooltipText('triceps')}</title>
            </rect>

            {/* Glutes (Cơ mông) */}
            <rect
              data-muscle="glutes"
              x="36"
              y="76"
              width="13"
              height="16"
              rx="4"
              fill={getColor('glutes').fill}
              opacity={getColor('glutes').opacity}
              className="transition-all duration-300 cursor-pointer"
              onMouseEnter={() => setHoveredMuscle('glutes')}
              onMouseLeave={() => setHoveredMuscle(null)}
            >
              <title>{getTooltipText('glutes')}</title>
            </rect>
            <rect
              data-muscle="glutes"
              x="51"
              y="76"
              width="13"
              height="16"
              rx="4"
              fill={getColor('glutes').fill}
              opacity={getColor('glutes').opacity}
              className="transition-all duration-300 cursor-pointer"
              onMouseEnter={() => setHoveredMuscle('glutes')}
              onMouseLeave={() => setHoveredMuscle(null)}
            >
              <title>{getTooltipText('glutes')}</title>
            </rect>

            {/* Hamstrings (Đùi sau) */}
            <rect
              data-muscle="hamstrings"
              x="36"
              y="94"
              width="12"
              height="38"
              rx="4"
              fill={getColor('hamstrings').fill}
              opacity={getColor('hamstrings').opacity}
              className="transition-all duration-300 cursor-pointer"
              onMouseEnter={() => setHoveredMuscle('hamstrings')}
              onMouseLeave={() => setHoveredMuscle(null)}
            >
              <title>{getTooltipText('hamstrings')}</title>
            </rect>
            <rect
              data-muscle="hamstrings"
              x="52"
              y="94"
              width="12"
              height="38"
              rx="4"
              fill={getColor('hamstrings').fill}
              opacity={getColor('hamstrings').opacity}
              className="transition-all duration-300 cursor-pointer"
              onMouseEnter={() => setHoveredMuscle('hamstrings')}
              onMouseLeave={() => setHoveredMuscle(null)}
            >
              <title>{getTooltipText('hamstrings')}</title>
            </rect>

            {/* Calves Back */}
            <rect
              data-muscle="calves"
              x="36"
              y="138"
              width="10"
              height="42"
              rx="4"
              fill={getColor('calves').fill}
              opacity={getColor('calves').opacity}
              className="transition-all duration-300 cursor-pointer"
              onMouseEnter={() => setHoveredMuscle('calves')}
              onMouseLeave={() => setHoveredMuscle(null)}
            >
              <title>{getTooltipText('calves')}</title>
            </rect>
            <rect
              data-muscle="calves"
              x="54"
              y="138"
              width="10"
              height="42"
              rx="4"
              fill={getColor('calves').fill}
              opacity={getColor('calves').opacity}
              className="transition-all duration-300 cursor-pointer"
              onMouseEnter={() => setHoveredMuscle('calves')}
              onMouseLeave={() => setHoveredMuscle(null)}
            >
              <title>{getTooltipText('calves')}</title>
            </rect>
          </svg>
        </div>
      </div>

      {/* Hover Info bar */}
      <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs min-h-[24px]">
        {hoveredMuscle ? (
          <span className="font-semibold text-slate-900">
            {getTooltipText(hoveredMuscle)}
          </span>
        ) : (
          <span className="text-slate-400">
            Di chuột vào từng cơ để xem số set kích hoạt
          </span>
        )}

        {/* Legend scale */}
        <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
          <span>Ít</span>
          <div className="flex items-center gap-0.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-[#CBD5E1]" title="0 set" />
            <span className="w-2.5 h-2.5 rounded-xs bg-[#FDBA74]" title="1-2 sets" />
            <span className="w-2.5 h-2.5 rounded-xs bg-[#FB923C]" title="3-5 sets" />
            <span className="w-2.5 h-2.5 rounded-xs bg-[#EA580C]" title="6-8 sets" />
            <span className="w-2.5 h-2.5 rounded-xs bg-[#C2410C]" title="9+ sets" />
          </div>
          <span>Nhiều</span>
        </div>
      </div>
    </div>
  );
};
