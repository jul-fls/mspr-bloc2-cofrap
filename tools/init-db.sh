#!/bin/bash

set -e

NAMESPACE="postgres"
SECRET_NAME="postgres-postgresql"
INIT_SQL_FILE="init.sql"
DB_NAME="users"
DB_USER="faas"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

# Get pod name
POSTGRES_POD=$(kubectl get pod -n "$NAMESPACE" -l app.kubernetes.io/component=primary -o jsonpath="{.items[0].metadata.name}")

# Get DB password from secret
PGPASSWORD=$(kubectl get secret "$SECRET_NAME" -n "$NAMESPACE" -o jsonpath="{.data.password}" | base64 -d)

if [ ! -f "$INIT_SQL_FILE" ]; then
  echo -e "${RED}❌ init.sql not found in current directory.${NC}"
  exit 1
fi

echo -e "${GREEN}🔍 Targeting Postgres pod: $POSTGRES_POD${NC}"

# Drop all tables
echo -e "${GREEN}🧹 Deleting all tables in database '$DB_NAME'...${NC}"
kubectl exec -n "$NAMESPACE" "$POSTGRES_POD" -- bash -c "
  export PGPASSWORD='$PGPASSWORD';
  psql -U $DB_USER -d $DB_NAME -t -c \"
    SELECT 'DROP TABLE IF EXISTS \\\"' || tablename || '\\\" CASCADE;' FROM pg_tables WHERE schemaname = 'public';
  \" | psql -U $DB_USER -d $DB_NAME
"

# Copy init.sql into pod
echo -e "${GREEN}📤 Copying init.sql to pod...${NC}"
kubectl cp "$INIT_SQL_FILE" "$NAMESPACE/$POSTGRES_POD:/tmp/init.sql"

# Apply schema
echo -e "${GREEN}📥 Applying init.sql inside the pod...${NC}"
kubectl exec -n "$NAMESPACE" "$POSTGRES_POD" -- bash -c "
  export PGPASSWORD='$PGPASSWORD';
  psql -U $DB_USER -d $DB_NAME -f /tmp/init.sql
"

echo -e "${GREEN}✅ Database schema applied successfully.${NC}"
