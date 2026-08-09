<?php
$app = \App\Models\Application::find(2);
if ($app) {
    $env = $app->environment_variables()->where("key", "CAPI_INTERNAL_URL")->first();
    if ($env) {
        $env->value = "https://capi.veklom.com";
        $env->save();
        echo "Updated CAPI_INTERNAL_URL to https://capi.veklom.com\n";
    } else {
        echo "CAPI_INTERNAL_URL not found\n";
    }
} else {
    echo "App not found\n";
}
