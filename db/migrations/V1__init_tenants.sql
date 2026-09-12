-- Tenant-aware templates/assets for multi-tenant report rendering.
-- See src/reports/reports.service.ts for how these are consumed.

create table tenants (
  id serial primary key,
  code varchar(64) not null unique,
  name varchar(255) not null,
  created_at timestamptz not null default now()
);

create table tenant_templates (
  id serial primary key,
  tenant_id integer not null references tenants(id) on delete cascade,
  template_key varchar(64) not null,
  html text not null,
  updated_at timestamptz not null default now(),
  unique (tenant_id, template_key)
);

create table tenant_assets (
  id serial primary key,
  tenant_id integer not null references tenants(id) on delete cascade,
  asset_key varchar(64) not null,
  content bytea not null,
  content_type varchar(100) not null,
  updated_at timestamptz not null default now(),
  unique (tenant_id, asset_key)
);
