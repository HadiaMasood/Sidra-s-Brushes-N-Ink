<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Artwork;
use App\Models\Order;
use App\Models\Review;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AnalyticsController extends Controller
{
    public function dashboard()
    {
        try {
            // Use simpler queries without eager loading for faster response
            $revenue = Order::whereIn('status', ['completed', 'delivered'])
                ->sum('total');
            
            // Add completed custom orders to revenue
            $customRevenue = \App\Models\CustomOrder::where('status', 'completed')
                ->sum('budget');
            
            $revenue += $customRevenue;

            $orders_count = Order::count();
            
            $artworks_count = Artwork::count();
            
            $reviews_count = Review::count();

            $customers_count = \App\Models\User::where('role', 'customer')->count();
            
            $pending_orders = Order::where('status', 'pending')->count();

            // Artwork specific stats
            $avg_price = Artwork::avg('price') ?? 0;
            $highest_price = Artwork::max('price') ?? 0;
            $total_sales = Artwork::sum('sales') ?? 0;
            $total_views = Artwork::sum('views') ?? 0;

            $stats = [
                'total_revenue' => (float)$revenue,
                'total_orders' => $orders_count,
                'total_artworks' => $artworks_count,
                'total_customers' => $customers_count,
                'pending_orders' => $pending_orders,
                'pending_reviews' => Review::where('approved', false)->count(),
                'avg_artwork_price' => (float)$avg_price,
                'highest_price_item' => (float)$highest_price,
            ];

            return response()->json($stats);
        } catch (\Exception $e) {
            \Log::error('Dashboard stats error: ' . $e->getMessage());
            return response()->json([
                'total_revenue' => 0,
                'total_orders' => 0,
                'total_artworks' => 0,
                'total_customers' => 0,
                'pending_orders' => 0,
                'pending_reviews' => 0,
            ]);
        }
    }

    public function revenue(Request $request)
    {
        $period = $request->query('period', 'monthly');
        
        $query = Order::whereIn('status', ['completed', 'delivered']);

        if ($period === 'daily') {
            $data = $query->whereDate('created_at', now()->toDateString())
                ->selectRaw('DATE(created_at) as date, SUM(total) as total')
                ->groupBy('date')
                ->get();
        } else if ($period === 'weekly') {
            $data = $query->whereBetween('created_at', [now()->startOfWeek(), now()->endOfWeek()])
                ->selectRaw('WEEK(created_at) as week, SUM(total) as total')
                ->groupBy('week')
                ->get();
        } else if ($period === 'yearly') {
            $data = $query->whereYear('created_at', now()->year)
                ->selectRaw('MONTH(created_at) as month, SUM(total) as total')
                ->groupBy('month')
                ->get();
        } else {
            $data = $query->whereMonth('created_at', now()->month)
                ->selectRaw('DATE(created_at) as date, SUM(total) as total')
                ->groupBy('date')
                ->get();
        }

        return response()->json(['data' => $data]);
    }

    public function orders()
    {
        $stats = [
            'total' => Order::count(),
            'pending' => Order::where('status', 'pending')->count(),
            'processing' => Order::where('status', 'processing')->count(),
            'shipped' => Order::where('status', 'shipped')->count(),
            'delivered' => Order::where('status', 'delivered')->count(),
            'total_revenue' => Order::whereIn('status', ['completed', 'delivered'])->sum('total'),
        ];

        return response()->json($stats);
    }

    public function artworks()
    {
        $stats = [
            'total' => Artwork::count(),
            'total_sales' => Artwork::sum('sales'),
            'total_views' => Artwork::sum('views'),
            'avg_price' => Artwork::avg('price'),
            'highest_price' => Artwork::max('price'),
            'lowest_price' => Artwork::min('price'),
        ];

        return response()->json($stats);
    }

    public function reviews()
    {
        $stats = [
            'total' => Review::count(),
            'approved' => Review::where('approved', true)->count(),
            'pending' => Review::where('approved', false)->count(),
            'avg_rating' => Review::avg('rating'),
        ];

        return response()->json($stats);
    }
    public function export(Request $request)
    {
        // No need for manual auth check - route is already protected by auth:sanctum middleware
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="sidra_ink_report.csv"',
            'Cache-Control' => 'no-cache, no-store, must-revalidate',
            'Pragma' => 'no-cache',
            'Expires' => '0',
        ];

        $callback = function () {
            $file = fopen('php://output', 'w');

            // 1. Summary Section
            fputcsv($file, ['-- SUMMARY REPORT --']);
            fputcsv($file, ['Generated At', now()->toDateTimeString()]);
            fputcsv($file, []);

            $revenue = Order::whereIn('status', ['completed', 'delivered'])->sum('total');
            $ordersCount = Order::count();
            $artworksCount = Artwork::count();
            
            fputcsv($file, ['Total Revenue', 'Rs. ' . number_format($revenue, 2)]);
            fputcsv($file, ['Total Orders', $ordersCount]);
            fputcsv($file, ['Total Artworks', $artworksCount]);
            fputcsv($file, []);
            fputcsv($file, []);

            // 2. Orders Section
            fputcsv($file, ['-- RECENT ORDERS (Last 100) --']);
            fputcsv($file, ['Order ID', 'Customer', 'Email', 'Amount', 'Status', 'Date']);
            
            // Use get() instead of chunk() for limit queries to be safe
            $orders = Order::latest()->limit(100)->get();
            foreach ($orders as $order) {
                fputcsv($file, [
                    $order->id,
                    $order->customer_name,
                    $order->customer_email,
                    'Rs. ' . number_format($order->total ?? 0, 2),
                    $order->status,
                    $order->created_at->format('Y-m-d H:i:s')
                ]);
            }
            
            fputcsv($file, []);
            fputcsv($file, []);

            // 3. Artworks Inventory
            fputcsv($file, ['-- ARTWORK INVENTORY --']);
            fputcsv($file, ['ID', 'Title', 'Price', 'Stock', 'Status']);
            
            Artwork::chunk(100, function ($artworks) use ($file) {
                foreach ($artworks as $artwork) {
                    fputcsv($file, [
                        $artwork->id,
                        $artwork->title,
                        'Rs. ' . number_format($artwork->price, 2),
                        $artwork->stock_quantity,
                        $artwork->deleted_at ? 'Deleted' : 'Active'
                    ]);
                }
            });

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}
