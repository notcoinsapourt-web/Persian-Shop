<?php

declare(strict_types=1);

namespace App\Security;

use InvalidArgumentException;

final class TelegramInitData
{
    /** Validate before using any client-provided identity. Never log the input. */
    public function verify(string $input, string $token, int $now, int $maxAge = 300): array
    {
        if ($token === '' || $input === '' || strlen($input) > 16384 || $maxAge < 1) {
            throw new InvalidArgumentException('Invalid Telegram credentials');
        }
        $data = [];
        foreach (explode('&', $input) as $part) {
            $pair = explode('=', $part, 2);
            if (count($pair) !== 2) {
                throw new InvalidArgumentException('Malformed init data');
            }
            $key = urldecode($pair[0]);
            if (!preg_match('/^[a-zA-Z0-9_]+$/D', $key) || array_key_exists($key, $data)) {
                throw new InvalidArgumentException('Duplicate or invalid field');
            }
            $data[$key] = urldecode($pair[1]);
        }
        $hash = $data['hash'] ?? '';
        unset($data['hash']);
        if (!preg_match('/^[a-f0-9]{64}$/D', $hash)) {
            throw new InvalidArgumentException('Missing signature');
        }
        ksort($data, SORT_STRING);
        $lines = [];
        foreach ($data as $key => $value) {
            $lines[] = $key.'='.$value;
        }
        $secret = hash_hmac('sha256', $token, 'WebAppData', true);
        $expected = hash_hmac('sha256', implode("\n", $lines), $secret);
        if (!hash_equals($expected, $hash)) {
            throw new InvalidArgumentException('Invalid signature');
        }
        $date = $data['auth_date'] ?? '';
        if (!ctype_digit($date) || (int) $date > $now + 30 || $now - (int) $date > $maxAge) {
            throw new InvalidArgumentException('Expired init data');
        }
        try {
            $user = json_decode($data['user'] ?? '', true, 32, JSON_THROW_ON_ERROR);
        } catch (\JsonException) {
            throw new InvalidArgumentException('Invalid user');
        }
        if (!is_array($user) || !isset($user['id']) || !is_int($user['id']) || $user['id'] <= 0 || ($user['is_bot'] ?? false)) {
            throw new InvalidArgumentException('Invalid user');
        }
        return $user;
    }
}
