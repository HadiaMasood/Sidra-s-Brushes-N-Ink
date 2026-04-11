<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CustomOrder;
use Illuminate\Http\Request;

class CustomOrderController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email',
            'phone' => 'required|string',
            'type' => 'required|string',
            'size' => 'required|string',
            'budget' => 'required|numeric|min:0',
            'description' => 'required|string|min:20',
            'reference_image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
        ]);

        // Remove reference_image from validated array — it's a file, not a scalar value
        unset($validated['reference_image']);

        $order = new CustomOrder($validated);

        if ($request->hasFile('reference_image')) {
            $path = $request->file('reference_image')->store('custom-orders', 'public');
            $order->reference_image = $path;
            \Log::info('Reference image saved', ['path' => $path]);
        } else {
            \Log::info('No reference image uploaded');
        }

        $order->save();
        return response()->json(['message' => 'Custom order request submitted', 'data' => $order], 201);
    }

    public function index()
    {
        $orders = CustomOrder::orderBy('created_at', 'desc')->paginate(20);
        return response()->json($orders);
    }

    public function show($id)
    {
        $order = CustomOrder::findOrFail($id);
        return response()->json($order);
    }

    public function updateStatus(Request $request, $id)
    {
        $order = CustomOrder::findOrFail($id);
        
        $validated = $request->validate([
            'status' => 'required|in:pending,reviewing,approved,rejected,completed',
        ]);

        $order->update($validated);
        return response()->json(['message' => 'Status updated', 'data' => $order]);
    }

    public function destroy($id)
    {
        CustomOrder::findOrFail($id)->delete();
        return response()->json(['message' => 'Custom order deleted']);
    }
}
