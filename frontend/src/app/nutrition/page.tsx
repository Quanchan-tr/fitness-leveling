'use strict';
'use client';

import React, { useState } from 'react';
import { TopBar } from '@/components/layout/TopBar';
import { initialFitnessData } from '@/lib/fitnessData';
import { Utensils, Plus, Flame, PieChart, Apple, Trash2 } from 'lucide-react';

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
  const [meals, setMeals] = useState<MealLogItem[]>([
    { id: '1', mealType: 'breakfast', foodName: 'Oatmeal with Whey Protein & Banana', calories: 480, proteinG: 34, carbsG: 62, fatG: 8 },
    { id: '2', mealType: 'lunch', foodName: 'Grilled Chicken Breast & Brown Rice', calories: 650, proteinG: 52, carbsG: 70, fatG: 12 },
    { id: '3', mealType: 'dinner', foodName: 'Salmon Fillet with Sweet Potato & Broccoli', calories: 540, proteinG: 42, carbsG: 45, fatG: 18 },
    { id: '4', mealType: 'snack', foodName: 'Greek Yogurt with Almonds', calories: 150, proteinG: 15, carbsG: 8, fatG: 6 },
  ]);

  const [mealType, setMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('lunch');
  const [foodName, setFoodName] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');

  const totalCalories = meals.reduce((acc, m) => acc + m.calories, 0);
  const totalProtein = meals.reduce((acc, m) => acc + m.proteinG, 0);
  const totalCarbs = meals.reduce((acc, m) => acc + m.carbsG, 0);
  const totalFat = meals.reduce((acc, m) => acc + m.fatG, 0);

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

  return (
    <main className="flex-1 flex flex-col min-w-0">
      <TopBar user={initialFitnessData.user} streak={initialFitnessData.today.streak} />

      <div className="p-6 space-y-6 max-w-5xl mx-auto w-full">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-[#1F2328] tracking-tight flex items-center gap-2.5">
              <Utensils className="w-7 h-7 text-[#FF6B35]" />
              Nutrition & Macro Tracker
            </h1>
            <p className="text-xs text-[#76583E] mt-0.5">
              Log your meals and maintain nutritional macro balance.
            </p>
          </div>
        </div>

        {/* Macro Summary Dashboard */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white p-4 rounded-2xl border border-[#B9A78E]/30 shadow-sm">
            <div className="text-xs font-semibold text-[#76583E] mb-1 flex items-center justify-between">
              <span>Total Energy</span>
              <Flame className="w-4 h-4 text-[#FF6B35]" />
            </div>
            <div className="text-2xl font-black text-[#1F2328]">{totalCalories} <span className="text-xs font-normal text-[#76583E]">/ 2400 kcal</span></div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-[#B9A78E]/30 shadow-sm">
            <div className="text-xs font-semibold text-[#76583E] mb-1 flex items-center justify-between">
              <span>Protein</span>
              <span className="text-xs font-bold text-[#FF6B35]">PRO</span>
            </div>
            <div className="text-2xl font-black text-[#FF6B35]">{totalProtein}g</div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-[#B9A78E]/30 shadow-sm">
            <div className="text-xs font-semibold text-[#76583E] mb-1 flex items-center justify-between">
              <span>Carbs</span>
              <span className="text-xs font-bold text-[#F4C95D]">CHO</span>
            </div>
            <div className="text-2xl font-black text-[#F4C95D]">{totalCarbs}g</div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-[#B9A78E]/30 shadow-sm">
            <div className="text-xs font-semibold text-[#76583E] mb-1 flex items-center justify-between">
              <span>Healthy Fats</span>
              <span className="text-xs font-bold text-[#4D96FF]">FAT</span>
            </div>
            <div className="text-2xl font-black text-[#4D96FF]">{totalFat}g</div>
          </div>
        </div>

        {/* Add Meal Form */}
        <form
          onSubmit={handleAddMeal}
          className="bg-white p-5 rounded-2xl border border-[#B9A78E]/40 shadow-sm space-y-3"
        >
          <h3 className="text-xs font-bold text-[#1F2328] uppercase tracking-wider flex items-center gap-2">
            <Apple className="w-4 h-4 text-[#FF6B35]" />
            Add Nutrition Item
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-6 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-[#76583E] mb-1">Meal</label>
              <select
                value={mealType}
                onChange={(e) => setMealType(e.target.value as any)}
                className="w-full bg-[#F7F3EA] px-3 py-2 rounded-xl border border-[#B9A78E]/40 text-xs font-medium"
              >
                <option value="breakfast">Breakfast</option>
                <option value="lunch">Lunch</option>
                <option value="dinner">Dinner</option>
                <option value="snack">Snack</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-semibold text-[#76583E] mb-1">Food Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Chicken breast"
                value={foodName}
                onChange={(e) => setFoodName(e.target.value)}
                className="w-full bg-[#F7F3EA] px-3 py-2 rounded-xl border border-[#B9A78E]/40 text-xs font-medium"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[#76583E] mb-1">Calories</label>
              <input
                type="number"
                placeholder="kcal"
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
                className="w-full bg-[#F7F3EA] px-3 py-2 rounded-xl border border-[#B9A78E]/40 text-xs font-medium"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[#76583E] mb-1">Protein (g)</label>
              <input
                type="number"
                placeholder="g"
                value={protein}
                onChange={(e) => setProtein(e.target.value)}
                className="w-full bg-[#F7F3EA] px-3 py-2 rounded-xl border border-[#B9A78E]/40 text-xs font-medium"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[#76583E] mb-1">Carbs / Fat</label>
              <input
                type="number"
                placeholder="Carbs (g)"
                value={carbs}
                onChange={(e) => setCarbs(e.target.value)}
                className="w-full bg-[#F7F3EA] px-3 py-2 rounded-xl border border-[#B9A78E]/40 text-xs font-medium"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-[#FF6B35] text-white px-5 py-2 rounded-xl text-xs font-bold hover:bg-[#FF6B35]/90 transition-all flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Add Meal
            </button>
          </div>
        </form>

        {/* Meals List */}
        <div className="bg-white rounded-2xl border border-[#B9A78E]/40 overflow-hidden shadow-sm">
          <div className="p-4 bg-[#E8E1D5]/40 border-b border-[#B9A78E]/30">
            <h3 className="text-xs font-bold text-[#1F2328] uppercase tracking-wider">
              Today's Meal Records
            </h3>
          </div>
          <div className="divide-y divide-[#B9A78E]/20">
            {meals.map((m) => (
              <div key={m.id} className="p-4 flex items-center justify-between hover:bg-[#F7F3EA] transition-colors">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#E8E1D5] text-[#76583E]">
                      {m.mealType}
                    </span>
                    <h4 className="font-bold text-xs text-[#1F2328]">{m.foodName}</h4>
                  </div>
                  <div className="flex items-center gap-3 mt-1.5 text-xs text-[#76583E]">
                    <span><strong>{m.calories}</strong> kcal</span>
                    <span>P: <strong className="text-[#FF6B35]">{m.proteinG}g</strong></span>
                    <span>C: <strong className="text-[#F4C95D]">{m.carbsG}g</strong></span>
                    <span>F: <strong className="text-[#4D96FF]">{m.fatG}g</strong></span>
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteMeal(m.id)}
                  className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
