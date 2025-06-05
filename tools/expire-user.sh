#!/bin/bash

set -e

# 🧩 Configuration
POSTGRES_NAMESPACE="postgres"
SECRET_NAMESPACE="openfaas"
SECRET_NAME="postgres-credentials"
DB_NAME="users"
DB_USER="faas"

# ✅ Check argument
if [ -z "$1" ]; then
  echo "❌ Usage: $0 <username>"
  exit 1
fi
USERNAME="$1"

# 📅 Compute 1 year ago in ISO 8601 format
ONE_YEAR_AGO=$(date -d '1 year ago' '+%Y-%m-%d')

# Get the pod name of the postgres primary
POD=$(kubectl get pods -n "$POSTGRES_NAMESPACE" -l app.kubernetes.io/component=primary -o jsonpath="{.items[0].metadata.name}")
echo "🔍 Using pod: $POD in namespace: $POSTGRES_NAMESPACE"

# Get DB password from secret stored in another namespace
PGPASSWORD=$(kubectl get secret "$SECRET_NAME" -n "$SECRET_NAMESPACE" -o jsonpath="{.data.PGPASSWORD}" | base64 -d)

# 🚀 Execute UPDATE inside the postgres pod
echo "🛠 Updating last_password_update for user: $USERNAME to $ONE_YEAR_AGO"

kubectl exec -n "$POSTGRES_NAMESPACE" "$POD" -- bash -c \
  "export PGPASSWORD='$PGPASSWORD'; psql -U '$DB_USER' -d '$DB_NAME' -c \"UPDATE users SET last_password_update = '$ONE_YEAR_AGO' WHERE login = '$USERNAME';\""
