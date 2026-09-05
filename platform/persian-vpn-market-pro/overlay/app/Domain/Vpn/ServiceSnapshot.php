<?php

declare(strict_types=1);

namespace App\Domain\Vpn;

final readonly class ServiceSnapshot
{
    public function __construct(
        public string $externalId,
        public string $status,
        public int $usedBytes,
        public ?int $limitBytes,
        public ?int $expiresAt,
        public array $configs = [],
        public ?string $subscriptionUrl = null,
    ) {}
}
