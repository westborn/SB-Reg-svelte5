-- Phase 1 integrity baseline checks
-- Run these queries on clone/baseline before and after each RLS increment.

-- 1) Registrations without artists
select count(*) as registrations_without_artist
from registration r
left join artist a on a.id = r.artist_id
where a.id is null;

-- 2) Entries with broken artist/registration chain
select count(*) as entries_with_broken_chain
from entry e
left join artist a on a.id = e.artist_id
left join registration r on r.id = e.registration_id
where a.id is null
   or r.id is null
   or r.artist_id <> e.artist_id;

-- 3) Attached images with broken ownership chain
select count(*) as images_with_broken_chain
from image i
left join artist a on a.id = i.artist_id
left join entry e on e.id = i.entry_id
left join registration r on r.id = i.registration_id
where a.id is null
   or (i.entry_id is not null and e.id is null)
   or (i.entry_id is not null and e.artist_id <> i.artist_id)
   or (i.registration_id is not null and r.id is null)
   or (i.entry_id is not null and i.registration_id is not null and e.registration_id <> i.registration_id);

-- 4) Duplicate primary image rows per entry (should always be zero)
select entry_id, count(*) as row_count
from primary_image
group by entry_id
having count(*) > 1;

-- 5) Primary image points to image not attached to same entry
select count(*) as invalid_primary_image_mapping
from primary_image p
join image i on i.id = p.image_id
where i.entry_id is distinct from p.entry_id;

-- 6) Duplicate location rows per entry (should always be zero)
select entry_id, count(*) as row_count
from location
group by entry_id
having count(*) > 1;

-- 7) Location rows with missing entry
select count(*) as locations_without_entry
from location l
left join entry e on e.id = l.entry_id
where e.id is null;

-- 8) Orphan entries by registration delete chain
select count(*) as entries_without_registration
from entry e
left join registration r on r.id = e.registration_id
where r.id is null;

-- 9) Orphan images by entry delete chain (attached only)
select count(*) as attached_images_without_entry
from image i
left join entry e on e.id = i.entry_id
where i.entry_id is not null
  and e.id is null;

-- 10) Orphan primary image rows by entry/image linkage
select count(*) as orphan_primary_image_rows
from primary_image p
left join entry e on e.id = p.entry_id
left join image i on i.id = p.image_id
where e.id is null
   or i.id is null;
