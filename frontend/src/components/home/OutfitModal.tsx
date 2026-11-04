'use client';

import React from 'react';
import { WardrobeModal } from './WardrobeModal';
import { CharacterOutfit } from './3d/Character';

interface OutfitModalProps {
  isOpen: boolean;
  onClose: () => void;
  outfit?: CharacterOutfit;
  onSaveOutfit?: (newOutfit: CharacterOutfit) => void;
}

/**
 * Backwards compatibility adapter mapping legacy OutfitModal calls to WardrobeModal
 */
export const OutfitModal: React.FC<OutfitModalProps> = ({ isOpen, onClose }) => {
  return <WardrobeModal isOpen={isOpen} onClose={onClose} />;
};
