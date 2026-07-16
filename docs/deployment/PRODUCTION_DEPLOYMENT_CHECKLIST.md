# Production Deployment Checklist

## Purpose

Use this checklist before launching or updating AfriTrade OS in production.

## 1. Release readiness

- [ ] Release branch reviewed and approved.
- [ ] Pull request includes summary, risk, tests, and rollback notes.
- [ ] No secrets committed to the repository.
- [ ] Product documentation and runbooks updated for user-visible changes.
- [ ] Database migration order confirmed.
- [ ] Production backup or restore point created.

## 2. Environment configuration

- [ ] `VITE_SUPABASE_URL` configured.
- [ ] `VITE_SUPABASE_ANON_KEY` configured.
- [ ] `VITE_OPENROUTER_API_KEY` or `OPENROUTER_API_KEY` configured if AI features are enabled.
- [ ] `VITE_PAYPAL_CLIENT_ID` configured if payments are enabled.
- [ ] `VITE_TURNSTILE_SITE_KEY` configured if Turnstile is enabled.
- [ ] hCaptcha site key/secret configured if hCaptcha is used.
- [ ] Notification provider credentials configured if email/SMS/push delivery is enabled.
- [ ] Vercel or hosting environment variables match staging names.

## 3. Supabase readiness

- [ ] Schemas applied in the documented order.
- [ ] RLS enabled on sensitive tables.
- [ ] Public policies reviewed for intentional public data only.
- [ ] Auth redirect URLs include production domain.
- [ ] Password reset flow tested.
- [ ] Storage buckets and policies configured for documents.
- [ ] Backups enabled.
- [ ] Reference data seeded and verified.

## 4. Application build

- [ ] Dependencies installed with the project package manager.
- [ ] TypeScript build passes.
- [ ] Vite production build passes.
- [ ] Serverless API routes compile in the target host.
- [ ] Electron build tested separately if desktop release is included.

## 5. Security validation

- [ ] Login rate limiting verified.
- [ ] Search/API rate limiting verified.
- [ ] CAPTCHA enabled on intended public forms.
- [ ] Users cannot access unauthorized persona routes.
- [ ] Users cannot read another user's private records.
- [ ] Organization-scoped records are isolated.
- [ ] Customs and government data reject unauthorized personas.
- [ ] API keys and integration secrets are stored securely.
- [ ] Audit logs capture sensitive admin and workflow actions.

## 6. Persona smoke tests

- [ ] SME Exporter can onboard, open dashboard, create/update trade, view finance/logistics/compliance.
- [ ] Enterprise Exporter can view export project workflows.
- [ ] Importer can open importer panel and view orders/shipments/documents.
- [ ] Customs Authority can open customs panel and review declarations.
- [ ] Logistics Provider can open logistics panel and view fleet/shipments/tenders/invoices.
- [ ] Bank / Insurer can open bank dashboard, applications, due diligence, risk, and tools.
- [ ] Government Agency can open command center, policy, statistics, flows, and registry modules.
- [ ] Trade Analyst can open analytics modules.
- [ ] Platform Admin can open admin console and system diagnostic.

## 7. Integration smoke tests

- [ ] Supabase auth and profile read/write succeed.
- [ ] Notifications load and mark-as-read works.
- [ ] AI request returns expected response or graceful unavailable message.
- [ ] PayPal button loads in the target region and plan configuration.
- [ ] CAPTCHA component returns token in enabled form.
- [ ] Search API validates query and rate limit behavior.

## 8. Monitoring and rollback

- [ ] Monitoring dashboard open during deployment.
- [ ] Error logs monitored for at least 30 minutes post-deploy.
- [ ] Core workflows checked after deploy.
- [ ] Rollback artifact or previous deployment identified.
- [ ] Database rollback or restore plan documented.
- [ ] Stakeholders notified of release status.

## 9. Go/no-go decision

Production release is **go** only when all critical checks pass and any remaining issues have an approved risk owner and mitigation plan.
