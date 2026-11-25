<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Admin;

use App\Models\Food;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;

class AdminFoodController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $perPage = min(max((int) $request->query('per_page', 20), 1), 100);
        $q = trim((string) $request->query('q', ''));
        $category = trim((string) $request->query('category', ''));
        $itemType = strtoupper(trim((string) $request->query('item_type', '')));
        $trashed = (string) $request->query('trashed', '');

        $query = $trashed === 'only' ? Food::onlyTrashed() : Food::query();

        if ($itemType !== '' && $itemType !== 'ALL') {
            $query->where('item_type', $itemType);
        }

        if ($category !== '' && $category !== 'Tất cả' && $category !== 'all') {
            $query->where('category', $category);
        }

        if ($q !== '') {
            $normalizedQ = Food::normalizeVietnamese($q);
            $tokens = array_values(array_filter(preg_split('/\s+/', $normalizedQ) ?: []));
            foreach ($tokens as $token) {
                $query->where('search_text', 'like', '%' . $token . '%');
            }
        }

        $paginator = $query->orderByDesc('updated_at')->paginate($perPage);
        $items = collect($paginator->items())->map(fn (Food $food) => $food->toApiArray())->values()->all();

        return response()->json([
            'data' => $items,
            'meta' => [
                'page' => $paginator->currentPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
                'last_page' => $paginator->lastPage(),
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $this->validateFood($request, isCreate: true);

        $food = Food::create([
            ...$validated,
            'item_type' => $validated['item_type'] ?? 'DISH',
            'fiber' => $validated['fiber'] ?? 0,
            'min_multiplier' => $validated['min_multiplier'] ?? 0.5,
            'max_multiplier' => $validated['max_multiplier'] ?? 2.5,
        ]);

        return response()->json([
            'data' => $food->toApiArray(),
        ], 201);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $food = Food::withTrashed()->findOrFail($id);
        $validated = $this->validateFood($request, isCreate: false);

        $food->update($validated);

        return response()->json([
            'data' => $food->fresh()->toApiArray(),
        ]);
    }

    public function destroy(string $id): JsonResponse
    {
        $food = Food::findOrFail($id);
        $food->delete();

        return response()->json([
            'data' => [
                'id' => $id,
                'deleted' => true,
            ],
        ]);
    }

    public function restore(string $id): JsonResponse
    {
        $food = Food::onlyTrashed()->findOrFail($id);
        $food->restore();

        return response()->json([
            'data' => $food->fresh()->toApiArray(),
        ]);
    }

    private function validateFood(Request $request, bool $isCreate): array
    {
        $req = $isCreate ? 'required' : 'sometimes';

        return $request->validate([
            'name' => "{$req}|string|max:255",
            'name_en' => 'nullable|string|max:255',
            'category' => "{$req}|string|max:100",
            'item_type' => 'sometimes|in:DISH,RAW',
            'serving_size' => "{$req}|string|max:100",
            'serving_weight_g' => 'nullable|numeric|min:0|max:10000',
            'calories' => "{$req}|integer|min:0|max:10000",
            'protein' => "{$req}|numeric|min:0|max:1000",
            'carbs' => "{$req}|numeric|min:0|max:1000",
            'fat' => "{$req}|numeric|min:0|max:1000",
            'fiber' => 'nullable|numeric|min:0|max:500',
            'min_multiplier' => 'nullable|numeric|min:0.1|max:10',
            'max_multiplier' => 'nullable|numeric|min:0.1|max:20',
            'image_url' => 'nullable|string|max:500',
            'description' => 'nullable|string|max:2000',
            'tags' => 'nullable|array',
            'tags.*' => 'string|max:50',
        ]);
    }
}
