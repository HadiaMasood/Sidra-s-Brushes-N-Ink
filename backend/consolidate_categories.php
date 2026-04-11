<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Category;
use App\Models\Artwork;
use Illuminate\Support\Facades\DB;

echo "--- CONSOLIDATING CATEGORIES ---\n";

$targetCategory = Category::where('name', 'Cute Aesthetic Cartoon Characters')->first();
$sourceCategory = Category::where('name', 'Mini Canvases')->first();

if (!$targetCategory) {
    echo "ERROR: Target category 'Cute Aesthetic Cartoon Characters' not found!\n";
    exit(1);
}

if (!$sourceCategory) {
    echo "NOTE: Source category 'Mini Canvases' not found. Checking for artworks with other mismatched names...\n";
    // Check for any other possible mismatches like 'Cute/Aesthetic...'
    $altSource = Category::where('name', 'LIKE', 'Cute%Aesthetic%')->where('id', '!=', $targetCategory->id)->first();
    if ($altSource) {
        $sourceCategory = $altSource;
        echo "Found alternative source: '{$sourceCategory->name}' (ID: {$sourceCategory->id})\n";
    }
}

if ($sourceCategory) {
    echo "Merging '{$sourceCategory->name}' (ID: {$sourceCategory->id}) into '{$targetCategory->name}' (ID: {$targetCategory->id})...\n";
    
    $count = Artwork::where('category_id', $sourceCategory->id)->update(['category_id' => $targetCategory->id]);
    echo "Updated $count artworks.\n";
    
    $sourceCategory->delete();
    echo "Deleted source category.\n";
} else {
    echo "No source category found to merge.\n";
}

// Final check
$finalCount = Artwork::where('category_id', $targetCategory->id)->count();
echo "FINAL COUNT for '{$targetCategory->name}': $finalCount artworks.\n";

echo "Done!\n";
