<?php

return [
    'name' => 'Persian VPN Market Pro',
    'telegram_token' => env('MARKET_TELEGRAM_BOT_TOKEN', ''),
    'webhook_secret' => env('MARKET_TELEGRAM_WEBHOOK_SECRET', ''),
    'owner_telegram_id' => env('MARKET_OWNER_TELEGRAM_ID', ''),
    'bot_enabled' => env('MARKET_BOT_ENABLED', false),
    'init_data_max_age' => 300,
    // Sales remain closed until financial + provisioning acceptance tests pass.
    'sales_enabled' => false,
    'adapters' => [],
    'emoji' => [
        'vpn' => env('MARKET_EMOJI_VPN', ''),
        'services' => env('MARKET_EMOJI_SERVICES', ''),
        'wallet' => env('MARKET_EMOJI_WALLET', ''),
        'store' => env('MARKET_EMOJI_STORE', ''),
    ],
];
