#!/bin/bash

set -e

# 🧩 Configuration
POSTGRES_NAMESPACE="postgres"
SECRET_NAMESPACE="openfaas"
SECRET_NAME="postgres-credentials"
DB_NAME="users"
DB_USER="faas"

# Get the pod name of the postgres primary
POD=$(kubectl get pods -n "$POSTGRES_NAMESPACE" -l app.kubernetes.io/component=primary -o jsonpath="{.items[0].metadata.name}")
echo "🔍 Using pod: $POD in namespace: $POSTGRES_NAMESPACE"

# Get DB password from secret stored in another namespace
PGPASSWORD=$(kubectl get secret "$SECRET_NAME" -n "$SECRET_NAMESPACE" -o jsonpath="{.data.PGPASSWORD}" | base64 -d)

# 🚀 Execute SQL query inside the postgres pod
kubectl exec -n "$POSTGRES_NAMESPACE" "$POD" -- bash -c "export PGPASSWORD='$PGPASSWORD'; psql -U '$DB_USER' -d '$DB_NAME' -c \"SELECT * FROM users;\""
