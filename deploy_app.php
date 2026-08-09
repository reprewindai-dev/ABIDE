$app = \App\Models\Application::find(31);
if ($app) {
    echo "UUID: " . $app->uuid . "\n";
    $deployment = \App\Jobs\ApplicationDeploymentJob::dispatch(
        application_uuid: $app->uuid,
        application_name: $app->name,
        project_uuid: $app->environment->project->uuid,
        environment_name: $app->environment->name,
        source: 'manual',
        destination: $app->destination->server->name,
        git_type: $app->source->getMorphClass() === 'App\Models\GithubApp' ? 'github' : 'gitlab',
        git_commit_sha: 'HEAD',
        git_branch: $app->git_branch,
    );
    echo "Deployment dispatched.\n";
} else {
    echo "App 31 not found.\n";
}
