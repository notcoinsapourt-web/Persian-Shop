<?php

namespace App\Http\Middleware;

use App\Security\AdminPermissions;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

final class MarketPermission
{
    public function handle(Request $request, Closure $next, string $ability)
    {
        $actor = (string) ($request->user()?->telegram_chat_id ?? '');
        $owner = (string) config('market.owner_telegram_id', '');
        $role = $actor !== '' && $actor !== $owner
            ? DB::table('market_admins')->where('telegram_id', $actor)->value('role')
            : null;
        abort_unless((new AdminPermissions)->allows($owner, $actor, $role, $ability), 403);
        return $next($request);
    }
}
