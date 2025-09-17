# Fix Images Not Visible in Search Property

## Tasks
- [x] Export API_URL from frontend/src/utils/api.ts
- [x] Update PropertyCard.tsx to import API_URL and use it for image URLs
- [x] Add debug logging to OwnerDashboard.tsx for add property response
- [x] Investigate backend approval status filtering in search API

## Findings
- Image URL construction was inconsistent between API calls and image fetching
- Fixed by using consistent API_URL for both
- Root cause: Properties are not visible in search because they have approvalStatus: "pending" by default
- Search API only returns properties with approvalStatus: "approved"
- Newly added properties need admin approval before appearing in search results

## Solution
- Fixed image URL consistency
- Properties require admin approval to appear in search results (this is correct behavior for a rental platform)
- User should contact admin to approve properties or implement auto-approval if appropriate
