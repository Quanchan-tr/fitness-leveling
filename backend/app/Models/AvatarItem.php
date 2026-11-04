<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AvatarItem extends Model
{
    use HasFactory;

    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'item_code',
        'name',
        'theme',
        'gender',
        'slot',
        'rarity',
        'mesh_url',
        'icon_url',
        'unlock_type',
        'unlock_value',
        'fitcoin_price',
        'colors',
        'hides_hair',
    ];

    protected $casts = [
        'colors' => 'array',
        'hides_hair' => 'boolean',
        'unlock_value' => 'integer',
        'fitcoin_price' => 'integer',
    ];

    public function userInventories(): HasMany
    {
        return $this->hasMany(UserInventory::class, 'item_id', 'id');
    }
}

