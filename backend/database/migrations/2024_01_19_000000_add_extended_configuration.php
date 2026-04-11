<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Add columns to configurations table if it exists
        if (Schema::hasTable('configurations')) {
            Schema::table('configurations', function (Blueprint $table) {
                if (!Schema::hasColumn('configurations', 'category')) {
                    $table->string('category')->default('general')->after('key');
                }
                if (!Schema::hasColumn('configurations', 'description')) {
                    $table->text('description')->nullable()->after('value');
                }
                if (!Schema::hasColumn('configurations', 'type')) {
                    $table->string('type')->default('text')->after('description'); // text, number, boolean, json, file
                }
            });
        }

        // Create social_feeds table for storing fetched social media content
        if (!Schema::hasTable('social_feeds')) {
            Schema::create('social_feeds', function (Blueprint $table) {
                $table->id();
                $table->string('platform')->index(); // instagram, facebook, twitter, etc
                $table->string('source_id'); // Instagram user ID or Facebook page ID
                $table->text('content');
                $table->string('post_id')->unique();
                $table->integer('likes')->default(0);
                $table->integer('comments_count')->default(0);
                $table->json('comments')->nullable();
                $table->json('metadata')->nullable();
                $table->timestamp('posted_at')->nullable();
                $table->timestamp('fetched_at')->nullable();
                $table->timestamps();
                $table->index(['platform', 'posted_at']);
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('configurations', function (Blueprint $table) {
            if (Schema::hasColumn('configurations', 'category')) {
                $table->dropColumn('category');
            }
            if (Schema::hasColumn('configurations', 'description')) {
                $table->dropColumn('description');
            }
            if (Schema::hasColumn('configurations', 'type')) {
                $table->dropColumn('type');
            }
        });

        Schema::dropIfExists('social_feeds');
    }
};
