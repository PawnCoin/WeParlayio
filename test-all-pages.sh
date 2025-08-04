#!/bin/bash

# WeParlay.io Comprehensive Page Testing Script
echo "🚀 Starting comprehensive WeParlay.io page testing..."

BASE_URL="http://localhost:5000"
ROUTES=(
    "/"
    "/auth"
    "/login" 
    "/signup"
    "/betting-hub"
    "/betting-dashboard"
    "/live-betting"
    "/odds"
    "/parlays"
    "/live-heatmap"
    "/betting-academy"
    "/results"
    "/my-bets"
    "/sports"
    "/sports/nfl"
    "/sport/nfl"
    "/esports-hub"
    "/tournaments"
    "/gaming"
    "/vip"
    "/banking"
    "/plaid-banking"
    "/crypto-wallet"
    "/social"
    "/head-to-head"
    "/profile"
    "/settings"
    "/security-settings"
    "/upgrade-tier"
    "/fantasy"
    "/fantasy-football"
    "/live-streaming"
    "/iptv"
    "/trivia"
    "/tier-comparison"
    "/weparlay-cash"
    "/crypto-info"
    "/analytics"
    "/theme-settings"
    "/payment-checkout"
    "/crypto-checkout"
    "/tier-upgrade-success"
    "/support"
    "/privacy-policy"
    "/terms-of-service"
    "/security-info"
)

ADMIN_ROUTES=(
    "/admin"
    "/admin-dashboard"
    "/users"
    "/admin/manage-users"
    "/admin/financial-overview"
    "/admin/analytics"
    "/admin/platform-settings"
    "/admin/visual-component-editor"
    "/social-media-bots"
    "/admin/social-media-dashboard"
    "/admin/verification"
    "/admin/security"
    "/system/notifications"
    "/system/transactions"
    "/system/payouts"
    "/system/logs"
    "/system/api-status"
    "/system/health"
    "/system/gaming"
    "/system/streaming"
)

DEV_ROUTES=(
    "/token-cleanup-test"
    "/notification-test"
    "/test-admin-auth"
    "/quick-admin-login"
    "/admin-login-test"
    "/api-test"
)

# Test function
test_route() {
    local route=$1
    local route_type=$2
    echo "Testing $route_type: $route"
    
    # Test HTTP response
    response=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL$route")
    
    if [ "$response" = "200" ]; then
        echo "✅ $route - HTTP 200 OK"
        return 0
    elif [ "$response" = "302" ] || [ "$response" = "301" ]; then
        echo "🔄 $route - Redirect ($response)"
        return 0
    elif [ "$response" = "401" ] || [ "$response" = "403" ]; then
        echo "🔒 $route - Auth Required ($response)"
        return 0
    else
        echo "❌ $route - HTTP $response"
        return 1
    fi
}

# Test public routes
echo "🌐 Testing Public Routes..."
failed_routes=()
for route in "${ROUTES[@]}"; do
    if ! test_route "$route" "PUBLIC"; then
        failed_routes+=("$route")
    fi
done

# Test admin routes
echo "🔐 Testing Admin Routes..."
for route in "${ADMIN_ROUTES[@]}"; do
    if ! test_route "$route" "ADMIN"; then
        failed_routes+=("$route")
    fi
done

# Test dev routes (only in dev)
echo "🛠️ Testing Dev Routes..."
for route in "${DEV_ROUTES[@]}"; do
    if ! test_route "$route" "DEV"; then
        failed_routes+=("$route")
    fi
done

# Summary
echo ""
echo "📊 TESTING SUMMARY"
echo "=================="
total_routes=$((${#ROUTES[@]} + ${#ADMIN_ROUTES[@]} + ${#DEV_ROUTES[@]}))
failed_count=${#failed_routes[@]}
success_count=$((total_routes - failed_count))

echo "Total Routes Tested: $total_routes"
echo "Successful: $success_count"
echo "Failed: $failed_count"

if [ $failed_count -gt 0 ]; then
    echo ""
    echo "❌ Failed Routes:"
    for route in "${failed_routes[@]}"; do
        echo "   $route"
    done
    exit 1
else
    echo "🎉 All routes tested successfully!"
    exit 0
fi
