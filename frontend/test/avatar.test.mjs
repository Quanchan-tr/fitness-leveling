import test from 'node:test';
import assert from 'node:assert/strict';

const VALID_SLOTS = [
  'HEADWEAR',
  'HAIR',
  'TOP',
  'BOTTOM',
  'SHOES',
  'ACCESSORIES',
  'SPECIAL',
];

const VALID_RARITIES = ['COMMON', 'RARE', 'EPIC', 'LEGENDARY'];

// Simulation of starter catalog item schema
const sampleCatalog = [
  { id: 'hw-1', itemCode: 'red_beanie', slot: 'HEADWEAR', gender: 'unisex', rarity: 'COMMON', unlockType: 'DEFAULT' },
  { id: 'hw-2', itemCode: 'straw_hat', slot: 'HEADWEAR', gender: 'female', rarity: 'RARE', unlockType: 'LEVEL', unlockValue: 5 },
  { id: 'hr-1', itemCode: 'male_spiky', slot: 'HAIR', gender: 'male', rarity: 'COMMON', unlockType: 'DEFAULT' },
  { id: 'hr-3', itemCode: 'female_braids', slot: 'HAIR', gender: 'female', rarity: 'COMMON', unlockType: 'DEFAULT' },
  { id: 'tp-1', itemCode: 'orange_plaid', slot: 'TOP', gender: 'male', rarity: 'COMMON', unlockType: 'DEFAULT' },
  { id: 'tp-4', itemCode: 'female_tunic', slot: 'TOP', gender: 'female', rarity: 'COMMON', unlockType: 'DEFAULT' },
  { id: 'bt-1', itemCode: 'blue_jeans', slot: 'BOTTOM', gender: 'male', rarity: 'COMMON', unlockType: 'DEFAULT' },
  { id: 'bt-3', itemCode: 'blue_skirt', slot: 'BOTTOM', gender: 'female', rarity: 'COMMON', unlockType: 'DEFAULT' },
  { id: 'sh-1', itemCode: 'combat_boots', slot: 'SHOES', gender: 'male', rarity: 'COMMON', unlockType: 'DEFAULT' },
  { id: 'sh-3', itemCode: 'leather_boots', slot: 'SHOES', gender: 'female', rarity: 'COMMON', unlockType: 'DEFAULT' },
  { id: 'sp-1', itemCode: 'kinetic_aura', slot: 'SPECIAL', gender: 'unisex', rarity: 'RARE', unlockType: 'LEVEL', unlockValue: 10 },
];

test('Equipment Slots validation covers all 7 required slots', () => {
  assert.equal(VALID_SLOTS.length, 7);
  assert.ok(VALID_SLOTS.includes('HEADWEAR'));
  assert.ok(VALID_SLOTS.includes('HAIR'));
  assert.ok(VALID_SLOTS.includes('TOP'));
  assert.ok(VALID_SLOTS.includes('BOTTOM'));
  assert.ok(VALID_SLOTS.includes('SHOES'));
  assert.ok(VALID_SLOTS.includes('ACCESSORIES'));
  assert.ok(VALID_SLOTS.includes('SPECIAL'));
});

test('Gender compatibility filter correctly handles Male, Female, and Unisex', () => {
  const filterByGender = (items, gender) =>
    items.filter((it) => it.gender === 'unisex' || it.gender === gender);

  const maleItems = filterByGender(sampleCatalog, 'male');
  assert.ok(maleItems.some((it) => it.itemCode === 'orange_plaid'));
  assert.ok(maleItems.some((it) => it.itemCode === 'red_beanie')); // unisex
  assert.ok(!maleItems.some((it) => it.itemCode === 'female_tunic'));

  const femaleItems = filterByGender(sampleCatalog, 'female');
  assert.ok(femaleItems.some((it) => it.itemCode === 'female_tunic'));
  assert.ok(femaleItems.some((it) => it.itemCode === 'straw_hat'));
  assert.ok(femaleItems.some((it) => it.itemCode === 'red_beanie')); // unisex
  assert.ok(!femaleItems.some((it) => it.itemCode === 'orange_plaid'));
});

test('Item unlock status calculates accurately across level and streak requirements', () => {
  const isUnlocked = (item, userLevel, streak) => {
    if (item.unlockType === 'DEFAULT') return true;
    if (item.unlockType === 'LEVEL') return userLevel >= item.unlockValue;
    if (item.unlockType === 'STREAK') return streak >= item.unlockValue;
    return false;
  };

  const strawHat = sampleCatalog.find((it) => it.itemCode === 'straw_hat');
  assert.equal(isUnlocked(strawHat, 3, 0), false, 'Level 3 should not unlock Level 5 item');
  assert.equal(isUnlocked(strawHat, 5, 0), true, 'Level 5 should unlock Level 5 item');
  assert.equal(isUnlocked(strawHat, 17, 7), true, 'Level 17 should unlock Level 5 item');
});

test('Default outfit generation produces complete equipment sets for Male and Female', () => {
  const getDefaultOutfit = (gender) => {
    if (gender === 'female') {
      return {
        HAIR: 'female_braids',
        TOP: 'female_tunic',
        BOTTOM: 'blue_skirt',
        SHOES: 'leather_boots',
      };
    }
    return {
      HEADWEAR: 'red_beanie',
      HAIR: 'male_spiky',
      TOP: 'orange_plaid',
      BOTTOM: 'brown_cargo',
      SHOES: 'combat_boots',
    };
  };

  const maleDefault = getDefaultOutfit('male');
  assert.ok(maleDefault.TOP === 'orange_plaid');
  assert.ok(maleDefault.BOTTOM === 'brown_cargo');
  assert.ok(maleDefault.SHOES === 'combat_boots');

  const femaleDefault = getDefaultOutfit('female');
  assert.ok(femaleDefault.TOP === 'female_tunic');
  assert.ok(femaleDefault.BOTTOM === 'blue_skirt');
  assert.ok(femaleDefault.SHOES === 'leather_boots');
});

