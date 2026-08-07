# Security Model and RLS Policy Explanation

## Security goals

AfriTrade OS handles trade, identity, finance, customs, government, logistics, and marketplace data. The security model is designed to:

- Keep users scoped to their own profile, sessions, preferences, documents, notifications, and billing data.
- Keep organization data scoped to members or authorized counterparties.
- Give customs users access to customs workflows.
- Give government users access to government oversight workflows.
- Allow public access only to intentional marketplace or reference data.
- Preserve auditability for sensitive decisions and admin actions.

## Identity model

- Supabase Auth provides authenticated user identity through `auth.uid()`.
- `profiles.id` should match the Supabase Auth user ID.
- `profiles.role` maps to application personas.
- `profiles.organization_id` links users to organizations.
- `profiles.is_super_admin` supports platform-level administrative access where policies allow it.

## Application access model

The frontend enforces role-based route access using the application role menu configuration. This improves user experience and prevents accidental access to unauthorized modules. Database RLS remains the authoritative control for data access.

## RLS principles

1. **Default private:** Sensitive tables should enable RLS.
2. **Owner access:** User-owned data uses `auth.uid() = user_id` or `auth.uid() = id`.
3. **Organization access:** Organization-scoped data should verify that the user belongs to the same organization.
4. **Role access:** Customs and government tables should verify user persona or authorized role.
5. **Public reference data:** Public tables must be intentionally public and contain no sensitive records.
6. **No recursive policies:** Avoid policies that query the same table in a way that causes recursion.
7. **Least privilege:** Separate `SELECT`, `INSERT`, `UPDATE`, and `DELETE` where different permissions are needed.

## Common policy patterns

### User-owned data

Used for profiles, notifications, preferences, sessions, security, payment methods, and invoices.

```sql
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id)
```

### Profile self-access

Used for profile rows where the primary key equals the auth user ID.

```sql
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id)
```

### Organization-scoped access

Used for products, tenders, bids, contracts, teams, and organization-specific workflows.

```sql
USING (
  organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
  )
)
```

When this pattern causes recursion or complexity, prefer helper functions or non-recursive policy remediation as represented by `supabase/fix-rls-recursion.sql`.

### Public reference data

Used for intentionally public records, such as public organizations, active financiers, active products, public tenders, verified ratings, public templates, FX rates, HS codes, and selected market intelligence.

```sql
USING (true)
```

or a narrower predicate such as:

```sql
USING (is_active = true)
```

### Persona-restricted data

Used for customs and government workflows. Policies should verify the authenticated user is assigned the relevant role in `profiles` or another authority table.

```sql
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
      AND profiles.role IN ('Customs Authority', 'Platform Admin')
  )
)
```

## RLS coverage by area

| Area         | Example tables                                                                                             | Expected access                                                                         |
| ------------ | ---------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| Identity     | `profiles`, `user_preferences`, `user_security`, `user_sessions`                                           | Users manage their own records.                                                         |
| Organization | `organizations`, `team_members`, `roles`                                                                   | Members view organization records; admins manage team/roles.                            |
| Marketplace  | `products`, `wishlist`, `tenders`, `bids`, `supplier_ratings`                                              | Public read where intended; organization members manage own listings/bids.              |
| Contracts    | `contracts`, `contract_milestones`, `contract_amendments`, `contract_disputes`                             | Contract parties view and update relevant records.                                      |
| Customs      | `customs_declarations`, `customs_reviews`, `customs_traders`, `customs_shipments`                          | Customs users manage; traders may view own declarations.                                |
| Government   | `gov_policies`, `gov_compliance_cases`, `gov_trade_agreements`, `gov_tariff_schedules`, `gov_border_posts` | Government users manage oversight data.                                                 |
| Finance      | `finance_summary`, `trade_finance_applications`                                                            | Users/organizations view relevant financial records; banks use role-specific workflows. |
| Admin        | `audit_logs`, `api_keys`, `integrations`                                                                   | Owner or admin access depending on record type.                                         |

## Sensitive data handling

- Do not store plaintext API secrets; store hashes, prefixes, or encrypted provider credentials.
- Avoid logging passwords, full payment details, private keys, or raw documents.
- Use provider vaults or environment variables for production secrets.
- Keep document URLs signed or access-controlled.
- Treat finance, KYC/KYB, customs, and government data as high sensitivity.

## CAPTCHA and rate limiting

- Use hCaptcha or Turnstile on public forms where bot abuse is likely.
- Apply login rate limiting to authentication routes.
- Apply search/API rate limiting to public serverless endpoints.
- Monitor repeated rate-limit events as potential abuse signals.

## Audit model

Audit events should capture:

- Actor user ID and organization ID where available.
- Action and entity type.
- Entity ID.
- Old/new values for sensitive mutations where appropriate.
- IP address and user agent.
- Status and error message.
- Timestamp.

## RLS validation checklist

1. Anonymous users cannot read private tables.
2. Users can read and update their own profile/settings only.
3. Users cannot read another user's notifications, invoices, security settings, or sessions.
4. Organization members can manage only their organization-scoped records.
5. Customs-only tables reject non-customs personas.
6. Government-only tables reject non-government personas.
7. Public tables contain only approved public data.
8. Admin policies do not create recursion errors.
9. Insert/update policies include `WITH CHECK` conditions.
10. Tests cover at least one allowed and one denied request per sensitive table group.
