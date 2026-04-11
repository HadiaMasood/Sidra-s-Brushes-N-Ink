<?php

use App\Models\Artwork;
use App\Models\Order;
use App\Models\Review;
use App\Models\Category;

define('LARAVEL_START', microtime(true));

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "Resetting artwork views and sales...\n";
$affected = Artwork::query()->update(['views' => 0, 'sales' => 0]);
echo "Updated $affected artworks.\n";

echo "Resetting order counts (optional)?\n";
echo "Note: Orders are stored in the 'orders' table. If you want to keep them but remove from revenue, they must have a status other than 'completed' or 'delivered'.\n";

// Check current stats
$totalViews = Artwork::sum('views');
$totalSales = Artwork::sum('sales');
$totalRevenue = Order::whereIn('status', ['completed', 'delivered'])->sum('total');

echo "Current stats after reset:\n";
echo "Total Views: $totalViews\n";
echo "Total Sales: $totalSales\n";
echo "Total Revenue: $totalRevenue\n";

echo "\n--- Orders List ---\n";
$orders = Order::all();
foreach ($orders as $order) {
    echo "ID: {$order->id}, Name: {$order->customer_name}, Total: {$order->total}, Status: {$order->status}, Created: {$order->created_at}\n";
}

echo "\n--- Custom Orders List ---\n";
$customOrders = App\Models\CustomOrder::all();
foreach ($customOrders as $co) {
    echo "ID: {$co->id}, Name: {$co->name}, Budget: {$co->budget}, Status: {$co->status}\n";
}

echo "\nDone!\n";
