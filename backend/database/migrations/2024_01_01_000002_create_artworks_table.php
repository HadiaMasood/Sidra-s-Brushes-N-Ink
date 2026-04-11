<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('artworks', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->longText('description');
            $table->decimal('price', 10, 2);
            $table->foreignId('category_id')->nullable()->constrained('categories')->onDelete('set null');
            $table->string('image_path');
            $table->string('dimensions')->nullable();
            $table->string('medium')->nullable();
            $table->string('artist')->nullable();
            $table->integer('year_created')->nullable();
            $table->integer('stock')->default(1);
            $table->integer('stock_quantity')->default(1);
            $table->integer('views')->default(0);
            $table->integer('sales')->default(0);
            $table->boolean('featured')->default(false);
            $table->boolean('is_featured')->default(false);
            $table->boolean('active')->default(true);
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('artworks');
    }
};
