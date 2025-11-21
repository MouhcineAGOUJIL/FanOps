#!/bin/bash

echo "📊 Testing Gate Reporting"
echo "========================="

echo ""
echo "1. Sending Gate Statistics Report..."
curl -s -X POST http://localhost:3000/dev/security/reportGate \
  -H "Content-Type: application/json" \
  -d '{
    "gateId": "G1",
    "deviceId": "scanner-01",
    "reportType": "stats",
    "validTickets": 150,
    "invalidTickets": 3,
    "replayAttempts": 2,
    "avgScanTime": 1.5,
    "errors": ["network_timeout", "invalid_format"],
    "message": "Gate operating normally"
  }' | jq

echo ""
echo "2. Sending Gate Error Report..."
curl -s -X POST http://localhost:3000/dev/security/reportGate \
  -H "Content-Type: application/json" \
  -d '{
    "gateId": "G2",
    "deviceId": "scanner-02",
    "reportType": "error",
    "validTickets": 0,
    "invalidTickets": 15,
    "replayAttempts": 0,
    "avgScanTime": 0,
    "errors": ["hardware_failure", "connection_lost"],
    "message": "Scanner hardware malfunction"
  }' | jq

echo ""
echo "3. Testing Missing Parameters..."
curl -s -X POST http://localhost:3000/dev/security/reportGate \
  -H "Content-Type: application/json" \
  -d '{
    "gateId": "G1"
  }' | jq