<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('custom_orders', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email');
            $table->string('phone');
            $table->string('type');
            $table->string('size');
            $table->decimal('budget', 10, 2);
            $table->text('description');
            $table->string('reference_image')->nullable();
            $table->enum('status', ['pending', 'reviewing', 'approved', 'rejected', 'completed'])->default('pending');
            $table->timestamps();
            $table->index('status');
            $table->index('email');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('custom_orders');
    }
};
