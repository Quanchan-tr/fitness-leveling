<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Admin;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class AdminUserController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $perPage = min(max((int) $request->query('per_page', 20), 1), 100);
        $status = (string) $request->query('status', 'all');
        $role = trim((string) $request->query('role', ''));
        $q = strtolower(trim((string) $request->query('q', '')));

        $query = match ($status) {
            'trashed' => User::onlyTrashed(),
            'banned' => User::whereNotNull('banned_at'),
            'active' => User::whereNull('banned_at'),
            default => User::query(),
        };

        if ($role !== '' && $role !== 'all') {
            $query->where('role', $role);
        }

        if ($q !== '') {
            $term = '%' . $q . '%';
            $query->where(function ($sub) use ($term) {
                $sub->whereRaw('LOWER(name) LIKE ?', [$term])
                    ->orWhereRaw('LOWER(email) LIKE ?', [$term]);
            });
        }

        $paginator = $query
            ->withCount(['workoutLogs', 'nutritionLogs', 'communityPosts', 'poseCheckSessions'])
            ->orderByDesc('created_at')
            ->paginate($perPage);

        return response()->json([
            'data' => $paginator->items(),
            'meta' => [
                'page' => $paginator->currentPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
                'last_page' => $paginator->lastPage(),
            ],
        ]);
    }

    public function show(string $id): JsonResponse
    {
        $user = User::withTrashed()
            ->withCount([
                'workoutLogs',
                'nutritionLogs',
                'communityPosts',
                'poseCheckSessions',
                'workoutRoutines',
            ])
            ->findOrFail($id);

        return response()->json([
            'data' => $user,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'email' => 'required|email|max:255|unique:users,email',
            'password' => 'required|string|min:8',
            'role' => 'required|in:user,admin',
            'goal' => 'sometimes|in:lose_weight,gain_muscle,maintain,muscle_gain',
            'gender' => 'sometimes|in:male,female,other',
            'weight_kg' => 'sometimes|numeric|min:20|max:300',
            'height_cm' => 'sometimes|numeric|min:80|max:250',
            'birth_date' => 'sometimes|date',
            'activity_level' => 'sometimes|string|max:20',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => strtolower(trim($validated['email'])),
            'password' => Hash::make($validated['password']),
            'role' => $validated['role'],
            'goal' => $validated['goal'] ?? 'maintain',
            'gender' => $validated['gender'] ?? 'other',
            'weight_kg' => $validated['weight_kg'] ?? 70.0,
            'height_cm' => $validated['height_cm'] ?? 170.0,
            'birth_date' => $validated['birth_date'] ?? '2000-01-01',
            'activity_level' => $validated['activity_level'] ?? 'moderate',
            'email_verified_at' => now(),
        ]);

        return response()->json([
            'data' => $user,
        ], 201);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $user = User::withTrashed()->findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:100',
            'email' => ['sometimes', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user->id)],
            'password' => 'sometimes|nullable|string|min:8',
            'role' => 'sometimes|in:user,admin',
            'goal' => 'sometimes|in:lose_weight,gain_muscle,maintain,muscle_gain',
            'gender' => 'sometimes|in:male,female,other',
            'weight_kg' => 'sometimes|numeric|min:20|max:300',
            'height_cm' => 'sometimes|numeric|min:80|max:250',
            'birth_date' => 'sometimes|date',
            'activity_level' => 'sometimes|string|max:20',
        ]);

        if ($user->id === $request->user()->id && isset($validated['role']) && $validated['role'] !== 'admin') {
            return $this->cannotModifySelf('Không thể tự hạ quyền quản trị của chính mình.');
        }

        if (isset($validated['email'])) {
            $validated['email'] = strtolower(trim($validated['email']));
        }

        if (!empty($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        } else {
            unset($validated['password']);
        }

        $user->update($validated);

        return response()->json([
            'data' => $user->fresh(),
        ]);
    }

    public function toggleBan(Request $request, string $id): JsonResponse
    {
        $user = User::findOrFail($id);

        if ($user->id === $request->user()->id) {
            return $this->cannotModifySelf('Không thể tự khóa tài khoản của chính mình.');
        }

        if ($user->isBanned()) {
            $user->banned_at = null;
            $user->save();
        } else {
            $user->banned_at = now();
            $user->save();
            $user->tokens()->delete();
        }

        return response()->json([
            'data' => $user->fresh(),
        ]);
    }

    public function destroy(Request $request, string $id): JsonResponse
    {
        $user = User::findOrFail($id);

        if ($user->id === $request->user()->id) {
            return $this->cannotModifySelf('Không thể tự xóa tài khoản của chính mình.');
        }

        $user->tokens()->delete();
        $user->delete();

        return response()->json([
            'data' => [
                'id' => $id,
                'deleted' => true,
            ],
        ]);
    }

    public function restore(string $id): JsonResponse
    {
        $user = User::onlyTrashed()->findOrFail($id);
        $user->restore();

        return response()->json([
            'data' => $user->fresh(),
        ]);
    }

    private function cannotModifySelf(string $message): JsonResponse
    {
        return response()->json([
            'error' => [
                'code' => 'CANNOT_MODIFY_SELF',
                'message' => $message,
            ],
        ], 422);
    }
}
