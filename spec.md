# StudyShare

## Current State
Full-stack notes/study material sharing platform with:
- Browse page with free/premium material cards, search, subject filter
- Upload page (admin only) with file upload and metadata
- Dashboard (My Library) with purchased materials and "Claim Admin Access" card
- Admin panel for managing materials and Stripe config
- Stripe payment integration for premium materials ($4.99)
- Authorization system (role-based: admin/user/guest)
- Hero section with colored highlighted keywords

The "Claim Admin Access" button in My Library is broken. The flow is:
1. `useActor` calls `_initializeAccessControlWithSecret(adminToken)` on login, which registers the user. If no admin assigned yet AND token matches, user becomes admin.
2. But the button also calls `_initializeAccessControlWithSecret` again -- since the user is already registered, `initialize()` does nothing (early return on `case (?_)`).
3. Result: the button appears to do nothing / returns an error because the user is already registered as a plain `user` role, not admin.

## Requested Changes (Diff)

### Add
- New backend function `claimAdminIfFirst()`: if caller is not anonymous and no admin has been assigned yet, directly set caller as admin and return `true`. Returns `false` if admin already exists.

### Modify
- Frontend `useInitializeAdminAccess` hook: call `claimAdminIfFirst()` instead of `_initializeAccessControlWithSecret`. Show appropriate error if admin already claimed.

### Remove
- Nothing removed

## Implementation Plan
1. Regenerate backend with `claimAdminIfFirst` public shared function added to main.mo
2. Update `useQueries.ts` `useInitializeAdminAccess` to call `actor.claimAdminIfFirst()` and handle the boolean return (false = already claimed by someone else)
