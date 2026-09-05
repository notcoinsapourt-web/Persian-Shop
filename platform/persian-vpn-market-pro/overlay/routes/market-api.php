<?php

use App\Http\Controllers\Market\AccountController;
use App\Http\Controllers\Market\AdminController;
use App\Http\Middleware\MarketPermission;
use App\Http\Middleware\TelegramWebAppAuth;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->middleware([TelegramWebAppAuth::class, 'throttle:60,1'])->group(function () {
    Route::get('account', [AccountController::class, 'show']);
    Route::get('plans', [AccountController::class, 'plans']);
    Route::prefix('admins')->middleware(MarketPermission::class.':admins.manage')->group(function () {
        Route::get('/', [AdminController::class, 'index']);
        Route::put('/', [AdminController::class, 'store']);
        Route::delete('/{telegramId}', [AdminController::class, 'destroy']);
    });
});
