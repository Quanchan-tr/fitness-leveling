<?php

declare(strict_types=1);

use App\Http\Controllers\Api\V1\AiController;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\BodyMetricController;
use App\Http\Controllers\Api\V1\ExerciseController;
use App\Http\Controllers\Api\V1\NutritionLogController;
use App\Http\Controllers\Api\V1\PoseCheckController;
use App\Http\Controllers\Api\V1\WorkoutLogController;
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
        Route::post('register', [AuthController::class, 'register']);
        Route::post('login', [AuthController::class, 'login']);

        Route::middleware('auth:sanctum')->group(function () {
            Route::get('me', [AuthController::class, 'me']);
            Route::post('logout', [AuthController::class, 'logout']);
        });
    });

    // --- PUBLIC EXERCISE CATALOG ---
    Route::get('exercises', [ExerciseController::class, 'index']);
    Route::get('exercises/{id}', [ExerciseController::class, 'show']);

    // --- PROTECTED DOMAIN ROUTES ---
    Route::middleware(['auth:sanctum'])->group(function () {
        // Exercise Contributions
        Route::post('exercises', [ExerciseController::class, 'store']);

        // Workout Logs
        Route::get('workout-logs', [WorkoutLogController::class, 'index']);
        Route::post('workout-logs', [WorkoutLogController::class, 'store'])->middleware(IdempotencyMiddleware::class);
        Route::get('workout-logs/{id}', [WorkoutLogController::class, 'show']);
        Route::post('workout-logs/{id}/sets', [WorkoutLogController::class, 'addSet'])->middleware(IdempotencyMiddleware::class);
        Route::delete('workout-logs/{id}', [WorkoutLogController::class, 'destroy']);

        // Nutrition Logs
        Route::get('nutrition-logs', [NutritionLogController::class, 'index']);
        Route::post('nutrition-logs', [NutritionLogController::class, 'store'])->middleware(IdempotencyMiddleware::class);
        Route::delete('nutrition-logs/{id}', [NutritionLogController::class, 'destroy']);

        // Body Metrics
        Route::get('body-metrics', [BodyMetricController::class, 'index']);
        Route::post('body-metrics', [BodyMetricController::class, 'store']);

        // AI Hub
        Route::prefix('ai')->middleware(IdempotencyMiddleware::class)->group(function () {
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
