<?php

namespace App\Http\Controllers\Market;

use App\Http\Controllers\Controller;
use App\Models\Plan;
use Illuminate\Http\Request;

final class AccountController extends Controller
{
    public function show(Request $request)
    {
        $user = $request->user();
        return response()->json([
            'name' => $user->name,
            'wallet' => ['balance' => (string) $user->balance, 'currency' => 'IRT'],
            'sales_enabled' => false,
            'orders' => $user->orders()->latest()->limit(50)->get([
                'id', 'plan_id', 'status', 'amount', 'expires_at', 'created_at',
            ]),
        ]);
    }

    public function plans()
    {
        return response()->json(['plans' => Plan::where('is_active', true)
            ->orderBy('price')->limit(200)->get([
                'id', 'name', 'price', 'volume_gb', 'duration_days', 'server_type',
            ])]);
    }
}
