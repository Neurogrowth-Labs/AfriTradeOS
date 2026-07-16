# AfriTrade OS Admin Operations Handbook

## Purpose

This handbook defines day-to-day operational procedures for AfriTrade OS platform administrators. It complements the security model, deployment checklist, and Supabase deployment guide.

## Admin responsibilities

- Tenant and organization lifecycle management.
- User, role, and access oversight.
- Platform health monitoring.
- Incident triage and escalation.
- API key and integration governance.
- Audit log review and evidence export.
- Subscription or plan operations.
- Queue and service status monitoring.
- Coordinating production deployments and database migrations.

## Daily operations checklist

1. Open **Admin Console** and review tenant alerts.
2. Open **System Health** and verify service status, uptime, queues, and critical errors.
3. Review failed login spikes, rate-limit events, and API errors.
4. Review unresolved support escalations from customs, government, bank, logistics, exporter, and importer workspaces.
5. Confirm integration health for Supabase, AI, PayPal, CAPTCHA, and notifications.
6. Review audit log warnings and failed admin actions.
7. Check pending KYC/KYB, declarations, finance applications, and high-severity operational alerts.

## Tenant operations

### Create a tenant

1. Validate business registration and onboarding requirements.
2. Create or approve organization profile.
3. Assign initial admin user.
4. Configure organization type, default currency, timezone, and verification status.
5. Confirm role menu access by persona.
6. Record the setup in audit logs or admin notes.

### Update a tenant

1. Verify requester authority.
2. Update organization metadata, plan, status, integrations, or settings.
3. Review downstream impact on users, roles, API keys, and billing.
4. Notify tenant admins of the change.

### Suspend a tenant

1. Confirm suspension reason and authorization.
2. Set organization or subscription status to suspended where supported.
3. Disable or rotate API keys if compromise is suspected.
4. Preserve audit logs, documents, and evidence.
5. Notify legal/compliance stakeholders where required.

## User and role operations

### Add or invite users

1. Confirm the user's organization and requested role.
2. Use team-member or profile management workflows.
3. Assign least-privilege permissions.
4. Require onboarding completion and security setup.
5. Review access after first login.

### Change a user role

1. Confirm business approval.
2. Update role and organization membership.
3. Verify route/menu access using the role matrix.
4. Review active sessions and revoke if privilege reduction is material.
5. Record the change in audit history.

### Remove a user

1. Disable access or remove team membership.
2. Revoke active sessions and API keys.
3. Reassign owned records where necessary.
4. Preserve audit history.

## API key operations

### Generate API keys

1. Confirm integration owner and purpose.
2. Assign minimal permissions and rate limit.
3. Store only key hash/prefix in the platform.
4. Share the full secret using an approved secure channel.
5. Set expiry when possible.

### Revoke API keys

1. Identify key prefix, owner, integration, and last-used timestamp.
2. Revoke or mark inactive.
3. Monitor downstream API errors.
4. Rotate dependent secrets.

## Incident operations

### Severity levels

| Severity | Description                                                           | Example                                                  |
| -------- | --------------------------------------------------------------------- | -------------------------------------------------------- |
| Critical | Platform-wide or data/security incident requiring immediate response. | Auth outage, data leakage, payment compromise.           |
| High     | Major persona or tenant workflow impacted.                            | Customs queue unavailable, finance application failures. |
| Medium   | Degraded workflow with workaround.                                    | AI integration unavailable, delayed notifications.       |
| Low      | Minor issue or documentation/support request.                         | Cosmetic UI issue, stale help text.                      |

### Incident response workflow

1. Declare severity and incident owner.
2. Capture start time, impacted users, modules, and symptoms.
3. Check System Health, logs, recent deployments, migrations, and provider status.
4. Apply mitigation or rollback.
5. Communicate status to affected stakeholders.
6. Preserve logs and evidence.
7. Confirm recovery with targeted checks.
8. Write post-incident notes with root cause, impact, timeline, and corrective actions.

## Global trade pause/resume

Use global pause only for severe platform, compliance, fraud, security, or regulatory events.

### Pause procedure

1. Obtain explicit approval from the incident commander or authorized executive.
2. Record reason, scope, and expected duration.
3. Trigger global pause from Admin Console.
4. Notify support, compliance, and affected tenant admins.
5. Monitor queues, API calls, and user-facing errors.

### Resume procedure

1. Confirm root cause is contained.
2. Confirm database and integration consistency.
3. Trigger resume from Admin Console.
4. Monitor high-priority workflows for at least one business cycle.
5. Document final timeline and impact.

## Audit log review

Review these events routinely:

- Login failures and rate-limit events.
- Role and permission changes.
- API key creation/revocation.
- Tenant suspension/reactivation.
- KYC/KYB approvals and rejections.
- Customs declaration decisions.
- Finance application approvals/rejections.
- Payment and subscription events.
- RLS or authorization errors.

## Backup and recovery expectations

- Supabase database backups must be enabled for production.
- Migration files must be committed before deployment.
- Before destructive schema changes, create a recovery point.
- Validate restore procedures in a non-production environment.
- Store provider credentials in environment-level secret storage, not source control.

## Change management

1. Open a change request for schema, auth, RLS, payment, or security changes.
2. Validate the change in development and staging.
3. Run lint/build/tests relevant to changed code.
4. Apply database migrations in order.
5. Deploy app changes.
6. Monitor health, logs, and core workflows.
7. Document rollback instructions and post-deploy validation.
