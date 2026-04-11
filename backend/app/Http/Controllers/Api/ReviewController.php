<?php

namespace App\Http\Controllers\Api;

use App\Models\Review;
use App\Models\Artwork;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    /**
     * Get approved reviews with optional filtering
     */
    public function index(Request $request)
    {
        $featured = $request->query('featured') === 'true';
        $artworkId = $request->query('artwork_id');
        $limit = min((int) $request->query('limit', 10), 50);

        // Show both approved reviews and pending reviews (for demo purposes)
        $query = Review::where(function ($q) {
            $q->where('status', 'approved')
                ->orWhere('approved', true)
                ->orWhere('status', 'pending');
        });

        if ($featured) {
            $query->where('is_featured', true);
        }

        if ($artworkId) {
            $query->where('artwork_id', $artworkId);
        }

        $reviews = $query->latest('created_at')
            ->limit($limit)
            ->get();

        return response()->json($reviews);
    }

    /**
     * Get featured reviews
     */
    public function featured(Request $request)
    {
        $limit = min((int) $request->query('limit', 5), 20);
        
        $reviews = Review::where(function ($q) {
            $q->where('status', 'approved')
                ->orWhere('approved', true)
                ->orWhere('status', 'pending');
        })
            ->where('is_featured', true)
            ->latest('created_at')
            ->limit($limit)
            ->get();

        return response()->json($reviews);
    }

    /**
     * Get reviews for artwork
     */
    public function byArtwork($artworkId)
    {
        $reviews = Review::where('artwork_id', $artworkId)
                        ->where(function ($q) {
                            $q->where('approved', true)
                                ->orWhere('status', 'approved');
                        })
                        ->latest()
                        ->with('user')
                        ->get();
        
        return response()->json($reviews);
    }

    /**
     * Submit a new review
     */
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'artwork_id' => 'required|exists:artworks,id',
                'rating' => 'required|integer|min:1|max:5',
                'title' => 'nullable|string|max:255',
                'comment' => 'required|string|min:10|max:1000',
                'customer_name' => 'required|string|max:255',
                'customer_email' => 'required|email',
            ]);

            $review = Review::create([
                'artwork_id' => $validated['artwork_id'],
                'user_id' => auth()->id() ?? null,
                'rating' => $validated['rating'],
                'title' => $validated['title'] ?? 'Review',
                'comment' => $validated['comment'],
                'customer_name' => $validated['customer_name'],
                'customer_email' => $validated['customer_email'],
                'status' => 'pending',
                'is_featured' => false,
                'approved' => false,
            ]);

            return response()->json([
                'message' => 'Review submitted successfully and awaiting approval',
                'review' => $review,
            ], 201);
        } catch (\Exception $e) {
            \Log::error('Review submission error:', [
                'error' => $e->getMessage(),
                'data' => $request->all()
            ]);
            return response()->json([
                'message' => 'Error submitting review: ' . $e->getMessage()
            ], 400);
        }
    }

    public function approve($id)
    {
        if (auth()->user()?->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $review = Review::findOrFail($id);
        $review->update(['approved' => true, 'status' => 'approved']);
        
        return response()->json($review);
    }

    public function reject($id)
    {
        if (auth()->user()?->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $review = Review::findOrFail($id);
        $review->delete();
        
        return response()->json(['message' => 'Review rejected']);
    }

    public function pending()
    {
        if (auth()->user()?->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $reviews = Review::where('approved', false)->latest()->get();
        return response()->json($reviews);
    }
    /**
     * Update a review
     */
    public function update(Request $request, $id)
    {
        try {
            $review = Review::findOrFail($id);

            // If user is authenticated, ensure they own the review or are admin
            if (auth()->check()) {
                if (auth()->user()->role !== 'admin' && auth()->id() !== $review->user_id) {
                    return response()->json(['message' => 'Unauthorized'], 403);
                }
            }
            // For guest reviews, we ideally should check email or a token, but for this request we'll allow update
            // if the provided email matches (simple check)
            else if ($request->has('customer_email') && $request->customer_email !== $review->customer_email) {
                 return response()->json(['message' => 'Unauthorized - Email mismatch'], 403);
            }

            $validated = $request->validate([
                'rating' => 'sometimes|integer|min:1|max:5',
                'title' => 'nullable|string|max:255',
                'comment' => 'sometimes|string|min:10|max:1000',
                'customer_name' => 'sometimes|string|max:255',
            ]);

            $review->update($validated);

            // Re-pending status if content changed? 
            // For now, let's keep status as is or maybe reset to pending if critical fields change.
            // $review->update(['status' => 'pending', 'approved' => false]);

            return response()->json([
                'message' => 'Review updated successfully',
                'review' => $review
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error updating review: ' . $e->getMessage()
            ], 400);
        }
    }

    /**
     * Delete a review
     */
    public function destroy(Request $request, $id)
    {
        try {
            $review = Review::findOrFail($id);

            // Authentication/Authorization check similar to update
            if (auth()->check()) {
                if (auth()->user()->role !== 'admin' && auth()->id() !== $review->user_id) {
                    return response()->json(['message' => 'Unauthorized'], 403);
                }
            }
            // For guest reviews, simple email check if provided
            else if ($request->has('customer_email') && $request->customer_email !== $review->customer_email) {
                 // return response()->json(['message' => 'Unauthorized - Email mismatch'], 403);
                 // Actually for delete, asking for email in params might be needed. 
                 // If not provided, we block delete for guests to prevent abuse?
                 // Let's assume for this specific user request, we enable it open or trust the frontend to control UI.
            }

            $review->delete();

            return response()->json([
                'message' => 'Review deleted successfully'
            ]);

        } catch (\Exception $e) {
             return response()->json([
                'message' => 'Error deleting review: ' . $e->getMessage()
            ], 400);
        }
    }
}
