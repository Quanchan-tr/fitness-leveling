<?php

declare(strict_types=1);

use App\Http\Controllers\Api\V1\AiController;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\AvatarController;
use App\Http\Controllers\Api\V1\BodyMetricController;
use App\Http\Controllers\Api\V1\CommunityController;
use App\Http\Controllers\Api\V1\ExerciseController;
use App\Http\Controllers\Api\V1\NutritionLogController;
use App\Http\Controllers\Api\V1\PoseCheckController;
use App\Http\Controllers\Api\V1\WorkoutLogController;
use App\Http\Controllers\Api\V1\WorkoutRoutineController;
use App\Http\Middleware\IdempotencyMiddleware;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes (/api/v1)
|--------------------------------------------------------------------------
*/

Route::prefix('v1')->group(function () {
    // --- AUTHENTICATION ---
    Route::prefix('auth')->group(function () {
        Route::post('register', [AuthController::class, 'register'])->middleware('throttle:6,1');
        Route::post('login', [AuthController::class, 'login'])->middleware('throttle:6,1');
        Route::post('verify-email', [AuthController::class, 'verifyEmail'])->middleware('throttle:6,1');
        Route::post('resend-verification', [AuthController::class, 'resendVerification'])->middleware('throttle:6,1');
        Route::post('forgot-password', [AuthController::class, 'forgotPassword'])->middleware('throttle:6,1');
        Route::post('verify-reset-code', [AuthController::class, 'verifyResetCode'])->middleware('throttle:6,1');
        Route::post('reset-password', [AuthController::class, 'resetPassword'])->middleware('throttle:6,1');

        Route::middleware('auth:sanctum')->group(function () {
            Route::get('me', [AuthController::class, 'me']);
            Route::put('profile', [AuthController::class, 'updateProfile']);
            Route::post('logout', [AuthController::class, 'logout']);
        });
    });

    // --- PUBLIC EXERCISE CATALOG ---
    Route::get('exercises', [ExerciseController::class, 'index']);
    Route::get('exercises/{id}', [ExerciseController::class, 'show']);

    // --- PROTECTED DOMAIN ROUTES ---
    Route::middleware(['auth:sanctum'])->group(function () {
        // 3D Avatar & Wardrobe Customization
        Route::get('avatar', [AvatarController::class, 'index']);
        Route::post('avatar/equip', [AvatarController::class, 'equip']);

        // Exercise Contributions
        Route::post('exercises', [ExerciseController::class, 'store']);

        // Workout Logs
        Route::get('workout-logs', [WorkoutLogController::class, 'index']);
        Route::post('workout-logs', [WorkoutLogController::class, 'store'])->middleware(IdempotencyMiddleware::class);
        Route::get('workout-logs/{id}', [WorkoutLogController::class, 'show']);
        Route::post('workout-logs/{id}/sets', [WorkoutLogController::class, 'addSet'])->middleware(IdempotencyMiddleware::class);
        Route::post('workout-logs/{id}/complete', [WorkoutLogController::class, 'complete']);
        Route::delete('workout-logs/{id}', [WorkoutLogController::class, 'destroy']);

        // Workout Routines (Custom & AI Generated Plans)
        Route::get('routines', [WorkoutRoutineController::class, 'index']);
        Route::post('routines', [WorkoutRoutineController::class, 'store'])->middleware(IdempotencyMiddleware::class);
        Route::get('routines/{id}', [WorkoutRoutineController::class, 'show']);
        Route::put('routines/{id}', [WorkoutRoutineController::class, 'update']);
        Route::delete('routines/{id}', [WorkoutRoutineController::class, 'destroy']);

        // Community Feed
        Route::get('community/posts', [CommunityController::class, 'index']);
        Route::post('community/posts', [CommunityController::class, 'store'])->middleware(IdempotencyMiddleware::class);
        Route::post('community/posts/{id}/like', [CommunityController::class, 'toggleLike']);
        Route::get('community/posts/{id}/comments', [CommunityController::class, 'comments']);
        Route::post('community/posts/{id}/comments', [CommunityController::class, 'addComment']);
        Route::delete('community/posts/{id}', [CommunityController::class, 'destroy']);

        // Nutrition Logs
        Route::get('nutrition-logs', [NutritionLogController::class, 'index']);
        Route::post('nutrition-logs', [NutritionLogController::class, 'store'])->middleware(IdempotencyMiddleware::class);
        Route::delete('nutrition-logs/{id}', [NutritionLogController::class, 'destroy']);

        // Body Metrics
        Route::get('body-metrics', [BodyMetricController::class, 'index']);
        Route::post('body-metrics', [BodyMetricController::class, 'store']);

        // AI Hub (Throttled 30 requests / minute)
        Route::prefix('ai')->middleware(['throttle:30,1', IdempotencyMiddleware::class])->group(function () {
            Route::post('exercise-plan', [AiController::class, 'exercisePlan']);
            Route::post('meal-plan', [AiController::class, 'mealPlan']);
        });

        // Pose Check Subsystem
        Route::prefix('pose-check')->group(function () {
            Route::post('realtime/result', [PoseCheckController::class, 'realtimeResult']);
            // Backward compatibility alias route
            Route::post('realtime/frame', [PoseCheckController::class, 'realtimeResult']);
            Route::post('upload', [PoseCheckController::class, 'upload'])->middleware(IdempotencyMiddleware::class);
            Route::get('sessions', [PoseCheckController::class, 'index']);
            Route::get('sessions/{id}', [PoseCheckController::class, 'show']);
        });
    });
});
