<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->onDelete('cascade');
            $table->string('transaction_id')->unique();
            $table->enum('gateway', ['easypaisa', 'jazzcash', 'manual'])->default('manual');
            $table->decimal('amount', 10, 2);
            $table->string('currency')->default('PKR');
            $table->enum('status', ['pending', 'completed', 'failed'])->default('pending');
            $table->json('gateway_response')->nullable();
            $table->timestamp('processed_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
