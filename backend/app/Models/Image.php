<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Image extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'artwork_id',
        'image_path',
        'alt_text',
        'is_primary',
        'order',
    ];

    protected $casts = [
        'is_primary' => 'boolean',
    ];

    protected $appends = ['image_url'];

    public function artwork()
    {
        return $this->belongsTo(Artwork::class);
    }

    public function getImageUrlAttribute()
    {
        if (!$this->image_path) {
            return null;
        }
        if (filter_var($this->image_path, FILTER_VALIDATE_URL)) {
            return $this->image_path;
        }
        return asset('storage/' . $this->image_path);
    }
}
