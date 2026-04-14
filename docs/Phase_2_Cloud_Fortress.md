# Phase 2: Cloud Fortress (M6-M9)

> **Status:** ✅ COMPLETE  
> **Tags:** #phase2 #supabase #security #rls #sync  
> **Files:** `api.js`, Supabase Config, Auth Flow

---

## Overview

The security and synchronization layer. Data protection through Row Level Security (RLS). Optimistic UI with background sync.

**Philosophy:** The user owns their data. We merely facilitate the membrane between local and cloud.

---

## Technology Stack

| Component | Technology | Purpose |
|-----------|------------|---------|
| Database | PostgreSQL (Supabase) | Structured persistence |
| Auth | Supabase Auth | Session management |
| Security | RLS Policies | Row-level access control |
| Functions | Edge Functions | Serverless API |
| Realtime | Supabase Realtime | Live sync (optional) |

---

## Module: API Gateway (api.js)

### Purpose
The cloud interface. All Supabase interactions centralized here.

### Architecture
```javascript
export const api = {
  client: null,           // Supabase client instance
  isOnline: false,        // Connection state
  
  // Core methods
  init(),                 // Initialize client
  syncProfile(),         // Upload to cloud
  fetchProfile(),        // Download from cloud
  isAuthenticated()      // Session check
}
```

### Configuration
```javascript
const SUPABASE_URL = '<YOUR_SUPABASE_URL>';
const SUPABASE_KEY = '<REDACTED_FOR_SECURITY>';
```

---

## Security: Row Level Security (RLS)

### Gesetz 11: RLS Law
> "Datenbankzugriff nur über Row Level Security. User können physisch keine fremden Daten lesen."

### Active Policies (profiles table)

| Operation | Policy | Condition |
|-----------|--------|-----------|
| SELECT | Users can read own profile | `auth.uid() = id` |
| INSERT | Users can create own profile | `auth.uid() = id` |
| UPDATE | Users can update own profile | `auth.uid() = id` |
| DELETE | Disabled | No policy |

### Verification Status
```javascript
/**
 * RLS VERIFICATION: ✅ PASSED (13.04.2026)
 * - profiles: SELECT (auth.uid() = id) ✅
 * - profiles: INSERT (auth.uid() = id) ✅
 * - profiles: UPDATE (auth.uid() = id) ✅
 * - DELETE: Not allowed (no policy) ✅
 */
```

---

## Sync Strategy

### Gesetz 10: Cloud-First, Offline-Always
```
User Action → LocalStorage (instant) → Supabase (async)
                      ↑                        ↓
                 Fallback state           Sync debounced
```

### Debouncing (Gesetz 12)
```javascript
let _syncDebounceTimer = null;

// Keystroke-intensive: 300ms
// Standard actions: 1000ms
// Batch uploads: 5000ms
```

### Optimistic UI Pattern
1. **Instant:** Write to LocalStorage
2. **Async:** Queue for cloud sync
3. **Debounce:** Wait for activity pause
4. **Upload:** Supabase upsert
5. **Error:** Retry or notify

---

## Authentication Flow

### Session Management
```javascript
// Check session
const session = await api.client.auth.getSession();

// Login
await api.client.auth.signInWithPassword({ email, password });

// Logout
await api.client.auth.signOut();
```

### Profile Synchronization
```javascript
// Upload
await api.client.from('profiles').upsert({
  id: userId,
  display_name: name,
  access_level: level,
  last_sync: new Date().toISOString()
});

// Download
const { data, error } = await api.client
  .from('profiles')
  .select('*')
  .eq('id', userId)
  .single();
```

---

## Data Model

### profiles Table
```sql
CREATE TABLE profiles (
  id uuid PRIMARY KEY references auth.users(id),
  display_name text,
  access_level integer DEFAULT 1,
  current_streak integer DEFAULT 0,
  shields integer DEFAULT 0,
  last_sync timestamp with time zone,
  created_at timestamp with time zone DEFAULT now()
);
```

---

## Security Checklist

| Check | Status |
|-------|--------|
| RLS enabled on all tables | ✅ |
| Policies restrict to auth.uid() | ✅ |
| Service key never exposed to client | ✅ |
| Anonymous key has minimal privileges | ✅ |
| DELETE operations disabled | ✅ |
| Sync debounced (no DDoS) | ✅ |

---

## Deployment

### GitHub Pages + Supabase
- **Frontend:** Static hosting (GitHub Pages)
- **Backend:** Supabase (managed)
- **Auth:** Supabase Auth (free tier)
- **Database:** PostgreSQL (RLS secured)

### Zero-Cost Architecture
> GitHub Pages: Free  
> Supabase Free Tier: 500MB database, 2GB bandwidth  
> **Total:** $0/month at current scale

---

## Compliance

| Law | Implementation |
|-----|----------------|
| Gesetz 7 | LocalStorage fallback before cloud |
| Gesetz 10 | Optimistic UI + async sync |
| Gesetz 11 | RLS policies enforced |
| Gesetz 12 | Debounced cloud uploads |

---

## Related

- Previous: [[Phase_1_Core_Engine]]
- Next: [[Phase_3_The_Artifact]]
- Current Math: [[M14_Synergy_Engine]]
- Architecture: [[000_ARCHITECTURE]]

---

**Completed:** M9  
**Security Status:** ✅ FORTRESS
