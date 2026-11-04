<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Models\AvatarItem;
use App\Models\UserAvatarConfig;
use App\Models\UserInventory;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class AvatarController extends Controller
{
    /**
     * Get the user's active avatar configuration, unlocked inventory, and catalog
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        // 1. Get or create default avatar config
        $config = UserAvatarConfig::with([
            'headwear',
            'hair',
            'top',
            'bottom',
            'shoes',
            'accessory',
            'special',
        ])->find($user->id);

        if (!$config) {
            $defaultGender = $user->gender === 'female' ? 'female' : 'male';
            $config = $this->createDefaultConfig($user->id, $defaultGender);
            $config->load([
                'headwear',
                'hair',
                'top',
                'bottom',
                'shoes',
                'accessory',
                'special',
            ]);
        }

        // 2. Fetch user's unlocked inventory items
        $inventoryItems = UserInventory::where('user_id', $user->id)
            ->with('item')
            ->get()
            ->map(fn ($inv) => $inv->item)
            ->filter();

        // Also merge default unlocked items
        $defaultItems = AvatarItem::where('unlock_type', 'DEFAULT')->get();
        $allUnlocked = $inventoryItems->concat($defaultItems)->unique('id')->values();

        // 3. Format equipped map
        $equipped = [
            'HEADWEAR' => $config->headwear,
            'HAIR' => $config->hair,
            'TOP' => $config->top,
            'BOTTOM' => $config->bottom,
            'SHOES' => $config->shoes,
            'ACCESSORIES' => $config->accessory,
            'SPECIAL' => $config->special,
        ];

        return response()->json([
            'data' => [
                'gender' => $config->character_gender,
                'equipped' => $equipped,
                'inventory' => $allUnlocked,
                'catalog' => AvatarItem::all(),
            ],
        ]);
    }

    /**
     * Equip modular items with slot and ownership validation
     */
    public function equip(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'gender' => 'required|in:male,female',
            'headwear_id' => 'nullable|string|exists:avatar_items,id',
            'hair_id' => 'nullable|string|exists:avatar_items,id',
            'top_id' => 'nullable|string|exists:avatar_items,id',
            'bottom_id' => 'nullable|string|exists:avatar_items,id',
            'shoes_id' => 'nullable|string|exists:avatar_items,id',
            'accessory_id' => 'nullable|string|exists:avatar_items,id',
            'special_id' => 'nullable|string|exists:avatar_items,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Dữ liệu trang phục không hợp lệ',
                'errors' => $validator->errors(),
            ], 422);
        }

        $user = $request->user();
        $validated = $validator->validated();

        // Validate Slot Consistency & Ownership
        $slotMapping = [
            'headwear_id' => 'HEADWEAR',
            'hair_id' => 'HAIR',
            'top_id' => 'TOP',
            'bottom_id' => 'BOTTOM',
            'shoes_id' => 'SHOES',
            'accessory_id' => 'ACCESSORIES',
            'special_id' => 'SPECIAL',
        ];

        $itemIds = array_filter([
            $validated['headwear_id'] ?? null,
            $validated['hair_id'] ?? null,
            $validated['top_id'] ?? null,
            $validated['bottom_id'] ?? null,
            $validated['shoes_id'] ?? null,
            $validated['accessory_id'] ?? null,
            $validated['special_id'] ?? null,
        ]);

        $items = AvatarItem::whereIn('id', $itemIds)->get()->keyBy('id');

        // Check slot compatibility
        foreach ($slotMapping as $param => $expectedSlot) {
            $itemId = $validated[$param] ?? null;
            if ($itemId && isset($items[$itemId])) {
                $item = $items[$itemId];
                if ($item->slot !== $expectedSlot) {
                    return response()->json([
                        'message' => "Vật phẩm '{$item->name}' không thuộc slot {$expectedSlot}.",
                    ], 422);
                }
            }
        }

        // Check ownership / unlock eligibility
        $unlockedIds = UserInventory::where('user_id', $user->id)
            ->pluck('item_id')
            ->toArray();

        foreach ($items as $item) {
            $isUnlocked = $item->unlock_type === 'DEFAULT' || in_array($item->id, $unlockedIds, true);
            if (!$isUnlocked) {
                return response()->json([
                    'message' => "Bạn chưa mở khóa vật phẩm '{$item->name}'.",
                ], 403);
            }
        }

        // Persist within atomic transaction
        $config = DB::transaction(function () use ($user, $validated) {
            return UserAvatarConfig::updateOrCreate(
                ['user_id' => $user->id],
                [
                    'character_gender' => $validated['gender'],
                    'headwear_id' => $validated['headwear_id'] ?? null,
                    'hair_id' => $validated['hair_id'] ?? null,
                    'top_id' => $validated['top_id'] ?? null,
                    'bottom_id' => $validated['bottom_id'] ?? null,
                    'shoes_id' => $validated['shoes_id'] ?? null,
                    'accessory_id' => $validated['accessory_id'] ?? null,
                    'special_id' => $validated['special_id'] ?? null,
                ]
            );
        });

        $config->load([
            'headwear',
            'hair',
            'top',
            'bottom',
            'shoes',
            'accessory',
            'special',
        ]);

        return response()->json([
            'message' => 'Trang phục đã được lưu thành công',
            'data' => [
                'gender' => $config->character_gender,
                'equipped' => [
                    'HEADWEAR' => $config->headwear,
                    'HAIR' => $config->hair,
                    'TOP' => $config->top,
                    'BOTTOM' => $config->bottom,
                    'SHOES' => $config->shoes,
                    'ACCESSORIES' => $config->accessory,
                    'SPECIAL' => $config->special,
                ],
            ],
        ]);
    }

    /**
     * Helper to initialize default configuration
     */
    private function createDefaultConfig(string $userId, string $gender): UserAvatarConfig
    {
        $defaults = $gender === 'female'
            ? [
                'hair_id' => 'hr-3', // female_braids
                'top_id' => 'tp-4',  // female_tunic
                'bottom_id' => 'bt-3', // blue_skirt
                'shoes_id' => 'sh-3', // leather_boots
                'accessory_id' => 'ac-1', // retro_glasses
            ]
            : [
                'headwear_id' => 'hw-1', // red_beanie
                'hair_id' => 'hr-1',     // male_spiky
                'top_id' => 'tp-1',      // orange_plaid
                'bottom_id' => 'bt-1',   // blue_jeans
                'shoes_id' => 'sh-1',    // combat_boots
            ];

        return UserAvatarConfig::create(array_merge([
            'user_id' => $userId,
            'character_gender' => $gender,
        ], $defaults));
    }
}

