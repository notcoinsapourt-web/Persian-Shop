<?php

use Illuminate\Support\Facades\Route;

// Deliberately expose no upstream sales, payment, agent, or admin routes yet.
Route::get('/', fn () => response()->json([
    'name' => 'Persian VPN Market Pro',
    'status' => 'development',
    'sales_enabled' => false,
]));
