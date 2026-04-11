<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('reviews', function (Blueprint $table) {
            // Add indexes for faster queries
            if (!Schema::hasColumn('reviews', 'approved')) {
                $table->index('approved');
            }
            
            if (!Schema::hasColumn('reviews', 'is_featured')) {
                $table->index('is_featured');
            }
            
            if (!Schema::hasColumn('reviews', 'status')) {
                $table->index('status');
            }
            
            if (!Schema::hasColumn('reviews', 'artwork_id')) {
                $table->index('artwork_id');
            }
            
            // Composite index for common queries
            $table->index(['approved', 'is_featured', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::table('reviews', function (Blueprint $table) {
            $table->dropIndex(['approved']);
            $table->dropIndex(['is_featured']);
            $table->dropIndex(['status']);
            $table->dropIndex(['artwork_id']);
            $table->dropIndex(['approved', 'is_featured', 'created_at']);
        });
    }
};
