<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ArtworkController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\ReviewController;
use App\Http\Controllers\Api\ConfigurationController;
use App\Http\Controllers\Api\AdminConfigController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\ContactController;
use App\Http\Controllers\Api\CustomOrderController;
use App\Http\Controllers\Api\AnalyticsController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BlogController;
use App\Http\Controllers\Api\ImageController;

// Test route
Route::get('/test', function () {
    return response()->json(['message' => 'API is working']);
});

// Test artworks direct - returns exact Laravel response
Route::get('/test-artworks-direct', function () {
    $artworks = \App\Models\Artwork::where('active', true)->get();
    \Log::info('Test artworks direct', [
        'count' => $artworks->count(),
        'first_title' => $artworks->first()?->title
    ]);
    return response()->json([
        'test' => 'direct',
        'count' => $artworks->count(),
        'artworks' => $artworks
    ]);
});

// Test artworks via controller
Route::get('/test-artworks-controller', function () {
    $controller = new \App\Http\Controllers\Api\ArtworkController();
    $request = \Illuminate\Http\Request::create('/api/artworks', 'GET');
    $response = $controller->index($request);
    
    \Log::info('Test artworks controller', [
        'response_type' => get_class($response),
        'content' => substr($response->getContent(), 0, 200)
    ]);
    
    return $response;
});

// Test delete route
Route::delete('/test-delete/{id}', function ($id) {
    return response()->json(['message' => 'Delete test working', 'id' => $id]);
});

// Authentication routes - Public
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);
// Backwards-compatible admin login route (some frontends expect /admin/login)
Route::post('/admin/login', [AuthController::class, 'adminLogin']);

// Public artwork routes
Route::get('/artworks', [ArtworkController::class, 'index']);
Route::get('/artworks/{id}', [ArtworkController::class, 'show']);

// Public review routes
Route::get('/reviews', [ReviewController::class, 'index']);
Route::get('/reviews/featured', [ReviewController::class, 'featured']);
Route::get('/reviews/artwork/{id}', [ReviewController::class, 'byArtwork']);
Route::post('/reviews', [ReviewController::class, 'store']);
Route::put('/reviews/{id}', [ReviewController::class, 'update']);
Route::delete('/reviews/{id}', [ReviewController::class, 'destroy']);

// Social feeds routes
Route::get('/social-feeds', [AdminConfigController::class, 'getSocialFeeds']);

// Order routes
Route::post('/orders', [OrderController::class, 'store']);

// Configuration routes
Route::get('/config', [ConfigurationController::class, 'index']);
Route::get('/config/{key}', [ConfigurationController::class, 'show']);
Route::get('/config/logo', [ConfigurationController::class, 'getLogo']);

// Public site configuration (used by frontend)
Route::get('/admin/config/all', [AdminConfigController::class, 'getAll']);

// Payment routes
Route::post('/payment/easypaisa', [PaymentController::class, 'initiateEasypaisa']);
Route::post('/payment/jazzcash', [PaymentController::class, 'initiateJazzcash']);
Route::post('/payment/jazzcash/callback', [PaymentController::class, 'handleJazzcashCallback']);
Route::get('/payment/{id}', [PaymentController::class, 'getPaymentStatus']);

// Category routes
Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/categories/{id}', [CategoryController::class, 'show']);

// Contact routes
Route::post('/contact', [ContactController::class, 'store']);

// Custom order routes
Route::post('/custom-orders', [CustomOrderController::class, 'store']);

// Blog routes
Route::get('/blog', [BlogController::class, 'index']);
Route::get('/blog/categories', [BlogController::class, 'categories']);
Route::get('/blog/{slug}', [BlogController::class, 'show']);

// Authenticated routes - Require authentication
Route::middleware('auth:sanctum')->group(function () {
        // Test auth route
        Route::get('/test-auth', function () {
            $user = auth()->user();
            return response()->json([
                'message' => 'Authenticated',
                'user' => $user,
                'role' => $user->role ?? 'unknown'
            ]);
        });

        // Auth routes
        Route::get('/auth/me', [AuthController::class, 'me']);
        Route::put('/auth/profile', [AuthController::class, 'updateProfile']);
        Route::post('/auth/change-password', [AuthController::class, 'changePassword']);
        Route::post('/auth/logout', [AuthController::class, 'logout']);

        // Artwork admin routes
        Route::post('/artworks', [ArtworkController::class, 'store']);
        Route::put('/artworks/{id}', [ArtworkController::class, 'update']);
        Route::post('/artworks/{id}', [ArtworkController::class, 'update']); // Support POST with _method=PUT for FormData
        Route::delete('/artworks/{id}', [ArtworkController::class, 'destroy']);

        // Order admin routes
        Route::get('/orders', [OrderController::class, 'index']);
        Route::get('/orders/{id}', [OrderController::class, 'show']);
        Route::put('/orders/{id}/status', [OrderController::class, 'updateStatus']);

        // Review admin routes
        Route::get('/admin/reviews', [AdminConfigController::class, 'getReviews']);
        Route::put('/admin/reviews/{id}', [AdminConfigController::class, 'updateReview']);
        Route::delete('/admin/reviews/{id}', [AdminConfigController::class, 'deleteReview']);
        Route::post('/reviews/{id}/approve', [ReviewController::class, 'approve']);
        Route::post('/reviews/{id}/reject', [ReviewController::class, 'reject']);
        Route::get('/reviews/pending', [ReviewController::class, 'pending']);

        // Configuration admin routes
        Route::put('/config', [ConfigurationController::class, 'update']);
        Route::post('/config/logo', [ConfigurationController::class, 'uploadLogo']);

        // Advanced Admin Config routes
        Route::post('/admin/config/update-multiple', [AdminConfigController::class, 'updateMultiple']);
        Route::post('/admin/config/upload-logo', [AdminConfigController::class, 'uploadLogo']);
        Route::get('/admin/config/logo', [AdminConfigController::class, 'getLogo']);
        Route::post('/admin/config/brand', [AdminConfigController::class, 'updateBrand']);
        Route::post('/admin/config/payment', [AdminConfigController::class, 'updatePaymentSettings']);
        Route::post('/admin/config/social-links', [AdminConfigController::class, 'updateSocialLinks']);
        Route::post('/admin/config/contact', [AdminConfigController::class, 'updateContactInfo']);
        Route::post('/admin/config/sync-social', [AdminConfigController::class, 'syncSocialFeeds']);
        Route::get('/admin/config/dashboard-stats', [AdminConfigController::class, 'getDashboardStats']);

        // Category admin routes
        Route::post('/categories', [CategoryController::class, 'store']);
        Route::put('/categories/{id}', [CategoryController::class, 'update']);
        Route::delete('/categories/{id}', [CategoryController::class, 'destroy']);

        // Contact admin routes
        Route::get('/contact', [ContactController::class, 'index']);
        Route::get('/contact/{id}', [ContactController::class, 'show']);
        Route::delete('/contact/{id}', [ContactController::class, 'destroy']);
        Route::post('/contact/{id}/reply', [ContactController::class, 'reply']);

        // Custom order admin routes
        Route::get('/custom-orders', [CustomOrderController::class, 'index']);
        Route::get('/custom-orders/{id}', [CustomOrderController::class, 'show']);
        Route::put('/custom-orders/{id}/status', [CustomOrderController::class, 'updateStatus']);
        Route::delete('/custom-orders/{id}', [CustomOrderController::class, 'destroy']);

        // Analytics routes
        Route::get('/analytics/dashboard', [AnalyticsController::class, 'dashboard']);
        Route::get('/analytics/export', [AnalyticsController::class, 'export']);
        Route::get('/analytics/revenue', [AnalyticsController::class, 'revenue']);
        Route::get('/analytics/orders', [AnalyticsController::class, 'orders']);
        Route::get('/analytics/artworks', [AnalyticsController::class, 'artworks']);
        Route::get('/analytics/reviews', [AnalyticsController::class, 'reviews']);

        // Blog admin routes
        Route::post('/blog', [BlogController::class, 'store']);
        Route::put('/blog/{post}', [BlogController::class, 'update']);
        Route::delete('/blog/{post}', [BlogController::class, 'destroy']);

        // Image routes for artworks
        Route::get('/artworks/{artworkId}/images', [ImageController::class, 'index']);
        Route::get('/artworks/{artworkId}/images/{imageId}', [ImageController::class, 'show']);
        Route::post('/artworks/{artworkId}/images', [ImageController::class, 'store']);
        Route::put('/artworks/{artworkId}/images/{imageId}', [ImageController::class, 'update']);
        Route::delete('/artworks/{artworkId}/images/{imageId}', [ImageController::class, 'destroy']);
        Route::post('/artworks/{artworkId}/images/reorder', [ImageController::class, 'reorder']);
});
