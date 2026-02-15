#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'EOF'
Collect PR context from git history and diff.

Usage:
  collect_pr_context.sh [--base <branch>] [--max-commits <n>]

Options:
  --base <branch>      Base branch to compare against (optional)
  --max-commits <n>    Max commits to show in log (default: 30)
  -h, --help           Show this help
EOF
}

detect_default_base() {
  local origin_head_ref

  if origin_head_ref="$(git symbolic-ref --quiet refs/remotes/origin/HEAD 2>/dev/null)"; then
    echo "${origin_head_ref#refs/remotes/origin/}"
    return 0
  fi

  if git show-ref --verify --quiet refs/heads/main; then
    echo "main"
    return 0
  fi

  if git show-ref --verify --quiet refs/heads/master; then
    echo "master"
    return 0
  fi

  echo "HEAD~1"
}

BASE_BRANCH=""
MAX_COMMITS=30

while [[ $# -gt 0 ]]; do
  case "$1" in
    --base)
      BASE_BRANCH="${2:-}"
      shift 2
      ;;
    --max-commits)
      MAX_COMMITS="${2:-}"
      shift 2
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

if ! git rev-parse --git-dir >/dev/null 2>&1; then
  echo "Not inside a git repository." >&2
  exit 1
fi

if [[ -z "${BASE_BRANCH}" ]]; then
  BASE_BRANCH="$(detect_default_base)"
fi

if ! git rev-parse --verify "${BASE_BRANCH}^{commit}" >/dev/null 2>&1; then
  echo "Base branch or revision not found: ${BASE_BRANCH}" >&2
  exit 1
fi

if ! [[ "${MAX_COMMITS}" =~ ^[0-9]+$ ]]; then
  echo "--max-commits must be a non-negative integer." >&2
  exit 1
fi

CURRENT_BRANCH="$(git rev-parse --abbrev-ref HEAD)"
MERGE_BASE="$(git merge-base "${BASE_BRANCH}" HEAD)"
COMMIT_RANGE="${MERGE_BASE}..HEAD"
CHANGED_FILES="$(git diff --name-only "${MERGE_BASE}" HEAD)"

echo "# PR Context"
echo
echo "- Current branch: \`${CURRENT_BRANCH}\`"
echo "- Base branch/revision: \`${BASE_BRANCH}\`"
echo "- Merge base: \`${MERGE_BASE}\`"
echo

echo "## Commit log (${MAX_COMMITS} max)"
if git log --no-merges --oneline "${COMMIT_RANGE}" | head -n "${MAX_COMMITS}" | grep -q .; then
  git log --no-merges --oneline "${COMMIT_RANGE}" | head -n "${MAX_COMMITS}" | sed 's/^/- /'
else
  echo "- No commits between merge base and HEAD."
fi
echo

echo "## Diff stat"
if git diff --stat "${MERGE_BASE}" HEAD | grep -q .; then
  git diff --stat "${MERGE_BASE}" HEAD
else
  echo "No file changes between merge base and HEAD."
fi
echo

echo "## Changed files"
if [[ -n "${CHANGED_FILES}" ]]; then
  printf '%s\n' "${CHANGED_FILES}" | sed 's/^/- /'
else
  echo "- No changed files."
fi
echo

echo "## Potential risk flags"
has_risk=0

if printf '%s\n' "${CHANGED_FILES}" | grep -Eq '(^|/)(prisma/schema\.prisma|migrations?/|db/|sql/)'; then
  echo "- Database schema/migration changes detected."
  has_risk=1
fi

if printf '%s\n' "${CHANGED_FILES}" | grep -Eq '(^|/)(package-lock\.json|pnpm-lock\.yaml|yarn\.lock|Dockerfile|docker-compose|\.github/workflows/)'; then
  echo "- Dependency/build/deployment surface changes detected."
  has_risk=1
fi

if printf '%s\n' "${CHANGED_FILES}" | grep -Eqi '(^|/)(auth|security|permission|token|session|jwt)'; then
  echo "- Authentication or security related changes detected."
  has_risk=1
fi

if printf '%s\n' "${CHANGED_FILES}" | grep -Eqi '(^|/)(routes/|controllers/|openapi|swagger|api)'; then
  echo "- API contract surface may be affected."
  has_risk=1
fi

if printf '%s\n' "${CHANGED_FILES}" | grep -Eqi '(^|/)(\.env|config|settings|terraform|k8s|helm)'; then
  echo "- Runtime configuration/infrastructure changes detected."
  has_risk=1
fi

if [[ "${has_risk}" -eq 0 ]]; then
  echo "- No predefined high-risk patterns detected."
fi
echo

echo "## Suggested test focus"
echo "- Verify primary changed business flow end-to-end."
echo "- Verify regressions around touched modules or routes."
echo "- Verify migration/deploy safety if risk flags above are present."
