<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Request as SymfonyRequest;

class HandleFormDataMethods
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle(Request $request, Closure $next)
    {
        // Check if this is a POST request with FormData containing _method
        if ($request->isMethod('post') && $request->has('_method')) {
            $method = strtoupper($request->input('_method'));
            
            // Valid HTTP methods
            $validMethods = ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'];
            
            if (in_array($method, $validMethods)) {
                $request->setMethod($method);
                
                // Log the override for debugging
                \Log::info('Method override applied', [
                    'from' => 'POST',
                    'to' => $method,
                    'path' => $request->path(),
                    'has_file' => $request->hasFile('image')
                ]);
            }
        }
        
        return $next($request);
    }
}
