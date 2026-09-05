<?php

namespace App\Http\Middleware;

use App\Models\User;
use App\Security\TelegramInitData;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use InvalidArgumentException;

final class TelegramWebAppAuth
{
    public function handle(Request $request, Closure $next)
    {
        try {
            $telegram = (new TelegramInitData)->verify(
                (string) $request->header('X-Telegram-Init-Data', ''),
                (string) config('market.telegram_token'),
                time(),
                (int) config('market.init_data_max_age', 300)
            );
        } catch (InvalidArgumentException) {
            return response()->json(['error' => 'telegram_auth_required'], 401);
        }

        // Reuse the existing bot identity. Registration remains in the upstream bot.
        $user = User::where('telegram_chat_id', (string) $telegram['id'])->first();
        if (!$user) {
            return response()->json(['error' => 'start_bot_first'], 403);
        }
        Auth::setUser($user);
        $request->setUserResolver(fn () => $user);
        $response = $next($request);
        $response->headers->set('Cache-Control', 'no-store, private');
        return $response;
    }
}
