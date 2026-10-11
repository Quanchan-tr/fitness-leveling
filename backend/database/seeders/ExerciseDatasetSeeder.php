<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Exercise;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;

class ExerciseDatasetSeeder extends Seeder
{
    private const CDN_BASE_URL = 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/';

    public function run(): void
    {
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

                $gifUrl = null;
                if (!empty($item['gif_url'])) {
                    $gifUrl = str_starts_with($item['gif_url'], 'http')
                        ? $item['gif_url']
                        : self::CDN_BASE_URL . ltrim($item['gif_url'], '/');
                }

                $thumbUrl = null;
                if (!empty($item['image'])) {
                    $thumbUrl = str_starts_with($item['image'], 'http')
                        ? $item['image']
                        : self::CDN_BASE_URL . ltrim($item['image'], '/');
                }

                // Format description from English instructions if available
                $desc = null;
                if (isset($item['instructions']['en']) && is_string($item['instructions']['en'])) {
                    $desc = $item['instructions']['en'];
                } elseif (isset($item['instruction_steps']['en']) && is_array($item['instruction_steps']['en'])) {
                    $desc = implode(' ', $item['instruction_steps']['en']);
                } else {
                    $desc = "Exercise: {$name}";
                }

                $instructions = $item['instructions'] ?? $item['instruction_steps'] ?? null;
                $secondaryMuscles = $item['secondary_muscles'] ?? $item['secondaryMuscles'] ?? null;

                $records[] = [
                    'id' => (string) Str::uuid(),
                    'external_id' => (string) ($item['id'] ?? Str::random(8)),
                    'created_by' => null,
                    'name' => $name,
                    'description' => $desc,
                    'category' => $item['category'] ?? null,
                    'body_part' => $item['body_part'] ?? $item['bodyPart'] ?? null,
                    'target_muscle' => $item['target'] ?? $item['target_muscle'] ?? null,
                    'secondary_muscles' => $secondaryMuscles ? json_encode($secondaryMuscles) : null,
                    'muscle_group' => $item['body_part'] ?? $item['category'] ?? $item['muscle_group'] ?? 'general',
                    'equipment' => $item['equipment'] ?? 'body weight',
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
