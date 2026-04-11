<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Artwork;
use App\Models\Category;

class ArtworkSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Ensure categories exist
        $islamic = Category::firstOrCreate(
            ['slug' => 'islamic-calligraphy'],
            ['name' => 'Islamic Calligraphy', 'description' => 'Beautiful Islamic calligraphy artworks']
        );
        
        $nameCalligraphy = Category::firstOrCreate(
            ['slug' => 'name-calligraphy'],
            ['name' => 'Name Calligraphy', 'description' => 'Custom name calligraphy paintings']
        );
        
        $natureArt = Category::firstOrCreate(
            ['slug' => 'nature-art'],
            ['name' => 'Nature Art', 'description' => 'Nature-inspired paintings and artworks']
        );
        
        $cartoonCharacters = Category::firstOrCreate(
            ['slug' => 'cute-aesthetic-cartoon-characters'],
            ['name' => 'Cute/Aesthetic Cartoon Characters', 'description' => 'Adorable cartoon character illustrations']
        );
        
        $toteBags = Category::firstOrCreate(
            ['slug' => 'tote-bags'],
            ['name' => 'Tote Bags', 'description' => 'Hand-painted artistic tote bags']
        );

        // Artworks
        $artworks = [
            [
                'title' => 'Heart of Nature Tree Art',
                'description' => 'Enchanting heart-shaped botanical artwork featuring a graceful tree silhouette against vibrant pink and blue gradient background. Delicate floral elements frame the composition, creating a romantic and nature-inspired piece perfect for bedrooms, living spaces, or as a thoughtful gift. This artwork beautifully blends love symbolism with natural beauty.',
                'price' => 4500,
                'framed_price' => 6000,
                'category_id' => $natureArt->id,
                'image_path' => 'artworks/sunset-sky-birds-tree-branch-painting.jpeg',
                'alt_text' => 'Heart shaped botanical painting with tree silhouette in pink and blue watercolor featuring delicate cherry blossom decorations',
                'dimensions' => '10x12 inches',
                'medium' => 'Acrylic on Canvas',
                'artist' => 'Sidra',
                'year_created' => 2026,
                'featured' => true,
                'is_featured' => true,
                'stock' => 1,
                'stock_quantity' => 1,
            ],
            [
                'title' => 'Floral Bloom Ink Illustration',
                'description' => 'A sophisticated black ink floral sketch showcasing a blossoming branch with intricate petal details. The delicate line art is layered over a bold, modern abstract background featuring organic shapes in vibrant crimson red, forest green, and deep royal blue. This piece offers a unique bridge between classic ink drawing and contemporary abstract expressionism.',
                'price' => 2500,
                'framed_price' => 3500,
                'category_id' => $natureArt->id,
                'image_path' => 'artworks/minimalist-floral-ink-line-art-abstract-color-background.jpeg',
                'alt_text' => 'Minimalist black ink floral line art blossoming branch on a colorful abstract background with red, green, and blue shapes.',
                'dimensions' => '10x10 inches',
                'medium' => 'Ink and Acrylic on Canvas',
                'artist' => 'Sidra',
                'year_created' => 2026,
                'featured' => false,
                'is_featured' => false,
                'stock' => 1,
                'stock_quantity' => 1,
            ],
        ];

        foreach ($artworks as $artwork) {
            Artwork::updateOrCreate(
                ['title' => $artwork['title']],
                $artwork
            );
        }

        // Create some sample reviews
        $this->createSampleReviews();
    }

    private function createSampleReviews(): void
    {
        $artworks = Artwork::all();
        
        if ($artworks->isEmpty()) {
            return;
        }

        $reviews = [
            [
                'artwork_id' => $artworks[0]->id,
                'customer_name' => 'Sarah Ahmed',
                'customer_email' => 'sarah@example.com',
                'rating' => 5,
                'title' => 'Absolutely Beautiful!',
                'comment' => 'This artwork transformed my bedroom completely. The colors are even more stunning in person than in the photos. Highly recommended!',
                'approved' => true,
                'is_featured' => true,
            ],
        ];

        foreach ($reviews as $review) {
            \App\Models\Review::updateOrCreate(
                [
                    'artwork_id' => $review['artwork_id'],
                    'customer_email' => $review['customer_email'],
                ],
                $review
            );
        }
    }
}
