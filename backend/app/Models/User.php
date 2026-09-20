<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, HasUuids, SoftDeletes;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'avatar_url',
        'goal',
        'weight_kg',
        'height_cm',
        'birth_date',
        'gender',
        'activity_level',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
        'weight_kg' => 'float',
        'height_cm' => 'float',
        'birth_date' => 'date',
    ];

    public function workoutLogs(): HasMany
    {
        return $this->hasMany(WorkoutLog::class);
    }

    public function nutritionLogs(): HasMany
    {
        return $this->hasMany(NutritionLog::class);
    }

    public function bodyMetrics(): HasMany
    {
        return $this->hasMany(BodyMetric::class);
    }

    public function aiRecommendations(): HasMany
    {
        return $this->hasMany(AiRecommendation::class);
    }

    public function poseCheckSessions(): HasMany
    {
        return $this->hasMany(PoseCheckSession::class);
    }
}
