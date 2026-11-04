<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserAvatarConfig extends Model
{
    use HasFactory;

    protected $primaryKey = 'user_id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'user_id',
        'character_gender',
        'headwear_id',
        'hair_id',
        'top_id',
        'bottom_id',
        'shoes_id',
        'accessory_id',
        'special_id',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function headwear(): BelongsTo
    {
        return $this->belongsTo(AvatarItem::class, 'headwear_id', 'id');
    }

    public function hair(): BelongsTo
    {
        return $this->belongsTo(AvatarItem::class, 'hair_id', 'id');
    }

    public function top(): BelongsTo
    {
        return $this->belongsTo(AvatarItem::class, 'top_id', 'id');
    }

    public function bottom(): BelongsTo
    {
        return $this->belongsTo(AvatarItem::class, 'bottom_id', 'id');
    }

    public function shoes(): BelongsTo
    {
        return $this->belongsTo(AvatarItem::class, 'shoes_id', 'id');
    }

    public function accessory(): BelongsTo
    {
        return $this->belongsTo(AvatarItem::class, 'accessory_id', 'id');
    }

    public function special(): BelongsTo
    {
        return $this->belongsTo(AvatarItem::class, 'special_id', 'id');
    }
}

