'use client';

import { useState, useMemo } from 'react';
import { FoodItem } from '@/types/nutrition.types';

function removeVietnameseTones(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim();
}

export function useFoodSearch(foods: FoodItem[]) {
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    const rawTrimmed = query.trim().toLowerCase();
    if (!rawTrimmed) {
      return foods;
    }

    const normalizedQuery = removeVietnameseTones(rawTrimmed);

    return foods.filter((food) => {
      const name = food.name.toLowerCase();
      const normalizedName = removeVietnameseTones(name);
      const category = food.category.toLowerCase();
      const normalizedCategory = removeVietnameseTones(category);
      const tags = (food.tags || []).map((t) => t.toLowerCase());
      const normalizedTags = (food.tags || []).map((t) => removeVietnameseTones(t));

      return (
        name.includes(rawTrimmed) ||
        normalizedName.includes(normalizedQuery) ||
        category.includes(rawTrimmed) ||
        normalizedCategory.includes(normalizedQuery) ||
        tags.some((t) => t.includes(rawTrimmed)) ||
        normalizedTags.some((t) => t.includes(normalizedQuery))
      );
    });
  }, [foods, query]);

  const clearSearch = () => {
    setQuery('');
  };

  return {
    query,
    setQuery,
    results,
    clearSearch,
  };
}
