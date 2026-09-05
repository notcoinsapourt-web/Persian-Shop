<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/market-web.php',
        api: __DIR__.'/../routes/market-api.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // API uses signed Telegram identity, not browser cookie authentication.
        $middleware->alias(['telegram.webapp' => \App\Http\Middleware\TelegramWebAppAuth::class]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->dontFlash(['password', 'password_confirmation', '_telegram_init_data']);
    })->create();
