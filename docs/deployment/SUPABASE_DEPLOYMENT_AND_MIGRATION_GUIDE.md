# Supabase Deployment and Migration Guide

## Purpose

This guide explains how to prepare and apply Supabase schemas for AfriTrade OS. It is written for administrators and developers deploying to development, staging, or production Supabase projects.

## Supabase files in this repository

| File                                      | Purpose                                                                                                                                                                       |
| ----------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `supabase/schema.sql`                     | Core profiles, organizations, audit logs, documents, KYC, notifications, licenses, marketplace, tenders, bids, suppliers, contracts, and contract activity tables.            |
| `supabase/onboarding_state.sql`           | Onboarding-related profile columns and backfill defaults.                                                                                                                     |
| `supabase/settings_tables.sql`            | User preferences, security, sessions, integrations, API keys, AI settings, billing, usage, payment methods, invoices, team members, roles, and associations.                  |
| `supabase/finance_tables.sql`             | FX rates, FX history, hedging suggestions, and finance summaries.                                                                                                             |
| `supabase/gov_schema.sql`                 | Government policies, compliance cases, trade agreements, tariff schedules, border posts, and trusted traders.                                                                 |
| `supabase/customs_schema.sql`             | Customs declarations, reviews, certificates, traders, shipments, revenue, officers, alerts, and HS codes.                                                                     |
| `supabase/enterprise_exporter_schema.sql` | Export projects, project documents, trade partners, market intelligence, finance applications, shipments, tenders, contracts, compliance, KYC, marketing, and dashboard KPIs. |
| `supabase/fix-rls-recursion.sql`          | RLS policy remediation for recursive policy patterns.                                                                                                                         |
| `supabase_rls_policies.sql`               | Additional RLS policy definitions where applicable.                                                                                                                           |

## Environment prerequisites

- Supabase project created.
- Supabase SQL editor or Supabase CLI access.
- Application environment variables configured:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
- Production database backups enabled.
- Separate development, staging, and production projects recommended.

## Recommended migration order

Apply SQL in this order for a clean project:

1. `supabase/schema.sql`
2. `supabase/onboarding_state.sql`
3. `supabase/settings_tables.sql`
4. `supabase/finance_tables.sql`
5. `supabase/gov_schema.sql`
6. `supabase/customs_schema.sql`
7. `supabase/enterprise_exporter_schema.sql`
8. `supabase/fix-rls-recursion.sql`
9. `supabase_rls_policies.sql` if it contains policies not already included in the environment.

## Deployment process

### 1. Prepare

1. Confirm target Supabase project.
2. Export current schema or create a restore point.
3. Review SQL for destructive statements.
4. Confirm extension requirements such as `uuid-ossp` or `pgcrypto` if used by the target SQL.
5. Confirm auth provider settings and email templates.

### 2. Apply schema

Use the Supabase SQL editor or CLI. If using SQL editor, apply one file at a time in the recommended order. If using CLI, keep migrations ordered and idempotent.

### 3. Validate tables

After applying scripts, confirm key table groups exist:

- Core: `profiles`, `organizations`, `audit_logs`, `documents`, `notifications`.
- Marketplace: `products`, `wishlist`, `tenders`, `bids`, `supplier_ratings`.
- Contracts: `contract_templates`, `contracts`, `contract_milestones`, `contract_amendments`, `contract_disputes`, `contract_activities`.
- Customs: `customs_declarations`, `customs_reviews`, `customs_traders`, `customs_shipments`.
- Government: `gov_policies`, `gov_compliance_cases`, `gov_trade_agreements`, `gov_tariff_schedules`, `gov_border_posts`.
- Settings: `user_preferences`, `user_security`, `integrations`, `api_keys`, `billing_info`.

### 4. Validate RLS

1. Confirm RLS is enabled on private tables.
2. Confirm public-read tables intentionally allow public access.
3. Test authenticated user access to own profile, preferences, documents, and notifications.
4. Test organization-scoped access with a user belonging to the organization.
5. Test government and customs persona access separately.
6. Test anonymous access only where intended, such as public marketplace or reference data.

### 5. Seed reference data

Seed only reviewed, non-sensitive reference data in production:

- HS codes and tariff references.
- Trade agreements.
- Border posts.
- Public financiers.
- Public contract templates.
- Trade associations.

### 6. Configure storage

Create storage buckets for document uploads if the production flow stores files in Supabase Storage. Apply bucket policies that mirror table ownership and organization constraints.

### 7. Configure auth

1. Enable required providers.
2. Configure redirect URLs for local, staging, and production domains.
3. Configure email templates.
4. Configure password policy and MFA policy if supported.
5. Confirm password reset routes function in the app shell.

## Migration safety rules

- Prefer `CREATE TABLE IF NOT EXISTS` and `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` for additive changes.
- Avoid destructive changes without backup and rollback plan.
- Never weaken RLS to debug production issues; reproduce in staging.
- Keep migration files in source control and apply them in order.
- Review duplicate table definitions before applying domain schemas. For example, `fx_rates` appears in both finance and enterprise exporter schema contexts and should be reconciled per target environment.

## Rollback guidance

For additive migrations, rollback may require dropping new policies, indexes, columns, or tables. For production, prefer restore points over hand-written destructive rollbacks when data integrity is at risk.

Rollback checklist:

1. Stop or pause impacted application workflows if needed.
2. Restore from backup or apply reviewed rollback SQL.
3. Re-run RLS validation.
4. Re-run core persona smoke tests.
5. Communicate recovery status.

## Post-migration smoke tests

1. Create a user and complete onboarding.
2. Read/write profile settings.
3. Fetch notifications.
4. Create or view an organization.
5. Load marketplace and tender views.
6. Submit a KYC/document workflow in staging.
7. Load customs and government dashboards with authorized personas.
8. Run a finance application review with bank persona.
9. Confirm unauthorized personas are blocked from restricted routes and tables.
