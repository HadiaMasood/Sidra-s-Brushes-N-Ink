<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SocialFeed extends Model
{
    use HasFactory;

    protected $fillable = [
        'platform',
        'source_id',
        'content',
        'post_id',
        'likes',
        'comments_count',
        'comments',
        'metadata',
        'posted_at',
        'fetched_at',
    ];

    protected $casts = [
        'comments' => 'array',
        'metadata' => 'array',
        'posted_at' => 'datetime',
        'fetched_at' => 'datetime',
    ];

    public static function getLatestByPlatform($platform, $limit = 10)
    {
        return self::where('platform', $platform)
            ->latest('posted_at')
            ->limit($limit)
            ->get();
    }

    public static function getLatestAll($limit = 15)
    {
        return self::latest('posted_at')
            ->limit($limit)
            ->get();
    }
}
