<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Artwork;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Http\Request;

class ArtworkController extends Controller
{
    public function index(Request $request)
    {
        $query = Artwork::with(['category', 'images']);

        // If client requests all results (admin panel), return all (including trashed)
        if ($request->query('all') === 'true') {
            $results = $query->withTrashed()->get();
            \Log::info('Returning all artworks (all=true)', ['count' => $results->count(), 'params' => $request->all()]);
            return response()->json($results);
        }

        // Optimized dropdown list (id/title/image_path for reviews)
        if ($request->query('dropdown') === 'true') {
            // Only return active items for dropdown
            $results = $query->where('active', true)->select('id', 'title', 'image_path')->orderBy('title')->get();
            return response()->json($results);
        }

        // Default public behavior: only active, non-deleted artworks
        $query->whereNull('deleted_at')->where('active', true);
        \Log::info('Public user - showing only active artworks', ['params' => $request->all()]);

        if ($request->has('category') && $request->category !== 'All') {
            $categoryValue = $request->category;
            
            // Support both category ID and category name/slug
            if (is_numeric($categoryValue)) {
                $query->where('category_id', $categoryValue);
            } else {
                $query->whereHas('category', function($q) use ($categoryValue) {
                    $q->where(function($sub) use ($categoryValue) {
                        $sub->whereRaw('LOWER(name) = ?', [strtolower($categoryValue)])
                            ->orWhereRaw('LOWER(slug) = ?', [strtolower($categoryValue)])
                            // Also try without slash if provided or with slash (robustness)
                            ->orWhereRaw('LOWER(REPLACE(name, "/", " ")) = ?', [strtolower(str_replace('/', ' ', $categoryValue))])
                            ->orWhereRaw('LOWER(REPLACE(name, " ", "")) = ?', [strtolower(str_replace(' ', '', $categoryValue))]);
                    });
                });
            }
        }

        if ($request->has('search') && !empty($request->search)) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('title', 'like', '%' . $search . '%')
                  ->orWhere('description', 'like', '%' . $search . '%');
            });
        }

        if ($request->has('featured') && $request->featured == 'true') {
            $query->where('featured', true);
        }

        // Sorting
        if ($request->has('sort')) {
            switch ($request->sort) {
                case 'price_low':
                    $query->orderBy('price', 'asc');
                    break;
                case 'price_high':
                    $query->orderBy('price', 'desc');
                    break;
                case 'popular':
                    $query->orderBy('views', 'desc');
                    break;
                case 'latest':
                default:
                    $query->orderBy('created_at', 'desc');
                    break;
            }
        } else {
            // Default sorting
            $query->orderBy('created_at', 'desc');
        }

        // Get limit from request (default 12, max 100)
        $limit = min((int) $request->query('limit', 12), 100);



        // If limit is specified and small (like for featured items), return simple array
        if ($request->has('limit') && $limit <= 20) {
            $results = $query->limit($limit)->get();
            \Log::info('Returning limited artworks', ['count' => $results->count(), 'limit' => $limit]);
            return response()->json($results);
        }

        // Default pagination for public gallery
        $results = $query->paginate($limit);
        \Log::info('Returning paginated artworks', [
            'total' => $results->total(),
            'per_page' => $results->perPage(),
            'current_page' => $results->currentPage()
        ]);
        
        return response()->json($results);
    }

    public function show($id)
    {
        try {
            $artwork = Artwork::with(['category', 'images'])->findOrFail($id);
            
            // Increment real views
            $artwork->increment('views');
            
            $reviews = $artwork->reviews()->where('approved', true)->get();
            
            return response()->json([
                'artwork' => $artwork,
                'reviews' => $reviews,
                'average_rating' => $reviews->avg('rating') ?? 0,
            ]);
        } catch (\Exception $e) {
            \Log::error('Error showing artwork ' . $id . ': ' . $e->getMessage());
            return response()->json(['message' => 'Error retrieving artwork'], 500);
        }
    }

    public function store(Request $request)
    {
        // Check if user is authenticated and admin
        $user = auth()->user();
        if (!$user || $user->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized - Admin access required'], 403);
        }

        try {
            \Log::info('Artwork store request', [
                'has_image' => $request->hasFile('image'),
                'has_images' => $request->hasFile('images'),
                'all_input' => $request->except(['image', 'images'])
            ]);

            // Validation logic for images
            $imagesToProcess = [];
            if ($request->hasFile('images')) {
                $imagesToProcess = $request->file('images');
                \Log::info('Processing multiple images in store', ['count' => count($imagesToProcess)]);
                foreach ($imagesToProcess as $idx => $img) {
                    \Log::info("Store Image $idx details", [
                        'name' => $img->getClientOriginalName(),
                        'size' => $img->getSize(),
                        'mime' => $img->getMimeType(),
                        'valid' => $img->isValid(),
                        'error' => $img->getError()
                    ]);
                }
            } elseif ($request->hasFile('image')) {
                $imagesToProcess[] = $request->file('image');
                \Log::info('Processing single image in store');
            }

            if (empty($imagesToProcess)) {
                return response()->json([
                    'message' => 'Validation failed',
                    'errors' => ['image' => ['At least one image is required']]
                ], 422);
            }

            // Validate extensions
            $validExtensions = ['jpeg', 'jpg', 'png', 'gif', 'webp'];
            foreach ($imagesToProcess as $img) {
                $ext = strtolower($img->getClientOriginalExtension());
                if (!in_array($ext, $validExtensions)) {
                    return response()->json([
                        'message' => 'Validation failed',
                        'errors' => ['image' => ['All images must be of type: jpeg, png, jpg, gif, webp']]
                    ], 422);
                }
            }

            $validated = $request->validate([
                'title' => 'required|string|max:255',
                'description' => 'required|string',
                'price' => 'required|numeric|min:0',
                'frame_price' => 'nullable|numeric|min:0',
                'framed_price' => 'nullable|numeric|min:0',
                'category_id' => 'nullable|exists:categories,id',
                'dimensions' => 'nullable|string',
                'medium' => 'nullable|string',
                'artist' => 'nullable|string',
                'year_created' => 'nullable|integer',
                'stock_quantity' => 'nullable|integer|min:0',
                'featured' => 'nullable|boolean',
                'active' => 'nullable|boolean',
            ]);

            // Handle Category
            if ($request->has('category') && !empty($request->category)) {
                $categoryName = trim($request->category);
                $category = \App\Models\Category::firstOrCreate(
                    ['name' => $categoryName],
                    ['slug' => \Illuminate\Support\Str::slug($categoryName)]
                );
                $validated['category_id'] = $category->id;
            }

            // Process first image for main record
            $mainImage = $imagesToProcess[0];
            $mainPath = $mainImage->store('artworks', 'public');
            $validated['image_path'] = $mainPath;

            // Create artwork
            $artwork = Artwork::create($validated);
            
            // Create Image records for ALL uploaded images
            foreach ($imagesToProcess as $index => $file) {
                if ($index === 0) {
                    $path = $mainPath;
                } else {
                    $path = $file->store('artworks', 'public');
                }

                $artwork->images()->create([
                    'image_path' => $path,
                    'is_primary' => ($index === 0),
                    'order' => $index,
                    'alt_text' => $validated['title'] . ($index > 0 ? ' - View ' . ($index + 1) : '')
                ]);
            }
            
            // Refresh
            $artwork = $artwork->fresh(['category', 'images']);
            
            $artworkData = $artwork->toArray();
            $artworkData['image_url'] = $artwork->image_url;

            return response()->json([
                'message' => 'Artwork created successfully',
                'data' => $artworkData
            ], 201);
            
        } catch (\Illuminate\Validation\ValidationException $e) {
            \Log::error('Validation error:', $e->errors());
            return response()->json(['message' => 'Validation failed', 'errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            \Log::error('Error creating artwork: ' . $e->getMessage());
            return response()->json(['message' => 'Failed to create artwork', 'error' => $e->getMessage()], 500);
        }
    }

    public function update(Request $request, $id)
    {
        \Log::info('=== UPDATE ARTWORK START ===', [
            'id' => $id,
            'method' => $request->method(),
            'content_type' => $request->header('Content-Type'),
            'has_image' => $request->hasFile('image'),
            'all_files' => array_keys($request->allFiles()),
            'all_input_keys' => array_keys($request->all()),
            'all_input' => $request->all(),
            '_method' => $request->input('_method'),
        ]);

        // Check if user is authenticated
        if (!auth()->check()) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }
        
        // Check if user is admin
        $user = auth()->user();
        if ($user->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized - Admin access required'], 403);
        }
        
        try {
            // For PUT requests with FormData, we need to get the data properly
            // Laravel may not populate $request->all() correctly for FormData in PUT
            $input = $request->all();
            
            \Log::info('Update artwork request', [
                'id' => $id,
                'all_input' => $input,
                'has_image' => $request->hasFile('image'),
                'input_count' => count($input),
            ]);

            $artwork = Artwork::findOrFail($id);

            // Validate image if provided
            if ($request->hasFile('image')) {
                $image = $request->file('image');
                $validExtensions = ['jpeg', 'jpg', 'png', 'gif', 'webp'];
                $extension = strtolower($image->getClientOriginalExtension());
                
                if (!in_array($extension, $validExtensions)) {
                    return response()->json([
                        'message' => 'Validation failed',
                        'errors' => ['image' => ['The image must be a file of type: jpeg, png, jpg, gif, webp']]
                    ], 422);
                }
            }
            
            // Validate images array if provided
            if ($request->hasFile('images')) {
                $images = $request->file('images');
                $validExtensions = ['jpeg', 'jpg', 'png', 'gif', 'webp'];
                
                foreach ($images as $index => $image) {
                    $extension = strtolower($image->getClientOriginalExtension());
                    if (!in_array($extension, $validExtensions)) {
                        return response()->json([
                            'message' => 'Validation failed',
                            'errors' => ["images.$index" => ['All images must be of type: jpeg, png, jpg, gif, webp']]
                        ], 422);
                    }
                }
            }

            $validated = $request->validate([
                'title' => 'nullable|string|max:255',
                'description' => 'nullable|string',
                'price' => 'nullable|numeric|min:0',
                'frame_price' => 'nullable|numeric|min:0',
                'framed_price' => 'nullable|numeric|min:0',
                'category_id' => 'nullable|exists:categories,id',
                'dimensions' => 'nullable|string',
                'medium' => 'nullable|string',
                'artist' => 'nullable|string',
                'year_created' => 'nullable|integer',
                'stock_quantity' => 'nullable|integer|min:0',
                'featured' => 'nullable|boolean',
                'active' => 'nullable|boolean',
            ]);

            $imagesToProcess = [];
            if ($request->hasFile('images')) {
                $imagesToProcess = $request->file('images');
                \Log::info('Processing multiple images in update', ['count' => count($imagesToProcess)]);
                foreach ($imagesToProcess as $idx => $img) {
                    \Log::info("Update Image $idx details", [
                        'name' => $img->getClientOriginalName(),
                        'size' => $img->getSize(),
                        'mime' => $img->getMimeType(),
                        'valid' => $img->isValid(),
                        'error' => $img->getError()
                    ]);
                }
            } elseif ($request->hasFile('image')) {
                $imagesToProcess[] = $request->file('image');
                \Log::info('Processing single image in update');
            }

            if (!empty($imagesToProcess)) {
                // If main image needs updating (for first file encountered)
                // We'll update the main record with the first new image
                // logic: replace main image with first new one? Or just add all?
                // Let's assume appending, but if one is singled out, update main.
                // Simplified: If images uploaded, add them. 
                // If main image_path is empty/broken, set it.
                
                // Process each image
                foreach ($imagesToProcess as $index => $file) {
                    $path = $file->store('artworks', 'public');
                    
                    // If it's the first image being added and current main image is missing/placeholder
                    // Update the main image path
                    if ($index === 0 && (!$artwork->image_path || strpos($artwork->image_path, 'placeholder') !== false)) {
                        $validated['image_path'] = $path;
                    } 
                    // Or if we specifically sent a single 'image' field (legacy update), replace main
                    elseif ($request->hasFile('image') && empty($request->file('images'))) {
                         // Delete old
                         if ($artwork->image_path && !filter_var($artwork->image_path, FILTER_VALIDATE_URL)) {
                            $oldPath = storage_path('app/public/' . $artwork->image_path);
                            if (file_exists($oldPath)) @unlink($oldPath);
                         }
                         $validated['image_path'] = $path;
                         
                         // Update primary image record too if exists
                         $primaryImg = $artwork->images()->where('is_primary', true)->first();
                         if ($primaryImg) {
                             $primaryImg->update(['image_path' => $path]);
                         } else {
                             // Create
                             $artwork->images()->create(['image_path' => $path, 'is_primary' => true, 'order' => 0]);
                         }
                    }

                    // Always create a new Image record for appended images (multi-upload)
                    if ($request->hasFile('images')) {
                        $maxOrder = $artwork->images()->max('order') ?? 0;
                        $artwork->images()->create([
                            'image_path' => $path,
                            'is_primary' => false,
                            'order' => $maxOrder + 1 + $index,
                             'alt_text' => $artwork->title . ' - View ' . ($maxOrder + 2 + $index)
                        ]);
                    }
                }
                
                \Log::info('Added ' . count($imagesToProcess) . ' new images');
            }

            // Convert string values to boolean if needed
            if (isset($validated['active'])) {
                $validated['active'] = filter_var($validated['active'], FILTER_VALIDATE_BOOLEAN);
            }
            
            if (isset($validated['featured'])) {
                $validated['featured'] = filter_var($validated['featured'], FILTER_VALIDATE_BOOLEAN);
            }

            // Handle Category assignment (find or create)
            if ($request->has('category') && !empty($request->category)) {
                $categoryName = trim($request->category);
                $category = \App\Models\Category::firstOrCreate(
                    ['name' => $categoryName],
                    ['slug' => \Illuminate\Support\Str::slug($categoryName)]
                );
                $validated['category_id'] = $category->id;
            }

            // Build update array - include validated fields
            $toUpdate = [];
            foreach ($validated as $key => $value) {
                // For image_path, always include if provided
                if ($key === 'image_path' && !empty($value)) {
                    $toUpdate[$key] = $value;
                    continue;
                }
                
                // Allow clearing price fields (if empty string, set to 0)
                if (in_array($key, ['framed_price', 'frame_price']) && $request->has($key) && ($value === '' || $value === null)) {
                    $toUpdate[$key] = 0;
                    continue;
                }

                // For other fields, skip empty strings but allow 0 or false
                if ($value !== null && $value !== '') {
                    $toUpdate[$key] = $value;
                }
            }
            
            \Log::info('Updating artwork model', [
                'id' => $id,
                'before' => $artwork->only(array_keys($toUpdate)),
                'after_values' => $toUpdate
            ]);
            
            if (!empty($toUpdate)) {
                $artwork->update($toUpdate);
                // Force save to ensure it hits DB
                $artwork->save();
                // Touch updated_at to force timestamp change
                $artwork->touch();
                \Log::info('Artwork updated successfully', ['id' => $id, 'updated_fields' => array_keys($toUpdate)]);
            } else {
                \Log::warning('No fields to update for artwork', ['id' => $id, 'validated' => $validated]);
            }
            
            // Refresh the model to get updated data and load relationships
            $artwork = $artwork->fresh(['category', 'images']);
            
            // Ensure image_url is included in response
            $responseData = $artwork->toArray();
            $responseData['image_url'] = $artwork->image_url;
            
            // Log the response for debugging
            \Log::info('Returning updated artwork', [
                'id' => $artwork->id,
                'image_path' => $artwork->image_path,
                'image_url' => $artwork->image_url,
                'updated_at' => $artwork->updated_at,
                'app_url' => config('app.url')
            ]);
            
            return response()->json([
                'success' => true,
                'message' => 'Artwork updated successfully',
                'data' => $responseData
            ]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json(['message' => 'Artwork not found'], 404);
        } catch (\Illuminate\Validation\ValidationException $e) {
            \Log::error('Validation error:', $e->errors());
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            \Log::error('Error updating artwork: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to update artwork',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function destroy($id)
    {
        \Log::info('Delete artwork called', [
            'id' => $id,
            'auth_check' => auth()->check(),
            'user_role' => auth()->user()?->role ?? 'not_authenticated'
        ]);
        
        // Check if user is authenticated
        if (!auth()->check()) {
            \Log::warning('Delete artwork: User not authenticated');
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        // Check if user is admin
        $user = auth()->user();
        if ($user->role !== 'admin') {
            \Log::warning('Delete artwork: User is not admin', ['role' => $user->role]);
            return response()->json(['message' => 'Unauthorized - Admin access required'], 403);
        }

        try {
            // Find the artwork (including soft deleted)
            $artwork = Artwork::withTrashed()->findOrFail($id);
            \Log::info('Found artwork to delete', ['artwork_id' => $artwork->id]);

            // Permanently delete the artwork
            $artwork->forceDelete();
            \Log::info('Artwork permanently deleted', ['artwork_id' => $id]);

            return response()->json(['message' => 'Artwork deleted successfully', 'data' => ['id' => $id]], 200);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            \Log::error('Artwork not found for delete', ['id' => $id]);
            return response()->json(['message' => 'Artwork not found'], 404);

        } catch (\Exception $e) {
            \Log::error('Error deleting artwork: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to delete artwork',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
