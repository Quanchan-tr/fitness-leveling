<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

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
        $dataset = $this->loadDataset();
        $q = strtolower(trim((string) $request->query('q', '')));
        $category = trim((string) $request->query('category', ''));
        $itemType = strtoupper(trim((string) $request->query('item_type', '')));
        $page = max(1, (int) $request->query('page', 1));
        $perPage = min(max((int) $request->query('per_page', 24), 1), 100);

        $filtered = array_filter($dataset, function ($item) use ($q, $category, $itemType) {
            if ($itemType !== '' && $itemType !== 'ALL') {
                if (($item['item_type'] ?? '') !== $itemType) {
                    return false;
                }
            }

            if ($category !== '' && $category !== 'Tất cả') {
                if (($item['category'] ?? '') !== $category) {
                    return false;
                }
            }

            if ($q !== '') {
                $name = mb_strtolower($item['name'] ?? '', 'UTF-8');
                $nameEn = mb_strtolower($item['name_en'] ?? '', 'UTF-8');
                $desc = mb_strtolower($item['description'] ?? '', 'UTF-8');
                $tags = mb_strtolower(implode(' ', $item['tags'] ?? []), 'UTF-8');

                $normalizedName = $this->removeVietnameseTones($name);
                $normalizedQ = $this->removeVietnameseTones($q);

                $matched = str_contains($name, $q) ||
                    str_contains($normalizedName, $normalizedQ) ||
                    str_contains($nameEn, $q) ||
                    str_contains($desc, $q) ||
                    str_contains($tags, $q);

                if (!$matched) {
                    return false;
                }
            }

            return true;
        });

        // Re-index array
        $filtered = array_values($filtered);
        $total = count($filtered);
        $lastPage = (int) ceil($total / $perPage);
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
        $dataset = $this->loadDataset();
        foreach ($dataset as $item) {
            if (($item['id'] ?? '') === $id) {
                return response()->json(['data' => $item]);
            }
        }

        return response()->json([
            'message' => 'Food item not found.'
        ], 404);
    }

    /**
     * Load dataset from JSON file with caching.
     */
    private function loadDataset(): array
    {
        return Cache::rememberForever('nutrition_dataset_cache', function () {
            $path = database_path('data/nutrition_dataset.json');
            if (!File::exists($path)) {
                return [];
            }

            $content = File::get($path);
            $data = json_decode($content, true);
            return is_array($data) ? $data : [];
        });
    }

    /**
     * Helper to remove Vietnamese tones for accent-insensitive search.
     */
    private function removeVietnameseTones(string $str): string
    {
        $patterns = [
            '/[áàảãạăắằẳẵặâấầẩẫậ]/u' => 'a',
            '/[ÁÀẢÃẠĂẮẰẲẴẶÂẤẦẨẪẬ]/u' => 'A',
            '/[éèẻẽẹêếềểễệ]/u' => 'e',
            '/[ÉÈẺẼẸÊẾỀỂỄỆ]/u' => 'E',
            '/[íìỉĩị]/u' => 'i',
            '/[ÍÌỈĨỊ]/u' => 'I',
            '/[óòỏõọôốồổỗộơớờởỡợ]/u' => 'o',
            '/[ÓÒỎÕỌÔỐỒỔỖỘƠỚỜỞỠỢ]/u' => 'O',
            '/[úùủũụưứừửữự]/u' => 'u',
            '/[ÚÙỦŨỤƯỨỪỬỮỰ]/u' => 'U',
            '/[ýỳỷỹỵ]/u' => 'y',
            '/[ÝỲỶỸỴ]/u' => 'Y',
            '/đ/u' => 'd',
            '/Đ/u' => 'D',
        ];

        return preg_replace(array_keys($patterns), array_values($patterns), $str);
    }
}

