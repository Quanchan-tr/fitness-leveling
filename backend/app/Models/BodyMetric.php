<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BodyMetric extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'user_id',
        'log_date',
        'weight_kg',
        'body_fat_pct',
        'height_cm',
    ];

    protected $casts = [
        'log_date' => 'date',
        'weight_kg' => 'float',
        'body_fat_pct' => 'float',
        'height_cm' => 'float',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
