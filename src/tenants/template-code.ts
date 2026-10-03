// Stable identifiers for the tenant-customizable templates, stored as
// tenant_templates.template_key (see db/migrations/V1__init_tenants.sql). Decoupled from the
// on-disk filename so the filesystem layout in src/reports/templates can change independently
// of what's stored per-tenant in the database.
export enum TemplateCode {
  OUTGOING_BILL = 'OUTGOING_BILL',
  OUTGOING_BILL_INFO = 'OUTGOING_BILL_INFO',
  INGOING_BILL = 'INGOING_BILL',
}

// Maps each tenant-customizable template file to its TemplateCode.
// template_pos_transaction.html/template_bank_statement.html have no tenant-specific content
// at all (shared filesystem markup, no logo). template_isplatnica.html/template_uplatnica.html
// are similarly absent, but do pull the tenant-specific default-signature(-with-stamp) assets at render time
// (see NEEDS_DEFAULT_SIGNATURE in reports.service.ts).
export const TENANT_TEMPLATE_CODES: Record<string, TemplateCode> = {
  'template_outgoing_bill.html': TemplateCode.OUTGOING_BILL,
  'template_outgoing_bill_info.html': TemplateCode.OUTGOING_BILL_INFO,
  'template_ingoing_bill.html': TemplateCode.INGOING_BILL,
};
