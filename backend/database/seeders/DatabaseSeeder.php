<?php

namespace Database\Seeders;

use App\Models\AvatarItem;
use App\Models\User;
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
        $demoUsers = [];

        if (!app()->isProduction()) {
            // Dev/staging demo accounts (never seeded in production)
            $demoUsers[] = User::updateOrCreate(
                ['email' => 'demo@fittrack.vn'],
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

            $demoUsers[] = User::updateOrCreate(
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
        }

        $adminEmail = strtolower(trim((string) env('ADMIN_EMAIL', app()->isProduction() ? '' : 'admin@fittrack.vn')));
        $adminPassword = (string) env('ADMIN_PASSWORD', app()->isProduction() ? '' : 'Admin@123456');

        if ($adminEmail !== '' && $adminPassword !== '') {
            User::updateOrCreate(
                ['email' => $adminEmail],
                [
                    'name' => 'FitTrack Admin',
                    'password' => Hash::make($adminPassword),
                    'role' => 'admin',
                    'goal' => 'maintain',
                    'weight_kg' => 70.0,
                    'height_cm' => 175.0,
                    'birth_date' => '1995-01-01',
                    'gender' => 'male',
                    'activity_level' => 'moderate',
                    'email_verified_at' => now(),
                ]
            );
        } elseif (app()->isProduction()) {
            $this->command?->warn('Skipped admin seeding: ADMIN_EMAIL and ADMIN_PASSWORD must be set in production.');
        }

        $this->call(ExerciseDatasetSeeder::class);
        $this->call(FoodDatasetSeeder::class);
        $this->call(AvatarItemSeeder::class);

        if (!app()->isProduction() && count($demoUsers) > 0) {
            // Unlock all avatar items for local dev demo accounts only
            $allItems = AvatarItem::all();
            foreach ($demoUsers as $u) {
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
}
