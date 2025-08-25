# Prevent Frequent File Rewrites by Implementing Diff-Based Edits and File Locking

This feature addresses [issue #4](../issues/4), which flags the inefficiency of rewriting entire files whenever the AI modifies code. Currently, Bolt overwrites the full file content for every change, causing unnecessary disk I/O and possible race conditions when multiple writes occur concurrently. Streaming outputs also result in repeated partial writes to the same file.

## Proposed Solution

* **Diff-based updates:** Instead of writing the whole file, the agent should return a unified diff. A new `applyDiff` function will apply patches to the existing file content, using context lines to locate the insertion point. No op writes should be skipped when the diff does not change the file.
* **File locking:** Add a lightweight locking mechanism so that only one write per file happens at a time. When a file is locked, subsequent writes should queue until the lock is released to avoid conflicts.
* **Prompt adjustments:** The prompt template will instruct models to return unified diffs rather than full file contents.

## Acceptance Criteria

* The `applyDiff` helper applies unified diffs correctly and is covered by tests (see `tests/prevent-file-rewrites.test.ts`).
* Files are only updated when the diff changes the content.
* A lock prevents concurrent writes to the same file.
* Documentation is updated to describe the new behavior.
