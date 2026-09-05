<?php

declare(strict_types=1);

require $argv[1].'/app/Security/TelegramInitData.php';
require $argv[1].'/app/Domain/Vpn/PanelAdapter.php';
require $argv[1].'/app/Domain/Vpn/ServiceSnapshot.php';
require $argv[1].'/app/Domain/Vpn/PanelRegistry.php';

use App\Security\TelegramInitData;
use App\Domain\Vpn\PanelRegistry;

$token = 'test-token-not-a-real-secret';
$now = 1800000000;
$validator = new TelegramInitData;
$count = 0;
function check(bool $valid, string $label): void {
    global $count;
    if (!$valid) { throw new RuntimeException($label); }
    ++$count;
    echo "PASS: $label\n";
}
function sign(array $data, string $token): string {
    ksort($data);
    $parts = [];
    foreach ($data as $key => $value) { $parts[] = "$key=$value"; }
    $key = hash_hmac('sha256', $token, 'WebAppData', true);
    $data['hash'] = hash_hmac('sha256', implode("\n", $parts), $key);
    return http_build_query($data, '', '&', PHP_QUERY_RFC3986);
}
$base = ['auth_date' => (string) $now, 'user' => json_encode(['id' => 12345, 'first_name' => 'کاربر + تست'])];
$valid = sign($base, $token);
check($validator->verify($valid, $token, $now)['id'] === 12345, 'valid signed identity');
check($validator->verify($valid, $token, $now)['first_name'] === 'کاربر + تست', 'unicode and plus preserved');
$signedWithExtra = sign($base + ['signature' => 'additional-ed25519-field'], $token);
check($validator->verify($signedWithExtra, $token, $now)['id'] === 12345, 'HMAC includes signature field');
$cases = [
    ['user_id=12345', $token, 'unsigned user ID rejected'],
    [$valid, 'different-token', 'wrong bot rejected'],
    [$valid, '', 'unconfigured bot rejected'],
    [str_replace('12345', '54321', $valid), $token, 'tampered identity rejected'],
    [$valid.'&auth_date='.$now, $token, 'duplicate field rejected'],
    [$valid.'&auth%5Fdate='.$now, $token, 'encoded duplicate rejected'],
    [$valid.'&user%5Bid%5D=54321', $token, 'array parameter rejected'],
    [sign(array_replace($base, ['auth_date' => (string) ($now-301)]), $token), $token, 'expired credentials rejected'],
    [sign(array_replace($base, ['auth_date' => (string) ($now+31)]), $token), $token, 'future credentials rejected'],
    [sign(array_replace($base, ['user' => '{']), $token), $token, 'malformed JSON rejected'],
    [sign(array_replace($base, ['user' => '{"id":-1}']), $token), $token, 'negative identity rejected'],
    [sign(array_replace($base, ['user' => '{"id":1,"is_bot":true}']), $token), $token, 'bot identity rejected'],
    [str_repeat('a', 16385), $token, 'oversized credentials rejected'],
];
foreach ($cases as [$input, $secret, $label]) {
    $rejected = false;
    try { $validator->verify($input, $secret, $now); }
    catch (InvalidArgumentException) { $rejected = true; }
    check($rejected, $label);
}
$registry = new PanelRegistry;
$rejected = false;
try { $registry->resolve('unknown', []); }
catch (InvalidArgumentException) { $rejected = true; }
check($rejected, 'unsupported panel fails closed');
$registry->register('test', fn () => null);
$rejected = false;
try { $registry->register('test', fn () => null); }
catch (LogicException) { $rejected = true; }
check($rejected, 'duplicate adapter rejected');
echo "$count security and registry checks passed\n";
