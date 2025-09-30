-- Database cleanup script to remove translation system tables
-- Run this script to completely remove translation-related tables from the database

-- Drop translation-related tables in correct order (respecting foreign key constraints)
DROP TABLE IF EXISTS translations;
DROP TABLE IF EXISTS translation_keys;
DROP TABLE IF EXISTS translation_namespaces;
DROP TABLE IF EXISTS languages;

-- Remove translation-related permissions from role_permissions table
DELETE FROM role_permissions WHERE permission LIKE 'translations:%';

-- Verify cleanup (these queries should return 0 rows)
-- SELECT COUNT(*) as translation_tables FROM information_schema.tables 
-- WHERE table_schema = DATABASE() AND table_name LIKE '%translation%';

-- SELECT COUNT(*) as language_tables FROM information_schema.tables 
-- WHERE table_schema = DATABASE() AND table_name = 'languages';

-- SELECT COUNT(*) as translation_permissions FROM role_permissions 
-- WHERE permission LIKE 'translations:%';
