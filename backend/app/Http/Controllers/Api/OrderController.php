<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Artwork;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        if (auth()->user()?->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $orders = Order::with('items.artwork', 'payment')->latest()->paginate(20);
        return response()->json($orders);
    }

    public function show($id)
    {
        $order = Order::with('items.artwork', 'payment')->findOrFail($id);
        return response()->json($order);
    }

    public function store(Request $request)
    {
        // Decode items if sent as JSON string (common in FormData submissions)
        if (is_string($request->input('items'))) {
            $decodedItems = json_decode($request->input('items'), true);
            if (json_last_error() === JSON_ERROR_NONE) {
                $request->merge(['items' => $decodedItems]);
            }
        }

        try {
            $validated = $request->validate([
                'customer_name' => 'required|string|max:255',
                'customer_email' => 'required|email',
                'customer_phone' => 'required|string|max:20',
                'customer_address' => 'nullable|string',
                'customer_city' => 'nullable|string',
                'customer_country' => 'nullable|string',
                'payment_method' => 'nullable|string',
                'notes' => 'nullable|string',
                'items' => 'required|array|min:1',
                'items.*.artwork_id' => 'required|exists:artworks,id',
                'items.*.quantity' => 'required|integer|min:1',
                'receipt' => 'nullable|file|mimes:jpeg,png,jpg|max:5120', // New: Payment receipt
            ]);

            $totalAmount = 0;
            $orderItems = [];

            foreach ($validated['items'] as $item) {
                $artwork = Artwork::findOrFail($item['artwork_id']);
                $subtotal = $artwork->price * $item['quantity'];
                $totalAmount += $subtotal;
                $orderItems[] = [
                    'artwork_id' => $item['artwork_id'],
                    'quantity' => $item['quantity'],
                    'unit_price' => $artwork->price,
                    'subtotal' => $subtotal,
                ];
            }

            $order = Order::create([
                'order_number' => 'ORD-' . date('YmdHis') . '-' . rand(1000, 9999), // Added random to avoid collision
                'customer_name' => $validated['customer_name'],
                'customer_email' => $validated['customer_email'],
                'customer_phone' => $validated['customer_phone'],
                'customer_address' => $validated['customer_address'] ?? null,
                'customer_city' => $validated['customer_city'] ?? null,
                'customer_country' => $validated['customer_country'] ?? null,
                'payment_method' => $validated['payment_method'] ?? 'cod',
                'notes' => $validated['notes'] ?? null,
                'total' => $totalAmount,
            ]);

            foreach ($orderItems as $item) {
                OrderItem::create(array_merge($item, ['order_id' => $order->id]));
            }

            // Handle Bank Transfer Receipt
            if ($validated['payment_method'] === 'bank_transfer' || $request->hasFile('receipt')) {
                $receiptPath = null;
                if ($request->hasFile('receipt')) {
                    $receiptPath = $request->file('receipt')->store('receipts', 'public');
                }

                \App\Models\Payment::create([
                    'order_id' => $order->id,
                    'transaction_id' => 'BNK-' . strtoupper(uniqid()),
                    'gateway' => 'manual',
                    'amount' => $order->total,
                    'status' => 'pending',
                    'receipt_path' => $receiptPath,
                ]);
            }

            return response()->json($order->load('items', 'payment'), 201);
        } catch (\Exception $e) {
            \Log::error('Order creation failed: ' . $e->getMessage(), ['trace' => $e->getTraceAsString()]);
            return response()->json(['message' => 'Checkout failed: ' . $e->getMessage()], 500);
        }
    }

    public function updateStatus(Request $request, $id)
    {
        if (auth()->user()?->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $order = Order::findOrFail($id);
        $oldStatus = $order->status;
        $newStatus = $request->input('status');

        $order->update(['status' => $newStatus]);
        
        // If order is newly completed/delivered, increment sales for all items
        $completedStatuses = ['completed', 'delivered'];
        if (in_array($newStatus, $completedStatuses) && !in_array($oldStatus, $completedStatuses)) {
            foreach ($order->items as $item) {
                if ($item->artwork) {
                    $item->artwork->increment('sales', $item->quantity);
                }
            }
        }
        
        return response()->json($order);
    }
}
