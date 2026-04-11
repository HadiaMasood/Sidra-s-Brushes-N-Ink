<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Route;

class RouteServiceProvider extends ServiceProvider
{
    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Route::middleware('api')
            ->prefix('api')
            ->group(base_path('routes/api.php'));

        // Serve storage files directly without any middleware
        Route::get('/storage/{path}', function ($path) {
            $filePath = storage_path('app/public/' . $path);
            if (!file_exists($filePath)) {
                abort(404);
            }
            $mimeType = match (pathinfo($filePath, PATHINFO_EXTENSION)) {
                'jpg', 'jpeg' => 'image/jpeg',
                'png' => 'image/png',
                'webp' => 'image/webp',
                'gif' => 'image/gif',
                'svg' => 'image/svg+xml',
                default => 'application/octet-stream',
            };
            return response()->file($filePath, [
                'Content-Type' => $mimeType,
                'Cache-Control' => 'public, max-age=31536000',
                'Access-Control-Allow-Origin' => '*',
            ]);
        })->where('path', '.*');

        Route::middleware('web')
            ->group(base_path('routes/web.php'));
    }
}
