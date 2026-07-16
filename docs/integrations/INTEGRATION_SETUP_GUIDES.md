# Integration Setup Guides

## Purpose

This guide documents setup requirements for AfriTrade OS integrations: AI, PayPal, CAPTCHA, and notifications.

## 1. AI integration: OpenRouter

### Used by

- Market intelligence.
- AI assistant-style flows.
- AI recommendations and generated content concepts.

### Environment variables

| Variable                  | Description                                                                                         |
| ------------------------- | --------------------------------------------------------------------------------------------------- |
| `VITE_OPENROUTER_API_KEY` | Browser-exposed key currently read by the Vite service. Prefer server-side proxying for production. |
| `OPENROUTER_API_KEY`      | Server-side key fallback.                                                                           |

### Setup steps

1. Create an OpenRouter account and API key.
2. Add the key to development, staging, and production environments.
3. Confirm allowed models and usage limits.
4. Set budget alerts with the provider.
5. Run a market intelligence request and verify graceful handling for quota errors.

### Production recommendations

- Prefer a serverless proxy so provider keys are not exposed to browsers.
- Add rate limiting and tenant/user quotas.
- Log request metadata, not sensitive prompts or documents unless explicitly approved.
- Provide fallback messages when the provider returns `429` or unavailable errors.

## 2. PayPal integration

### Used by

- Upgrade plans and payment buttons.
- Pro and Enterprise plan payment flows.

### Environment variables

| Variable                | Description                                   |
| ----------------------- | --------------------------------------------- |
| `VITE_PAYPAL_CLIENT_ID` | PayPal client ID used by the client-side SDK. |

### Setup steps

1. Create PayPal developer application.
2. Copy sandbox client ID to development/staging.
3. Copy live client ID to production only after business approval.
4. Configure supported currencies and countries.
5. Validate plan names and prices against product/billing policy.
6. Test successful approval, cancellation, and error callbacks.

### Production recommendations

- Verify payments server-side before changing subscription entitlements.
- Do not rely solely on client-side approval callbacks.
- Store transaction IDs and invoice records.
- Monitor payment disputes, refunds, and failed captures.

## 3. CAPTCHA integrations

AfriTrade OS includes components for both hCaptcha and Cloudflare Turnstile. Choose one primary CAPTCHA provider per form unless a fallback is required.

### hCaptcha

#### Used by

- Public or sensitive forms where hCaptcha is selected.

#### Setup steps

1. Create hCaptcha site key and secret.
2. Configure allowed domains.
3. Add site key to the frontend environment or configuration.
4. Verify token server-side before accepting sensitive actions.
5. Monitor pass/fail rates for false positives.

### Cloudflare Turnstile

#### Environment variables

| Variable                  | Description                                     |
| ------------------------- | ----------------------------------------------- |
| `VITE_TURNSTILE_SITE_KEY` | Turnstile site key used by the React component. |

#### Setup steps

1. Create Turnstile widget in Cloudflare.
2. Configure allowed domains.
3. Add site key to environment variables.
4. Add server-side verification for token-protected API actions.
5. Test expiration and reset behavior.

### CAPTCHA production recommendations

- Verify tokens server-side; frontend token generation alone is not sufficient.
- Apply CAPTCHA to login risk challenges, registration, contact, public search, or high-abuse endpoints as needed.
- Do not block accessibility-critical workflows without an alternate support path.

## 4. Notifications integration

### Used by

- In-app notification dropdown.
- Trade, KYC, payment, document, and system alert events.

### Current platform behavior

- Notifications are read from the Supabase `notifications` table.
- Users can mark one or all notifications as read.
- Users can clear notifications.
- The app includes fallback demo notifications if live fetch fails.

### Setup steps

1. Apply Supabase schema containing the `notifications` table.
2. Confirm RLS allows users to view/update their own notifications only.
3. Add application events that insert notification records.
4. If email/SMS/push is required, select and configure providers.
5. Store provider credentials as server-side secrets.
6. Add retry and dead-letter behavior for external delivery.

### Recommended notification event types

- `trade_created`
- `trade_updated`
- `trade_completed`
- `kyc_submitted`
- `kyc_approved`
- `kyc_rejected`
- `document_uploaded`
- `document_approved`
- `document_rejected`
- `payment_received`
- `payment_sent`
- `system_alert`

### Production recommendations

- Keep in-app notifications as source of truth.
- Use email/SMS/push as delivery channels, not primary records.
- Track delivery status and retry attempts.
- Rate-limit noisy notification types.
- Provide user preferences for categories and channels.

## 5. Integration readiness checklist

- [ ] Provider account and credentials created.
- [ ] Development, staging, and production credentials separated.
- [ ] Environment variables configured in hosting platform.
- [ ] Secrets are not committed to source control.
- [ ] Server-side verification exists for payment and CAPTCHA events.
- [ ] Rate limiting is applied to public or costly integrations.
- [ ] Provider error handling and fallback user messages are implemented.
- [ ] Logs contain enough metadata for support without exposing secrets or sensitive documents.
