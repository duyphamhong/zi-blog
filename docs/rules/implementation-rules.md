# Implementation Rules

Codex must read and follow this file before implementing any plan.

## Rule 1 — Branch, pull request, and merge workflow

Before implementing a new plan:

1. Fetch the latest remote state.
2. Check out `main` and update it to the latest remote `main` with a
   fast-forward-only pull.
3. Create a new branch from that updated `main` with a name that describes the
   plan or change.

After implementation:

1. Run the required validation.
2. Commit the completed changes on the implementation branch.
3. Push the branch and create a pull request for human review.

Codex must not merge the pull request. A human must review and merge it.
