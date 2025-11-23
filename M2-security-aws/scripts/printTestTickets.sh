#!/bin/bash

# Print Test Tickets from AWS DynamoDB

echo "🎫 ============================================"
echo "   CAN 2025 - TEST TICKETS"
echo "============================================"
echo ""

# Get all tickets and format them nicely
aws dynamodb scan \
  --table-name can2025-secure-gates-sold-tickets-dev \
  --region eu-west-1 | \
  jq -r '.Items[] | 
    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n" +
    "🎟️  TICKET ID: \(.ticketId.S)\n" +
    "👤 User: \(.userId.S)\n" +
    "💺 Seat: \(.seatNumber.S) (\(.type.S))\n" +
    "🏟️  Match: \(.matchId.S)\n" +
    "📊 Status: \(.status.S)\n" +
    "\n🔑 JWT Token:\n\(.jwt.S)\n"'

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Total tickets available for testing"
echo ""

# Count tickets
aws dynamodb scan \
  --table-name can2025-secure-gates-sold-tickets-dev \
  --region eu-west-1 \
  --select COUNT | jq -r '"📊 Total: \(.Count) tickets"'

echo ""
echo "💡 Usage: Copy any JWT token above and paste into scanner"
echo "============================================"
