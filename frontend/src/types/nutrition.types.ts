export type MealType = 'breakfast' | 'lunch' | 'dinner';

export interface MacroNutrients {
  protein: number; // in grams
  carbs: number;   // in grams
  fat: number;     // in grams
}

export type FoodItemType = 'DISH' | 'RAW';

export interface FoodItem {
  id: string;
  name: string;
  category: string;
  base_serving: string;
  base_calories: number;
  base_macros: MacroNutrients;
  min_multiplier: number;
  max_multiplier: number;
  description?: string;
  tags?: string[];
  item_type?: FoodItemType;
  serving_size?: string;
  serving_weight_g?: number;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  fiber?: number;
  name_en?: string;
}

export interface FoodLogItem {
  id: string;
  foodId: string;
  name: string;
  meal: MealType;
  multiplier: number;
  calories: number;
  macros: MacroNutrients;
  loggedAt: string; // ISO timestamp string
}

export interface ComboFoodRef {
  foodId: string;
  multiplier: number;
}

export interface SavedCombo {
  id: string;
  name: string;
  items: ComboFoodRef[];
  createdAt: string;
}

export interface MacroTargets {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface DailyMacroSummary {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  targets: MacroTargets;
  calorieProgress: number; // clamped 0-100%
  proteinProgress: number; // clamped 0-100%
  carbProgress: number;    // clamped 0-100%
  fatProgress: number;     // clamped 0-100%
}
