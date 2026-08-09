# Fix Abide Blueprint Generation

## Goal Description
Fix the Abide backend blueprint generation so it successfully runs queries against the local Ollama node without triggering Out Of Memory (OOM) errors, and remove the misleading fallback logic that returns fake blueprints when a failure occurs.

## Proposed Changes
### server.ts
- **Truncate Context for Ollama**: In xecuteBlueprintGenerationWorker and xecuteTestGenerationWorker, if the selected provider is \ollama\ (or \llama\), truncate the \codebaseContext\ (or prompt) to a maximum of 32,000 characters to prevent the remote Ollama server (Server 5) from OOMing and dropping the TCP connection.
- **Remove Fake Fallback**: Remove the \	ry/catch\ fallback in xecuteBlueprintGenerationWorker that intercepts all errors and returns a hardcoded \generateFallbackBlueprint\. If a generation fails, it should correctly propagate the error so the user is informed of the actual failure, rather than silently injecting a fake blueprint.
- **Remove Fake Test Suite Fallback**: Remove the similar fallback in xecuteTestGenerationWorker that uses \generateLocalFallbackTestSuite\.
- **Delete Dead Code**: Delete the generateFallbackBlueprint and generateLocalFallbackTestSuite functions entirely.

## User Review Required
Removing the fallback means that if the LLM API fails, the user will see an error in the UI instead of a dummy blueprint. This is in line with the request to run 'truthfully', but please confirm this behavior is desired.

## Verification Plan
1. Check that the Abide node starts successfully.
2. Submit a blueprint generation task with a large codebase context and verify that the Ollama request succeeds without triggering an OOM on the server.
3. Verify that any API failure propagates an error to the user interface instead of returning a fake fallback blueprint.
