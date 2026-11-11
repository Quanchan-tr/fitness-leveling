<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use App\Http\Requests\UpdateProfileRequest;
use App\Models\User;
use App\Services\Gamification\GamificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function __construct(
        private readonly GamificationService $gamificationService = new GamificationService()
    ) {}

    public function register(RegisterRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'goal' => $validated['goal'] ?? 'maintain',
            'weight_kg' => $validated['weight_kg'] ?? 70.0,
            'height_cm' => $validated['height_cm'] ?? 170.0,
            'birth_date' => $validated['birth_date'] ?? '2000-01-01',
            'gender' => $validated['gender'] ?? 'other',
            'activity_level' => $validated['activity_level'] ?? 'moderate',
            'role' => 'user',
            'xp' => 0,
            'level' => 1,
            'current_streak' => 1,
            'last_active_date' => now()->toDateString(),
            'email_verified_at' => now(),
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;
        $gamification = $this->gamificationService->getGamificationSummary($user);

        return response()->json([
            'data' => [
                'user' => [
                    ...$user->toArray(),
                    'gamification' => $gamification,
                ],
                'token' => $token,
            ],
        ], 201);
    }

    public function login(LoginRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $user = User::where('email', $validated['email'])->first();

        if (!$user || !Hash::check($validated['password'], $user->password)) {
            return response()->json([
                'error' => [
                    'code' => 'UNAUTHENTICATED',
                    'message' => 'Invalid email or password credentials.',
                ],
            ], 401);
        }

        // Auto verify email if needed
        if ($user->email_verified_at === null) {
            $user->email_verified_at = now();
            $user->save();
        }

        // Record daily active login streak
        $this->gamificationService->recordDailyLogin($user);
        $user->refresh();

        $token = $user->createToken('auth_token')->plainTextToken;
        $gamification = $this->gamificationService->getGamificationSummary($user);

        return response()->json([
            'data' => [
                'user' => [
                    ...$user->toArray(),
                    'gamification' => $gamification,
                ],
                'token' => $token,
            ],
        ]);
    }

    public function me(Request $request): JsonResponse
    {
        $user = $request->user();
        $this->gamificationService->recordDailyLogin($user);
        $user->refresh();
        $gamification = $this->gamificationService->getGamificationSummary($user);

        return response()->json([
            'data' => [
                ...$user->toArray(),
                'gamification' => $gamification,
            ],
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'data' => [
                'message' => 'Logged out successfully.',
            ],
        ]);
    }

    public function updateProfile(UpdateProfileRequest $request): JsonResponse
    {
        $user = $request->user();
        $user->update($request->validated());
        $freshUser = $user->fresh();
        $gamification = $this->gamificationService->getGamificationSummary($freshUser);

        return response()->json([
            'data' => [
                'user' => [
                    ...$freshUser->toArray(),
                    'gamification' => $gamification,
                ],
                'message' => 'Profile updated successfully.',
            ],
        ]);
    }
}
