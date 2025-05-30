
# TypeScript/ESLint Unused Functions Audit

## 🔴 CRITICAL - Backend Infrastructure (Fix Immediately)

### 1. WordPress Sync Functions

- **Issue**: `applyWordPressConfig` called globally but may have connection issues
- **Priority**: CRITICAL - Affects theme integration
- **Status**: ⚠️ Needs verification

### 2. WebSocket Service Functions
- **File**: `server/services/websocketService.ts`
- **Issue**: Connection handlers may not be properly attached
- **Priority**: CRITICAL - Real-time functionality
- **Status**: ⚠️ Needs audit

### 3. Authentication Middleware
- **File**: `server/middleware/restrictedAuth.ts`
- **Issue**: Auth functions may not be exported/used
- **Priority**: CRITICAL - Security
- **Status**: ⚠️ Needs verification

## 🟠 HIGH PRIORITY - Core Functionality

### 4. Sport Icon Function (CONFIRMED)
- **File**: `client/src/components/layout/Sidebar.tsx`
- **Function**: `getSportIcon(sportKey: string)`
- **Issue**: Defined but never called
- **Priority**: HIGH - UI functionality
- **Status**: 🔴 CONFIRMED UNUSED

### 5. Gaming API Functions
- **File**: `server/services/gamingAPIService.ts`
- **Issue**: API integration functions may be unused
- **Priority**: HIGH - Gaming features
- **Status**: ⚠️ Needs audit

### 6. Real-time Odds Functions
- **File**: `server/services/realTimeOddsService.ts`
- **Functions**: Various processing methods
- **Priority**: HIGH - Core betting
- **Status**: ⚠️ Needs verification

### 7. Wallet Service Functions
- **File**: `client/src/services/walletService.ts`
- **Functions**: Connection handlers
- **Priority**: HIGH - Payment processing
- **Status**: ⚠️ Needs audit

## 🟡 MEDIUM PRIORITY - User Experience

### 8. Notification Functions
- **File**: `server/services/notificationService.ts`
- **Issue**: Some notification handlers unused
- **Priority**: MEDIUM - User engagement
- **Status**: ⚠️ Needs audit

### 9. Internationalization Functions
- **File**: `client/src/lib/internationalization.ts`
- **Functions**: Format helpers
- **Priority**: MEDIUM - Localization
- **Status**: ⚠️ Needs verification

### 10. Analytics Functions
- **File**: `client/src/lib/analytics.ts`
- **Functions**: Tracking helpers
- **Priority**: MEDIUM - Data collection
- **Status**: ⚠️ Needs audit

### 11. Theme Functions
- **File**: `client/src/lib/themeColorUtils.ts`
- **Functions**: Color processing
- **Priority**: MEDIUM - UI consistency
- **Status**: ⚠️ Needs verification

## 🟢 LOW PRIORITY - Enhancement Features

### 12. Social Media Bot Functions
- **File**: `server/services/socialMediaBots.ts`
- **Functions**: Bot automation
- **Priority**: LOW - Marketing
- **Status**: ⚠️ Can defer

### 13. Advanced Gaming Functions
- **File**: Various gaming components
- **Functions**: Secondary features
- **Priority**: LOW - Nice-to-have
- **Status**: ⚠️ Can defer

## Action Plan

### Phase 1: Critical Backend (Day 1)
1. Audit WebSocket service connections
2. Verify WordPress sync integration
3. Check authentication middleware usage

### Phase 2: Core Functionality (Day 2)
1. Fix `getSportIcon` function usage
2. Audit gaming API integrations
3. Verify real-time odds processing

### Phase 3: User Experience (Day 3)
1. Check notification service usage
2. Verify analytics tracking
3. Audit internationalization

### Phase 4: Enhancements (Day 4+)
1. Review social media functions
2. Check advanced gaming features
3. Cleanup unused utilities

## Notes
- Functions marked as ⚠️ need manual verification
- Functions marked as 🔴 are confirmed unused
- Priority based on impact on core functionality
- Backend stability is highest priority
