<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WorkoutLogSet extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'workout_log_id',
        'exercise_id',
        'set_number',
        'reps',
        'weight_kg',
        'duration_sec',
    ];

    protected $casts = [
        'set_number' => 'integer',
        'reps' => 'integer',
        'weight_kg' => 'float',
        'duration_sec' => 'integer',
    ];

    public function workoutLog(): BelongsTo
    {
        return $this->belongsTo(WorkoutLog::class);
    }

    public function exercise(): BelongsTo
    {
        return $this->belongsTo(Exercise::class);
    }
}
