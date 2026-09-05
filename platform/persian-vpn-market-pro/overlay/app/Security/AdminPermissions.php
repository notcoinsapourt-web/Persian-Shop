<?php

declare(strict_types=1);

namespace App\Security;

final class AdminPermissions
{
    public const ROLES = ['admin', 'finance', 'support'];

    public function allows(string $owner, string $actor, ?string $role, string $ability): bool
    {
        if (!preg_match('/^[1-9][0-9]{0,15}$/D', $actor)) {
            return false;
        }
        if ($owner !== '' && hash_equals($owner, $actor)) {
            return true;
        }
        $permissions = [
            'admin' => ['catalog.manage', 'servers.manage', 'orders.manage', 'users.read', 'tickets.manage'],
            'finance' => ['payments.review', 'transactions.read'],
            'support' => ['tickets.manage', 'users.read'],
        ];
        // Only the configured owner can manage administrators. Unknown roles fail closed.
        return in_array($ability, $permissions[$role ?? ''] ?? [], true);
    }
}
