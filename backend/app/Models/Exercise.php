<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Exercise extends Model
{
    use HasFactory, HasUuids, SoftDeletes;

    protected $fillable = [
        'created_by',
        'name',
        'description',
        'muscle_group',
        'equipment',
        'difficulty',
        'video_url',
        'thumbnail_url',
        'has_pose_check',
        'pose_rules_key',
        'verified',
        'avg_rating',
        'rating_count',
        'status',
    ];

    protected $casts = [
        'has_pose_check' => 'boolean',
        'verified' => 'boolean',
        'avg_rating' => 'float',
        'rating_count' => 'integer',
    ];

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function ratings(): HasMany
    {
        return $this->hasMany(ExerciseRating::class);
    }

    public function reports(): HasMany
    {
        return $this->hasMany(ExerciseReport::class);
    }
}
