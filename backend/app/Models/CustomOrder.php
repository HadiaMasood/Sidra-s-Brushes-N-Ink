<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CustomOrder extends Model
{
    use HasFactory;

    protected $table = 'custom_orders';

    protected $fillable = [
        'name',
        'email',
        'phone',
        'type',
        'size',
        'budget',
        'description',
        'reference_image',
        'status',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];
}
