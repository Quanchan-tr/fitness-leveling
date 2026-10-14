import React from 'react';

export interface CharacterOutfit {
  shirtColor?: string;
  shirtStripeColor?: string;
  shortsColor?: string;
  headbandColor?: string;
  shoesColor?: string;
  wristbandColor?: string;
}

export interface CharacterProps {
  level?: number;
  outfit?: CharacterOutfit;
  rotationY?: number;
}
