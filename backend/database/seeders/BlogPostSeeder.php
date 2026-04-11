<?php

namespace Database\Seeders;

use App\Models\BlogPost;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class BlogPostSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        BlogPost::truncate();
        $posts = [
            [
                'title' => '🌙 Islamic Calligraphy Art for Homes and Gifts',
                'slug' => 'islamic-calligraphy-art-homes-gifts',
                'category' => 'Islamic Art',
                'author' => 'Sidra',
                'excerpt' => 'Discover elegant Quranic verses and Arabic typography blended with landscape elements. Perfect for home décor and spiritual gifts.',
                'content' => '
<div class="blog-post-content space-y-6">
    <p>Islamic calligraphy is one of our signature styles at <strong>Sidra’s Brushes N Ink</strong>. We design elegant <strong>Quranic verses, Asma-ul-Husna, duas, and Arabic typography</strong> blended with soft backgrounds and landscape elements.</p>
    
    <div class="my-6">
        <img src="islamic-calligraphy-framed-piece.png" alt="Elegant framed Islamic calligraphy artwork with Arabic typography and gold frame" class="rounded-lg shadow-md w-full" />
    </div>

    <p>Our <strong>Islamic calligraphy paintings</strong> are crafted to bring peace and timeless beauty to any space. They are perfect for:</p>
    <ul class="list-disc pl-6 mb-4">
        <li>Home wall décor</li>
        <li>Office spaces</li>
        <li>Wedding and housewarming gifts</li>
        <li>Spiritual corners</li>
    </ul>
    <p>We combine tradition with modern design so every piece feels peaceful and timeless. Each stroke is a tribute to the rich heritage of calligraphy.</p>
   
</div>
',
                'read_time' => '4 min read',
                'featured_image' => 'islamic-calligraphy-easel-painting.png',
                'is_published' => true,
                'published_at' => now()->subDays(5),
            ],
            [
                'title' => '🌅 Nature & Landscape Paintings Inspired by Skies and Sunsets',
                'slug' => 'nature-landscape-paintings-skies-sunsets',
                'category' => 'Landscapes',
                'author' => 'Sidra',
                'excerpt' => 'Nature inspires calm. Explore our hand-painted landscape artwork featuring skies, moons, and sunsets that turn blank walls into relaxing spaces.',
                'content' => '
<div class="blog-post-content space-y-6">
    <p>Nature inspires calm and reflection. At <strong>Sidra’s Brushes N Ink</strong>, we create <strong>hand-painted landscape artwork</strong> featuring skies, moons, sunsets, trees, clouds, and horizons.</p>
    
    <div class="my-6">
        <img src="/nature-landscape-moonlight-painting.png" alt="Peaceful hand-painted moonlight seascape with a glowing moon reflecting on ocean waves" class="rounded-lg shadow-md w-full" />
    </div>

    <p>These <strong>landscape paintings</strong> are ideal for creating a serene environment in your:</p>
    <ul class="list-disc pl-6 mb-4">
        <li>Living rooms</li>
        <li>Bedrooms</li>
        <li>Study rooms</li>
        <li>Office interiors</li>
    </ul>
    <p>Each brushstroke adds depth and emotion, turning blank walls into relaxing, artistic spaces. Our use of light and color aims to mirror the beauty of the natural world.</p>
  
</div>
',
                'read_time' => '5 min read',
                'featured_image' => '/nature-landscape-sunset-painting.png',
                'is_published' => true,
                'published_at' => now()->subDays(4),
            ],
            [
                'title' => '🎌 Anime and Cartoon Character Paintings',
                'slug' => 'anime-cartoon-character-paintings',
                'category' => 'Illustrations',
                'author' => 'Sidra',
                'excerpt' => 'From favorite heroes to cute characters, we transform fan ideas into expressive handmade anime artwork. Perfect for kids rooms and gifts.',
                'content' => '
<div class="blog-post-content space-y-6">
    <p>For art lovers who enjoy fun and creativity, we offer <strong>custom anime and cartoon character paintings</strong>. From favorite heroes to cute characters, we transform ideas into expressive art at <strong>Sidra’s Brushes N Ink</strong>.</p>
    
    <div class="my-6">
        <img src="anime-painting-watercolor-style.png" alt="Custom anime and cartoon character handmade painting with vibrant colors" class="rounded-lg shadow-md w-full" />
    </div>

    <p>Our <strong>anime artwork</strong> is a popular choice for:</p>
    <ul class="list-disc pl-6 mb-4">
        <li>Kids’ rooms</li>
        <li>Personalized gifts</li>
        <li>Fan collections</li>
        <li>Creative décor</li>
    </ul>
    <p>Every character is painted with attention to detail while maintaining our unique artistic style. We bring animated worlds to life on canvas with vibrant colors and dynamic compositions.</p>
  
</div>
',
                'read_time' => '4 min read',
                'featured_image' => 'anime-character-portrait-art.png',
                'is_published' => true,
                'published_at' => now()->subDays(3),
            ],
            [
                'title' => '✍️ Personalized Name Calligraphy Designs',
                'slug' => 'personalized-name-calligraphy-designs',
                'category' => 'Custom Designs',
                'author' => 'Sidra',
                'excerpt' => 'Names tell a story. We design unique custom name calligraphy in English, Urdu, and Arabic styles. Meaningful art for your home or office.',
                'content' => '
<div class="blog-post-content space-y-6">
    <p>Names tell a story. We design <strong>custom name calligraphy</strong> in English, Urdu, and Arabic styles. These personalized artworks are elegant and meaningful pieces produced by <strong>Sidra’s Brushes N Ink</strong>.</p>
    
    <div class="my-6">
        <img src="custom-name-calligraphy-design.png" alt="Custom personalized name calligraphy artwork on a tote bag" class="rounded-lg shadow-md w-full" />
    </div>

    <p>Our <strong>name calligraphy art</strong> is perfect for:</p>
    <ul class="list-disc pl-6 mb-4">
        <li>Wall frames</li>
        <li>Office desks</li>
        <li>Gifts for loved ones</li>
        <li>Branding décor</li>
    </ul>
    <p>Each design is unique and created according to your style preference. It makes for a truly one-of-a-kind gift that carries a personal connection for the recipient.</p>
   
</div>
',
                'read_time' => '3 min read',
                'featured_image' => 'personalized-name-calligraphy-art.png',
                'is_published' => true,
                'published_at' => now()->subDays(2),
            ],
            [
                'title' => '👜 Hand-Painted Tote Bags with Artistic Style',
                'slug' => 'hand-painted-tote-bags-artistic-style',
                'category' => 'Wearable Art',
                'author' => 'Sidra',
                'excerpt' => 'Art should travel with you. Explore our stylish, eco-friendly hand-painted tote bags featuring landscapes and calligraphy.',
                'content' => '
<div class="blog-post-content space-y-6">
    <p>Art should travel with you. That’s why at <strong>Sidra’s Brushes N Ink</strong>, we create <strong>hand-painted tote bags</strong> with calligraphy, quotes, landscapes, and custom designs.</p>
    
    <div class="my-6">
        <img src="tote-bag-2.png" alt="Hand painted tote bag design" class="rounded-lg shadow-md w-full" />
    </div>

    <p>Our <strong>custom tote bags</strong> are more than just accessories:</p>
    <ul class="list-disc pl-6 mb-4">
        <li>Eco-friendly & Reusable</li>
        <li>Stylish & Vibrant</li>
        <li>Personalized with your choice of art</li>
    </ul>
    <p>They are perfect for daily use, shopping, university, and as meaningful gifts. Carry your personality wherever you go with our unique wearable art.</p>
 
</div>
',
                'read_time' => '4 min read',
                'featured_image' => '/tote-bag-1.png',
                'is_published' => true,
                'published_at' => now()->subDays(1),
            ],
        ];

        foreach ($posts as $post) {
            BlogPost::create($post);
        }
    }
}
