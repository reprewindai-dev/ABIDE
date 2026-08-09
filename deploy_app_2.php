$app = \App\Models\Application::find(31);
if ($app) {
    $deployment_uuid = new \Visus\Cuid2\Cuid2;
    $result = queue_application_deployment(
        application: $app,
        deployment_uuid: $deployment_uuid,
        force_rebuild: true,
        commit: 'HEAD',
        is_webhook: false,
    );
    echo "Deployment queued with UUID: " . $deployment_uuid . "\n";
} else {
    echo "App 31 not found.\n";
}
