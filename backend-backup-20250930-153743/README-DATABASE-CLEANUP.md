# Database Cleanup - Translation System Removal

## Overview
This document provides instructions for completely removing the translation system from the database.

## Files Created
- `cleanup-translation-tables.sql` - SQL script to remove translation tables
- This README with instructions

## Translation Tables to Remove
The following tables should be removed from the database:
- `translations`
- `translation_keys` 
- `translation_namespaces`
- `languages`

## How to Run the Cleanup

### Option 1: Using MySQL Command Line
```bash
# Connect to your MySQL database
mysql -h localhost -P 7777 -u root -p adminlte

# Run the cleanup script
source /path/to/cleanup-translation-tables.sql;
```

### Option 2: Using MySQL Workbench or phpMyAdmin
1. Open your MySQL client
2. Select the `adminlte` database
3. Copy and paste the contents of `cleanup-translation-tables.sql`
4. Execute the script

### Option 3: Using Docker (if using Docker for MySQL)
```bash
# Copy the script to the container
docker cp cleanup-translation-tables.sql <container_name>:/tmp/

# Execute the script
docker exec -i <container_name> mysql -u root -p adminlte < /tmp/cleanup-translation-tables.sql
```

## Verification
After running the cleanup script, verify that the tables are removed:

```sql
-- Check for translation tables (should return 0 rows)
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'adminlte' 
AND table_name LIKE '%translation%';

-- Check for language table (should return 0 rows)
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'adminlte' 
AND table_name = 'languages';

-- Check for translation permissions (should return 0 rows)
SELECT COUNT(*) as translation_permissions 
FROM role_permissions 
WHERE permission LIKE 'translations:%';
```

## Safety Notes
- **BACKUP YOUR DATABASE** before running this script
- This script will permanently delete translation data
- Make sure no other parts of your application depend on these tables
- Test in a development environment first

## What This Script Does
1. Drops translation-related tables
2. Removes translation permissions from role_permissions table
3. Provides verification queries to confirm cleanup

## After Cleanup
- Restart your backend application
- Verify that the application starts without errors
- Check that no translation-related errors appear in logs
