<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Check if admin already exists
        if (User::where('email', 'admin@example.com')->exists()) {
            echo "Admin user already exists!\n";
            return;
        }

        User::create([
            'name' => 'Admin',
            'email' => 'admin@example.com',
            'password' => Hash::make('Brushes&Ink@2026!Secure#Admin'),
            'is_admin' => true,
        ]);

        echo "Admin user created successfully!\n";
        echo "Email: admin@example.com\n";
        echo "Password: Brushes&Ink@2026!Secure#Admin\n";
    }
}
