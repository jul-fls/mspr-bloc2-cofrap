#!/bin/bash

set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check for function name
if [ -z "$1" ]; then
  echo -e "${RED}Usage: $0 <function-name>${NC}"
  exit 1
fi

cd ../functions || { echo -e "${RED}Error: Could not change directory to 'functions'.${NC}"; exit 1; }

FUNCTION_NAME="$1"
YAML_FILE="${FUNCTION_NAME}.yaml"
NAMESPACE="openfaas-fn"

if [ ! -f "$YAML_FILE" ]; then
  echo -e "${RED}Error: ${YAML_FILE} not found.${NC}"
  exit 1
fi

echo -e "${GREEN}🛠 Building $FUNCTION_NAME...${NC}"
faas-cli build -f "$YAML_FILE"

echo -e "${GREEN}📦 Pushing $FUNCTION_NAME...${NC}"
faas-cli push -f "$YAML_FILE"

echo -e "${GREEN}🧹 Deleting old pods...${NC}"
PODS=$(kubectl get pods -n "$NAMESPACE" -l "faas_function=$FUNCTION_NAME" -o name)
if [ -n "$PODS" ]; then
  echo "$PODS" | xargs kubectl delete -n "$NAMESPACE"
else
  echo -e "${RED}⚠️ No old pods found for function ${FUNCTION_NAME}.${NC}"
fi

echo -e "${GREEN}🚀 Deploying $FUNCTION_NAME...${NC}"
DEPLOY_OUTPUT=$(faas-cli deploy -f "$YAML_FILE" 2>&1)

if echo "$DEPLOY_OUTPUT" | grep -q "Deployed."; then
  echo -e "${GREEN}✅ Deployment successful!${NC}"
  echo "$DEPLOY_OUTPUT" | grep "URL:"
else
  echo -e "${RED}❌ Deployment failed!${NC}"
  echo "$DEPLOY_OUTPUT"
  exit 1
fi
