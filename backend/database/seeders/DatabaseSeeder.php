<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Default Demo User for direct API authentication
        User::firstOrCreate(
            ['email' => 'demo@fitnessleveling.test'],
            [
                'name' => 'Demo Athlete',
                'password' => Hash::make('password123'),
                'role' => 'user',
                'goal' => 'muscle_gain',
                'weight_kg' => 68.5,
                'height_cm' => 175.0,
                'birth_date' => '1998-05-15',
                'gender' => 'male',
                'activity_level' => 'moderate',
            ]
        );

        User::firstOrCreate(
            ['email' => 'test@example.com'],
            [
                'name' => 'Test User',
                'password' => Hash::make('password'),
                'role' => 'user',
            ]
        );

        $this->call(ExerciseDatasetSeeder::class);
    }
}

