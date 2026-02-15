#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'EOF'
Create or update a GitHub PR for the current branch using gh CLI.

Usage:
  upsert_github_pr.sh --base <branch> --title <title> --body-file <path> [--draft]

Options:
  --base <branch>      Base branch
  --title <title>      PR title
  --body-file <path>   Markdown file path for PR body
  --draft              Create PR as draft (create only)
  -h, --help           Show this help
EOF
}

BASE_BRANCH=""
TITLE=""
BODY_FILE=""
DRAFT_FLAG=0

while [[ $# -gt 0 ]]; do
  case "$1" in
    --base)
      BASE_BRANCH="${2:-}"
      shift 2
      ;;
    --title)
      TITLE="${2:-}"
      shift 2
      ;;
    --body-file)
      BODY_FILE="${2:-}"
      shift 2
      ;;
    --draft)
      DRAFT_FLAG=1
      shift
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown argument: $1" >&2
      usage >&2
      exit 1
      ;;
  esac
done

if [[ -z "${BASE_BRANCH}" || -z "${TITLE}" || -z "${BODY_FILE}" ]]; then
  echo "Missing required options." >&2
  usage >&2
  exit 1
fi

if ! git rev-parse --git-dir >/dev/null 2>&1; then
  echo "Not inside a git repository." >&2
  exit 1
fi

if ! command -v gh >/dev/null 2>&1; then
  echo "gh command is not installed." >&2
  exit 1
fi

if [[ ! -f "${BODY_FILE}" ]]; then
  echo "Body file not found: ${BODY_FILE}" >&2
  exit 1
fi

if ! gh auth status >/dev/null 2>&1; then
  echo "gh is not authenticated. Run: gh auth login" >&2
  exit 1
fi

CURRENT_BRANCH="$(git rev-parse --abbrev-ref HEAD)"

if [[ "${CURRENT_BRANCH}" == "${BASE_BRANCH}" ]]; then
  echo "Current branch and base branch are identical: ${CURRENT_BRANCH}" >&2
  exit 1
fi

EXISTING_NUMBER="$(gh pr list --state open --head "${CURRENT_BRANCH}" --json number --jq '.[0].number' 2>/dev/null || true)"

if [[ -n "${EXISTING_NUMBER}" && "${EXISTING_NUMBER}" != "null" ]]; then
  gh pr edit "${EXISTING_NUMBER}" \
    --base "${BASE_BRANCH}" \
    --title "${TITLE}" \
    --body-file "${BODY_FILE}" >/dev/null
  PR_URL="$(gh pr view "${EXISTING_NUMBER}" --json url --jq '.url')"
  echo "updated:${PR_URL}"
  exit 0
fi

CREATE_ARGS=(
  pr create
  --base "${BASE_BRANCH}"
  --head "${CURRENT_BRANCH}"
  --title "${TITLE}"
  --body-file "${BODY_FILE}"
)

if [[ "${DRAFT_FLAG}" -eq 1 ]]; then
  CREATE_ARGS+=(--draft)
fi

PR_URL="$(gh "${CREATE_ARGS[@]}")"
echo "created:${PR_URL}"
