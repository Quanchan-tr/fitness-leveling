'use strict';
'use client';

import React, { useState } from 'react';
import { TopBar } from '@/components/layout/TopBar';
import { initialFitnessData } from '@/lib/fitnessData';
import { Utensils, Plus, Flame, Trash2 } from 'lucide-react';
import { useShell } from '@/components/layout/ShellLayout';

interface MealLogItem {
  id: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  foodName: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
}

export default function NutritionPage() {
  const { toggleMobileNav } = useShell();
  const [meals, setMeals] = useState<MealLogItem[]>([
    { id: '1', mealType: 'breakfast', foodName: 'Yến mạch, chuối & 1 muỗng Whey Protein', calories: 480, proteinG: 34, carbsG: 62, fatG: 8 },
    { id: '2', mealType: 'lunch', foodName: 'Ức gà áp chảo, cơm gạo lứt & bông cải xanh', calories: 650, proteinG: 52, carbsG: 70, fatG: 12 },
    { id: '3', mealType: 'dinner', foodName: 'Cá hồi nướng măng tây & khoai lang mật', calories: 540, proteinG: 42, carbsG: 45, fatG: 18 },
    { id: '4', mealType: 'snack', foodName: 'Sữa chua Hy Lạp & hạt hạnh nhân', calories: 170, proteinG: 16, carbsG: 10, fatG: 7 },
  ]);

  const [mealType, setMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('lunch');
  const [foodName, setFoodName] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');

  const targetCalories = 2400;
  const targetProtein = 160;
  const targetCarbs = 250;
  const targetFat = 70;

  const totalCalories = meals.reduce((acc, m) => acc + m.calories, 0);
  const totalProtein = meals.reduce((acc, m) => acc + m.proteinG, 0);
  const totalCarbs = meals.reduce((acc, m) => acc + m.carbsG, 0);
  const totalFat = meals.reduce((acc, m) => acc + m.fatG, 0);

  const calPercent = Math.min(100, Math.round((totalCalories / targetCalories) * 100));
  const proPercent = Math.min(100, Math.round((totalProtein / targetProtein) * 100));
  const carbPercent = Math.min(100, Math.round((totalCarbs / targetCarbs) * 100));
  const fatPercent = Math.min(100, Math.round((totalFat / targetFat) * 100));

  const handleAddMeal = (e: React.FormEvent) => {
    e.preventDefault();
    if (foodName.trim()) {
      setMeals([
        ...meals,
        {
          id: `meal-${Date.now()}`,
          mealType,
          foodName: foodName.trim(),
          calories: parseInt(calories, 10) || 250,
          proteinG: parseFloat(protein) || 20,
          carbsG: parseFloat(carbs) || 30,
          fatG: parseFloat(fat) || 5,
        },
      ]);
      setFoodName('');
      setCalories('');
      setProtein('');
      setCarbs('');
      setFat('');
    }
  };

  const handleDeleteMeal = (id: string) => {
    setMeals(meals.filter((m) => m.id !== id));
  };

  const getMealTypeBadge = (type: string) => {
    switch (type) {
      case 'breakfast':
        return { label: 'Bữa sáng', color: 'bg-amber-50 text-amber-700 border-amber-200' };
      case 'lunch':
        return { label: 'Bữa trưa', color: 'bg-orange-50 text-orange-700 border-orange-200' };
      case 'dinner':
        return { label: 'Bữa tối', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
      case 'snack':
      default:
        return { label: 'Ăn nhẹ', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    }
  };

  return (
    <main className="flex-1 flex flex-col min-w-0 bg-slate-50 min-h-screen">
      <TopBar
        user={initialFitnessData.user}
        streak={initialFitnessData.today.streak}
        onToggleMobileMenu={toggleMobileNav}
      />

      <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-5xl mx-auto w-full">
        {/* Page Header (Information-first, bold and focused) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              <Utensils className="w-7 h-7 sm:w-8 sm:h-8 text-[#FF5722]" />
              <span>Dinh dưỡng</span>
            </h1>
          </div>
        </div>

        {/* Macro Summary Dashboard (4 Cards with Bold Slate Numbers, not rainbow text) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Calorie Card */}
          <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-2">
              <span>Tổng calo nạp</span>
              <Flame className="w-4 h-4 text-[#FF5722]" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900 tabular-nums">
                {totalCalories}{' '}
                <span className="text-xs font-medium text-slate-400">
                  / {targetCalories} kcal
                </span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-2.5">
                <div
                  className="bg-[#FF5722] h-full rounded-full transition-all duration-500"
                  style={{ width: `${calPercent}%` }}
                />
              </div>
              <div className="text-[10px] text-slate-400 font-medium mt-1.5 flex justify-between tabular-nums">
                <span>{calPercent}% mục tiêu</span>
                <span>Còn {Math.max(0, targetCalories - totalCalories)} kcal</span>
              </div>
            </div>
          </div>

          {/* Protein Card */}
          <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-2">
              <span>Protein (Đạm)</span>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">PRO</span>
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900 tabular-nums">
                {totalProtein}g{' '}
                <span className="text-xs font-medium text-slate-400">/ {targetProtein}g</span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-2.5">
                <div
                  className="bg-[#FF5722] h-full rounded-full transition-all duration-500"
                  style={{ width: `${proPercent}%` }}
                />
              </div>
              <div className="text-[10px] text-slate-400 font-medium mt-1.5 flex justify-between tabular-nums">
                <span>{proPercent}%</span>
                <span>Còn {Math.max(0, targetProtein - totalProtein)}g</span>
              </div>
            </div>
          </div>

          {/* Carbs Card */}
          <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-2">
              <span>Carbs (Tinh bột)</span>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">CARB</span>
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900 tabular-nums">
                {totalCarbs}g{' '}
                <span className="text-xs font-medium text-slate-400">/ {targetCarbs}g</span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-2.5">
                <div
                  className="bg-sky-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${carbPercent}%` }}
                />
              </div>
              <div className="text-[10px] text-slate-400 font-medium mt-1.5 flex justify-between tabular-nums">
                <span>{carbPercent}%</span>
                <span>Còn {Math.max(0, targetCarbs - totalCarbs)}g</span>
              </div>
            </div>
          </div>

          {/* Fat Card */}
          <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-2">
              <span>Fats (Chất béo)</span>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">FAT</span>
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900 tabular-nums">
                {totalFat}g{' '}
                <span className="text-xs font-medium text-slate-400">/ {targetFat}g</span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-2.5">
                <div
                  className="bg-amber-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${fatPercent}%` }}
                />
              </div>
              <div className="text-[10px] text-slate-400 font-medium mt-1.5 flex justify-between tabular-nums">
                <span>{fatPercent}%</span>
                <span>Còn {Math.max(0, targetFat - totalFat)}g</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Food Log Form */}
        <form
          onSubmit={handleAddMeal}
          className="bg-white p-5 rounded-xl border border-slate-200 space-y-4"
        >
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
            <Plus className="w-5 h-5 text-[#FF5722]" />
            <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
              Nhật ký món ăn
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-6 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Tên món ăn / Thực phẩm
              </label>
              <input
                type="text"
                required
                placeholder="Vd: 200g ức gà luộc"
                value={foodName}
                onChange={(e) => setFoodName(e.target.value)}
                className="w-full bg-slate-50 px-3 py-2 rounded-lg border border-slate-200 text-xs sm:text-sm font-medium focus:outline-none focus:border-[#FF5722]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Bữa ăn
              </label>
              <select
                value={mealType}
                onChange={(e) => setMealType(e.target.value as any)}
                className="w-full bg-slate-50 px-3 py-2 rounded-lg border border-slate-200 text-xs sm:text-sm font-medium focus:outline-none focus:border-[#FF5722]"
              >
                <option value="breakfast">Bữa sáng</option>
                <option value="lunch">Bữa trưa</option>
                <option value="dinner">Bữa tối</option>
                <option value="snack">Ăn nhẹ</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Calo (kcal)
              </label>
              <input
                type="number"
                placeholder="300"
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
                className="w-full bg-slate-50 px-3 py-2 rounded-lg border border-slate-200 text-xs sm:text-sm font-medium focus:outline-none focus:border-[#FF5722]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Protein (g)
              </label>
              <input
                type="number"
                step="0.1"
                placeholder="30"
                value={protein}
                onChange={(e) => setProtein(e.target.value)}
                className="w-full bg-slate-50 px-3 py-2 rounded-lg border border-slate-200 text-xs sm:text-sm font-medium focus:outline-none focus:border-[#FF5722]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Carb / Fat (g)
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                <input
                  type="number"
                  step="0.1"
                  placeholder="C"
                  value={carbs}
                  onChange={(e) => setCarbs(e.target.value)}
                  className="w-full bg-slate-50 px-2 py-2 rounded-lg border border-slate-200 text-xs sm:text-sm font-medium focus:outline-none focus:border-[#FF5722]"
                />
                <input
                  type="number"
                  step="0.1"
                  placeholder="F"
                  value={fat}
                  onChange={(e) => setFat(e.target.value)}
                  className="w-full bg-slate-50 px-2 py-2 rounded-lg border border-slate-200 text-xs sm:text-sm font-medium focus:outline-none focus:border-[#FF5722]"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              className="bg-[#FF5722] text-white px-4 py-2 rounded-lg text-xs sm:text-sm font-bold hover:bg-[#E64A19] transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Ghi nhận món ăn</span>
            </button>
          </div>
        </form>

        {/* Meals List */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
              Nhật ký bữa ăn hôm nay ({meals.length} món)
            </h3>
            <span className="text-xs font-bold text-slate-600 tabular-nums">
              Tổng cộng: {totalCalories} kcal
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {meals.map((m) => {
              const badge = getMealTypeBadge(m.mealType);
              return (
                <div
                  key={m.id}
                  className="p-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.2 rounded border ${badge.color}`}
                      >
                        {badge.label}
                      </span>
                      <h4 className="font-bold text-xs sm:text-sm text-slate-900">
                        {m.foodName}
                      </h4>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500 font-medium tabular-nums">
                      <span>
                        <strong className="text-slate-900 font-semibold">{m.calories}</strong> kcal
                      </span>
                      <span>
                        P: <strong className="text-slate-800">{m.proteinG}g</strong>
                      </span>
                      <span>
                        C: <strong className="text-slate-800">{m.carbsG}g</strong>
                      </span>
                      <span>
                        F: <strong className="text-slate-800">{m.fatG}g</strong>
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteMeal(m.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                    title="Xóa món ăn"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </main>
  );
}
