<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
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
        'workout_preferences',
        'email_verified_at',
        'xp',
        'level',
        'current_streak',
        'last_active_date',
        'banned_at',
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
        'workout_preferences' => 'array',
        'xp' => 'integer',
        'level' => 'integer',
        'current_streak' => 'integer',
        'last_active_date' => 'date',
        'banned_at' => 'datetime',
    ];

    public function isBanned(): bool
    {
        return $this->banned_at !== null;
    }

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

    public function avatarConfig(): HasOne
    {
        return $this->hasOne(UserAvatarConfig::class);
    }

    public function userInventories(): HasMany
    {
        return $this->hasMany(UserInventory::class);
    }

    public function workoutRoutines(): HasMany
    {
        return $this->hasMany(WorkoutRoutine::class);
    }

    public function communityPosts(): HasMany
    {
        return $this->hasMany(CommunityPost::class);
    }

    public function postComments(): HasMany
    {
        return $this->hasMany(PostComment::class);
    }

    public function followers(): HasMany
    {
        return $this->hasMany(UserFollow::class, 'following_id');
    }

    public function following(): HasMany
    {
        return $this->hasMany(UserFollow::class, 'follower_id');
    }
}
