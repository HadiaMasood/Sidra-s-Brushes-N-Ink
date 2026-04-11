<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Review extends Model
{
    use HasFactory;

    protected $fillable = [
        'artwork_id',
        'user_id',
        'customer_name',
        'customer_email',
        'rating',
        'title',
        'comment',
        'status',
        'is_featured',
        'approved',
    ];

    protected $casts = [
        'approved' => 'boolean',
        'is_featured' => 'boolean',
    ];

    public function artwork()
    {
        return $this->belongsTo(Artwork::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public static function getApproved($limit = 10)
    {
        return self::where('status', 'approved')
            ->orWhere('approved', true)
            ->latest('created_at')
            ->limit($limit)
            ->with('user', 'artwork')
            ->get();
    }

    public static function getFeatured($limit = 5)
    {
        return self::where('is_featured', true)
            ->where(function ($query) {
                $query->where('status', 'approved')
                    ->orWhere('approved', true);
            })
            ->latest('created_at')
            ->limit($limit)
            ->with('user', 'artwork')
            ->get();
    }
}
