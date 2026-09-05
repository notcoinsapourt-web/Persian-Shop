<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('market_admins', function (Blueprint $table) {
            $table->string('telegram_id', 16)->primary();
            $table->string('role', 20);
            $table->timestamps();
        });
        Schema::create('market_admin_audit', function (Blueprint $table) {
            $table->id();
            $table->string('actor_telegram_id', 16);
            $table->string('target_telegram_id', 16);
            $table->string('action', 40);
            $table->string('role', 20)->nullable();
            $table->timestamp('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('market_admin_audit');
        Schema::dropIfExists('market_admins');
    }
};
