<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Exercise;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;

class ExerciseDatasetSeeder extends Seeder
{
    private const DEV_CDN_PREFIX = 'https://raw.githubusercontent.com/Quanchan-tr/fitness-leveling/dev/media/exercises/';

    private function cdnBaseUrl(): string
    {
        $configured = (string) config(
            'services.exercise_media.cdn_url',
            'https://raw.githubusercontent.com/Quanchan-tr/fitness-leveling/main/media/exercises/'
        );

        return rtrim($configured, '/') . '/';
    }

    private function normalizeMediaUrl(?string $url, string $cdnBase): ?string
    {
        if (empty($url)) {
            return null;
        }

        if (str_starts_with($url, self::DEV_CDN_PREFIX)) {
            return $cdnBase . ltrim(substr($url, strlen(self::DEV_CDN_PREFIX)), '/');
        }

        if (str_starts_with($url, 'http') || str_starts_with($url, '/')) {
            return $url;
        }

        if (str_starts_with($url, 'exercises/')) {
            return '/' . $url;
        }

        return $cdnBase . ltrim($url, '/');
    }

    public function run(): void
    {
        $cdnBase = $this->cdnBaseUrl();
        $filePath = database_path('data/exercises.json');

        if (!File::exists($filePath)) {
            $this->command?->error("File not found: {$filePath}");
            return;
        }

        $jsonContent = File::get($filePath);
        $dataset = json_decode($jsonContent, true);

        if (!is_array($dataset)) {
            $this->command?->error('Invalid JSON content in exercises.json');
            return;
        }

        $total = count($dataset);
        $this->command?->info("Importing {$total} exercises from exercises.json...");

        // Clear existing dataset exercises to ensure idempotency
        Exercise::whereNotNull('external_id')->delete();

        $chunks = array_chunk($dataset, 150);
        $insertedCount = 0;
        $now = now()->toDateTimeString();

        foreach ($chunks as $chunkIndex => $chunk) {
            $records = [];

            foreach ($chunk as $item) {
                $name = trim($item['name'] ?? 'Unknown Exercise');
                $nameLower = strtolower($name);

                $hasAi = false;
                $poseRulesKey = null;

                if (str_contains($nameLower, 'squat')) {
                    $hasAi = true;
                    $poseRulesKey = 'squat';
                } elseif (
                    str_contains($nameLower, 'push up') ||
                    str_contains($nameLower, 'push-up') ||
                    str_contains($nameLower, 'pushup')
                ) {
                    $hasAi = true;
                    $poseRulesKey = 'pushup';
                } elseif (str_contains($nameLower, 'plank')) {
                    $hasAi = true;
                    $poseRulesKey = 'plank';
                }

                $gifUrl = $this->normalizeMediaUrl($item['gif_url'] ?? null, $cdnBase);

                $thumbUrl = null;
                if (!empty($item['thumbnail_url'])) {
                    $thumbUrl = $this->normalizeMediaUrl($item['thumbnail_url'], $cdnBase);
                } elseif (!empty($item['image'])) {
                    $thumbUrl = $this->normalizeMediaUrl($item['image'], $cdnBase);
                } else {
                    $thumbUrl = $gifUrl;
                }

                // Format description prioritizing Vietnamese instructions if available
                $desc = null;
                if (isset($item['instruction_steps']['vi']) && is_array($item['instruction_steps']['vi']) && count($item['instruction_steps']['vi']) > 0) {
                    $desc = implode(' ', $item['instruction_steps']['vi']);
                } elseif (isset($item['instructions']['vi']) && is_string($item['instructions']['vi'])) {
                    $desc = $item['instructions']['vi'];
                } elseif (isset($item['instructions']['en']) && is_string($item['instructions']['en'])) {
                    $desc = $item['instructions']['en'];
                } elseif (isset($item['instruction_steps']['en']) && is_array($item['instruction_steps']['en'])) {
                    $desc = implode(' ', $item['instruction_steps']['en']);
                } else {
                    $desc = "Exercise: {$name}";
                }

                $instructions = $item['instructions'] ?? $item['instruction_steps'] ?? null;
                $secondaryMuscles = $item['secondary_muscles'] ?? $item['secondaryMuscles'] ?? null;

                $targetMuscle = $item['target_vi'] ?? $item['target'] ?? $item['target_muscle'] ?? null;
                $equipment = $item['equipment_vi'] ?? $item['equipment'] ?? 'body weight';
                $bodyPart = $item['body_part_vi'] ?? $item['body_part'] ?? $item['bodyPart'] ?? null;

                $records[] = [
                    'id' => (string) Str::uuid(),
                    'external_id' => (string) ($item['id'] ?? Str::random(8)),
                    'created_by' => null,
                    'name' => $name,
                    'description' => $desc,
                    'category' => $item['category'] ?? null,
                    'body_part' => $bodyPart,
                    'target_muscle' => $targetMuscle,
                    'secondary_muscles' => $secondaryMuscles ? json_encode($secondaryMuscles) : null,
                    'muscle_group' => $bodyPart ?? $item['category'] ?? $item['muscle_group'] ?? 'general',
                    'equipment' => $equipment,
                    'difficulty' => 'beginner',
                    'video_url' => null,
                    'thumbnail_url' => $thumbUrl,
                    'gif_url' => $gifUrl,
                    'instructions' => $instructions ? json_encode($instructions) : null,
                    'has_pose_check' => $hasAi,
                    'has_ai_check' => $hasAi,
                    'pose_rules_key' => $poseRulesKey,
                    'verified' => true,
                    'avg_rating' => 0.00,
                    'rating_count' => 0,
                    'status' => 'active',
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
            }

            Exercise::insert($records);
            $insertedCount += count($records);
        }

        $this->command?->info("Successfully imported {$insertedCount} exercises into the database.");
    }
}
