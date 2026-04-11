<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Configuration;
use App\Models\SocialFeed;
use App\Models\Review;
use App\Services\SocialMediaService;
use Illuminate\Http\Request;

class AdminConfigController extends Controller
{
    protected $socialMediaService;

    public function __construct(SocialMediaService $socialMediaService)
    {
        $this->socialMediaService = $socialMediaService;
        // Allow public access to getAll, getLogo, getSocialFeeds
        // All other methods require admin authentication
        $this->middleware('auth:sanctum')->except(['getAll', 'getLogo', 'getSocialFeeds']);
        
        // Check admin role for authenticated routes
        $this->middleware(function ($request, $next) {
            if (auth()->check() && auth()->user()->role !== 'admin') {
                return response()->json(['message' => 'Unauthorized. Admin access required.'], 403);
            }
            return $next($request);
        })->except(['getAll', 'getLogo', 'getSocialFeeds']);
    }

    /**
     * Get all configuration settings grouped by category
     */
    public function getAll()
    {
        $configs = Configuration::all();
        
        $grouped = $configs->groupBy('category')->map(function ($items) {
            return $items->pluck('value', 'key');
        })->toArray();

        // Security: Filter out sensitive keys from public (non-admin) access
        $isAdmin = auth()->check() && auth()->user()->role === 'admin';
        if (!$isAdmin && isset($grouped['payment'])) {
            $sensitiveKeys = [
                'easypaisa_merchant_id', 'easypaisa_api_key',
                'jazzcash_merchant_id', 'jazzcash_api_key',
                'jazzcash_salt', 'jazzcash_password'
            ];
            foreach ($sensitiveKeys as $key) {
                unset($grouped['payment'][$key]);
            }
        }

        return response()->json($grouped);
    }

    /**
     * Update multiple configuration settings at once
     */
    public function updateMultiple(Request $request)
    {
        $validated = $request->validate([
            'settings' => 'required|array',
            'settings.*.key' => 'required|string',
            'settings.*.value' => 'nullable',
            'settings.*.category' => 'nullable|string',
        ]);

        $updated = [];
        foreach ($validated['settings'] as $setting) {
            $config = Configuration::updateOrCreate(
                ['key' => $setting['key']],
                [
                    'value' => $setting['value'],
                    'category' => $setting['category'] ?? 'general',
                ]
            );
            $updated[] = $config;
        }

        return response()->json([
            'message' => 'Settings updated successfully',
            'updated' => $updated,
        ]);
    }

    /**
     * Upload and manage site logo
     */
    public function uploadLogo(Request $request)
    {
        $request->validate([
            'logo' => 'required|image|mimes:jpeg,png,jpg,gif,svg|max:2048'
        ]);

        if ($request->hasFile('logo')) {
            $path = $request->file('logo')->store('logos', 'public');
            
            Configuration::updateOrCreate(
                ['key' => 'site_logo'],
                [
                    'value' => $path,
                    'category' => 'branding',
                    'type' => 'file',
                    'description' => 'Site logo image',
                ]
            );

            return response()->json([
                'message' => 'Logo uploaded successfully',
                'logo_path' => $path,
                'logo_url' => asset('storage/' . $path),
            ], 201);
        }

        return response()->json(['message' => 'No file uploaded'], 400);
    }

    /**
     * Get logo
     */
    public function getLogo()
    {
        $logoPath = Configuration::get('site_logo');
        return response()->json([
            'logo_path' => $logoPath,
            'logo_url' => $logoPath ? asset('storage/' . $logoPath) : null,
        ]);
    }

    /**
     * Update brand settings
     */
    public function updateBrand(Request $request)
    {
        $validated = $request->validate([
            'brand_name' => 'nullable|string|max:255',
            'brand_tagline' => 'nullable|string|max:500',
            'brand_description' => 'nullable|string',
        ]);

        foreach ($validated as $key => $value) {
            if ($value !== null) {
                Configuration::updateOrCreate(
                    ['key' => $key],
                    [
                        'value' => $value,
                        'category' => 'branding',
                    ]
                );
            }
        }

        return response()->json([
            'message' => 'Brand settings updated',
            'data' => $validated,
        ]);
    }

    /**
     * Update currency and payment settings
     */
    public function updatePaymentSettings(Request $request)
    {
        $validated = $request->validate([
            'currency' => 'nullable|string|size:3',
            'currency_symbol' => 'nullable|string|max:5',
            'easypaisa_merchant_id' => 'nullable|string',
            'easypaisa_api_key' => 'nullable|string',
            'jazzcash_merchant_id' => 'nullable|string',
            'jazzcash_api_key' => 'nullable|string',
            'bank_name' => 'nullable|string',
            'bank_account_title' => 'nullable|string',
            'bank_account_no' => 'nullable|string',
            'bank_iban' => 'nullable|string',
        ]);

        foreach ($validated as $key => $value) {
            if ($value !== null) {
                Configuration::updateOrCreate(
                    ['key' => $key],
                    [
                        'value' => $value,
                        'category' => 'payment',
                    ]
                );
            }
        }

        return response()->json([
            'message' => 'Payment settings updated',
            'data' => $validated,
        ]);
    }

    /**
     * Update social media links and IDs
     */
    public function updateSocialLinks(Request $request)
    {
        $validated = $request->validate([
            'instagram_url' => 'nullable|string',
            'instagram_id' => 'nullable|string',
            'instagram_token' => 'nullable|string',
            'facebook_url' => 'nullable|string',
            'facebook_id' => 'nullable|string',
            'facebook_token' => 'nullable|string',
            'twitter_url' => 'nullable|string',
            'twitter_id' => 'nullable|string',
            'linkedin_url' => 'nullable|string',
            'youtube_url' => 'nullable|string',
            'tiktok_url' => 'nullable|string',
        ]);

        foreach ($validated as $key => $value) {
            if ($value !== null) {
                Configuration::updateOrCreate(
                    ['key' => $key],
                    [
                        'value' => $value,
                        'category' => 'social',
                    ]
                );
            }
        }

        return response()->json([
            'message' => 'Social media links updated',
            'data' => $validated,
        ]);
    }

    /**
     * Update contact information
     */
    public function updateContactInfo(Request $request)
    {
        $validated = $request->validate([
            'contact_email' => 'nullable|email',
            'contact_phone' => 'nullable|string|max:20',
            'contact_address' => 'nullable|string',
            'contact_city' => 'nullable|string',
            'contact_country' => 'nullable|string',
            'contact_zip' => 'nullable|string|max:10',
            'business_hours' => 'nullable|string',
            'business_email' => 'nullable|email',
        ]);

        foreach ($validated as $key => $value) {
            if ($value !== null) {
                Configuration::updateOrCreate(
                    ['key' => $key],
                    [
                        'value' => $value,
                        'category' => 'contact',
                    ]
                );
            }
        }

        return response()->json([
            'message' => 'Contact information updated',
            'data' => $validated,
        ]);
    }

    /**
     * Sync social media feeds from Instagram and Facebook
     */
    public function syncSocialFeeds()
    {
        try {
            $results = $this->socialMediaService->syncAllFeeds();
            return response()->json([
                'message' => 'Social media feeds synced successfully',
                'results' => $results,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error syncing feeds: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get all social feeds for display
     */
    public function getSocialFeeds(Request $request)
    {
        $platform = $request->query('platform'); // Optional filter by platform
        $limit = $request->query('limit', 15);

        if ($platform) {
            $feeds = SocialFeed::where('platform', $platform)
                ->latest('posted_at')
                ->limit($limit)
                ->get();
        } else {
            $feeds = SocialFeed::latest('posted_at')
                ->limit($limit)
                ->get();
        }

        return response()->json($feeds);
    }

    /**
     * Review management - get all reviews
     */
    public function getReviews(Request $request)
    {
        $status = $request->query('status'); // pending, approved, rejected
        $featured = $request->query('featured') === 'true';

        $query = Review::with('user', 'artwork');

        if ($status) {
            $query->where('status', $status);
        }

        if ($featured) {
            $query->where('is_featured', true);
        }

        $reviews = $query->latest('created_at')->paginate(20);

        return response()->json($reviews);
    }

    /**
     * Approve or reject a review
     */
    public function updateReview(Request $request, $reviewId)
    {
        $validated = $request->validate([
            'status' => 'sometimes|in:pending,approved,rejected',
            'is_featured' => 'sometimes|boolean',
        ]);

        $review = Review::findOrFail($reviewId);
        $review->update($validated);

        return response()->json([
            'message' => 'Review updated successfully',
            'review' => $review,
        ]);
    }

    /**
     * Delete a review
     */
    public function deleteReview($reviewId)
    {
        $review = Review::findOrFail($reviewId);
        $review->delete();

        return response()->json(['message' => 'Review deleted successfully']);
    }

    /**
     * Get dashboard stats
     */
    public function getDashboardStats()
    {
        return response()->json([
            'total_reviews' => Review::count(),
            'pending_reviews' => Review::where('status', 'pending')->count(),
            'approved_reviews' => Review::where('status', 'approved')->count(),
            'featured_reviews' => Review::where('is_featured', true)->count(),
            'instagram_posts' => SocialFeed::where('platform', 'instagram')->count(),
            'facebook_posts' => SocialFeed::where('platform', 'facebook')->count(),
        ]);
    }
}
