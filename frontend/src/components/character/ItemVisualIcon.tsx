'use client';

import React from 'react';

interface ItemVisualIconProps {
  itemCode: string;
  className?: string;
}

/**
 * Pixel-art / stylized RPG vector illustrations for each wardrobe equipment item.
 * Faithfully matches the reference image items (beanies, shirts, jackets, pants, boots, wings, sparkles, concepts)
 */
export const ItemVisualIcon: React.FC<ItemVisualIconProps> = ({ itemCode, className = 'w-16 h-16' }) => {
  switch (itemCode) {
    // ================= HEADWEAR =================
    case 'red_beanie':
      return (
        <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="16" y="16" width="32" height="24" rx="4" fill="#B91C1C" />
          <path d="M16 26H48" stroke="#991B1B" strokeWidth="2" strokeDasharray="3 3" />
          <rect x="12" y="34" width="40" height="14" rx="2" fill="#DC2626" stroke="#7F1D1D" strokeWidth="2" />
          <line x1="20" y1="36" x2="20" y2="46" stroke="#991B1B" strokeWidth="2" />
          <line x1="28" y1="36" x2="28" y2="46" stroke="#991B1B" strokeWidth="2" />
          <line x1="36" y1="36" x2="36" y2="46" stroke="#991B1B" strokeWidth="2" />
          <line x1="44" y1="36" x2="44" y2="46" stroke="#991B1B" strokeWidth="2" />
          <rect x="29" y="38" width="6" height="6" fill="#FBBF24" stroke="#B45309" strokeWidth="1" />
        </svg>
      );

    case 'straw_hat':
      return (
        <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="22" y="22" width="20" height="16" rx="2" fill="#FDE047" stroke="#CA8A04" strokeWidth="1.5" />
          <rect x="22" y="32" width="20" height="6" fill="#DC2626" />
          <ellipse cx="32" cy="40" rx="24" ry="6" fill="#FEF08A" stroke="#CA8A04" strokeWidth="2" />
          <line x1="12" y1="40" x2="52" y2="40" stroke="#EAB308" strokeWidth="1" strokeDasharray="3 3" />
        </svg>
      );

    case 'witch_hat':
      return (
        <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <ellipse cx="32" cy="44" rx="24" ry="7" fill="#1E1B4B" stroke="#0F172A" strokeWidth="2" />
          <path d="M18 42L32 12L40 22L46 42H18Z" fill="#312E81" />
          <rect x="21" y="38" width="22" height="5" fill="#DC2626" />
          <rect x="29" y="37" width="6" height="7" fill="#FBBF24" stroke="#B45309" strokeWidth="1" />
        </svg>
      );

    case 'fur_cap':
      return (
        <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="16" y="18" width="32" height="22" rx="4" fill="#78350F" />
          <rect x="14" y="28" width="36" height="14" rx="2" fill="#FEF3C7" stroke="#D97706" strokeWidth="1.5" />
          <rect x="12" y="38" width="8" height="14" rx="2" fill="#FEF3C7" />
          <rect x="44" y="38" width="8" height="14" rx="2" fill="#FEF3C7" />
        </svg>
      );

    case 'athletic_cap':
      return (
        <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M16 38C16 26 22 20 32 20C42 20 48 26 48 38H16Z" fill="#0F172A" />
          <rect x="36" y="36" width="18" height="6" rx="2" fill="#FF5722" />
        </svg>
      );

    case 'retro_headband':
      return (
        <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="14" y="26" width="36" height="12" rx="2" fill="#EC4899" stroke="#BE185D" strokeWidth="1.5" />
          <rect x="14" y="30" width="36" height="4" fill="#06B6D4" />
          <line x1="20" y1="26" x2="20" y2="38" stroke="#BE185D" strokeWidth="1" strokeDasharray="2 2" />
          <line x1="28" y1="26" x2="28" y2="38" stroke="#BE185D" strokeWidth="1" strokeDasharray="2 2" />
          <line x1="36" y1="26" x2="36" y2="38" stroke="#BE185D" strokeWidth="1" strokeDasharray="2 2" />
          <line x1="44" y1="26" x2="44" y2="38" stroke="#BE185D" strokeWidth="1" strokeDasharray="2 2" />
        </svg>
      );

    case 'cyber_headphones':
      return (
        <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M16 32V24C16 16 23 12 32 12C41 12 48 16 48 24V32" stroke="#18181B" strokeWidth="4" strokeLinecap="round" />
          <rect x="10" y="28" width="10" height="18" rx="2" fill="#09090B" stroke="#27272A" strokeWidth="1.5" />
          <rect x="12" y="32" width="6" height="10" rx="1" fill="#06B6D4" />
          <rect x="44" y="28" width="10" height="18" rx="2" fill="#09090B" stroke="#27272A" strokeWidth="1.5" />
          <rect x="46" y="32" width="6" height="10" rx="1" fill="#06B6D4" />
          <circle cx="15" cy="37" r="1.5" fill="#FFFFFF" />
          <circle cx="49" cy="37" r="1.5" fill="#FFFFFF" />
        </svg>
      );

    case 'solar_crown':
      return (
        <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="14" y="34" width="36" height="8" rx="1" fill="#F59E0B" stroke="#B45309" strokeWidth="1.5" />
          <polygon points="18,34 22,22 26,34" fill="#FBBF24" />
          <polygon points="26,34 32,14 38,34" fill="#FDE047" stroke="#F59E0B" strokeWidth="1" />
          <polygon points="38,34 42,22 46,34" fill="#FBBF24" />
          <circle cx="32" cy="38" r="3" fill="#FFFFFF" stroke="#F59E0B" strokeWidth="1" />
        </svg>
      );

    // ================= HAIR =================
    case 'male_spiky':
      return (
        <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M16 42C14 30 20 22 26 18L30 12L36 18L44 14L46 24L50 32C50 44 46 44 42 44H20C16 44 16 42 16 42Z" fill="#854D0E" stroke="#5A2E12" strokeWidth="2" />
          <path d="M26 18L32 26L38 20" stroke="#A16207" strokeWidth="2" />
          <polygon points="24,20 28,14 34,22" fill="#A16207" />
        </svg>
      );

    case 'male_undercut':
      return (
        <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M18 38H46V44H18V38Z" fill="#3F3F46" />
          <path d="M18 36C18 24 24 16 36 14C44 14 46 22 46 36H18Z" fill="#18181B" />
          <path d="M26 16L40 22L44 32" stroke="#52525B" strokeWidth="2" />
        </svg>
      );

    case 'male_messy_curls':
      return (
        <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="24" cy="22" r="8" fill="#451A03" />
          <circle cx="34" cy="18" r="9" fill="#78350F" />
          <circle cx="44" cy="24" r="7" fill="#451A03" />
          <circle cx="28" cy="32" r="6" fill="#78350F" />
          <circle cx="38" cy="30" r="7" fill="#451A03" />
          <rect x="18" y="32" width="28" height="12" rx="3" fill="#451A03" />
        </svg>
      );

    case 'male_samurai_bun':
      return (
        <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="32" cy="14" r="6" fill="#18181B" />
          <rect x="29" y="18" width="6" height="4" fill="#F59E0B" />
          <path d="M18 36C18 24 24 20 32 20C40 20 46 24 46 36H18Z" fill="#18181B" />
          <path d="M18 38H46V44H18V38Z" fill="#3F3F46" />
        </svg>
      );

    case 'male_buzz_cut':
      return (
        <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 38C20 26 25 20 32 20C39 20 44 26 44 38H20Z" fill="#27272A" />
          <line x1="20" y1="36" x2="44" y2="36" stroke="#52525B" strokeWidth="2" />
        </svg>
      );

    case 'female_braids':
      return (
        <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M18 36C16 24 22 16 32 16C42 16 48 24 46 36H18Z" fill="#592D14" />
          <circle cx="32" cy="14" r="6" fill="#451A03" />
          <rect x="14" y="32" width="6" height="22" rx="3" fill="#592D14" />
          <rect x="13" y="44" width="8" height="4" fill="#FBBF24" />
          <rect x="44" y="32" width="6" height="22" rx="3" fill="#592D14" />
          <rect x="43" y="44" width="8" height="4" fill="#FBBF24" />
        </svg>
      );

    case 'female_ponytail':
      return (
        <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 38C18 26 24 18 34 18C42 18 46 24 46 38H20Z" fill="#1C1917" />
          <path d="M42 24C48 20 54 26 52 38C50 44 46 44 44 42" stroke="#1C1917" strokeWidth="6" strokeLinecap="round" />
          <circle cx="42" cy="24" r="3" fill="#FF5722" />
        </svg>
      );

    case 'female_bob_cut':
      return (
        <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M16 44C14 26 22 18 32 18C42 18 50 26 48 44L44 46L42 34H22L20 46L16 44Z" fill="#3B0764" />
        </svg>
      );

    case 'female_wavy_long':
      return (
        <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M18 36C16 22 24 16 32 16C40 16 48 22 46 36H18Z" fill="#7C2D12" />
          <path d="M16 34C14 42 18 48 16 54C15 56 18 56 20 52C22 46 18 42 20 34" fill="#7C2D12" />
          <path d="M48 34C50 42 46 48 48 54C49 56 46 56 44 52C42 46 46 42 44 34" fill="#7C2D12" />
        </svg>
      );

    case 'female_twin_buns':
      return (
        <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="20" cy="18" r="7" fill="#BE185D" />
          <circle cx="44" cy="18" r="7" fill="#BE185D" />
          <path d="M20 38C18 26 24 20 32 20C40 20 46 26 44 38H20Z" fill="#BE185D" />
        </svg>
      );

    // ================= TOP =================
    case 'orange_plaid':
      return (
        <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="6" y="24" width="14" height="20" rx="3" fill="#EA580C" stroke="#9A3412" strokeWidth="1.5" />
          <rect x="44" y="24" width="14" height="20" rx="3" fill="#EA580C" stroke="#9A3412" strokeWidth="1.5" />
          <rect x="16" y="20" width="32" height="34" rx="3" fill="#EA580C" stroke="#9A3412" strokeWidth="2" />
          <rect x="25" y="20" width="14" height="34" fill="#06B6D4" />
          <rect x="28" y="28" width="8" height="8" fill="#0891B2" rx="1" />
          <line x1="16" y1="28" x2="25" y2="28" stroke="#9A3412" strokeWidth="2" strokeDasharray="2 2" />
          <line x1="39" y1="28" x2="48" y2="28" stroke="#9A3412" strokeWidth="2" strokeDasharray="2 2" />
          <line x1="16" y1="40" x2="25" y2="40" stroke="#9A3412" strokeWidth="2" strokeDasharray="2 2" />
          <line x1="39" y1="40" x2="48" y2="40" stroke="#9A3412" strokeWidth="2" strokeDasharray="2 2" />
        </svg>
      );

    case 'teal_shirt':
      return (
        <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="8" y="24" width="12" height="16" rx="2" fill="#0D9488" />
          <rect x="44" y="24" width="12" height="16" rx="2" fill="#0D9488" />
          <rect x="18" y="20" width="28" height="34" rx="3" fill="#0D9488" stroke="#115E59" strokeWidth="2" />
          <path d="M26 20C26 25 38 25 38 20" stroke="#115E59" strokeWidth="2" fill="none" />
        </svg>
      );

    case 'leather_coat':
      return (
        <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 24L18 18H46L52 24V44L46 42V56L38 52L32 54L26 52L18 56V42L12 44V24Z" fill="#451A03" stroke="#292524" strokeWidth="2" />
          <path d="M24 18L32 34L40 18" stroke="#78350F" strokeWidth="3" fill="#18181B" />
          <rect x="18" y="38" width="28" height="5" fill="#18181B" />
          <rect x="29" y="37" width="6" height="7" fill="#F59E0B" />
        </svg>
      );

    case 'female_tunic':
      return (
        <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M18 20H46L44 50H20L18 20Z" fill="#1E3A5F" stroke="#0F172A" strokeWidth="2" />
          <rect x="20" y="32" width="24" height="12" fill="#451A03" />
          <line x1="28" y1="34" x2="36" y2="42" stroke="#FDE047" strokeWidth="2" />
          <line x1="36" y1="34" x2="28" y2="42" stroke="#FDE047" strokeWidth="2" />
          <path d="M24 20C24 26 40 26 40 20L34 26L38 32H26L30 26L24 20Z" fill="#DC2626" />
        </svg>
      );

    case 'gothic_top':
      return (
        <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="8" y="24" width="10" height="24" fill="#18181B" />
          <rect x="46" y="24" width="10" height="24" fill="#18181B" />
          <path d="M18 22H46L42 42L32 46L22 42L18 22Z" fill="#18181B" stroke="#DC2626" strokeWidth="2" />
        </svg>
      );

    case 'mage_robe':
      return (
        <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M16 20H48L46 52H18L16 20Z" fill="#1E3A8A" stroke="#0F172A" strokeWidth="2" />
          <rect x="12" y="18" width="10" height="10" rx="3" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="1.5" />
          <rect x="42" y="18" width="10" height="10" rx="3" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="1.5" />
          <polygon points="32,28 36,34 32,40 28,34" fill="#38BDF8" stroke="#0284C7" strokeWidth="1" />
        </svg>
      );

    case 'calisthenics_top':
      return (
        <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M22 18H28L30 26H34L36 18H42L46 48H18L22 18Z" fill="#27272A" stroke="#18181B" strokeWidth="2" />
          <line x1="22" y1="18" x2="28" y2="18" stroke="#F4F4F5" strokeWidth="2" />
          <line x1="36" y1="18" x2="42" y2="18" stroke="#F4F4F5" strokeWidth="2" />
          <path d="M28 18C28 24 36 24 36 18" stroke="#F4F4F5" strokeWidth="1.5" />
          <rect x="29" y="30" width="6" height="2" fill="#F4F4F5" />
        </svg>
      );

    case 'techwear_jacket':
      return (
        <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="6" y="24" width="14" height="22" rx="2" fill="#18181B" stroke="#27272A" strokeWidth="1.5" />
          <rect x="44" y="24" width="14" height="22" rx="2" fill="#18181B" stroke="#27272A" strokeWidth="1.5" />
          <rect x="18" y="20" width="28" height="34" rx="2" fill="#18181B" stroke="#27272A" strokeWidth="2" />
          <rect x="24" y="16" width="16" height="6" fill="#27272A" />
          <line x1="32" y1="22" x2="32" y2="54" stroke="#52525B" strokeWidth="2" />
          <rect x="20" y="30" width="8" height="8" rx="1" fill="#27272A" stroke="#3F3F46" strokeWidth="1" />
          <rect x="36" y="30" width="8" height="8" rx="1" fill="#27272A" stroke="#3F3F46" strokeWidth="1" />
          <path d="M20 40V48L24 50" stroke="#71717A" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M44 40V48L40 50" stroke="#71717A" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );

    case 'cyber_grid_hoodie':
      return (
        <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="8" y="24" width="12" height="20" rx="2" fill="#09090B" />
          <rect x="44" y="24" width="12" height="20" rx="2" fill="#09090B" />
          <rect x="18" y="20" width="28" height="34" rx="2" fill="#09090B" stroke="#06B6D4" strokeWidth="1.5" />
          <line x1="22" y1="26" x2="42" y2="26" stroke="#06B6D4" strokeWidth="1" strokeOpacity="0.8" />
          <line x1="22" y1="32" x2="42" y2="32" stroke="#06B6D4" strokeWidth="1" strokeOpacity="0.8" />
          <line x1="22" y1="38" x2="42" y2="38" stroke="#06B6D4" strokeWidth="1" strokeOpacity="0.8" />
          <line x1="26" y1="22" x2="26" y2="44" stroke="#06B6D4" strokeWidth="1" strokeOpacity="0.8" />
          <line x1="32" y1="22" x2="32" y2="44" stroke="#06B6D4" strokeWidth="1" strokeOpacity="0.8" />
          <line x1="38" y1="22" x2="38" y2="44" stroke="#06B6D4" strokeWidth="1" strokeOpacity="0.8" />
          <rect x="22" y="42" width="20" height="8" rx="1" fill="#18181B" stroke="#06B6D4" strokeWidth="1" />
        </svg>
      );

    case 'shinobi_tunic':
      return (
        <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="8" y="24" width="12" height="18" rx="1" fill="#18022B" stroke="#3B0764" strokeWidth="1" />
          <rect x="44" y="24" width="12" height="18" rx="1" fill="#18022B" stroke="#3B0764" strokeWidth="1" />
          <path d="M18 20H46L44 50H20L18 20Z" fill="#18022B" stroke="#3B0764" strokeWidth="2" />
          <line x1="18" y1="20" x2="36" y2="36" stroke="#7C3AED" strokeWidth="2" />
          <line x1="46" y1="20" x2="26" y2="38" stroke="#7C3AED" strokeWidth="2" />
          <rect x="18" y="36" width="28" height="6" fill="#7C3AED" />
          <rect x="28" y="42" width="6" height="10" fill="#9333EA" />
        </svg>
      );

    case 'mecha_exorig':
      return (
        <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="18" y="20" width="28" height="34" rx="2" fill="#18181B" stroke="#3F3F46" strokeWidth="1.5" />
          <rect x="10" y="20" width="10" height="8" rx="1" fill="#EAB308" stroke="#713F12" strokeWidth="1" />
          <rect x="44" y="20" width="10" height="8" rx="1" fill="#EAB308" stroke="#713F12" strokeWidth="1" />
          <rect x="22" y="24" width="6" height="14" fill="#EAB308" stroke="#713F12" strokeWidth="1" />
          <rect x="36" y="24" width="6" height="14" fill="#EAB308" stroke="#713F12" strokeWidth="1" />
          <circle cx="32" cy="32" r="4" fill="#FACC15" stroke="#CA8A04" strokeWidth="1" />
          <rect x="22" y="44" width="20" height="4" fill="#EAB308" />
          <line x1="26" y1="44" x2="24" y2="48" stroke="#09090B" strokeWidth="2" />
          <line x1="32" y1="44" x2="30" y2="48" stroke="#09090B" strokeWidth="2" />
          <line x1="38" y1="44" x2="36" y2="48" stroke="#09090B" strokeWidth="2" />
        </svg>
      );

    case 'glitch_void_suit':
      return (
        <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="18" y="20" width="28" height="34" rx="2" fill="#020617" stroke="#1E1B4B" strokeWidth="2" />
          <rect x="22" y="24" width="6" height="6" fill="#06B6D4" />
          <rect x="34" y="28" width="8" height="4" fill="#A855F7" />
          <rect x="26" y="36" width="12" height="4" fill="#06B6D4" />
          <rect x="20" y="42" width="6" height="6" fill="#A855F7" />
          <rect x="38" y="40" width="6" height="8" fill="#38BDF8" />
          <rect x="12" y="28" width="5" height="3" fill="#06B6D4" opacity="0.8" />
          <rect x="47" y="34" width="5" height="3" fill="#A855F7" opacity="0.8" />
        </svg>
      );

    case 'solar_armor':
      return (
        <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M16 20H48L44 50H20L16 20Z" fill="#F59E0B" stroke="#B45309" strokeWidth="2" />
          <line x1="16" y1="20" x2="48" y2="20" stroke="#FFFFFF" strokeWidth="3" />
          <rect x="10" y="20" width="8" height="10" rx="1" fill="#FBBF24" stroke="#B45309" strokeWidth="1" />
          <rect x="46" y="20" width="8" height="10" rx="1" fill="#FBBF24" stroke="#B45309" strokeWidth="1" />
          <circle cx="32" cy="32" r="6" fill="#FFFFFF" stroke="#F59E0B" strokeWidth="2" />
          <polygon points="32,22 34,26 32,25 30,26" fill="#FEF08A" />
          <polygon points="32,42 34,38 32,39 30,38" fill="#FEF08A" />
        </svg>
      );

    // ================= BOTTOM =================
    case 'blue_jeans':
      return (
        <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="18" y="16" width="28" height="8" rx="2" fill="#1E293B" stroke="#0F172A" strokeWidth="1.5" />
          <rect x="18" y="24" width="12" height="28" fill="#1E293B" stroke="#0F172A" strokeWidth="1.5" />
          <rect x="34" y="24" width="12" height="28" fill="#1E293B" stroke="#0F172A" strokeWidth="1.5" />
          <rect x="18" y="48" width="12" height="4" fill="#475569" />
          <rect x="34" y="48" width="12" height="4" fill="#475569" />
        </svg>
      );

    case 'brown_cargo':
      return (
        <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="18" y="16" width="28" height="8" rx="2" fill="#451A03" stroke="#292524" strokeWidth="1.5" />
          <rect x="18" y="24" width="12" height="28" fill="#451A03" stroke="#292524" strokeWidth="1.5" />
          <rect x="34" y="24" width="12" height="28" fill="#451A03" stroke="#292524" strokeWidth="1.5" />
        </svg>
      );

    case 'blue_skirt':
      return (
        <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M22 18H42L48 44H16L22 18Z" fill="#1E3A5F" stroke="#0F172A" strokeWidth="2" />
          <path d="M30 18L26 44" stroke="#0F172A" strokeWidth="2" />
          <rect x="16" y="42" width="32" height="4" fill="#F8FAFC" />
        </svg>
      );

    case 'female_leggings':
      return (
        <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="20" y="18" width="24" height="6" fill="#09090B" />
          <rect x="20" y="24" width="10" height="30" rx="1" fill="#09090B" />
          <rect x="34" y="24" width="10" height="30" rx="1" fill="#09090B" />
          <line x1="20" y1="36" x2="30" y2="36" stroke="#FF5722" strokeWidth="2" />
          <line x1="34" y1="36" x2="44" y2="36" stroke="#FF5722" strokeWidth="2" />
        </svg>
      );

    case 'calisthenics_shorts':
      return (
        <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="20" y="20" width="24" height="6" fill="#18181B" />
          <path d="M20 26H31V42H22L20 26Z" fill="#27272A" />
          <path d="M33 26H44L42 42H33V26Z" fill="#27272A" />
          <line x1="20" y1="26" x2="22" y2="42" stroke="#FFFFFF" strokeWidth="2" />
          <line x1="44" y1="26" x2="42" y2="42" stroke="#FFFFFF" strokeWidth="2" />
        </svg>
      );

    case 'techwear_pants':
      return (
        <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="18" y="16" width="28" height="8" rx="1" fill="#18181B" stroke="#27272A" strokeWidth="1.5" />
          <rect x="18" y="24" width="12" height="28" fill="#18181B" stroke="#27272A" strokeWidth="1.5" />
          <rect x="34" y="24" width="12" height="28" fill="#18181B" stroke="#27272A" strokeWidth="1.5" />
          <rect x="16" y="30" width="5" height="10" rx="1" fill="#27272A" />
          <rect x="43" y="30" width="5" height="10" rx="1" fill="#27272A" />
          <line x1="18" y1="32" x2="30" y2="42" stroke="#52525B" strokeWidth="1.5" />
          <line x1="46" y1="32" x2="34" y2="42" stroke="#52525B" strokeWidth="1.5" />
          <rect x="18" y="48" width="12" height="4" fill="#09090B" />
          <rect x="34" y="48" width="12" height="4" fill="#09090B" />
        </svg>
      );

    case 'cargo_tactical':
      return (
        <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="18" y="16" width="28" height="8" rx="1" fill="#365314" />
          <rect x="18" y="24" width="12" height="28" fill="#365314" stroke="#1A2E05" strokeWidth="1" />
          <rect x="34" y="24" width="12" height="28" fill="#365314" stroke="#1A2E05" strokeWidth="1" />
          <rect x="15" y="30" width="5" height="10" fill="#1A2E05" />
          <rect x="44" y="30" width="5" height="10" fill="#1A2E05" />
        </svg>
      );

    case 'track_pants':
      return (
        <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="18" y="16" width="28" height="8" fill="#1E293B" />
          <rect x="18" y="24" width="12" height="28" fill="#1E293B" />
          <rect x="34" y="24" width="12" height="28" fill="#1E293B" />
          <line x1="19" y1="24" x2="19" y2="52" stroke="#FFFFFF" strokeWidth="2" />
          <line x1="45" y1="24" x2="45" y2="52" stroke="#FFFFFF" strokeWidth="2" />
        </svg>
      );

    case 'denim_shorts':
      return (
        <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="18" y="18" width="28" height="8" fill="#0284C7" />
          <rect x="18" y="26" width="12" height="16" fill="#0284C7" />
          <rect x="34" y="26" width="12" height="16" fill="#0284C7" />
          <rect x="18" y="38" width="12" height="4" fill="#E0F2FE" />
          <rect x="34" y="38" width="12" height="4" fill="#E0F2FE" />
        </svg>
      );

    case 'cyber_glitch_pants':
      return (
        <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="18" y="16" width="28" height="8" fill="#020617" />
          <rect x="18" y="24" width="12" height="28" fill="#020617" stroke="#1E1B4B" strokeWidth="1" />
          <rect x="34" y="24" width="12" height="28" fill="#020617" stroke="#1E1B4B" strokeWidth="1" />
          <rect x="22" y="30" width="4" height="6" fill="#06B6D4" />
          <rect x="38" y="38" width="6" height="4" fill="#06B6D4" />
        </svg>
      );

    // ================= SHOES =================
    case 'combat_boots':
      return (
        <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M14 26H24V44H30V50H14V26Z" fill="#09090B" stroke="#27272A" strokeWidth="2" />
          <rect x="12" y="48" width="18" height="4" fill="#713F12" />
          <path d="M38 26H48V44H54V50H38V26Z" fill="#09090B" stroke="#27272A" strokeWidth="2" />
          <rect x="36" y="48" width="18" height="4" fill="#713F12" />
          <circle cx="21" cy="32" r="1.5" fill="#EAB308" />
          <circle cx="45" cy="32" r="1.5" fill="#EAB308" />
        </svg>
      );

    case 'red_sneakers':
      return (
        <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M14 30H24V44H32V50H14V30Z" fill="#DC2626" />
          <rect x="14" y="46" width="18" height="4" fill="#FFFFFF" />
          <path d="M36 30H46V44H54V50H36V30Z" fill="#DC2626" />
          <rect x="36" y="46" width="18" height="4" fill="#FFFFFF" />
        </svg>
      );

    case 'leather_boots':
      return (
        <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M14 26H24V44H30V50H14V26Z" fill="#451A03" stroke="#292524" strokeWidth="1.5" />
          <rect x="14" y="24" width="10" height="4" fill="#78350F" />
          <path d="M38 26H48V44H54V50H38V26Z" fill="#451A03" stroke="#292524" strokeWidth="1.5" />
          <rect x="38" y="24" width="10" height="4" fill="#78350F" />
        </svg>
      );

    case 'winter_boots':
      return (
        <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M14 30H24V44H30V50H14V30Z" fill="#D4A373" />
          <rect x="12" y="26" width="14" height="6" rx="2" fill="#FEF3C7" />
          <path d="M38 30H48V44H54V50H38V30Z" fill="#D4A373" />
          <rect x="36" y="26" width="14" height="6" rx="2" fill="#FEF3C7" />
        </svg>
      );

    case 'retro_runners':
      return (
        <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 36H24V44H32V50H12V36Z" fill="#F43F5E" />
          <rect x="12" y="46" width="20" height="4" fill="#06B6D4" />
          <path d="M36 36H48V44H56V50H36V36Z" fill="#F43F5E" />
          <rect x="36" y="46" width="20" height="4" fill="#06B6D4" />
        </svg>
      );

    case 'mecha_boots':
      return (
        <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 28H24V44H32V52H12V28Z" fill="#18181B" stroke="#27272A" strokeWidth="1.5" />
          <path d="M36 28H48V44H56V52H36V28Z" fill="#18181B" stroke="#27272A" strokeWidth="1.5" />
          <rect x="22" y="32" width="4" height="10" fill="#EAB308" stroke="#713F12" strokeWidth="1" />
          <rect x="46" y="32" width="4" height="10" fill="#EAB308" stroke="#713F12" strokeWidth="1" />
        </svg>
      );

    case 'pro_powerlifters':
      return (
        <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 34H24V44H32V50H12V34Z" fill="#18181B" />
          <rect x="16" y="38" width="12" height="4" fill="#DC2626" />
          <rect x="12" y="48" width="20" height="3" fill="#78350F" />
          <path d="M36 34H48V44H56V50H36V34Z" fill="#18181B" />
          <rect x="40" y="38" width="12" height="4" fill="#DC2626" />
          <rect x="36" y="48" width="20" height="3" fill="#78350F" />
        </svg>
      );

    case 'cyber_high_tops':
      return (
        <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 28H24V44H32V50H12V28Z" fill="#09090B" />
          <rect x="12" y="47" width="20" height="4" fill="#06B6D4" />
          <path d="M36 28H48V44H56V50H36V28Z" fill="#09090B" />
          <rect x="36" y="47" width="20" height="4" fill="#06B6D4" />
        </svg>
      );

    case 'sandals_gladiator':
      return (
        <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="14" y="46" width="16" height="4" fill="#78350F" />
          <line x1="16" y1="36" x2="28" y2="44" stroke="#9A3412" strokeWidth="2" />
          <line x1="28" y1="36" x2="16" y2="44" stroke="#9A3412" strokeWidth="2" />
          <rect x="38" y="46" width="16" height="4" fill="#78350F" />
          <line x1="40" y1="36" x2="52" y2="44" stroke="#9A3412" strokeWidth="2" />
          <line x1="52" y1="36" x2="40" y2="44" stroke="#9A3412" strokeWidth="2" />
        </svg>
      );

    case 'golden_titan_boots':
      return (
        <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 26H24V44H32V50H12V26Z" fill="#F59E0B" stroke="#B45309" strokeWidth="1.5" />
          <rect x="16" y="30" width="8" height="10" fill="#FFFFFF" />
          <path d="M36 26H48V44H56V50H36V26Z" fill="#F59E0B" stroke="#B45309" strokeWidth="1.5" />
          <rect x="40" y="30" width="8" height="10" fill="#FFFFFF" />
        </svg>
      );

    // ================= ACCESSORIES =================
    case 'retro_glasses':
      return (
        <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="22" cy="32" r="10" stroke="#1E293B" strokeWidth="3" fill="#E0F2FE" fillOpacity="0.5" />
          <circle cx="42" cy="32" r="10" stroke="#1E293B" strokeWidth="3" fill="#E0F2FE" fillOpacity="0.5" />
          <line x1="32" y1="32" x2="32" y2="32" stroke="#1E293B" strokeWidth="3" />
        </svg>
      );

    case 'red_scarf':
      return (
        <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <ellipse cx="32" cy="30" rx="18" ry="8" fill="#DC2626" stroke="#991B1B" strokeWidth="2" />
          <path d="M36 34L40 48L32 46L28 34" fill="#DC2626" />
        </svg>
      );

    case 'wrist_wraps':
      return (
        <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="14" y="24" width="12" height="16" rx="2" fill="#FF5722" stroke="#0F172A" strokeWidth="2" />
          <rect x="38" y="24" width="12" height="16" rx="2" fill="#FF5722" stroke="#0F172A" strokeWidth="2" />
        </svg>
      );

    case 'oni_mask':
      return (
        <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M18 26H46L42 46L32 50L22 46L18 26Z" fill="#991B1B" stroke="#7F1D1D" strokeWidth="2" />
          <polygon points="26,36 30,36 28,42" fill="#FFFFFF" />
          <polygon points="34,36 38,36 36,42" fill="#FFFFFF" />
          <polygon points="18,28 14,24 19,32" fill="#F8FAFC" />
          <polygon points="46,28 50,24 45,32" fill="#F8FAFC" />
        </svg>
      );

    case 'cyber_visor':
      return (
        <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="12" y="28" width="40" height="12" rx="2" fill="#06B6D4" fillOpacity="0.85" stroke="#0891B2" strokeWidth="2" />
          <line x1="16" y1="34" x2="48" y2="34" stroke="#FFFFFF" strokeWidth="1" strokeDasharray="3 3" />
        </svg>
      );

    case 'lifting_belt':
      return (
        <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="12" y="26" width="40" height="14" rx="2" fill="#18181B" stroke="#27272A" strokeWidth="2" />
          <rect x="28" y="24" width="8" height="18" rx="1" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="1.5" />
          <line x1="32" y1="26" x2="32" y2="40" stroke="#475569" strokeWidth="2" />
        </svg>
      );

    case 'smart_watch':
      return (
        <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="24" y="16" width="16" height="32" rx="3" fill="#09090B" />
          <rect x="26" y="24" width="12" height="16" rx="2" fill="#18181B" stroke="#27272A" strokeWidth="1" />
          <circle cx="32" cy="32" r="3" fill="#10B981" />
        </svg>
      );

    case 'tactical_backpack':
      return (
        <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="18" y="18" width="28" height="34" rx="4" fill="#27272A" stroke="#18181B" strokeWidth="2" />
          <rect x="22" y="32" width="20" height="14" rx="2" fill="#365314" />
          <rect x="12" y="24" width="5" height="18" rx="1" fill="#84CC16" />
        </svg>
      );

    case 'gold_necklace':
      return (
        <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 22C20 34 44 34 44 22" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round" />
          <rect x="29" y="33" width="6" height="4" rx="1" fill="#F59E0B" />
          <line x1="27" y1="35" x2="37" y2="35" stroke="#FBBF24" strokeWidth="2" />
        </svg>
      );

    // ================= SPECIAL =================
    case 'angel_wings':
      return (
        <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M26 36L14 20L8 28L12 40L20 44L26 36Z" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="1.5" />
          <path d="M12 28L22 34" stroke="#FDE047" strokeWidth="2" />
          <path d="M38 36L50 20L56 28L52 40L44 44L38 36Z" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="1.5" />
          <path d="M52 28L42 34" stroke="#FDE047" strokeWidth="2" />
          <polygon points="32,16 34,22 40,24 34,26 32,32 30,26 24,24 30,22" fill="#FBBF24" />
        </svg>
      );

    case 'shadow_wings':
      return (
        <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M26 36L12 18L10 32L6 34L14 46L26 36Z" fill="#3B0764" stroke="#7C3AED" strokeWidth="1.5" />
          <path d="M38 36L52 18L54 32L58 34L50 46L38 36Z" fill="#3B0764" stroke="#7C3AED" strokeWidth="1.5" />
          <circle cx="32" cy="20" r="3" fill="#A855F7" />
        </svg>
      );

    case 'sparkles_aura':
      return (
        <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <polygon points="32,14 34,20 40,22 34,24 32,30 30,24 24,22 30,20" fill="#38BDF8" />
          <polygon points="18,34 20,38 24,39 20,40 18,44 16,40 12,39 16,38" fill="#FBBF24" />
          <polygon points="46,36 48,40 52,41 48,42 46,46 44,42 40,41 44,40" fill="#F43F5E" />
        </svg>
      );

    case 'shinobi_smoke':
      return (
        <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="22" cy="38" r="10" fill="#6B21A8" fillOpacity="0.7" />
          <circle cx="40" cy="40" r="12" fill="#581C87" fillOpacity="0.8" />
          <circle cx="30" cy="28" r="8" fill="#7C3AED" fillOpacity="0.6" />
        </svg>
      );

    case 'glitch_singularity':
      return (
        <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="28" y="12" width="8" height="8" fill="#06B6D4" stroke="#0891B2" strokeWidth="1" />
          <rect x="14" y="24" width="7" height="7" fill="#A855F7" stroke="#7C3AED" strokeWidth="1" />
          <rect x="44" y="26" width="6" height="6" fill="#38BDF8" stroke="#0284C7" strokeWidth="1" />
        </svg>
      );

    case 'solar_flame_aura':
      return (
        <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 48C18 36 24 30 28 20C30 30 36 32 38 24C44 32 46 40 44 48C40 54 24 54 20 48Z" fill="#F59E0B" fillOpacity="0.85" />
          <path d="M26 48C24 40 28 34 32 26C34 34 38 36 38 48C36 52 28 52 26 48Z" fill="#FDE047" />
        </svg>
      );

    default:
      return (
        <div className={`rounded-xl bg-slate-100 flex items-center justify-center ${className}`}>
          <div className="w-8 h-8 rounded-lg bg-slate-300" />
        </div>
      );
  }
};
