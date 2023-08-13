#!/usr/bin/env bash

set -euo pipefail

ROLE_ARN="arn:aws:iam::487538579658:role/MumsmumsAdmin"
DYNAMO_DB_STACK_NAME="dynamodb-stack"

# Assume the MumsMumsAdmin role which is permitted to manage AWS resources
TEMP_CREDENTIALS=$(aws sts assume-role --role-arn "$ROLE_ARN" --role-session-name "AssumedRoleSession")

AWS_ACCESS_KEY_ID=$(echo "$TEMP_CREDENTIALS" | jq -r '.Credentials.AccessKeyId')
AWS_SECRET_ACCESS_KEY=$(echo "$TEMP_CREDENTIALS" | jq -r '.Credentials.SecretAccessKey')
AWS_SESSION_TOKEN=$(echo "$TEMP_CREDENTIALS" | jq -r '.Credentials.SessionToken')

export AWS_ACCESS_KEY_ID
export AWS_SECRET_ACCESS_KEY
export AWS_SESSION_TOKEN

aws cloudformation deploy --stack-name "$DYNAMO_DB_STACK_NAME" --template-file cloud-formation/dynamodb-stack.yaml --capabilities CAPABILITY_NAMED_IAM
