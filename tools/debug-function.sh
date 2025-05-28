#!/bin/bash

set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

# Check argument
if [ -z "$1" ]; then
  echo -e "${RED}Usage: $0 <function-name>${NC}"
  exit 1
fi

FUNCTION_NAME="$1"

echo -e "${GREEN}🔍 Looking up pod for function: ${FUNCTION_NAME}${NC}"

# Get the pod name
POD_NAME=$(kubectl get pods -n openfaas-fn -l "faas_function=${FUNCTION_NAME}" -o jsonpath="{.items[0].metadata.name}" 2>/dev/null)

if [ -z "$POD_NAME" ]; then
  echo -e "${RED}❌ No pod found for function '${FUNCTION_NAME}' in namespace openfaas-fn${NC}"
  exit 1
fi

echo -e "${GREEN}📦 Found pod: ${POD_NAME}${NC}"
echo -e "${GREEN}📺 Tailing logs (Ctrl+C to exit)...${NC}"
echo

kubectl logs -n openfaas-fn -f "$POD_NAME"
