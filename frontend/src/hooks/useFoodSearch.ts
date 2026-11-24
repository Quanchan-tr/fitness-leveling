'use client';

import { useState, useMemo } from 'react';
import { FoodItem } from '@/types/nutrition.types';

export function removeVietnameseTones(str: string): string {
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
    const queryTokens = normalizedQuery.split(/\s+/).filter(Boolean);

    return foods.filter((food) => {
      const name = food.name.toLowerCase();
      const normalizedName = removeVietnameseTones(name);
      const nameEn = (food.name_en || '').toLowerCase();
      const category = food.category.toLowerCase();
      const normalizedCategory = removeVietnameseTones(category);
      const tags = (food.tags || []).map((t) => t.toLowerCase());
      const normalizedTags = (food.tags || []).map((t) => removeVietnameseTones(t));

      // Direct full match check
      const fullMatch =
        name.includes(rawTrimmed) ||
        normalizedName.includes(normalizedQuery) ||
        nameEn.includes(rawTrimmed) ||
        category.includes(rawTrimmed) ||
        normalizedCategory.includes(normalizedQuery) ||
        tags.some((t) => t.includes(rawTrimmed)) ||
        normalizedTags.some((t) => t.includes(normalizedQuery));

      if (fullMatch) return true;

      // Multi-token match check (e.g. "uc ga", "bo nuong", "bun cha")
      if (queryTokens.length > 1) {
        const matchesAllTokens = queryTokens.every(
          (token) =>
            normalizedName.includes(token) ||
            normalizedCategory.includes(token) ||
            nameEn.includes(token) ||
            normalizedTags.some((t) => t.includes(token))
        );
        if (matchesAllTokens) return true;
      }

      return false;
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
