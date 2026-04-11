<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Artwork extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'title',
        'description',
        'price',
        'frame_price',
        'framed_price',
        'image_path',
        'alt_text',
        'category_id',
        'artist',
        'year_created',
        'dimensions',
        'medium',
        'stock_quantity',
        'featured',
        'active',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'frame_price' => 'decimal:2',
        'framed_price' => 'decimal:2',
        'featured' => 'boolean',
        'active' => 'boolean',
    ];

    protected $appends = ['image_url'];

    public function orderItems()
    {
        return $this->hasMany(OrderItem::class);
    }

    public function reviews()
    {
        return $this->hasMany(Review::class);
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function images()
    {
        return $this->hasMany(Image::class)->orderBy('order');
    }

    public function getImageUrlAttribute()
    {
        if (!$this->image_path) {
            return null;
        }

        // If it's already a full URL, return as-is
        if (filter_var($this->image_path, FILTER_VALIDATE_URL)) {
            return $this->image_path;
        }

        // Normalize: remove leading 'storage/' if present
        $path = $this->image_path;
        if (strpos($path, 'storage/') === 0) {
            $path = substr($path, 8);
        }

        // Build URL from APP_URL — but never use localhost in production
        $baseUrl = rtrim(config('app.url'), '/');

        // Safety: if APP_URL is still localhost, return a relative path
        // so the frontend can prepend its own base URL
        if (strpos($baseUrl, 'localhost') !== false || strpos($baseUrl, '127.0.0.1') !== false) {
            return '/storage/' . ltrim($path, '/');
        }

        return $baseUrl . '/storage/' . ltrim($path, '/');
    }
}
