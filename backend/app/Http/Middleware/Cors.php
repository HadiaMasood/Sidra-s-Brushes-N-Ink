<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class Cors
{
    public function handle(Request $request, Closure $next)
    {
        $allowedOrigins = [
            'http://localhost:3000',
            'http://localhost:3004',
            'http://localhost:3005',
            'http://localhost:3006',
            'http://localhost:3007',
            'http://localhost:3008',
            'http://localhost:5173',
            'http://127.0.0.1:3000',
            'http://127.0.0.1:3004',
            'http://127.0.0.1:3005',
            'http://127.0.0.1:3006',
            'http://127.0.0.1:3007',
            'http://127.0.0.1:3008',
            'http://127.0.0.1:5173',
            // Production domains
            'https://sidrabni.com',
            'https://www.sidrabni.com',
            'http://sidrabni.com',
            'http://www.sidrabni.com',
        ];

        $origin = $request->header('Origin');

        // Log the origin for debugging
        if ($origin) {
            \Log::info('CORS Request', ['origin' => $origin, 'method' => $request->method(), 'url' => $request->fullUrl()]);
        }

        // IMPORTANT: Browsers block requests where Allow-Origin='*' AND Allow-Credentials='true'
        // So: if origin is known → use specific origin + credentials
        //     if origin is unknown → use '*' but WITHOUT credentials header
        $isKnownOrigin = in_array($origin, $allowedOrigins);
        $allowOrigin = $isKnownOrigin ? $origin : ($origin ?: '*');

        if ($request->isMethod('options')) {
            $response = response('', 200)
                ->header('Access-Control-Allow-Origin', $allowOrigin)
                ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH')
                ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, X-CSRF-TOKEN')
                ->header('Access-Control-Max-Age', '86400');

            if ($isKnownOrigin) {
                $response->header('Access-Control-Allow-Credentials', 'true');
            }

            return $response;
        }

        $response = $next($request);

        // Ensure we handle both Response and BinaryFileResponse
        if (method_exists($response, 'header')) {
            $response->header('Access-Control-Allow-Origin', $allowOrigin)
                     ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH')
                     ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, X-CSRF-TOKEN');

            if ($isKnownOrigin) {
                $response->header('Access-Control-Allow-Credentials', 'true');
            }
        } elseif (isset($response->headers)) {
            $response->headers->set('Access-Control-Allow-Origin', $allowOrigin);
            $response->headers->set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
            $response->headers->set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, X-CSRF-TOKEN');

            if ($isKnownOrigin) {
                $response->headers->set('Access-Control-Allow-Credentials', 'true');
            }
        }

        return $response;
    }
}

