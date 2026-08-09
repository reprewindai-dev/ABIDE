<?php
require __DIR__."/vendor/autoload.php";
$app = require_once __DIR__."/bootstrap/app.php";
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();
queue_application_deployment(application: \App\Models\Application::find(31), deployment_uuid: new \Illuminate\Support\Stringable(\Illuminate\Support\Str::uuid()), force_rebuild: false, is_webhook: false);
echo "Deployed\n";

