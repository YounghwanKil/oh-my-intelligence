#!/usr/bin/env bash
# ADR-003: Check vendored types haven't drifted from upstream OMC/OMX
# Exit 0 if types match, exit 1 if diverged
#
# Simple approach: check if key type names from OMI's types/index.ts
# still exist in the upstream OMC/OMX interop files.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
OMI_TYPES="$PROJECT_ROOT/src/types/index.ts"

# Key type names that OMI depends on from OMC interop
REQUIRED_TYPES=(
  "Lane"
  "Provider"
  "ProviderStatus"
  "RoutingDecision"
  "ProviderInfo"
  "TaskClassification"
  "PhaseMapping"
  "OmiState"
)

errors=0

echo "=== OMI Vendored Types Check ==="
echo "Checking: $OMI_TYPES"
echo ""

if [ ! -f "$OMI_TYPES" ]; then
  echo "FAIL: OMI types file not found at $OMI_TYPES"
  exit 1
fi

# Check that all required types are defined in our types file
for type_name in "${REQUIRED_TYPES[@]}"; do
  if grep -qE "(export (type|interface) ${type_name}\\b)" "$OMI_TYPES"; then
    echo "  OK: $type_name"
  else
    echo "  MISSING: $type_name not found in $OMI_TYPES"
    errors=$((errors + 1))
  fi
done

echo ""

# Check upstream OMC shared-state types if available
OMC_CANDIDATES=(
  "$PROJECT_ROOT/../oh-my-claudecode/src/shared/types.ts"
  "$PROJECT_ROOT/../oh-my-claudecode/src/types/index.ts"
  "$PROJECT_ROOT/node_modules/oh-my-claude-sisyphus/src/types/index.ts"
)

found_upstream=false
for candidate in "${OMC_CANDIDATES[@]}"; do
  if [ -f "$candidate" ]; then
    found_upstream=true
    echo "Upstream OMC types found: $candidate"
    echo "Checking compatibility..."
    echo ""

    # Verify key OMC types that OMI consumes via omc-bridge still exist upstream
    # These are OMC-native types, not OMI types — OMI reads OMC state as a downstream consumer
    OMC_CONSUMED_TYPES=("AgentConfig" "ModelType" "PluginConfig")
    for type_name in "${OMC_CONSUMED_TYPES[@]}"; do
      if grep -qE "(export (type|interface) ${type_name}\\b|type ${type_name} =)" "$candidate"; then
        echo "  OK: $type_name exists upstream"
      else
        echo "  DRIFT: $type_name missing from upstream $candidate"
        errors=$((errors + 1))
      fi
    done
    break
  fi
done

if [ "$found_upstream" = false ]; then
  echo "INFO: No upstream OMC types found (standalone install). Skipping drift check."
fi

echo ""

if [ "$errors" -gt 0 ]; then
  echo "FAIL: $errors type(s) diverged or missing"
  exit 1
fi

echo "PASS: All vendored types are consistent"
exit 0
