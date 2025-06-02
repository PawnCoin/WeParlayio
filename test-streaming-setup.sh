#!/bin/bash
# Test TVApp2 Integration Script

echo "Testing TVApp2 streaming integration..."

# Test streaming status endpoint
echo "1. Checking streaming status:"
curl -s http://localhost:5000/api/streaming/status | jq '.'

echo -e "\n2. Testing sports streams endpoint:"
curl -s http://localhost:5000/api/streaming/sports | jq '.'

echo -e "\n3. Testing esports streams endpoint:"
curl -s http://localhost:5000/api/streaming/esports | jq '.'

echo -e "\n4. Testing specific stream access:"
curl -s http://localhost:5000/api/streaming/stream/test-event-123 | jq '.'

echo -e "\nIntegration test complete!"