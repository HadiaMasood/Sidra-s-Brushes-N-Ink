<?php

/**
 * Quick script to seed Bank AL HABIB details into the configurations table.
 * Run once from the backend folder: php seed_bank_details.php
 */

require_once __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Configuration;

$bankDetails = [
    ['key' => 'bank_name',          'value' => 'BANK AL HABIB Limited',     'category' => 'payment'],
    ['key' => 'bank_account_title', 'value' => 'SIDRA MASOOD',              'category' => 'payment'],
    ['key' => 'bank_account_no',    'value' => '0458-1824-001750-01-8',     'category' => 'payment'],
    ['key' => 'bank_iban',          'value' => 'PK30 BAHL 0458 1824 0017 5001', 'category' => 'payment'],
];

foreach ($bankDetails as $detail) {
    Configuration::updateOrCreate(
        ['key' => $detail['key']],
        ['value' => $detail['value'], 'category' => $detail['category']]
    );
    echo "✅ Saved: {$detail['key']} = {$detail['value']}\n";
}

echo "\n✅ Bank details saved to database successfully!\n";
echo "You can now update them anytime from Admin Panel → Payment tab.\n";
