<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Configuration;
use Illuminate\Http\Request;

class ConfigurationController extends Controller
{
    public function index()
    {
        $configs = Configuration::all()->pluck('value', 'key');
        
        // Security: Filter out sensitive keys from public access
        $isAdmin = auth()->check() && auth()->user()->role === 'admin';
        if (!$isAdmin) {
            $sensitiveKeys = [
                'easypaisa_merchant_id', 'easypaisa_api_key',
                'jazzcash_merchant_id', 'jazzcash_api_key'
            ];
            foreach ($sensitiveKeys as $key) {
                unset($configs[$key]);
            }
        }
        
        return response()->json($configs);
    }

    public function show($key)
    {
        $config = Configuration::where('key', $key)->first();
        return response()->json(['value' => $config?->value ?? null]);
    }

    public function update(Request $request)
    {
        if (auth()->user()?->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'key' => 'required|string',
            'value' => 'nullable|string',
        ]);

        $config = Configuration::updateOrCreate(
            ['key' => $validated['key']],
            ['value' => $validated['value']]
        );

        return response()->json($config);
    }

    public function uploadLogo(Request $request)
    {
        if (auth()->user()?->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate(['logo' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048']);

        if ($request->hasFile('logo')) {
            $path = $request->file('logo')->store('logos', 'public');
            Configuration::set('site_logo', $path);
            
            return response()->json([
                'message' => 'Logo uploaded successfully',
                'logo_path' => $path,
                'logo_url' => asset('storage/' . $path),
            ], 201);
        }

        return response()->json(['message' => 'No file uploaded'], 400);
    }

    public function getLogo()
    {
        $logoPath = Configuration::get('site_logo');
        return response()->json([
            'logo_path' => $logoPath,
            'logo_url' => $logoPath ? asset('storage/' . $logoPath) : null,
        ]);
    }
}
