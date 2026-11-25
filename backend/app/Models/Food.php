<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Food extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'foods';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'name',
        'name_en',
        'search_text',
        'category',
        'item_type',
        'serving_size',
        'serving_weight_g',
        'calories',
        'protein',
        'carbs',
        'fat',
        'fiber',
        'min_multiplier',
        'max_multiplier',
        'image_url',
        'description',
        'tags',
    ];

    protected $casts = [
        'serving_weight_g' => 'float',
        'calories' => 'integer',
        'protein' => 'float',
        'carbs' => 'float',
        'fat' => 'float',
        'fiber' => 'float',
        'min_multiplier' => 'float',
        'max_multiplier' => 'float',
        'tags' => 'array',
    ];

    protected static function booted(): void
    {
        static::saving(function (self $food) {
            if (empty($food->id)) {
                $food->id = (string) Str::uuid();
            }
            $food->search_text = self::buildSearchText($food);
        });
    }

    public static function normalizeVietnamese(string $str): string
    {
        $patterns = [
            '/[áàảãạăắằẳẵặâấầẩẫậ]/u' => 'a',
            '/[ÁÀẢÃẠĂẮẰẲẴẶÂẤẦẨẪẬ]/u' => 'A',
            '/[éèẻẽẹêếềểễệ]/u' => 'e',
            '/[ÉÈẺẼẸÊẾỀỂỄỆ]/u' => 'E',
            '/[íìỉĩị]/u' => 'i',
            '/[ÍÌỈĨỊ]/u' => 'I',
            '/[óòỏõọôốồổỗộơớờởỡợ]/u' => 'o',
            '/[ÓÒỎÕỌÔỐỒỔỖỘƠỚỜỞỠỢ]/u' => 'O',
            '/[úùủũụưứừửữự]/u' => 'u',
            '/[ÚÙỦŨỤƯỨỪỬỮỰ]/u' => 'U',
            '/[ýỳỷỹỵ]/u' => 'y',
            '/[ÝỲỶỸỴ]/u' => 'Y',
            '/đ/u' => 'd',
            '/Đ/u' => 'D',
        ];

        $replaced = preg_replace(array_keys($patterns), array_values($patterns), $str);

        return trim(mb_strtolower((string) $replaced, 'UTF-8'));
    }

    public static function buildSearchText(self $food): string
    {
        $tagsText = is_array($food->tags) ? implode(' ', $food->tags) : '';

        return self::normalizeVietnamese(implode(' ', array_filter([
            $food->name,
            $food->name_en,
            $food->category,
            $tagsText,
            $food->description,
        ])));
    }

    public function toApiArray(): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'name_en' => $this->name_en,
            'category' => $this->category,
            'item_type' => $this->item_type,
            'base_serving' => $this->serving_size,
            'serving_size' => $this->serving_size,
            'serving_weight_g' => $this->serving_weight_g,
            'base_calories' => $this->calories,
            'calories' => $this->calories,
            'base_macros' => [
                'protein' => $this->protein,
                'carbs' => $this->carbs,
                'fat' => $this->fat,
            ],
            'protein' => $this->protein,
            'carbs' => $this->carbs,
            'fat' => $this->fat,
            'fiber' => $this->fiber,
            'min_multiplier' => $this->min_multiplier,
            'max_multiplier' => $this->max_multiplier,
            'image_url' => $this->image_url,
            'description' => $this->description,
            'tags' => $this->tags ?? [],
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
            'deleted_at' => $this->deleted_at?->toIso8601String(),
        ];
    }
}
