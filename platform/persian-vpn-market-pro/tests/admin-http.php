<?php

declare(strict_types=1);

// Isolated SQLite fixture for HTTP authorization; not an upstream migration test.
putenv('APP_ENV=testing');
putenv('APP_KEY=base64:AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=');
putenv('CACHE_STORE=array');
putenv('SESSION_DRIVER=array');
putenv('DB_CONNECTION=sqlite');
putenv('DB_DATABASE=:memory:');
putenv('MARKET_OWNER_TELEGRAM_ID=100');
putenv('MARKET_TELEGRAM_BOT_TOKEN=fixture-bot-token');
require $argv[1].'/vendor/autoload.php';
$app = require $argv[1].'/bootstrap/app.php';
$kernel = $app->make(\Illuminate\Contracts\Http\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Http\Request;

Schema::create('users', function (Blueprint $table) {
    $table->id();
    $table->string('telegram_chat_id')->unique();
    $table->string('name');
});
foreach (['100', '200', '300'] as $id) {
    DB::table('users')->insert(['telegram_chat_id' => $id, 'name' => 'fixture']);
}
$migration = require $argv[1].'/database/migrations/2026_09_05_000001_create_market_admin_tables.php';
$migration->up();
$count = 0;
function expectStatus($response, int $status, string $label): void {
    global $count;
    if ($response->getStatusCode() !== $status) {
        throw new RuntimeException($label.' expected '.$status.' got '.$response->getStatusCode());
    }
    ++$count;
    echo "PASS: $label\n";
}
function send(string $id, string $method, string $path, array $body = []) {
    global $kernel;
    Auth::forgetGuards();
    $data = ['auth_date' => (string) time(), 'user' => json_encode(['id' => (int) $id])];
    ksort($data);
    $lines = [];
    foreach ($data as $key => $value) { $lines[] = "$key=$value"; }
    $secret = hash_hmac('sha256', 'fixture-bot-token', 'WebAppData', true);
    $data['hash'] = hash_hmac('sha256', implode("\n", $lines), $secret);
    $request = Request::create($path, $method, [], [], [], [
        'HTTP_ACCEPT' => 'application/json',
        'CONTENT_TYPE' => 'application/json',
        'HTTP_X_TELEGRAM_INIT_DATA' => http_build_query($data),
    ], json_encode($body));
    $response = $kernel->handle($request);
    $kernel->terminate($request, $response);
    return $response;
}
expectStatus(send('100', 'GET', '/api/v1/admins'), 200, 'owner lists admins');
expectStatus(send('200', 'GET', '/api/v1/admins'), 403, 'customer denied admin list');
expectStatus(send('100', 'PUT', '/api/v1/admins', ['telegram_id' => '200', 'role' => 'admin']), 200, 'owner grants admin');
expectStatus(send('200', 'PUT', '/api/v1/admins', ['telegram_id' => '300', 'role' => 'admin']), 403, 'admin cannot grant admin');
expectStatus(send('100', 'PUT', '/api/v1/admins', ['telegram_id' => '300', 'role' => 'owner']), 422, 'owner role cannot be assigned through API');
expectStatus(send('100', 'PUT', '/api/v1/admins', ['telegram_id' => '100', 'role' => 'support']), 422, 'owner cannot be demoted');
expectStatus(send('100', 'DELETE', '/api/v1/admins/100'), 422, 'owner cannot be removed');
expectStatus(send('100', 'PUT', '/api/v1/admins', ['telegram_id' => '200', 'role' => 'support']), 200, 'owner changes role');
if (DB::table('market_admins')->count() !== 1) { throw new RuntimeException('Duplicate membership'); }
expectStatus(send('100', 'DELETE', '/api/v1/admins/200'), 204, 'owner revokes admin');
if (DB::table('market_admins')->exists()) { throw new RuntimeException('Revocation did not persist'); }
if (DB::table('market_admin_audit')->count() !== 3) { throw new RuntimeException('Incorrect audit count'); }
expectStatus(send('999', 'GET', '/api/v1/admins'), 403, 'unregistered Telegram user denied');
$request = Request::create('/api/v1/admins?user_id=100', 'GET', [], [], [], ['HTTP_ACCEPT' => 'application/json']);
expectStatus($kernel->handle($request), 401, 'unsigned owner ID cannot reuse previous identity');
echo "$count HTTP checks passed; persistence and audit verified\n";
