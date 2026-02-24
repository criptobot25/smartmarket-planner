# Branch protection recommendations

Use these settings for your default branch (`main` or `master`) to match the current CI pipeline in `.github/workflows/ci.yml`.

## Required status checks

Mark these checks as **required**:

- `validate`
- `test`
- `build`

These are the three job names in CI and are stable for branch protection.

## Recommended protection settings

Enable:

- Require a pull request before merging
- Require status checks to pass before merging
- Require branches to be up to date before merging
- Require conversation resolution before merging
- Require signed commits (optional, if your team uses it)
- Include administrators (recommended)

## Optional merge controls

Recommended:

- Allow squash merging
- Automatically delete head branches
- Dismiss stale pull request approvals when new commits are pushed

## Notes

- CI currently triggers on PR/push for both `main` and `master`.
- If you rename workflow job IDs in `.github/workflows/ci.yml`, update required checks accordingly.
