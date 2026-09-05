<?php

declare(strict_types=1);

namespace App\Domain\Vpn;

interface PanelAdapter
{
    /** Must find/reconcile an existing externalId before attempting creation. */
    public function provision(string $externalId, array $plan): ServiceSnapshot;
    public function inspect(string $externalId): ServiceSnapshot;
    /** Absolute targets, not increments: retrying must not extend twice. */
    public function setLimits(string $externalId, int $limitBytes, int $expiresAt): ServiceSnapshot;
    public function disable(string $externalId): void;
    public function health(): array;
}
