<?php

namespace App\Http\Controllers\Market;

use App\Http\Controllers\Controller;
use App\Security\AdminPermissions;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

final class AdminController extends Controller
{
    public function index()
    {
        return response()->json([
            'owner_telegram_id' => (string) config('market.owner_telegram_id'),
            'admins' => DB::table('market_admins')->orderBy('telegram_id')->paginate(50),
            'roles' => AdminPermissions::ROLES,
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'telegram_id' => ['required', 'string', 'regex:/^[1-9][0-9]{0,15}$/D'],
            'role' => ['required', Rule::in(AdminPermissions::ROLES)],
        ]);
        abort_if($data['telegram_id'] === (string) config('market.owner_telegram_id'), 422, 'Owner is protected');
        DB::transaction(function () use ($request, $data) {
            DB::table('market_admins')->upsert([
                $data + ['created_at' => now(), 'updated_at' => now()],
            ], ['telegram_id'], ['role', 'updated_at']);
            $this->audit($request, 'admin.role_set', $data['telegram_id'], $data['role']);
        });
        return response()->json(['admin' => $data]);
    }

    public function destroy(Request $request, string $telegramId)
    {
        abort_unless(preg_match('/^[1-9][0-9]{0,15}$/D', $telegramId), 422);
        abort_if($telegramId === (string) config('market.owner_telegram_id'), 422, 'Owner is protected');
        DB::transaction(function () use ($request, $telegramId) {
            $deleted = DB::table('market_admins')->where('telegram_id', $telegramId)->delete();
            if ($deleted) {
                $this->audit($request, 'admin.revoked', $telegramId, null);
            }
        });
        return response()->noContent();
    }

    private function audit(Request $request, string $action, string $target, ?string $role): void
    {
        DB::table('market_admin_audit')->insert([
            'actor_telegram_id' => (string) $request->user()->telegram_chat_id,
            'target_telegram_id' => $target,
            'action' => $action,
            'role' => $role,
            'created_at' => now(),
        ]);
    }
}
