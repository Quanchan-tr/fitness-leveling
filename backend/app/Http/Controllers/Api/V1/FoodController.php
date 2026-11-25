<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Models\Food;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\File;

class FoodController extends Controller
{
    /**
     * Get list of foods and raw ingredients with search & category filters.
     */
    public function index(Request $request): JsonResponse
    {
        $q = trim((string) $request->query('q', ''));
        $category = trim((string) $request->query('category', ''));
        $itemType = strtoupper(trim((string) $request->query('item_type', '')));
        $page = max(1, (int) $request->query('page', 1));
        $perPage = min(max((int) $request->query('per_page', 24), 1), 500);

        // Prefer PostgreSQL table when seeded; fall back to static JSON only on unseeded dev DB.
        if (Food::withTrashed()->exists()) {
            $query = Food::query();

            if ($itemType !== '' && $itemType !== 'ALL') {
                $query->where('item_type', $itemType);
            }

            if ($category !== '' && $category !== 'Tất cả') {
                $query->where('category', $category);
            }

            if ($q !== '') {
                $normalizedQ = Food::normalizeVietnamese($q);
                $tokens = array_values(array_filter(preg_split('/\s+/', $normalizedQ) ?: []));
                foreach ($tokens as $token) {
                    $query->where('search_text', 'like', '%' . $token . '%');
                }
            }

            $paginator = $query->orderBy('name')->paginate($perPage, ['*'], 'page', $page);
            $items = collect($paginator->items())->map(fn (Food $food) => $food->toApiArray())->values()->all();

            return response()->json([
                'data' => $items,
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'total' => $paginator->total(),
                'per_page' => $paginator->perPage(),
                'meta' => [
                    'page' => $paginator->currentPage(),
                    'per_page' => $paginator->perPage(),
                    'total' => $paginator->total(),
                    'last_page' => $paginator->lastPage(),
                ],
            ]);
        }

        $dataset = $this->loadDataset();
        $qLower = strtolower($q);
        $filtered = array_filter($dataset, function ($item) use ($qLower, $category, $itemType) {
            if ($itemType !== '' && $itemType !== 'ALL' && ($item['item_type'] ?? '') !== $itemType) {
                return false;
            }
            if ($category !== '' && $category !== 'Tất cả' && ($item['category'] ?? '') !== $category) {
                return false;
            }
            if ($qLower !== '') {
                $name = mb_strtolower($item['name'] ?? '', 'UTF-8');
                $nameEn = mb_strtolower($item['name_en'] ?? '', 'UTF-8');
                $desc = mb_strtolower($item['description'] ?? '', 'UTF-8');
                $tags = mb_strtolower(implode(' ', $item['tags'] ?? []), 'UTF-8');
                $normalizedName = Food::normalizeVietnamese($name);
                $normalizedQ = Food::normalizeVietnamese($qLower);

                return str_contains($name, $qLower)
                    || str_contains($normalizedName, $normalizedQ)
                    || str_contains($nameEn, $qLower)
                    || str_contains($desc, $qLower)
                    || str_contains($tags, $qLower);
            }

            return true;
        });

        $filtered = array_values($filtered);
        $total = count($filtered);
        $lastPage = max(1, (int) ceil($total / $perPage));
        $offset = ($page - 1) * $perPage;
        $items = array_slice($filtered, $offset, $perPage);

        return response()->json([
            'data' => $items,
            'current_page' => $page,
            'last_page' => $lastPage,
            'total' => $total,
            'per_page' => $perPage,
            'meta' => [
                'page' => $page,
                'per_page' => $perPage,
                'total' => $total,
                'last_page' => $lastPage,
            ],
        ]);
    }

    /**
     * Get single food item by ID.
     */
    public function show(string $id): JsonResponse
    {
        if (Food::withTrashed()->exists()) {
            $food = Food::find($id);
            if ($food) {
                return response()->json(['data' => $food->toApiArray()]);
            }

            return response()->json(['message' => 'Food item not found.'], 404);
        }

        foreach ($this->loadDataset() as $item) {
            if (($item['id'] ?? '') === $id) {
                return response()->json(['data' => $item]);
            }
        }

        return response()->json([
            'message' => 'Food item not found.',
        ], 404);
    }

    private function loadDataset(): array
    {
        return Cache::rememberForever('nutrition_dataset_cache', function () {
            $path = database_path('data/nutrition_dataset.json');
            if (!File::exists($path)) {
                return [];
            }

            $data = json_decode(File::get($path), true);

            return is_array($data) ? $data : [];
        });
    }
}
