# Storage Setup for Admin Panel

## Create Buckets in Supabase Dashboard

1. Go to **Supabase Dashboard** → **Storage**
2. Click **New bucket**

### product-images
- **Name:** `product-images`
- **Public bucket:** Yes
- **File size limit:** 5 MB
- **Allowed MIME types:** `image/jpeg`, `image/png`, `image/webp`, `image/gif`

### banner-images
- **Name:** `banner-images`
- **Public bucket:** Yes
- **File size limit:** 5 MB
- **Allowed MIME types:** `image/jpeg`, `image/png`, `image/webp`, `image/gif`

## RLS Policies

After creating buckets, run migration `012_storage_buckets.sql` to add upload/read policies. Or add manually:

- **product-images**: Admin (team_members with role=admin) can INSERT; Public can SELECT
- **banner-images**: Same as above

## Public URL Format

Files are accessible at:
`https://<project-ref>.supabase.co/storage/v1/object/public/product-images/<path>`
`https://<project-ref>.supabase.co/storage/v1/object/public/banner-images/<path>`
