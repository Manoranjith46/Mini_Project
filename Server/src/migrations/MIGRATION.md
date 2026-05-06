# Database Migration Guide

## Migration: Update "Reported" status to "Pending"

This migration updates all existing issues with the "Reported" status to "Pending".

### Background
The issue status system has been updated to remove the "Reported" status and replace it with "Pending" as the default status for new issues.

### What Changed
- ❌ Removed "Reported" from issue status enum
- ✅ Added "Pending" as the default status for new issues
- 🔄 Updated frontend to remove "Reported" from status filter options

### How to Run the Migration

1. **Make sure your server is set up:**
   ```bash
   cd Server
   npm install
   ```

2. **Run the migration script:**
   ```bash
   npm run migrate:reported-to-pending
   ```

   Or manually with ts-node:
   ```bash
   npx ts-node src/migrations/migrateReportedToPending.ts
   ```

3. **Verify the migration:**
   - The script will log the number of updated issues
   - It will verify that no "Reported" statuses remain
   - All matching issues will be converted to "Pending"

### Environment Variables
Make sure your `.env` file contains the MongoDB connection string:
```
MONGODB_URI=mongodb://localhost:27017/mini-project
```

### Rollback (if needed)
If you need to rollback, run the reverse migration:
```bash
npx ts-node src/migrations/migrateReportedToPending.ts
```
And manually change "Pending" back to "Reported" in the database.

### Files Modified
- `Server/src/models/issue.model.ts` - Removed "Reported" from enum, changed default to "Pending"
- `Server/src/controllers/issues.controllers.ts` - Changed new issue status to "Pending"
- `Server/src/controllers/admin.controller.ts` - Removed "Reported" from valid statuses
- `Server/src/utils/issue.ts` - Updated interface
- `Server/src/models/issueStatusHistory.model.ts` - Removed "Reported" from history enum
- `Client/src/pages/CitizenHome.tsx` - Removed "Reported" from status filter options
