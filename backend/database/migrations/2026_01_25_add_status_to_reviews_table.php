<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('reviews', function (Blueprint $table) {
            // Add status column if it doesn't exist
            if (!Schema::hasColumn('reviews', 'status')) {
                $table->string('status')->default('pending')->after('comment');
            }
        });
    }

    public function down(): void
    {
        Schema::table('reviews', function (Blueprint $table) {
            if (Schema::hasColumn('reviews', 'status')) {
                $table->dropColumn('status');
            }
        });
    }
};
