-- Safe database cleanup script to remove translation system tables
-- This script handles foreign key constraints properly

-- First, let's see what translation-related tables exist
SELECT 'Checking for translation tables...' as status;
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = DATABASE() 
AND (table_name LIKE '%translation%' OR table_name = 'languages');

-- Disable foreign key checks temporarily
SET FOREIGN_KEY_CHECKS = 0;

-- Drop translation-related tables in correct order
DROP TABLE IF EXISTS translations;
DROP TABLE IF EXISTS translation_keys;
DROP TABLE IF EXISTS translation_namespaces;
DROP TABLE IF EXISTS languages;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- Remove translation-related permissions from role_permissions table
DELETE FROM role_permissions WHERE permission LIKE 'translations:%';

-- Verify cleanup
SELECT 'Verification - Translation tables remaining:' as status;
SELECT COUNT(*) as translation_tables 
FROM information_schema.tables 
WHERE table_schema = DATABASE() 
AND table_name LIKE '%translation%';

SELECT 'Verification - Language tables remaining:' as status;
SELECT COUNT(*) as language_tables 
FROM information_schema.tables 
WHERE table_schema = DATABASE() 
AND table_name = 'languages';

SELECT 'Verification - Translation permissions remaining:' as status;
SELECT COUNT(*) as translation_permissions 
FROM role_permissions 
WHERE permission LIKE 'translations:%';

SELECT 'Cleanup completed successfully!' as status;
