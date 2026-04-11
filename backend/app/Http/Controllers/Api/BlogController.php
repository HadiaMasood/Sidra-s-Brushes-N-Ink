<?php

namespace App\Http\Controllers\Api;

use App\Models\BlogPost;
use Illuminate\Http\Request;

class BlogController extends Controller
{
    /**
     * Get all published blog posts
     */
    public function index(Request $request)
    {
        $query = BlogPost::published();

        // Filter by category
        if ($request->has('category') && $request->category !== 'all') {
            $query->byCategory($request->category);
        }

        // Search
        if ($request->has('search')) {
            $search = $request->search;
            $query->where('title', 'like', "%{$search}%")
                  ->orWhere('excerpt', 'like', "%{$search}%");
        }

        // Sort
        $sortBy = $request->get('sort_by', 'latest');
        switch ($sortBy) {
            case 'oldest':
                $query->orderBy('published_at', 'asc');
                break;
            case 'popular':
                $query->orderBy('views', 'desc');
                break;
            case 'latest':
            default:
                $query->orderBy('published_at', 'desc');
        }

        $posts = $query->paginate(12);

        return response()->json([
            'data' => $posts->items(),
            'meta' => [
                'current_page' => $posts->currentPage(),
                'last_page' => $posts->lastPage(),
                'total' => $posts->total(),
            ],
        ]);
    }

    /**
     * Get single blog post by slug
     */
    public function show($slug)
    {
        $post = BlogPost::where('slug', $slug)->published()->firstOrFail();

        return response()->json([
            'data' => $post,
        ]);
    }

    /**
     * Create blog post (Admin only)
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'slug' => 'required|string|unique:blog_posts',
            'content' => 'required|string',
            'excerpt' => 'required|string|max:500',
            'category' => 'required|string',
            'author' => 'required|string',
            'featured_image' => 'nullable|image|max:2048',
            'read_time' => 'nullable|string',
            'is_published' => 'boolean',
        ]);

        if ($request->hasFile('featured_image')) {
            $path = $request->file('featured_image')->store('blog', 'public');
            $validated['featured_image'] = $path;
        }

        if ($validated['is_published'] ?? false) {
            $validated['published_at'] = now();
        }

        $post = BlogPost::create($validated);

        return response()->json([
            'message' => 'Blog post created successfully',
            'data' => $post,
        ], 201);
    }

    /**
     * Update blog post (Admin only)
     */
    public function update(Request $request, BlogPost $post)
    {
        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'slug' => 'sometimes|string|unique:blog_posts,slug,' . $post->id,
            'content' => 'sometimes|string',
            'excerpt' => 'sometimes|string|max:500',
            'category' => 'sometimes|string',
            'author' => 'sometimes|string',
            'featured_image' => 'nullable|image|max:2048',
            'read_time' => 'nullable|string',
            'is_published' => 'boolean',
        ]);

        if ($request->hasFile('featured_image')) {
            $path = $request->file('featured_image')->store('blog', 'public');
            $validated['featured_image'] = $path;
        }

        if (isset($validated['is_published']) && $validated['is_published'] && !$post->published_at) {
            $validated['published_at'] = now();
        }

        $post->update($validated);

        return response()->json([
            'message' => 'Blog post updated successfully',
            'data' => $post,
        ]);
    }

    /**
     * Delete blog post (Admin only)
     */
    public function destroy(BlogPost $post)
    {
        $post->delete();

        return response()->json([
            'message' => 'Blog post deleted successfully',
        ]);
    }

    /**
     * Get blog categories
     */
    public function categories()
    {
        $categories = BlogPost::published()
            ->distinct()
            ->pluck('category');

        return response()->json([
            'data' => $categories,
        ]);
    }
}
