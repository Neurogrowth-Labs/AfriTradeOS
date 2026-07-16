# AfriTrade OS Product Documentation

## 1. Product Overview

AfriTrade OS is a pan-African digital trade operating system for secure, compliant, and data-driven cross-border commerce under the African Continental Free Trade Area (AfCFTA). The platform brings exporters, importers, logistics providers, customs authorities, banks, insurers, government agencies, trade analysts, and platform administrators into one role-based workspace.

The product combines trade lifecycle management, market intelligence, compliance tooling, logistics visibility, trade finance workflows, partner discovery, smart contracts, AI assistance, and administrative oversight. It is implemented as a React/Vite/TypeScript web application with Supabase-backed authentication and data services, and it can also be packaged as an Electron desktop application.

## 2. Target Users and Personas

AfriTrade OS is organized around the following personas:

| Persona             | Primary Goal                                                                                                                                  | Default Workspace          |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------- |
| SME Exporter        | Manage exports, compliance, shipments, finance, tenders, partners, and marketing assets.                                                      | Dashboard                  |
| Enterprise Exporter | Coordinate high-volume export operations with stronger analytics and operational oversight.                                                   | Command Center / Dashboard |
| Importer            | Manage purchase orders, inbound shipments, import documents, compliance checks, finance, analytics, and settings.                             | Importer Panel             |
| Customs Authority   | Review declarations, verify traders and certificates, monitor shipments, analyze revenue and risk, and configure authority settings.          | Customs Panel              |
| Logistics Provider  | Manage fleet, drivers, shipments, quotes, tenders, invoices, document generation, and operational risk.                                       | Logistics Panel            |
| Bank / Insurer      | Monitor finance portfolios, applications, due diligence, client risk, insurance, blockchain verification, AfCFTA tools, and account settings. | Finance Dashboard          |
| Government Agency   | Monitor trade flows, policy compliance, agreements, statistics, entity verification, and business registry intelligence.                      | Regulator / Command Center |
| Trade Analyst       | Research markets, trade trends, regulatory data, logistics data, finance metrics, market players, and tenders.                                | Analytics Hub              |
| Platform Admin      | Operate tenant administration, global oversight, diagnostics, platform modules, API keys, queues, logs, and access control.                   | Admin Console              |

## 3. Product Value Proposition

AfriTrade OS reduces friction in African cross-border trade by:

- Centralizing trade operations from opportunity discovery through settlement and delivery.
- Making AfCFTA compliance, tariff preference checks, document readiness, and entity verification easier to manage.
- Giving financial institutions structured trade finance application, due diligence, and risk views.
- Helping logistics providers manage active shipments, fleet availability, border delays, tenders, invoices, and documentation.
- Giving governments and customs authorities oversight tools for policy, enforcement, declarations, trade flows, and registry data.
- Providing analysts with curated trade, finance, logistics, tender, and market-player intelligence.
- Supporting AI-assisted workflows for market intelligence, compliance explanations, marketing generation, document extraction, risk assessment, and operational recommendations.

## 4. Application Architecture

### 4.1 Frontend

- **Framework:** React with TypeScript.
- **Build tooling:** Vite.
- **Routing:** React Router.
- **Styling:** Tailwind CSS utility classes and component-level styling conventions.
- **Icons:** `lucide-react`.
- **Charts and visualization:** `recharts`, `three`, `leaflet`, and `react-leaflet`.
- **Desktop packaging:** Electron via `electron/main.cjs` and `electron-builder` configuration in `package.json`.

### 4.2 Backend and Data Layer

- **Primary backend:** Supabase.
- **Database:** PostgreSQL schemas and migration scripts are stored in `supabase/`.
- **Authentication:** Supabase Auth, with onboarding state and profile lookup coordinated in the app shell.
- **Data services:** TypeScript service modules in `services/` encapsulate Supabase queries and domain-specific data mapping.
- **Fallback/demo data:** `services/mockDatabase.ts` provides graceful fallback behavior when live data is unavailable.

### 4.3 Serverless API Layer

The repository includes Vercel-style API routes:

- `api/auth/login.ts` handles login-related server-side behavior.
- `api/search.ts` supports search functionality.
- `api/_lib/rateLimit.ts`, `lib/rateLimit.ts`, `lib/loginRateLimitClient.ts`, and `lib/validateSearchQuery.ts` support rate limiting and query validation.

### 4.4 External Integrations

- **Supabase:** Auth, profiles, notifications, domain tables, storage-backed document references, and RLS policies.
- **OpenRouter:** AI chat completion access used by the former Gemini service wrapper for market intelligence and AI assistance-style interactions.
- **PayPal:** Client-side payment plan upgrade flow.
- **hCaptcha / Cloudflare Turnstile:** CAPTCHA components are available for bot mitigation.
- **Electron:** Optional desktop distribution for Windows and macOS.

## 5. Navigation, Roles, and Access Control

The main application shell maps URL paths to internal `AppView` values and uses role-based menu configuration to control access. Each persona receives a tailored menu made of sections and modules. Unauthorized route access redirects users back to the dashboard.

Key route examples:

| Route                 | Module                                                                       |
| --------------------- | ---------------------------------------------------------------------------- |
| `/dashboard`          | Dashboard / Analytics Hub, depending on persona                              |
| `/trade`              | Trade Lifecycle or Analyst Trade Trends                                      |
| `/finance`            | Trade Finance or Analyst Finance Metrics                                     |
| `/market`             | Market Intelligence, Government Trade Statistics, or Analyst Market Research |
| `/compliance`         | Trade Compliance, Government Policy Compliance, or Analyst Regulatory Data   |
| `/logistics`          | Logistics, Government Trade Flows, or Analyst Logistics Data                 |
| `/logistics-provider` | Logistics Provider Panel                                                     |
| `/marketplace`        | Marketplace, Government Business Registry, or Analyst Market Players         |
| `/assistant`          | Live Assistant                                                               |
| `/marketing`          | Marketing Studio                                                             |
| `/kyc`                | KYC Verification or Government Entity Verification                           |
| `/tenders`            | Tender Management or Analyst Tender Analysis                                 |
| `/contracts`          | Smart Contracts or Government Trade Agreements                               |
| `/customs`            | Customs Authority Panel                                                      |
| `/importer`           | Importer Panel                                                               |
| `/bank-dashboard`     | Bank Finance Dashboard                                                       |
| `/bank-applications`  | Bank Finance Applications                                                    |
| `/bank-due-diligence` | Bank KYC / AML Due Diligence                                                 |
| `/bank-risk-clients`  | Bank Risk and Client Directory                                               |
| `/bank-trade-tools`   | Bank Trade Tools                                                             |
| `/bank-settings`      | Bank Account Settings                                                        |
| `/admin`              | Platform Admin Console                                                       |
| `/regulator`          | Regulator / Government Command Center                                        |
| `/diagnostic`         | System Diagnostic                                                            |
| `/profile`            | User Profile and Settings                                                    |

## 6. Authentication and Onboarding

The platform starts with an onboarding-first experience. Users authenticate, select or inherit a role, complete company and profile information, and then receive a role-specific default route.

Onboarding state is considered complete only when the profile has:

- `onboarding_completed` set.
- Full name.
- Email.
- Country.
- Company name.
- Role.

If the database profile is not available, the app falls back to authentication metadata and keeps the user in onboarding until the required profile fields exist.

## 7. Core Product Modules

### 7.1 Dashboard and Analytics Hub

The dashboard is a persona-aware command center. It provides KPI cards, quick actions, alerts, widgets, role-specific summaries, and navigation shortcuts. For analysts, the dashboard is positioned as an analytics hub for market, trade, compliance, logistics, finance, player, and tender intelligence.

### 7.2 Trade Lifecycle

The trade lifecycle workspace helps exporters and administrators manage trades from planning to completion. It includes project templates, step-based trade workflows, draggable operational cards, Incoterm explanations, document-related actions, payment actions, and download actions.

Typical lifecycle areas include:

- Trade planning and workspace setup.
- Product, HS code, value, origin, destination, and Incoterm handling.
- Compliance readiness and execution stages.
- Logistics coordination.
- Settlement and completion tracking.

### 7.3 Enterprise Exporter Operations

The enterprise exporter service model supports export projects with project numbers, statuses, priorities, product details, HS codes, origin and destination countries, ports, Incoterms, target shipping dates, compliance scores, required/completed documents, finance information, project managers, AI risk scores, recommendations, route optimization, tags, and custom fields.

### 7.4 Importer Panel

The importer panel is a dedicated command center for import-side operations. It includes tabs and views for:

- Import dashboard.
- Purchase/import orders.
- Shipment tracking.
- Documents.
- Compliance.
- Finance.
- Analytics.
- Settings.

Import orders track supplier, source country, destination country, Incoterm, purchase order date, shipment date, transport mode, journey status, value, ETA/ATD, customs declaration state, compliance status, logistics partner, HS code, product description, quantity, weight, volume, and containers.

### 7.5 Market Intelligence

Market intelligence provides research and insight workflows for trade opportunities, commodity trends, demand indicators, pricing movement, sentiment, and regional opportunity analysis. The AI service can produce market analysis responses using OpenRouter and is designed around African trade and AfCFTA context.

### 7.6 Marketplace and Partner Network

The marketplace helps users discover buyers, sellers, logistics providers, finance providers, government entities, legal providers, and other ecosystem organizations. Organization records include type, verification status, location, rating, reviews, tags, description, and logo initials. Marketplace actions include connect, message, filter, partner matching, and meeting scheduling flows.

### 7.7 Tender and RFQ Management

Tender management supports browsing, sorting, exporting, and evaluating tender opportunities. Analyst users receive tender analysis views, while exporters can use tenders as a commercial pipeline and logistics providers can use tender workflows for shipment opportunities.

### 7.8 Smart Contracts and Trade Agreements

The smart contracts module manages contract states, milestones, downloads, and contract actions. For government users, the same navigation area maps to trade agreements, including AfCFTA, regional economic community agreements, tariff schedules, rules of origin, and preference calculations.

### 7.9 Compliance

The compliance module supports trade compliance, policy checks, regulatory data, AfCFTA eligibility concepts, document readiness, and risk explanations. Compliance data models include checks with AfCFTA status, scores, explanations, recommendations, and timestamps.

### 7.10 KYC / KYB and Entity Verification

KYC verification supports document selection/upload flows, audit log events, document status badges, and verification state tracking. Government users access an entity verification version focused on trusted trader and registry oversight. Banks access a due diligence version focused on KYC, AML alerts, verification records, risk levels, and review workflows.

### 7.11 Customs Authority Panel

The customs authority panel is a mission-control workspace for customs users. It includes:

- Dashboard.
- Review queue.
- Trader registry.
- Declaration management.
- Certificate and document verification.
- Shipment monitoring.
- Analytics.
- Settings.

Customs declarations track declaration number, declaration type, status, trader, TIN, origin/destination, port of entry/exit, HS code, product description, quantity, weights, declared value, CIF/FOB values, duty/VAT rates and amounts, total taxes, AfCFTA eligibility, preference savings, risk scores, AI flags, documents, officer assignment, notes, query/rejection reasons, and submission/clearance dates.

### 7.12 Logistics

The logistics module gives exporters and administrators shipment visibility, quote workflows, customs detail actions, QR code actions, alert dismissal, and an interactive map-style experience with zooming and panning.

### 7.13 Logistics Provider Panel

The logistics provider panel is a dedicated operational workspace. It includes:

- Dashboard.
- Fleet management.
- Active shipments.
- Driver and vehicle operations.
- Client and quote actions.
- Tenders and bidding.
- Invoice viewing/downloading.
- Document generation.
- HS code search.
- AfCFTA calculator.
- Settings.

Fleet records include registration, vehicle type, capacity, status, current location, driver, fuel level, maintenance dates, insurance expiry, permit expiry, mileage, and health score.

### 7.14 Trade Finance

Trade finance supports finance provider discovery, tariff and tax calculations, application actions, and financing workflows. Finance request records capture trade, financier, status, product type, amount, risk score, requested date, and provider name.

### 7.15 Bank / Insurer Workspaces

Banks and insurers receive a specialized workspace made of five core areas:

1. **Finance Dashboard** — portfolio exposure, trade flows, credit pipeline, risk radar, document states, and application stages.
2. **Finance Applications** — application list/detail flows, smart application builder, document extraction, and credit scoring.
3. **KYC & AML Due Diligence** — KYC profiles, alerts, verification records, risk indicators, and review sections.
4. **Risk & Clients** — market risk monitoring, client directory, favorites, risk categories, and status filtering.
5. **Trade Tools** — insurance quoting, blockchain verification, and AfCFTA checker.

Finance application subcomponents include:

- Application builder.
- Credit scoring.
- Document extraction.
- Workflow automation.

### 7.16 Government and Regulator Workspaces

Government users receive role-specific views for:

- Command center with live trade monitoring, KPIs, risk alerts, and anomaly detection.
- Policy and compliance library.
- Enforcement and compliance cases.
- Trade agreements and tariff calculations.
- Trade statistics, import/export volumes, AI insights, forecasts, and exports.
- Trade flow monitoring at border posts and corridors.
- Entity verification.
- Business registry.

Government data models include policies, compliance cases, trade agreements, tariff schedules, and border posts.

### 7.17 Trade Analyst Workspaces

Trade analysts access specialized data modules:

- Market research.
- Trade trends.
- Regulatory data.
- Logistics data.
- Finance metrics.
- Market players.
- Tender analysis.

These modules are designed for research, comparative analysis, risk identification, opportunity discovery, and reporting.

### 7.18 Admin Console

The platform admin console provides operational controls for:

- Custom roles.
- Tenant management.
- Subscription or plan management.
- Global trade pause/resume actions.
- Alert investigation.
- Log exports and log links.
- API key revocation/copy/generation.
- Service status views.
- Queue management.

### 7.19 System Diagnostic

The system diagnostic module displays service health, uptime, severity indicators, and operational diagnostics for platform monitoring.

### 7.20 User Profile and Account Settings

The user profile supports identity, organization, preferences, security, integrations, AI settings, billing, and audit tabs. Bank users receive bank-specific account settings for users, roles, currencies, integrations, and audit logs.

### 7.21 Live Assistant and CoPilot

The live assistant and CoPilot provide AI-assisted interaction surfaces. Supporting audio utilities encode and decode PCM audio data, enabling browser audio processing and potential real-time assistant experiences.

### 7.22 Marketing Studio

The marketing studio supports AI-assisted generation or management of trade marketing assets. Exporters and administrators can access it as a tool for commercial enablement.

### 7.23 Notifications, Localization, Theme, and Currency

The app shell includes:

- Notification fetching from Supabase with fallback demo notifications.
- Mark-as-read and clear-all notification actions.
- Language state.
- Currency context and selector.
- Dark/light theme state with local storage and system preference support.
- Responsive sidebar behavior.

## 8. Data Model Summary

The repository defines major TypeScript interfaces and Supabase schemas for:

- Users and profiles.
- Organizations.
- Trades.
- Compliance checks.
- Shipments.
- Finance requests.
- Market intelligence records.
- Audit logs.
- KYC requests.
- AML alerts.
- Customs declarations and reviews.
- Enterprise export projects and documents.
- Import orders and shipment milestones.
- Logistics fleet, drivers, KPIs, shipments, tenders, and invoices.
- Government policies, cases, agreements, tariffs, and border posts.
- Settings, organizations, preferences, document templates, subscriptions, payment methods, and invoices.

Database scripts in `supabase/` cover onboarding state, customs, settings, finance, government, enterprise exporter, core schema, and RLS remediation/policies.

## 9. Security and Compliance Features

AfriTrade OS includes several security and compliance-oriented capabilities:

- Supabase authentication and session handling.
- Role-based navigation and route protection.
- Onboarding completion gates.
- Supabase RLS policy scripts and remediation files.
- KYC/KYB workflows.
- AML alert models.
- Customs declaration review and risk scoring.
- Government policy compliance and enforcement views.
- CAPTCHA components for hCaptcha and Cloudflare Turnstile.
- Login and search rate-limiting support.
- Search query validation.
- Audit logs in multiple workspaces.
- API key management surfaces for admins.

## 10. Subscription and Payments

The product includes subscription plan definitions and PayPal upgrade plan support.

Subscription plans include:

- Starter.
- Pro Exporter.
- Enterprise.

PayPal upgrade plans include:

- Pro Plan.
- Enterprise Plan.

Plan features cover trade limits, AI analytics, market alerts, compliance reports, API access, team collaboration, white labeling, custom integrations, support, SLA, security, and enterprise account management concepts.

## 11. Configuration and Environment Variables

Important environment variables include:

| Variable                                          | Purpose                                      |
| ------------------------------------------------- | -------------------------------------------- |
| `VITE_SUPABASE_URL`                               | Supabase project URL for live auth and data. |
| `VITE_SUPABASE_ANON_KEY`                          | Supabase anonymous key.                      |
| `VITE_OPENROUTER_API_KEY` or `OPENROUTER_API_KEY` | AI service API key.                          |
| `VITE_PAYPAL_CLIENT_ID`                           | PayPal client ID for payment buttons.        |
| `VITE_TURNSTILE_SITE_KEY`                         | Cloudflare Turnstile site key.               |

The README currently also references `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`; however, the Vite application code reads `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.

## 12. Running the Product Locally

Install dependencies:

```bash
pnpm install
```

Run the web app:

```bash
pnpm dev
```

Build the web app:

```bash
pnpm build
```

Preview a production build:

```bash
pnpm preview
```

Run Electron during development:

```bash
pnpm electron:dev
```

Build desktop packages:

```bash
pnpm electron:build
```

## 13. Deployment Notes

- `vercel.json` indicates deployment support for Vercel-style hosting and API routes.
- Supabase schema files must be applied to the target Supabase project before enabling live production workflows.
- RLS policies should be reviewed and applied using the provided Supabase policy scripts.
- Live AI, payment, CAPTCHA, and email/SMS integrations require corresponding environment variables and provider setup.
- Electron desktop builds output to the configured `release` directory.

## 14. Repository Map

| Path                       | Purpose                                                                                                 |
| -------------------------- | ------------------------------------------------------------------------------------------------------- |
| `App.tsx`                  | Main application shell, routing, role routing, onboarding gate, notifications, theme/currency controls. |
| `index.tsx`                | React application entry point.                                                                          |
| `types.ts`                 | Shared application views, personas, and core domain interfaces.                                         |
| `config/roleMenuConfig.ts` | Role-based navigation and route access definitions.                                                     |
| `components/`              | Main product UI modules.                                                                                |
| `components/finance/`      | Finance application, credit scoring, extraction, and workflow components.                               |
| `contexts/`                | Shared React contexts such as currency.                                                                 |
| `services/`                | Domain services, Supabase client, AI, onboarding, subscription, settings, payment, and data access.     |
| `api/`                     | Serverless API handlers and API utilities.                                                              |
| `lib/`                     | Shared validation and rate-limiting utilities.                                                          |
| `supabase/`                | Database schemas, RLS policies, and remediation scripts.                                                |
| `electron/`                | Electron main process entry.                                                                            |
| `docs/`                    | Product, development, remediation, and reference documentation.                                         |
| `assets/` and `public/`    | Static images and public assets.                                                                        |

## 15. Current Product Status

Based on the repository, AfriTrade OS is a substantial product prototype or early platform implementation with broad module coverage. Many workspaces include rich UI, mock/demo data fallbacks, and domain-specific data models. Live production readiness depends on completing Supabase schema deployment, RLS validation, provider configuration, integration hardening, testing, and production environment setup.

## 16. Recommended Next Documentation Additions

Future documentation should add:

- User guides per persona.
- Admin operations handbook.
- Supabase deployment and migration guide.
- API reference for serverless routes.
- Data dictionary generated from Supabase schemas.
- Security model and RLS policy explanation.
- End-to-end trade, customs, finance, logistics, and government workflow diagrams.
- Production deployment checklist.
- Integration setup guides for AI, PayPal, CAPTCHA, and notifications.

## 17. Detailed Documentation Set

The product documentation is extended by the following dedicated guides:

| Guide                                                        | Purpose                                                                                                     |
| ------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------- |
| `docs/guides/PERSONA_USER_GUIDES.md`                         | Role-specific user guides for every supported persona.                                                      |
| `docs/operations/ADMIN_OPERATIONS_HANDBOOK.md`               | Admin runbook for tenant, user, API key, incident, audit, and change operations.                            |
| `docs/deployment/SUPABASE_DEPLOYMENT_AND_MIGRATION_GUIDE.md` | Supabase schema deployment, migration order, RLS validation, seeding, auth, and rollback guidance.          |
| `docs/api/SERVERLESS_API_REFERENCE.md`                       | Reference for serverless API routes and shared API utilities.                                               |
| `docs/reference/DATA_DICTIONARY.md`                          | Schema-derived data dictionary generated from SQL files in `supabase/`.                                     |
| `docs/security/SECURITY_MODEL_AND_RLS.md`                    | Security model, RLS policy patterns, sensitive data handling, and validation checklist.                     |
| `docs/workflows/END_TO_END_WORKFLOW_DIAGRAMS.md`             | Mermaid diagrams for trade, customs, finance, logistics, government, marketplace, and onboarding workflows. |
| `docs/deployment/PRODUCTION_DEPLOYMENT_CHECKLIST.md`         | Production launch and release checklist.                                                                    |
| `docs/integrations/INTEGRATION_SETUP_GUIDES.md`              | Setup guides for AI, PayPal, CAPTCHA, and notifications.                                                    |
