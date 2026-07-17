/*
# Add phone column to staff table

1. Modified Tables
- `staff`: added `phone` text column (nullable) for WhatsApp notifications to stylists
*/

ALTER TABLE staff ADD COLUMN IF NOT EXISTS phone text;
