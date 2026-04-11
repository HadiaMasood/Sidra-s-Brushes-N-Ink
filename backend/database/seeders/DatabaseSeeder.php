<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\Category;
use App\Models\Artwork;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Review;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Create categories - Updated to match current business categories
        $categories = [
            ['name' => 'Islamic Calligraphy', 'slug' => 'islamic-calligraphy', 'description' => 'Beautiful Islamic calligraphy artworks'],
            ['name' => 'Name Calligraphy', 'slug' => 'name-calligraphy', 'description' => 'Custom name calligraphy paintings'],
            ['name' => 'Nature Art', 'slug' => 'nature-art', 'description' => 'Nature-inspired paintings and artworks'],
            ['name' => 'Cute/Aesthetic Cartoon Characters', 'slug' => 'cute-aesthetic-cartoon-characters', 'description' => 'Adorable cartoon character illustrations'],
            ['name' => 'Tote Bags', 'slug' => 'tote-bags', 'description' => 'Hand-painted artistic tote bags'],
        ];

        foreach ($categories as $category) {
            Category::create($category);
        }

        // Artworks will be created by ArtworkSeeder

        // Create sample reviews
        $reviews = [
            ['artwork_id' => 1, 'customer_name' => 'Ahmed Khan', 'customer_email' => 'ahmed@example.com', 'rating' => 5, 'title' => 'Amazing artwork!', 'comment' => 'Amazing artwork! Very satisfied with the purchase.', 'approved' => true, 'is_featured' => true],
            ['artwork_id' => 2, 'customer_name' => 'Fatima Ali', 'customer_email' => 'fatima@example.com', 'rating' => 4, 'title' => 'Beautiful landscape', 'comment' => 'Beautiful landscape, great quality packaging.', 'approved' => true, 'is_featured' => true],
            ['artwork_id' => 3, 'customer_name' => 'Hassan Malik', 'customer_email' => 'hassan@example.com', 'rating' => 5, 'title' => 'Perfect portrait', 'comment' => 'Perfect portrait, exactly as described!', 'approved' => true, 'is_featured' => true],
        ];

        foreach ($reviews as $review) {
            Review::create($review);
        }

        // Create sample orders
        $orders = [
            [
                'customer_name' => 'Ali Hassan',
                'customer_email' => 'ali@example.com',
                'customer_phone' => '03001234567',
                'total' => 5500,
                'status' => 'completed',
                'payment_method' => 'manual',
            ],
            [
                'customer_name' => 'Zainab Malik',
                'customer_email' => 'zainab@example.com',
                'customer_phone' => '03009876543',
                'total' => 13700,
                'status' => 'shipped',
                'payment_method' => 'easypaisa',
            ],
            [
                'customer_name' => 'Muhammad Khan',
                'customer_email' => 'khan@example.com',
                'customer_phone' => '03005555555',
                'total' => 8500,
                'status' => 'pending',
                'payment_method' => 'manual',
            ],
        ];

        foreach ($orders as $order) {
            $createdOrder = Order::create($order);
            
            // Add order items
            if ($createdOrder->total == 5500) {
                OrderItem::create(['order_id' => $createdOrder->id, 'artwork_id' => 1, 'quantity' => 1]);
            } elseif ($createdOrder->total == 13700) {
                OrderItem::create(['order_id' => $createdOrder->id, 'artwork_id' => 2, 'quantity' => 1]);
                OrderItem::create(['order_id' => $createdOrder->id, 'artwork_id' => 4, 'quantity' => 1]);
            } else {
                OrderItem::create(['order_id' => $createdOrder->id, 'artwork_id' => 3, 'quantity' => 1]);
            }
        }

        // Run seeders
        $this->call([
            ArtworkSeeder::class,
            BlogPostSeeder::class,
        ]);

        // Create admin user if not exists
        \App\Models\User::firstOrCreate(
            ['email' => 'admin@example.com'],
            [
                'name' => 'Admin User',
                'password' => 'Brushes&Ink@2026!Secure#Admin',
                'role' => 'admin',
            ]
        );

        // Create sample customer user
        \App\Models\User::firstOrCreate(
            ['email' => 'customer@example.com'],
            [
                'name' => 'Sample Customer',
                'password' => 'customer123',
                'role' => 'customer',
            ]
        );
    }
}
