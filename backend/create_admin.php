<?php

require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$adminUser = App\Models\User::where('email', 'admin@example.com')->first();
if ($adminUser) {
    $adminUser->role = 'admin';
    $adminUser->password = \Illuminate\Support\Facades\Hash::make('Brushes&Ink@2026!Secure#Admin');
    $adminUser->save();
    echo "Admin user updated with admin role!" . PHP_EOL;
} else {
    echo "Admin user not found, creating..." . PHP_EOL;
    \App\Models\User::create([
        'name' => 'Admin',
        'email' => 'admin@example.com',
        'password' => \Illuminate\Support\Facades\Hash::make('Brushes&Ink@2026!Secure#Admin'),
        'role' => 'admin'
    ]);
    echo "Admin user created!" . PHP_EOL;
}
