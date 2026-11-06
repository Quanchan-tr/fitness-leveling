<?php

namespace Database\Seeders;

use App\Models\AvatarItem;
use App\Models\User;
use App\Models\UserAvatarConfig;
use App\Models\UserInventory;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Default Demo User for direct API authentication (Buffed to Level 50)
        $demoUser = User::updateOrCreate(
            ['email' => 'demo@fitnessleveling.test'],
            [
                'name' => 'Demo Athlete (Lv.50)',
                'password' => Hash::make('password123'),
                'role' => 'user',
                'goal' => 'muscle_gain',
                'weight_kg' => 74.5,
                'height_cm' => 178.0,
                'birth_date' => '1998-05-15',
                'gender' => 'male',
                'activity_level' => 'very_active',
                'email_verified_at' => now(),
            ]
        );

        $testUser = User::updateOrCreate(
            ['email' => 'test@example.com'],
            [
                'name' => 'Test User (Lv.50)',
                'password' => Hash::make('password'),
                'role' => 'user',
                'gender' => 'female',
                'weight_kg' => 60.0,
                'height_cm' => 165.0,
                'birth_date' => '2000-01-01',
                'email_verified_at' => now(),
            ]
        );

        $this->call(ExerciseDatasetSeeder::class);
        $this->call(AvatarItemSeeder::class);

        // Unlock all avatar items for both test accounts (Level 50 Buff)
        $allItems = AvatarItem::all();
        foreach ([$demoUser, $testUser] as $u) {
            foreach ($allItems as $item) {
                UserInventory::firstOrCreate([
                    'user_id' => $u->id,
                    'item_id' => $item->id,
                ], [
                    'unlocked_at' => now(),
                ]);
            }
        }
    }
}
