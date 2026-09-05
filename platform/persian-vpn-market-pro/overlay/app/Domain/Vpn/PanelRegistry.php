<?php

declare(strict_types=1);

namespace App\Domain\Vpn;

use Closure;
use InvalidArgumentException;
use LogicException;

final class PanelRegistry
{
    private array $factories = [];

    public function register(string $type, Closure $factory): void
    {
        if ($type === '' || isset($this->factories[$type])) {
            throw new LogicException('Invalid or duplicate panel type');
        }
        $this->factories[$type] = $factory;
    }

    public function resolve(string $type, array $connection): PanelAdapter
    {
        if (!isset($this->factories[$type])) {
            throw new InvalidArgumentException('Unsupported panel type');
        }
        return ($this->factories[$type])($connection);
    }
}
