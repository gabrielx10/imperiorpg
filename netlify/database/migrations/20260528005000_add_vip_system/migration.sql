/*
  # Add VIP System to Characters

  1. New Columns
    - `vip_level` (integer) - VIP tier: 0 = regular, 1+ = VIP
    - `vip_expiry` (timestamp) - When VIP expires
    - `auto_battle` (boolean) - Whether auto-battle is enabled
    - `is_admin` (boolean) - Admin status for management panel
*/

ALTER TABLE "characters" ADD COLUMN "vip_level" integer DEFAULT 0 NOT NULL;
ALTER TABLE "characters" ADD COLUMN "vip_expiry" timestamp;
ALTER TABLE "characters" ADD COLUMN "auto_battle" boolean DEFAULT false NOT NULL;
ALTER TABLE "characters" ADD COLUMN "is_admin" boolean DEFAULT false NOT NULL;
