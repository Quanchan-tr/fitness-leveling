<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Food;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;

class FoodDatasetSeeder extends Seeder
{
    public function run(): void
    {
        $filePath = database_path('data/nutrition_dataset.json');

        if (!File::exists($filePath)) {
            $this->command?->warn("File not found: {$filePath}, skipping FoodDatasetSeeder.");
            return;
        }

        $dataset = json_decode(File::get($filePath), true);
        if (!is_array($dataset)) {
            $this->command?->error('Invalid JSON content in nutrition_dataset.json');
            return;
        }

        $now = now()->toDateTimeString();
        $insertedCount = 0;

        foreach (array_chunk($dataset, 250) as $chunk) {
            $records = [];

            foreach ($chunk as $item) {
                $name = trim((string) ($item['name'] ?? ''));
                if ($name === '') {
                    continue;
                }

                $nameEn = isset($item['name_en']) ? trim((string) $item['name_en']) : null;
                $category = trim((string) ($item['category'] ?? 'Khác'));
                $tags = is_array($item['tags'] ?? null) ? $item['tags'] : [];
                $description = isset($item['description']) ? (string) $item['description'] : null;

                $macros = is_array($item['base_macros'] ?? null) ? $item['base_macros'] : [];
                $protein = (float) ($item['protein'] ?? $macros['protein'] ?? 0);
                $carbs = (float) ($item['carbs'] ?? $macros['carbs'] ?? 0);
                $fat = (float) ($item['fat'] ?? $macros['fat'] ?? 0);

                $searchText = Food::normalizeVietnamese(implode(' ', array_filter([
                    $name,
                    $nameEn,
                    $category,
                    implode(' ', $tags),
                    $description,
                ])));

                $records[] = [
                    'id' => (string) ($item['id'] ?? Str::uuid()),
                    'name' => Str::limit($name, 255, ''),
                    'name_en' => $nameEn ? Str::limit($nameEn, 255, '') : null,
                    'search_text' => $searchText,
                    'category' => Str::limit($category, 100, ''),
                    'item_type' => strtoupper((string) ($item['item_type'] ?? 'DISH')),
                    'serving_size' => Str::limit((string) ($item['serving_size'] ?? $item['base_serving'] ?? '1 phần'), 100, ''),
                    'serving_weight_g' => isset($item['serving_weight_g']) ? (float) $item['serving_weight_g'] : null,
                    'calories' => max(0, (int) ($item['calories'] ?? $item['base_calories'] ?? 0)),
                    'protein' => max(0, $protein),
                    'carbs' => max(0, $carbs),
                    'fat' => max(0, $fat),
                    'fiber' => max(0, (float) ($item['fiber'] ?? 0)),
                    'min_multiplier' => (float) ($item['min_multiplier'] ?? 0.5),
                    'max_multiplier' => (float) ($item['max_multiplier'] ?? 2.5),
                    'image_url' => isset($item['image_url']) ? (string) $item['image_url'] : null,
                    'description' => $description,
                    'tags' => json_encode($tags, JSON_UNESCAPED_UNICODE),
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
            }

            if ($records !== []) {
                Food::upsert(
                    $records,
                    ['id'],
                    [
                        'name',
                        'name_en',
                        'search_text',
                        'category',
                        'item_type',
                        'serving_size',
                        'serving_weight_g',
                        'calories',
                        'protein',
                        'carbs',
                        'fat',
                        'fiber',
                        'min_multiplier',
                        'max_multiplier',
                        'image_url',
                        'description',
                        'tags',
                        'updated_at',
                    ]
                );
                $insertedCount += count($records);
            }
        }

        $this->command?->info("Successfully seeded {$insertedCount} foods into the database.");
    }
}
