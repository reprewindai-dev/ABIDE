echo \App\Models\ApplicationDeploymentQueue::where('application_id', 31)->orderBy('created_at', 'desc')->first()->status;
