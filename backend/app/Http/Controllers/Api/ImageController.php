<?php

namespace App\Http\Controllers\Api;

use App\Models\Image;
use App\Models\Artwork;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ImageController extends Controller
{
    /**
     * Get all images for an artwork
     */
    public function index($artworkId)
    {
        $artwork = Artwork::findOrFail($artworkId);
        $images = $artwork->images()->get();
        
        return response()->json([
            'success' => true,
            'data' => $images,
        ]);
    }

    /**
     * Get a single image
     */
    public function show($artworkId, $imageId)
    {
        $artwork = Artwork::findOrFail($artworkId);
        $image = $artwork->images()->findOrFail($imageId);
        
        return response()->json([
            'success' => true,
            'data' => $image,
        ]);
    }

    /**
     * Upload a new image for an artwork
     */
    /**
     * Upload new images for an artwork
     */
    public function store(Request $request, $artworkId)
    {
        $artwork = Artwork::findOrFail($artworkId);

        $request->validate([
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
            'images' => 'nullable|array',
            'images.*' => 'image|mimes:jpeg,png,jpg,gif,webp|max:5120',
            'alt_text' => 'nullable|string|max:255',
            'is_primary' => 'nullable|boolean',
        ]);

        if (!$request->hasFile('image') && !$request->hasFile('images')) {
             return response()->json([
                'success' => false,
                'message' => 'No images provided',
            ], 422);
        }

        try {
            $uploadedImages = [];
            $files = [];

            // Handle single file (legacy)
            if ($request->hasFile('image')) {
                $files[] = $request->file('image');
            }

            // Handle multiple files
            if ($request->hasFile('images')) {
                foreach($request->file('images') as $file) {
                    $files[] = $file;
                }
            }

            // If setting as primary, unset other primary images
            if ($request->boolean('is_primary')) {
                $artwork->images()->update(['is_primary' => false]);
            }

            foreach ($files as $index => $file) {
                // Upload image
                $path = $file->store('artworks', 'public');

                // Get next order number
                $nextOrder = $artwork->images()->max('order') + 1 ?? 1;

                // Create image record
                $image = $artwork->images()->create([
                    'image_path' => $path,
                    'alt_text' => $request->input('alt_text', $artwork->title),
                    // Only the first one can be primary if multiple are uploaded and check is true
                    // unlikely to happen in bulk upload but good for safety
                    'is_primary' => $request->boolean('is_primary', false) && empty($uploadedImages), 
                    'order' => $nextOrder,
                ]);
                
                $uploadedImages[] = $image;
            }

            return response()->json([
                'success' => true,
                'message' => count($uploadedImages) . ' image(s) uploaded successfully',
                'data' => count($uploadedImages) === 1 ? $uploadedImages[0] : $uploadedImages,
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to upload image: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update image details
     */
    public function update(Request $request, $artworkId, $imageId)
    {
        $artwork = Artwork::findOrFail($artworkId);
        $image = $artwork->images()->findOrFail($imageId);

        $request->validate([
            'alt_text' => 'nullable|string|max:255',
            'is_primary' => 'nullable|boolean',
            'order' => 'nullable|integer|min:1',
        ]);

        try {
            // If setting as primary, unset other primary images
            if ($request->boolean('is_primary')) {
                $artwork->images()->where('id', '!=', $imageId)->update(['is_primary' => false]);
            }

            $image->update($request->only(['alt_text', 'is_primary', 'order']));

            return response()->json([
                'success' => true,
                'message' => 'Image updated successfully',
                'data' => $image,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update image: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Delete an image
     */
    public function destroy($artworkId, $imageId)
    {
        $artwork = Artwork::findOrFail($artworkId);
        $image = $artwork->images()->findOrFail($imageId);

        try {
            // Delete file from storage
            if (Storage::disk('public')->exists($image->image_path)) {
                Storage::disk('public')->delete($image->image_path);
            }

            $image->delete();

            return response()->json([
                'success' => true,
                'message' => 'Image deleted successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete image: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Reorder images
     */
    public function reorder(Request $request, $artworkId)
    {
        $artwork = Artwork::findOrFail($artworkId);

        $request->validate([
            'images' => 'required|array',
            'images.*.id' => 'required|integer',
            'images.*.order' => 'required|integer|min:1',
        ]);

        try {
            foreach ($request->input('images') as $imageData) {
                $image = $artwork->images()->findOrFail($imageData['id']);
                $image->update(['order' => $imageData['order']]);
            }

            return response()->json([
                'success' => true,
                'message' => 'Images reordered successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to reorder images: ' . $e->getMessage(),
            ], 500);
        }
    }
}
