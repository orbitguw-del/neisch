-- 20260523000000_warehouse_site_type.sql
--
-- Adds type column to sites: 'construction_site' (default) | 'warehouse'.
-- A warehouse is a storage location — same stock/ledger/transfer flows, no
-- workers or attendance. Receipt destination picker uses this to drive
-- auto-transfer creation (warehouse → construction site).

alter table sites
  add column if not exists type text not null default 'construction_site'
  check (type in ('construction_site', 'warehouse'));
