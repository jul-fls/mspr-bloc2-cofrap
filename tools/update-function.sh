#!/bin/bash

set -e
set -x

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check for function name
if [ -z "$1" ]; then
  /usr/bin/echo -e "${RED}Usage: $0 <function-name>${NC}"
  exit 2
fi

cd ../functions || { /usr/bin/echo -e "${RED}Error: Could not change directory to 'functions'.${NC}"; exit 3; }

FUNCTION_NAME="$1"
YAML_FILE="${FUNCTION_NAME}.yaml"
NAMESPACE="openfaas-fn"

# List all the files in the current directory
/usr/bin/echo -e "${GREEN}📂 Current directory contents:${NC}"
/usr/bin/ls -l

# Check if the YAML file exists
if [ ! -f "$YAML_FILE" ]; then
  /usr/bin/echo -e "${RED}Error: ${YAML_FILE} not found.${NC}"
  exit 4
fi

/usr/bin/echo -e "${GREEN}🛠 Building $FUNCTION_NAME...${NC}"
/usr/local/bin/faas-cli build -f "$YAML_FILE"

/usr/bin/echo -e "${GREEN}📦 Pushing $FUNCTION_NAME...${NC}"
/usr/local/bin/faas-cli push -f "$YAML_FILE"

/usr/bin/echo -e "${GREEN}🧹 Deleting old pods...${NC}"
PODS=$(/usr/local/bin/kubectl get pods -n "$NAMESPACE" -l "faas_function=$FUNCTION_NAME" -o name)
if [ -n "$PODS" ]; then
  /usr/bin/echo "$PODS" | xargs /usr/local/bin/kubectl delete -n "$NAMESPACE"
else
  /usr/bin/echo -e "${RED}⚠️ No old pods found for function ${FUNCTION_NAME}.${NC}"
fi

/usr/bin/echo -e "${GREEN}🚀 Deploying $FUNCTION_NAME...${NC}"
DEPLOY_OUTPUT=$(/usr/local/bin/faas-cli deploy -f "$YAML_FILE" 2>&1)

if /usr/bin/echo "$DEPLOY_OUTPUT" | grep -q "Deployed."; then
  /usr/bin/echo -e "${GREEN}✅ Deployment successful!${NC}"
  /usr/bin/echo "$DEPLOY_OUTPUT" | grep "URL:"
else
  /usr/bin/echo -e "${RED}❌ Deployment failed!${NC}"
  /usr/bin/echo "$DEPLOY_OUTPUT"
  exit 5
fi
