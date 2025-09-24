-- SQL script to validate Phase 6.1 migration completion
-- Check if primary_image table exists and has correct structure

-- 1. Verify primary_image table exists
SELECT
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'primary_image'
ORDER BY ordinal_position;

-- 2. Check foreign key constraints
SELECT
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_name = 'primary_image';

-- 3. Check unique constraint on entry_id
SELECT
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'primary_image'
    AND tc.constraint_type = 'UNIQUE';

-- 4. Count existing entries vs entries with primary images
SELECT
    'Total entries' as metric,
    COUNT(*) as count
FROM entry
UNION ALL
SELECT
    'Entries with images' as metric,
    COUNT(DISTINCT entry_id) as count
FROM image
WHERE entry_id IS NOT NULL
UNION ALL
SELECT
    'Entries with primary image relation' as metric,
    COUNT(*) as count
FROM primary_image;
