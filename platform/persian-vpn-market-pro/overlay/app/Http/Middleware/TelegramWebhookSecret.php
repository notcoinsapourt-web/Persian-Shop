<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

final class TelegramWebhookSecret
{
    public function handle(Request $request, Closure $next)
    {
        $expected = (string) config('market.webhook_secret');
        $supplied = (string) $request->header('X-Telegram-Bot-Api-Secret-Token', '');
        if (strlen($expected) < 32 || !hash_equals($expected, $supplied)) {
            return response()->json(['error' => 'invalid_webhook_secret'], 401);
        }
        return $next($request);
    }
}
