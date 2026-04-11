<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Set all artworks to active = true
        DB::table('artworks')->update(['active' => true]);
    }

    public function down(): void
    {
        // Revert if needed
        DB::table('artworks')->update(['active' => false]);
    }
};
