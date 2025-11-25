#!/bin/bash

API_URL="https://3cfc8hn4xa.execute-api.eu-west-1.amazonaws.com/dev"
VALID_TICKET="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJVU0VSLTg5OCIsInRpY2tldElkIjoiNzgzOTAwNzgtNmZiZi00MmU4LTk5NWItNjI4Yjg3MTZhM2EwIiwic2NvcGVzIjpbImZhbiJdLCJqdGkiOiIyZDZiZmFlOC01NjZmLTRjZWItYWY3MS00YzdlMmFlY2QyZjciLCJtYXRjaElkIjoiQ0FOMjAyNS1NQVItRzEiLCJzZWF0TnVtYmVyIjoiVklQLTUiLCJ0eXBlIjoiVklQIiwiaWF0IjoxNzY0MDYwMzk4LCJleHAiOjE3NjQxNDY3OTh9.V1B6ZP-sRl23VJhKyJ99mXRNDa0cqqs0l-pa85_XmjU"

echo "🚀 Generating Traffic for Sentinel..."

# 1. Login Success
echo "1️⃣  Login Success (admin)..."
TOKEN=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}' | jq -r '.token')
echo "   Token: ${TOKEN:0:20}..."

# 2. Login Failure
echo "2️⃣  Login Failure (hacker)..."
curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username": "hacker", "password": "wrongpassword"}' > /dev/null

# 3. Verify Valid Ticket
echo "3️⃣  Verify Valid Ticket..."
curl -s -X POST "$API_URL/security/verifyTicket" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"ticketJWT\": \"$VALID_TICKET\", \"gateId\": \"G1\", \"gatekeeperId\": \"GK1\"}" > /dev/null

# 4. Verify Invalid Ticket
echo "4️⃣  Verify Invalid Ticket..."
curl -s -X POST "$API_URL/security/verifyTicket" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"ticketJWT": "invalid.jwt.token", "gateId": "G1", "gatekeeperId": "GK1"}' > /dev/null

echo "✅ Traffic generated! Logs should appear in Sentinel in 5-10 minutes."
