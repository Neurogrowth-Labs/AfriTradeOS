# AfriTrade OS Data Dictionary

## Source

This data dictionary is generated from the SQL files in `supabase/`. It summarizes table purpose, ownership pattern, and major columns for implementation and review. Re-run this review whenever schemas change.

## `customs_schema.sql`

### `customs_declarations`

Customs declaration intake, review, risk, tax, and clearance data.

| Column                      | Type / SQL fragment         |
| --------------------------- | --------------------------- |
| `id`                        | `UUID`                      |
| `declaration_number`        | `TEXT`                      |
| `declaration_type`          | `public.declaration_type`   |
| `status`                    | `public.declaration_status` |
| `trader_id`                 | `UUID`                      |
| `trader_name`               | `TEXT`                      |
| `trader_tin`                | `TEXT`                      |
| `importer_exporter_code`    | `TEXT`                      |
| `origin_country`            | `TEXT`                      |
| `destination_country`       | `TEXT`                      |
| `port_of_entry`             | `TEXT`                      |
| `port_of_exit`              | `TEXT`                      |
| `hs_code`                   | `TEXT`                      |
| `hs_code_description`       | `TEXT`                      |
| `product_description`       | `TEXT`                      |
| `quantity`                  | `NUMERIC`                   |
| `unit`                      | `TEXT`                      |
| `gross_weight`              | `NUMERIC`                   |
| `net_weight`                | `NUMERIC`                   |
| `declared_value`            | `NUMERIC`                   |
| `currency`                  | `TEXT`                      |
| `exchange_rate`             | `NUMERIC`                   |
| `cif_value`                 | `NUMERIC`                   |
| `fob_value`                 | `NUMERIC`                   |
| `freight_cost`              | `NUMERIC`                   |
| `insurance_cost`            | `NUMERIC`                   |
| `duty_rate`                 | `NUMERIC`                   |
| `duty_amount`               | `NUMERIC`                   |
| `vat_rate`                  | `NUMERIC`                   |
| `vat_amount`                | `NUMERIC`                   |
| `excise_duty`               | `NUMERIC`                   |
| `other_charges`             | `NUMERIC`                   |
| `total_taxes`               | `NUMERIC`                   |
| `afcfta_eligible`           | `BOOLEAN`                   |
| `certificate_of_origin_id`  | `UUID`                      |
| `rules_of_origin_criteria`  | `TEXT`                      |
| `preferential_rate_applied` | `BOOLEAN`                   |
| `tariff_preference_savings` | `NUMERIC`                   |
| `risk_score`                | `INTEGER`                   |
| `risk_level`                | `TEXT`                      |
| `risk_factors`              | `JSONB`                     |
| `ai_risk_flags`             | `JSONB`                     |
| `documents`                 | `JSONB`                     |
| `bill_of_lading_number`     | `TEXT`                      |
| `invoice_number`            | `TEXT`                      |
| `assigned_officer_id`       | `UUID`                      |
| `assigned_officer_name`     | `TEXT`                      |
| `reviewed_at`               | `TIMESTAMP WITH TIME ZONE`  |
| `review_notes`              | `TEXT`                      |
| `query_reason`              | `TEXT`                      |
| `rejection_reason`          | `TEXT`                      |
| `submitted_at`              | `TIMESTAMP WITH TIME ZONE`  |
| `cleared_at`                | `TIMESTAMP WITH TIME ZONE`  |
| `created_at`                | `TIMESTAMP WITH TIME ZONE`  |
| `updated_at`                | `TIMESTAMP WITH TIME ZONE`  |
| `metadata`                  | `JSONB`                     |

### `customs_reviews`

Officer review actions for customs declarations.

| Column                    | Type / SQL fragment        |
| ------------------------- | -------------------------- |
| `id`                      | `UUID`                     |
| `declaration_id`          | `UUID`                     |
| `officer_id`              | `UUID`                     |
| `officer_name`            | `TEXT`                     |
| `action`                  | `TEXT`                     |
| `previous_status`         | `TEXT`                     |
| `new_status`              | `TEXT`                     |
| `notes`                   | `TEXT`                     |
| `internal_notes`          | `TEXT`                     |
| `risk_score_before`       | `INTEGER`                  |
| `risk_score_after`        | `INTEGER`                  |
| `risk_flags_added`        | `JSONB`                    |
| `sla_deadline`            | `TIMESTAMP WITH TIME ZONE` |
| `sla_met`                 | `BOOLEAN`                  |
| `processing_time_seconds` | `INTEGER`                  |
| `ip_address`              | `INET`                     |
| `user_agent`              | `TEXT`                     |
| `created_at`              | `TIMESTAMP WITH TIME ZONE` |

### `customs_certificates`

Certificates of origin, phytosanitary, quality, and related records.

| Column                | Type / SQL fragment         |
| --------------------- | --------------------------- |
| `id`                  | `UUID`                      |
| `certificate_number`  | `TEXT`                      |
| `certificate_type`    | `TEXT`                      |
| `issuing_country`     | `TEXT`                      |
| `issuing_authority`   | `TEXT`                      |
| `issue_date`          | `DATE`                      |
| `expiry_date`         | `DATE`                      |
| `hs_code`             | `TEXT`                      |
| `product_description` | `TEXT`                      |
| `quantity`            | `NUMERIC`                   |
| `exporter_name`       | `TEXT`                      |
| `exporter_country`    | `TEXT`                      |
| `importer_name`       | `TEXT`                      |
| `importer_country`    | `TEXT`                      |
| `status`              | `public.certificate_status` |
| `verified_at`         | `TIMESTAMP WITH TIME ZONE`  |
| `verified_by`         | `UUID`                      |
| `verification_method` | `TEXT`                      |
| `blockchain_hash`     | `TEXT`                      |
| `qr_code_data`        | `TEXT`                      |
| `afcfta_compliant`    | `BOOLEAN`                   |
| `origin_criteria`     | `TEXT`                      |
| `cumulation_applied`  | `BOOLEAN`                   |
| `document_url`        | `TEXT`                      |
| `metadata`            | `JSONB`                     |
| `created_at`          | `TIMESTAMP WITH TIME ZONE`  |
| `updated_at`          | `TIMESTAMP WITH TIME ZONE`  |

### `customs_traders`

Customs trader registry and compliance history.

| Column                     | Type / SQL fragment        |
| -------------------------- | -------------------------- |
| `id`                       | `UUID`                     |
| `organization_id`          | `UUID`                     |
| `tin`                      | `TEXT`                     |
| `customs_code`             | `TEXT`                     |
| `registration_date`        | `DATE`                     |
| `license_expiry`           | `DATE`                     |
| `trader_type`              | `TEXT`                     |
| `risk_classification`      | `public.trader_risk_class` |
| `compliance_score`         | `INTEGER`                  |
| `total_declarations`       | `INTEGER`                  |
| `approved_declarations`    | `INTEGER`                  |
| `rejected_declarations`    | `INTEGER`                  |
| `total_trade_value`        | `NUMERIC`                  |
| `avg_clearance_time_hours` | `NUMERIC`                  |
| `violations_count`         | `INTEGER`                  |
| `active_alerts`            | `INTEGER`                  |
| `last_violation_date`      | `DATE`                     |
| `sanctions_check_date`     | `DATE`                     |
| `sanctions_status`         | `TEXT`                     |
| `beneficial_owners`        | `JSONB`                    |
| `linked_entities`          | `JSONB`                    |
| `aeo_status`               | `TEXT`                     |
| `aeo_tier`                 | `TEXT`                     |
| `aeo_benefits`             | `TEXT[]`                   |
| `last_audit_date`          | `DATE`                     |
| `next_audit_date`          | `DATE`                     |
| `notes`                    | `TEXT`                     |
| `metadata`                 | `JSONB`                    |
| `created_at`               | `TIMESTAMP WITH TIME ZONE` |
| `updated_at`               | `TIMESTAMP WITH TIME ZONE` |

### `customs_shipments`

Customs-visible shipment and border movement data.

| Column                  | Type / SQL fragment        |
| ----------------------- | -------------------------- |
| `id`                    | `UUID`                     |
| `declaration_id`        | `UUID`                     |
| `tracking_number`       | `TEXT`                     |
| `container_number`      | `TEXT`                     |
| `bill_of_lading`        | `TEXT`                     |
| `airway_bill`           | `TEXT`                     |
| `transport_mode`        | `TEXT`                     |
| `vessel_name`           | `TEXT`                     |
| `voyage_number`         | `TEXT`                     |
| `carrier_name`          | `TEXT`                     |
| `origin_port`           | `TEXT`                     |
| `destination_port`      | `TEXT`                     |
| `current_location`      | `TEXT`                     |
| `current_country`       | `TEXT`                     |
| `latitude`              | `NUMERIC(10,6)`            |
| `longitude`             | `NUMERIC(10,6)`            |
| `status`                | `public.shipment_status`   |
| `eta`                   | `TIMESTAMP WITH TIME ZONE` |
| `ata`                   | `TIMESTAMP WITH TIME ZONE` |
| `cleared_at`            | `TIMESTAMP WITH TIME ZONE` |
| `released_at`           | `TIMESTAMP WITH TIME ZONE` |
| `inspection_required`   | `BOOLEAN`                  |
| `inspection_type`       | `TEXT`                     |
| `inspection_result`     | `TEXT`                     |
| `inspection_notes`      | `TEXT`                     |
| `scanned`               | `BOOLEAN`                  |
| `scan_result`           | `TEXT`                     |
| `temperature_monitored` | `BOOLEAN`                  |
| `current_temperature`   | `NUMERIC`                  |
| `tamper_alert`          | `BOOLEAN`                  |
| `gps_enabled`           | `BOOLEAN`                  |
| `last_gps_update`       | `TIMESTAMP WITH TIME ZONE` |
| `risk_score`            | `INTEGER`                  |
| `risk_flags`            | `JSONB`                    |
| `timeline`              | `JSONB`                    |
| `metadata`              | `JSONB`                    |
| `created_at`            | `TIMESTAMP WITH TIME ZONE` |
| `updated_at`            | `TIMESTAMP WITH TIME ZONE` |

### `customs_revenue`

Revenue collection records tied to customs declarations.

| Column                | Type / SQL fragment        |
| --------------------- | -------------------------- |
| `id`                  | `UUID`                     |
| `declaration_id`      | `UUID`                     |
| `payment_reference`   | `TEXT`                     |
| `payment_date`        | `DATE`                     |
| `payment_method`      | `TEXT`                     |
| `duty_collected`      | `NUMERIC`                  |
| `vat_collected`       | `NUMERIC`                  |
| `excise_collected`    | `NUMERIC`                  |
| `penalties_collected` | `NUMERIC`                  |
| `other_fees`          | `NUMERIC`                  |
| `total_collected`     | `NUMERIC`                  |
| `currency`            | `TEXT`                     |
| `bank_name`           | `TEXT`                     |
| `bank_reference`      | `TEXT`                     |
| `status`              | `TEXT`                     |
| `confirmed_at`        | `TIMESTAMP WITH TIME ZONE` |
| `metadata`            | `JSONB`                    |
| `created_at`          | `TIMESTAMP WITH TIME ZONE` |

### `customs_officers`

Customs officer directory and performance metrics.

| Column                    | Type / SQL fragment        |
| ------------------------- | -------------------------- |
| `id`                      | `UUID`                     |
| `user_id`                 | `UUID`                     |
| `badge_number`            | `TEXT`                     |
| `rank`                    | `TEXT`                     |
| `station`                 | `TEXT`                     |
| `department`              | `TEXT`                     |
| `declarations_reviewed`   | `INTEGER`                  |
| `declarations_approved`   | `INTEGER`                  |
| `declarations_rejected`   | `INTEGER`                  |
| `avg_review_time_minutes` | `NUMERIC`                  |
| `accuracy_rate`           | `NUMERIC`                  |
| `appeals_overturned`      | `INTEGER`                  |
| `compliance_rate`         | `NUMERIC`                  |
| `current_queue_size`      | `INTEGER`                  |
| `daily_target`            | `INTEGER`                  |
| `is_active`               | `BOOLEAN`                  |
| `last_active_at`          | `TIMESTAMP WITH TIME ZONE` |
| `metadata`                | `JSONB`                    |
| `created_at`              | `TIMESTAMP WITH TIME ZONE` |
| `updated_at`              | `TIMESTAMP WITH TIME ZONE` |

### `customs_alerts`

Customs risk and operational alerts.

| Column             | Type / SQL fragment        |
| ------------------ | -------------------------- |
| `id`               | `UUID`                     |
| `alert_type`       | `TEXT`                     |
| `))`               | `expression`               |
| `severity`         | `TEXT`                     |
| `declaration_id`   | `UUID`                     |
| `trader_id`        | `UUID`                     |
| `shipment_id`      | `UUID`                     |
| `title`            | `TEXT`                     |
| `description`      | `TEXT`                     |
| `ai_confidence`    | `NUMERIC`                  |
| `pattern_details`  | `JSONB`                    |
| `status`           | `TEXT`                     |
| `assigned_to`      | `UUID`                     |
| `resolved_at`      | `TIMESTAMP WITH TIME ZONE` |
| `resolution_notes` | `TEXT`                     |
| `metadata`         | `JSONB`                    |
| `created_at`       | `TIMESTAMP WITH TIME ZONE` |
| `updated_at`       | `TIMESTAMP WITH TIME ZONE` |

### `customs_hs_codes`

HS code reference and tariff rate data.

| Column              | Type / SQL fragment        |
| ------------------- | -------------------------- |
| `id`                | `UUID`                     |
| `hs_code`           | `TEXT`                     |
| `description`       | `TEXT`                     |
| `chapter`           | `TEXT`                     |
| `section`           | `TEXT`                     |
| `mfn_rate`          | `NUMERIC`                  |
| `afcfta_rate`       | `NUMERIC`                  |
| `ecowas_rate`       | `NUMERIC`                  |
| `eac_rate`          | `NUMERIC`                  |
| `sadc_rate`         | `NUMERIC`                  |
| `unit`              | `TEXT`                     |
| `requires_license`  | `BOOLEAN`                  |
| `restricted`        | `BOOLEAN`                  |
| `prohibited`        | `BOOLEAN`                  |
| `high_risk`         | `BOOLEAN`                  |
| `common_fraud_item` | `BOOLEAN`                  |
| `metadata`          | `JSONB`                    |
| `created_at`        | `TIMESTAMP WITH TIME ZONE` |

## `enterprise_exporter_schema.sql`

### `export_projects`

Enterprise exporter project records.

| Column                  | Type / SQL fragment                                    |
| ----------------------- | ------------------------------------------------------ |
| `id`                    | `UUID`                                                 |
| `project_number`        | `TEXT`                                                 |
| `organization_id`       | `UUID`                                                 |
| `title`                 | `TEXT`                                                 |
| `description`           | `TEXT`                                                 |
| `template_type`         | `TEXT, -- 'produce', 'textiles', 'goods', 'minerals'`  |
| `status`                | `public.project_status`                                |
| `priority`              | `public.project_priority`                              |
| `product`               | `TEXT`                                                 |
| `hs_code`               | `TEXT`                                                 |
| `quantity`              | `NUMERIC`                                              |
| `unit`                  | `TEXT`                                                 |
| `value`                 | `NUMERIC`                                              |
| `currency`              | `TEXT`                                                 |
| `origin_country`        | `TEXT`                                                 |
| `destination_country`   | `TEXT`                                                 |
| `origin_port`           | `TEXT`                                                 |
| `destination_port`      | `TEXT`                                                 |
| `incoterm`              | `TEXT`                                                 |
| `target_ship_date`      | `DATE`                                                 |
| `actual_ship_date`      | `DATE`                                                 |
| `estimated_arrival`     | `DATE`                                                 |
| `actual_arrival`        | `DATE`                                                 |
| `afcfta_eligible`       | `BOOLEAN`                                              |
| `compliance_score`      | `NUMERIC`                                              |
| `compliance_status`     | `TEXT`                                                 |
| `required_documents`    | `JSONB`                                                |
| `completed_documents`   | `JSONB`                                                |
| `finance_status`        | `TEXT`                                                 |
| `finance_type`          | `TEXT, -- 'lc', 'guarantee', 'factoring', 'insurance'` |
| `finance_amount`        | `NUMERIC`                                              |
| `finance_provider`      | `TEXT`                                                 |
| `project_manager_id`    | `UUID`                                                 |
| `team_members`          | `JSONB`                                                |
| `ai_risk_score`         | `NUMERIC`                                              |
| `ai_recommendations`    | `JSONB`                                                |
| `ai_route_optimization` | `JSONB`                                                |
| `tags`                  | `JSONB`                                                |
| `custom_fields`         | `JSONB`                                                |
| `created_at`            | `TIMESTAMPTZ`                                          |
| `updated_at`            | `TIMESTAMPTZ`                                          |

### `project_documents`

Documents linked to export projects.

| Column                | Type / SQL fragment      |
| --------------------- | ------------------------ |
| `id`                  | `UUID`                   |
| `project_id`          | `UUID`                   |
| `name`                | `TEXT`                   |
| `document_type`       | `TEXT`                   |
| `file_url`            | `TEXT`                   |
| `file_size`           | `INTEGER`                |
| `mime_type`           | `TEXT`                   |
| `version`             | `INTEGER`                |
| `previous_version_id` | `UUID`                   |
| `status`              | `public.document_status` |
| `verified_by`         | `UUID`                   |
| `verified_at`         | `TIMESTAMPTZ`            |
| `rejection_reason`    | `TEXT`                   |
| `expiry_date`         | `DATE`                   |
| `compliance_checked`  | `BOOLEAN`                |
| `compliance_issues`   | `JSONB`                  |
| `uploaded_by`         | `UUID`                   |
| `created_at`          | `TIMESTAMPTZ`            |
| `updated_at`          | `TIMESTAMPTZ`            |

### `project_activities`

Project activity stream.

| Column                | Type / SQL fragment |
| --------------------- | ------------------- |
| `id`                  | `UUID`              |
| `project_id`          | `UUID`              |
| `user_id`             | `UUID`              |
| `user_name`           | `TEXT`              |
| `action`              | `TEXT`              |
| `detail`              | `TEXT`              |
| `activity_type`       | `TEXT`              |
| `related_document_id` | `UUID`              |
| `related_entity_type` | `TEXT`              |
| `related_entity_id`   | `UUID`              |
| `is_ai_generated`     | `BOOLEAN`           |
| `ai_confidence`       | `NUMERIC`           |
| `created_at`          | `TIMESTAMPTZ`       |

### `trade_partners`

Export partner directory.

| Column                     | Type / SQL fragment        |
| -------------------------- | -------------------------- |
| `id`                       | `UUID`                     |
| `organization_id`          | `UUID`                     |
| `company_name`             | `TEXT`                     |
| `partner_type`             | `public.partner_type`      |
| `country`                  | `TEXT`                     |
| `city`                     | `TEXT`                     |
| `address`                  | `TEXT`                     |
| `contact_name`             | `TEXT`                     |
| `contact_email`            | `TEXT`                     |
| `contact_phone`            | `TEXT`                     |
| `website`                  | `TEXT`                     |
| `verification_tier`        | `public.verification_tier` |
| `kyc_verified`             | `BOOLEAN`                  |
| `kyc_verified_at`          | `TIMESTAMPTZ`              |
| `afcfta_registered`        | `BOOLEAN`                  |
| `international_compliance` | `BOOLEAN`                  |
| `rating`                   | `NUMERIC`                  |
| `review_count`             | `INTEGER`                  |
| `compliance_score`         | `NUMERIC`                  |
| `total_trades`             | `INTEGER`                  |
| `total_trade_value`        | `NUMERIC`                  |
| `successful_trades`        | `INTEGER`                  |
| `sectors`                  | `JSONB`                    |
| `products`                 | `JSONB`                    |
| `certifications`           | `JSONB`                    |
| `ai_match_score`           | `NUMERIC`                  |
| `ai_recommended_for`       | `JSONB`                    |
| `is_active`                | `BOOLEAN`                  |
| `created_at`               | `TIMESTAMPTZ`              |
| `updated_at`               | `TIMESTAMPTZ`              |

### `market_intelligence`

Market research and indicator data.

| Column                    | Type / SQL fragment                           |
| ------------------------- | --------------------------------------------- |
| `id`                      | `UUID`                                        |
| `country`                 | `TEXT`                                        |
| `sector`                  | `TEXT`                                        |
| `hs_code`                 | `TEXT`                                        |
| `product_category`        | `TEXT`                                        |
| `import_volume`           | `NUMERIC`                                     |
| `export_volume`           | `NUMERIC`                                     |
| `import_value`            | `NUMERIC`                                     |
| `export_value`            | `NUMERIC`                                     |
| `demand_index`            | `NUMERIC`                                     |
| `supply_index`            | `NUMERIC`                                     |
| `price_trend`             | `TEXT`                                        |
| `price_change_percent`    | `NUMERIC`                                     |
| `mfn_tariff_rate`         | `NUMERIC`                                     |
| `afcfta_tariff_rate`      | `NUMERIC`                                     |
| `non_tariff_barriers`     | `JSONB`                                       |
| `regulatory_requirements` | `JSONB`                                       |
| `ai_demand_forecast`      | `JSONB, -- { '3m': 55, '6m': 60, '12m': 65 }` |
| `ai_price_forecast`       | `JSONB`                                       |
| `ai_opportunity_score`    | `NUMERIC`                                     |
| `ai_risk_factors`         | `JSONB`                                       |
| `top_exporters`           | `JSONB`                                       |
| `top_importers`           | `JSONB`                                       |
| `market_share_data`       | `JSONB`                                       |
| `period_start`            | `DATE`                                        |
| `period_end`              | `DATE`                                        |
| `data_source`             | `TEXT`                                        |
| `created_at`              | `TIMESTAMPTZ`                                 |
| `updated_at`              | `TIMESTAMPTZ`                                 |

### `fx_rates`

Foreign exchange rates.

| Column                    | Type / SQL fragment |
| ------------------------- | ------------------- |
| `id`                      | `UUID`              |
| `base_currency`           | `TEXT`              |
| `quote_currency`          | `TEXT`              |
| `rate`                    | `NUMERIC`           |
| `change_1d`               | `NUMERIC`           |
| `change_1w`               | `NUMERIC`           |
| `change_1m`               | `NUMERIC`           |
| `volatility_30d`          | `NUMERIC`           |
| `ai_hedge_recommendation` | `TEXT`              |
| `ai_forecast_1m`          | `NUMERIC`           |
| `ai_forecast_3m`          | `NUMERIC`           |
| `source`                  | `TEXT`              |
| `recorded_at`             | `TIMESTAMPTZ`       |

### `trade_finance_applications`

Finance applications tied to export projects.

| Column                | Type / SQL fragment           |
| --------------------- | ----------------------------- |
| `id`                  | `UUID`                        |
| `application_number`  | `TEXT`                        |
| `organization_id`     | `UUID`                        |
| `project_id`          | `UUID`                        |
| `product_type`        | `public.finance_product_type` |
| `amount_requested`    | `NUMERIC`                     |
| `currency`            | `TEXT`                        |
| `term_days`           | `INTEGER`                     |
| `status`              | `public.finance_app_status`   |
| `provider_id`         | `UUID`                        |
| `provider_name`       | `TEXT`                        |
| `approved_amount`     | `NUMERIC`                     |
| `interest_rate`       | `NUMERIC`                     |
| `fees`                | `NUMERIC`                     |
| `collateral_required` | `JSONB`                       |
| `ai_risk_score`       | `NUMERIC`                     |
| `ai_fraud_flags`      | `JSONB`                       |
| `compliance_score`    | `NUMERIC`                     |
| `submitted_at`        | `TIMESTAMPTZ`                 |
| `reviewed_at`         | `TIMESTAMPTZ`                 |
| `approved_at`         | `TIMESTAMPTZ`                 |
| `disbursed_at`        | `TIMESTAMPTZ`                 |
| `due_date`            | `DATE`                        |
| `required_documents`  | `JSONB`                       |
| `submitted_documents` | `JSONB`                       |
| `created_at`          | `TIMESTAMPTZ`                 |
| `updated_at`          | `TIMESTAMPTZ`                 |

### `shipment_tracking`

Export shipment tracking records.

| Column                  | Type / SQL fragment      |
| ----------------------- | ------------------------ |
| `id`                    | `UUID`                   |
| `project_id`            | `UUID`                   |
| `tracking_number`       | `TEXT`                   |
| `carrier_name`          | `TEXT`                   |
| `transport_mode`        | `public.transport_mode`  |
| `container_number`      | `TEXT`                   |
| `container_type`        | `TEXT`                   |
| `cargo_weight`          | `NUMERIC`                |
| `cargo_volume`          | `NUMERIC`                |
| `origin_port`           | `TEXT`                   |
| `destination_port`      | `TEXT`                   |
| `current_location`      | `TEXT`                   |
| `current_country`       | `TEXT`                   |
| `latitude`              | `NUMERIC`                |
| `longitude`             | `NUMERIC`                |
| `status`                | `public.shipment_status` |
| `status_detail`         | `TEXT`                   |
| `booking_date`          | `DATE`                   |
| `pickup_date`           | `DATE`                   |
| `departure_date`        | `DATE`                   |
| `eta`                   | `DATE`                   |
| `ata`                   | `DATE`                   |
| `risk_level`            | `TEXT`                   |
| `risk_factors`          | `JSONB`                  |
| `delay_probability`     | `NUMERIC`                |
| `temperature`           | `NUMERIC`                |
| `humidity`              | `NUMERIC`                |
| `last_sensor_update`    | `TIMESTAMPTZ`            |
| `sensor_alerts`         | `JSONB`                  |
| `timeline`              | `JSONB`                  |
| `ai_route_score`        | `NUMERIC`                |
| `ai_alternative_routes` | `JSONB`                  |
| `ai_carbon_footprint`   | `NUMERIC`                |
| `created_at`            | `TIMESTAMPTZ`            |
| `updated_at`            | `TIMESTAMPTZ`            |

### `trade_tenders`

Trade tender opportunities.

| Column                    | Type / SQL fragment                         |
| ------------------------- | ------------------------------------------- |
| `id`                      | `UUID`                                      |
| `tender_number`           | `TEXT`                                      |
| `title`                   | `TEXT`                                      |
| `description`             | `TEXT`                                      |
| `issuer_name`             | `TEXT`                                      |
| `issuer_country`          | `TEXT`                                      |
| `issuer_type`             | `TEXT, -- 'government', 'corporate', 'ngo'` |
| `product_category`        | `TEXT`                                      |
| `hs_codes`                | `JSONB`                                     |
| `quantity`                | `NUMERIC`                                   |
| `unit`                    | `TEXT`                                      |
| `specifications`          | `JSONB`                                     |
| `estimated_value`         | `NUMERIC`                                   |
| `currency`                | `TEXT`                                      |
| `published_date`          | `DATE`                                      |
| `deadline`                | `DATE`                                      |
| `delivery_date`           | `DATE`                                      |
| `status`                  | `public.tender_status`                      |
| `eligibility_criteria`    | `JSONB`                                     |
| `required_documents`      | `JSONB`                                     |
| `required_certifications` | `JSONB`                                     |
| `ai_match_score`          | `NUMERIC`                                   |
| `ai_win_probability`      | `NUMERIC`                                   |
| `ai_pricing_suggestion`   | `JSONB`                                     |
| `ai_compliance_check`     | `JSONB`                                     |
| `source_url`              | `TEXT`                                      |
| `created_at`              | `TIMESTAMPTZ`                               |
| `updated_at`              | `TIMESTAMPTZ`                               |

### `tender_bids`

Bids against trade tenders.

| Column                    | Type / SQL fragment |
| ------------------------- | ------------------- |
| `id`                      | `UUID`              |
| `tender_id`               | `UUID`              |
| `organization_id`         | `UUID`              |
| `bid_amount`              | `NUMERIC`           |
| `currency`                | `TEXT`              |
| `delivery_days`           | `INTEGER`           |
| `status`                  | `public.bid_status` |
| `submitted_documents`     | `JSONB`             |
| `ai_generated_content`    | `JSONB`             |
| `ai_competitive_analysis` | `JSONB`             |
| `submitted_at`            | `TIMESTAMPTZ`       |
| `created_at`              | `TIMESTAMPTZ`       |
| `updated_at`              | `TIMESTAMPTZ`       |

### `trade_contracts`

Exporter-specific trade contracts.

| Column                        | Type / SQL fragment                                      |
| ----------------------------- | -------------------------------------------------------- |
| `id`                          | `UUID`                                                   |
| `contract_number`             | `TEXT`                                                   |
| `organization_id`             | `UUID`                                                   |
| `title`                       | `TEXT`                                                   |
| `contract_type`               | `TEXT, -- 'sales', 'purchase', 'distribution', 'agency'` |
| `template_id`                 | `TEXT`                                                   |
| `counterparty_id`             | `UUID`                                                   |
| `counterparty_name`           | `TEXT`                                                   |
| `counterparty_country`        | `TEXT`                                                   |
| `value`                       | `NUMERIC`                                                |
| `currency`                    | `TEXT`                                                   |
| `payment_terms`               | `TEXT`                                                   |
| `delivery_terms`              | `TEXT`                                                   |
| `incoterm`                    | `TEXT`                                                   |
| `effective_date`              | `DATE`                                                   |
| `expiry_date`                 | `DATE`                                                   |
| `renewal_date`                | `DATE`                                                   |
| `status`                      | `public.contract_status`                                 |
| `our_signature_date`          | `TIMESTAMPTZ`                                            |
| `counterparty_signature_date` | `TIMESTAMPTZ`                                            |
| `digital_signature_hash`      | `TEXT`                                                   |
| `performance_score`           | `NUMERIC`                                                |
| `milestones_completed`        | `INTEGER`                                                |
| `milestones_total`            | `INTEGER`                                                |
| `ai_risk_flags`               | `JSONB`                                                  |
| `ai_renewal_recommendation`   | `TEXT`                                                   |
| `ai_performance_insights`     | `JSONB`                                                  |
| `contract_document_url`       | `TEXT`                                                   |
| `amendments`                  | `JSONB`                                                  |
| `created_at`                  | `TIMESTAMPTZ`                                            |
| `updated_at`                  | `TIMESTAMPTZ`                                            |

### `compliance_checks`

Project compliance checks and AI review results.

| Column                 | Type / SQL fragment              |
| ---------------------- | -------------------------------- |
| `id`                   | `UUID`                           |
| `project_id`           | `UUID`                           |
| `description`          | `TEXT`                           |
| `status`               | `public.compliance_check_status` |
| `passed`               | `BOOLEAN`                        |
| `score`                | `NUMERIC`                        |
| `issues`               | `JSONB`                          |
| `recommendations`      | `JSONB`                          |
| `regulation_reference` | `TEXT`                           |
| `regulation_country`   | `TEXT`                           |
| `ai_verified`          | `BOOLEAN`                        |
| `ai_confidence`        | `NUMERIC`                        |
| `ai_suggestions`       | `JSONB`                          |
| `created_at`           | `TIMESTAMPTZ`                    |
| `updated_at`           | `TIMESTAMPTZ`                    |

### `kyc_verifications`

Organization verification state.

| Column                           | Type / SQL fragment |
| -------------------------------- | ------------------- |
| `id`                             | `UUID`              |
| `organization_id`                | `UUID`              |
| `status`                         | `public.kyc_status` |
| `documents_submitted`            | `JSONB`             |
| `documents_verified`             | `JSONB`             |
| `documents_rejected`             | `JSONB`             |
| `business_registration_verified` | `BOOLEAN`           |
| `tax_registration_verified`      | `BOOLEAN`           |
| `bank_account_verified`          | `BOOLEAN`           |
| `address_verified`               | `BOOLEAN`           |
| `directors_verified`             | `BOOLEAN`           |
| `sanctions_checked`              | `BOOLEAN`           |
| `sanctions_clear`                | `BOOLEAN`           |
| `sanctions_check_date`           | `TIMESTAMPTZ`       |
| `blacklist_checked`              | `BOOLEAN`           |
| `blacklist_clear`                | `BOOLEAN`           |
| `ai_risk_score`                  | `NUMERIC`           |
| `ai_risk_factors`                | `JSONB`             |
| `verified_at`                    | `TIMESTAMPTZ`       |
| `expires_at`                     | `TIMESTAMPTZ`       |
| `renewal_reminder_sent`          | `BOOLEAN`           |
| `created_at`                     | `TIMESTAMPTZ`       |
| `updated_at`                     | `TIMESTAMPTZ`       |

### `marketing_campaigns`

Exporter marketing campaigns and generated assets.

| Column                 | Type / SQL fragment                                                 |
| ---------------------- | ------------------------------------------------------------------- |
| `id`                   | `UUID`                                                              |
| `organization_id`      | `UUID`                                                              |
| `name`                 | `TEXT`                                                              |
| `description`          | `TEXT`                                                              |
| `campaign_type`        | `TEXT, -- 'product_showcase', 'brand_awareness', 'lead_generation'` |
| `target_countries`     | `JSONB`                                                             |
| `target_sectors`       | `JSONB`                                                             |
| `target_buyer_types`   | `JSONB`                                                             |
| `products`             | `JSONB`                                                             |
| `content_assets`       | `JSONB`                                                             |
| `ai_generated_content` | `JSONB`                                                             |
| `channels`             | `JSONB`                                                             |
| `start_date`           | `DATE`                                                              |
| `end_date`             | `DATE`                                                              |
| `status`               | `public.campaign_status`                                            |
| `budget`               | `NUMERIC`                                                           |
| `spent`                | `NUMERIC`                                                           |
| `currency`             | `TEXT`                                                              |
| `impressions`          | `INTEGER`                                                           |
| `clicks`               | `INTEGER`                                                           |
| `leads`                | `INTEGER`                                                           |
| `conversions`          | `INTEGER`                                                           |
| `roi`                  | `NUMERIC`                                                           |
| `created_at`           | `TIMESTAMPTZ`                                                       |
| `updated_at`           | `TIMESTAMPTZ`                                                       |

### `exporter_dashboard_kpis`

Precomputed exporter dashboard metrics.

| Column                      | Type / SQL fragment |
| --------------------------- | ------------------- |
| `id`                        | `UUID`              |
| `organization_id`           | `UUID`              |
| `period_date`               | `DATE`              |
| `total_exports`             | `NUMERIC`           |
| `total_export_value`        | `NUMERIC`           |
| `active_projects`           | `INTEGER`           |
| `completed_projects`        | `INTEGER`           |
| `exports_by_country`        | `JSONB`             |
| `exports_by_sector`         | `JSONB`             |
| `exports_by_partner`        | `JSONB`             |
| `pending_payments`          | `NUMERIC`           |
| `received_payments`         | `NUMERIC`           |
| `outstanding_credit`        | `NUMERIC`           |
| `finance_utilization`       | `NUMERIC`           |
| `compliance_score`          | `NUMERIC`           |
| `pending_compliance_checks` | `INTEGER`           |
| `afcfta_savings`            | `NUMERIC`           |
| `shipments_in_transit`      | `INTEGER`           |
| `on_time_delivery_rate`     | `NUMERIC`           |
| `avg_transit_days`          | `NUMERIC`           |
| `ai_market_opportunities`   | `JSONB`             |
| `ai_risk_alerts`            | `JSONB`             |
| `ai_recommendations`        | `JSONB`             |
| `created_at`                | `TIMESTAMPTZ`       |

## `finance_tables.sql`

### `fx_rates`

Foreign exchange rates.

| Column           | Type / SQL fragment        |
| ---------------- | -------------------------- |
| `id`             | `UUID`                     |
| `pair`           | `TEXT`                     |
| `rate`           | `NUMERIC(18,4)`            |
| `change`         | `NUMERIC(18,4)`            |
| `change_percent` | `NUMERIC(8,4)`             |
| `high_24h`       | `NUMERIC(18,4)`            |
| `low_24h`        | `NUMERIC(18,4)`            |
| `source`         | `TEXT`                     |
| `updated_at`     | `TIMESTAMP WITH TIME ZONE` |
| `created_at`     | `TIMESTAMP WITH TIME ZONE` |

### `fx_rate_history`

Historical FX rate observations.

| Column        | Type / SQL fragment        |
| ------------- | -------------------------- |
| `id`          | `UUID`                     |
| `pair`        | `TEXT`                     |
| `rate`        | `NUMERIC(18,4)`            |
| `recorded_at` | `TIMESTAMP WITH TIME ZONE` |

### `hedging_suggestions`

Active hedging recommendations.

| Column              | Type / SQL fragment        |
| ------------------- | -------------------------- |
| `id`                | `UUID`                     |
| `type`              | `TEXT`                     |
| `pair`              | `TEXT`                     |
| `description`       | `TEXT`                     |
| `estimated_savings` | `NUMERIC(12,2)`            |
| `savings_display`   | `TEXT, -- e.g. '$4,200'`   |
| `risk`              | `TEXT`                     |
| `term`              | `TEXT, -- e.g. '90 days'`  |
| `is_active`         | `BOOLEAN`                  |
| `created_at`        | `TIMESTAMP WITH TIME ZONE` |

### `finance_summary`

User-level finance summary metrics.

| Column                  | Type / SQL fragment        |
| ----------------------- | -------------------------- |
| `id`                    | `UUID`                     |
| `user_id`               | `UUID`                     |
| `approved_credit`       | `NUMERIC(14,2)`            |
| `total_disbursed`       | `NUMERIC(14,2)`            |
| `total_repaid`          | `NUMERIC(14,2)`            |
| `avg_interest_rate`     | `NUMERIC(5,2)`             |
| `next_repayment_date`   | `DATE`                     |
| `next_repayment_amount` | `NUMERIC(14,2)`            |
| `fx_exposure`           | `NUMERIC(14,2)`            |
| `hedged_amount`         | `NUMERIC(14,2)`            |
| `updated_at`            | `TIMESTAMP WITH TIME ZONE` |

## `gov_schema.sql`

### `gov_policies`

Government policy library.

| Column              | Type / SQL fragment        |
| ------------------- | -------------------------- |
| `id`                | `UUID`                     |
| `title`             | `TEXT`                     |
| `category`          | `TEXT`                     |
| `status`            | `TEXT`                     |
| `effective_date`    | `DATE`                     |
| `expiry_date`       | `DATE`                     |
| `issuing_authority` | `TEXT`                     |
| `country`           | `TEXT`                     |
| `description`       | `TEXT`                     |
| `document_url`      | `TEXT`                     |
| `compliance_rate`   | `NUMERIC(5,2)`             |
| `affected_sectors`  | `TEXT[]`                   |
| `tags`              | `TEXT[]`                   |
| `metadata`          | `JSONB`                    |
| `created_at`        | `TIMESTAMP WITH TIME ZONE` |
| `updated_at`        | `TIMESTAMP WITH TIME ZONE` |

### `gov_compliance_cases`

Government enforcement and compliance cases.

| Column               | Type / SQL fragment        |
| -------------------- | -------------------------- |
| `id`                 | `UUID`                     |
| `case_number`        | `TEXT`                     |
| `title`              | `TEXT`                     |
| `entity_name`        | `TEXT`                     |
| `entity_id`          | `UUID`                     |
| `policy_id`          | `UUID`                     |
| `violation_type`     | `TEXT`                     |
| `severity`           | `TEXT`                     |
| `status`             | `TEXT`                     |
| `assigned_to`        | `TEXT`                     |
| `description`        | `TEXT`                     |
| `penalty_amount`     | `NUMERIC`                  |
| `penalty_currency`   | `TEXT`                     |
| `resolution`         | `TEXT`                     |
| `evidence_documents` | `UUID[]`                   |
| `country`            | `TEXT`                     |
| `created_at`         | `TIMESTAMP WITH TIME ZONE` |
| `updated_at`         | `TIMESTAMP WITH TIME ZONE` |
| `resolved_at`        | `TIMESTAMP WITH TIME ZONE` |

### `gov_trade_agreements`

Trade agreement metadata and utilization metrics.

| Column                 | Type / SQL fragment        |
| ---------------------- | -------------------------- |
| `id`                   | `UUID`                     |
| `name`                 | `TEXT`                     |
| `short_name`           | `TEXT`                     |
| `agreement_type`       | `TEXT`                     |
| `status`               | `TEXT`                     |
| `member_countries`     | `TEXT[]`                   |
| `effective_date`       | `DATE`                     |
| `expiry_date`          | `DATE`                     |
| `coverage_area`        | `TEXT`                     |
| `tariff_reduction_pct` | `NUMERIC(5,2)`             |
| `utilization_rate`     | `NUMERIC(5,2)`             |
| `trade_volume`         | `NUMERIC`                  |
| `key_provisions`       | `TEXT[]`                   |
| `secretariat`          | `TEXT`                     |
| `website`              | `TEXT`                     |
| `metadata`             | `JSONB`                    |
| `created_at`           | `TIMESTAMP WITH TIME ZONE` |
| `updated_at`           | `TIMESTAMP WITH TIME ZONE` |

### `gov_tariff_schedules`

Tariff schedule and rules-of-origin data.

| Column                 | Type / SQL fragment        |
| ---------------------- | -------------------------- |
| `id`                   | `UUID`                     |
| `agreement_id`         | `UUID`                     |
| `hs_code`              | `TEXT`                     |
| `product_description`  | `TEXT`                     |
| `mfn_rate`             | `NUMERIC(5,2)`             |
| `preferential_rate`    | `NUMERIC(5,2)`             |
| `margin_of_preference` | `NUMERIC(5,2)`             |
| `origin_criteria`      | `TEXT`                     |
| `sensitive_list`       | `BOOLEAN`                  |
| `exclusion_list`       | `BOOLEAN`                  |
| `effective_date`       | `DATE`                     |
| `metadata`             | `JSONB`                    |
| `created_at`           | `TIMESTAMP WITH TIME ZONE` |

### `gov_border_posts`

Border post and corridor operational data.

| Column                | Type / SQL fragment        |
| --------------------- | -------------------------- |
| `id`                  | `UUID`                     |
| `name`                | `TEXT`                     |
| `post_type`           | `TEXT`                     |
| `country`             | `TEXT`                     |
| `adjacent_country`    | `TEXT`                     |
| `corridor`            | `TEXT`                     |
| `latitude`            | `NUMERIC(10,6)`            |
| `longitude`           | `NUMERIC(10,6)`            |
| `avg_clearance_hours` | `NUMERIC(6,2)`             |
| `daily_volume`        | `INTEGER`                  |
| `congestion_level`    | `TEXT`                     |
| `operational_status`  | `TEXT`                     |
| `one_stop_border`     | `BOOLEAN`                  |
| `operating_hours`     | `TEXT`                     |
| `metadata`            | `JSONB`                    |
| `created_at`          | `TIMESTAMP WITH TIME ZONE` |
| `updated_at`          | `TIMESTAMP WITH TIME ZONE` |

### `gov_trusted_traders`

Trusted trader certification data.

| Column             | Type / SQL fragment        |
| ------------------ | -------------------------- |
| `id`               | `UUID`                     |
| `organization_id`  | `UUID`                     |
| `tier`             | `TEXT`                     |
| `compliance_score` | `INTEGER`                  |
| `trade_volume`     | `NUMERIC`                  |
| `total_trades`     | `INTEGER`                  |
| `violations_count` | `INTEGER`                  |
| `last_audit_date`  | `DATE`                     |
| `next_audit_date`  | `DATE`                     |
| `certified_at`     | `TIMESTAMP WITH TIME ZONE` |
| `expires_at`       | `TIMESTAMP WITH TIME ZONE` |
| `benefits`         | `TEXT[]`                   |
| `metadata`         | `JSONB`                    |
| `created_at`       | `TIMESTAMP WITH TIME ZONE` |
| `updated_at`       | `TIMESTAMP WITH TIME ZONE` |

## `schema.sql`

### `profiles`

User identity, persona, onboarding, and organization membership.

| Column                               | Type / SQL fragment        |
| ------------------------------------ | -------------------------- |
| `id`                                 | `UUID`                     |
| `email`                              | `TEXT`                     |
| `full_name`                          | `TEXT`                     |
| `phone`                              | `TEXT`                     |
| `country`                            | `TEXT`                     |
| `role`                               | `public.user_persona`      |
| `organization_id`                    | `UUID`                     |
| `company_name`                       | `TEXT`                     |
| `is_super_admin`                     | `BOOLEAN`                  |
| `onboarding_completed`               | `BOOLEAN`                  |
| `onboarding_step`                    | `INTEGER`                  |
| `created_at`                         | `TIMESTAMP WITH TIME ZONE` |
| `updated_at`                         | `TIMESTAMP WITH TIME ZONE` |
| `onboarding_completed`               | `= FALSE OR (`             |
| `NULLIF(TRIM(COALESCE(full_name,`    | `'')), '') IS`             |
| `NULLIF(TRIM(COALESCE(email,`        | `'')), '') IS`             |
| `NULLIF(TRIM(COALESCE(country,`      | `'')), '') IS`             |
| `NULLIF(TRIM(COALESCE(company_name,` | `'')), '') IS`             |
| `)`                                  | `expression`               |
| `)`                                  | `expression`               |

### `audit_logs`

Audit trail for user, admin, and workflow actions.

| Column          | Type / SQL fragment        |
| --------------- | -------------------------- |
| `id`            | `UUID`                     |
| `user_id`       | `UUID`                     |
| `action`        | `TEXT`                     |
| `entity_type`   | `TEXT`                     |
| `entity_id`     | `TEXT`                     |
| `old_values`    | `JSONB`                    |
| `new_values`    | `JSONB`                    |
| `ip_address`    | `INET`                     |
| `user_agent`    | `TEXT`                     |
| `status`        | `TEXT`                     |
| `error_message` | `TEXT`                     |
| `created_at`    | `TIMESTAMP WITH TIME ZONE` |

### `documents`

Uploaded or referenced user/organization documents.

| Column               | Type / SQL fragment        |
| -------------------- | -------------------------- |
| `id`                 | `UUID`                     |
| `user_id`            | `UUID`                     |
| `organization_id`    | `UUID`                     |
| `document_type`      | `public.document_type`     |
| `file_name`          | `TEXT`                     |
| `file_path`          | `TEXT`                     |
| `file_size`          | `INTEGER`                  |
| `mime_type`          | `TEXT`                     |
| `status`             | `public.document_status`   |
| `verification_notes` | `TEXT`                     |
| `verified_by`        | `UUID`                     |
| `verified_at`        | `TIMESTAMP WITH TIME ZONE` |
| `expires_at`         | `TIMESTAMP WITH TIME ZONE` |
| `metadata`           | `JSONB`                    |
| `created_at`         | `TIMESTAMP WITH TIME ZONE` |
| `updated_at`         | `TIMESTAMP WITH TIME ZONE` |

### `organizations`

Companies, agencies, providers, and ecosystem participants.

| Column                | Type / SQL fragment          |
| --------------------- | ---------------------------- |
| `id`                  | `UUID`                       |
| `name`                | `TEXT`                       |
| `type`                | `public.organization_type`   |
| `registration_number` | `TEXT`                       |
| `tax_id`              | `TEXT`                       |
| `country`             | `TEXT`                       |
| `city`                | `TEXT`                       |
| `address`             | `TEXT`                       |
| `phone`               | `TEXT`                       |
| `email`               | `TEXT`                       |
| `website`             | `TEXT`                       |
| `logo_url`            | `TEXT`                       |
| `logo_initial`        | `TEXT`                       |
| `description`         | `TEXT`                       |
| `verification_status` | `public.verification_status` |
| `verified_at`         | `TIMESTAMP WITH TIME ZONE`   |
| `verified_by`         | `UUID`                       |
| `rating`              | `NUMERIC(2,1)`               |
| `reviews_count`       | `INTEGER`                    |
| `tags`                | `TEXT[]`                     |
| `metadata`            | `JSONB`                      |
| `created_by`          | `UUID`                       |
| `created_at`          | `TIMESTAMP WITH TIME ZONE`   |
| `updated_at`          | `TIMESTAMP WITH TIME ZONE`   |

### `kyc_requests`

KYC/KYB review requests and risk metadata.

| Column                | Type / SQL fragment        |
| --------------------- | -------------------------- |
| `id`                  | `UUID`                     |
| `user_id`             | `UUID`                     |
| `organization_id`     | `UUID`                     |
| `request_type`        | `TEXT`                     |
| `status`              | `public.kyc_status`        |
| `submitted_at`        | `TIMESTAMP WITH TIME ZONE` |
| `reviewed_by`         | `UUID`                     |
| `reviewed_at`         | `TIMESTAMP WITH TIME ZONE` |
| `review_notes`        | `TEXT`                     |
| `rejection_reason`    | `TEXT`                     |
| `risk_score`          | `INTEGER`                  |
| `documents_required`  | `TEXT[]`                   |
| `documents_submitted` | `UUID[]`                   |
| `expires_at`          | `TIMESTAMP WITH TIME ZONE` |
| `metadata`            | `JSONB`                    |
| `created_at`          | `TIMESTAMP WITH TIME ZONE` |
| `updated_at`          | `TIMESTAMP WITH TIME ZONE` |

### `notifications`

In-app notification records.

| Column       | Type / SQL fragment        |
| ------------ | -------------------------- |
| `id`         | `UUID`                     |
| `user_id`    | `UUID`                     |
| `type`       | `public.notification_type` |
| `title`      | `TEXT`                     |
| `message`    | `TEXT`                     |
| `link`       | `TEXT`                     |
| `is_read`    | `BOOLEAN`                  |
| `read_at`    | `TIMESTAMP WITH TIME ZONE` |
| `metadata`   | `JSONB`                    |
| `created_at` | `TIMESTAMP WITH TIME ZONE` |

### `licenses`

Organization or user trade licenses.

| Column              | Type / SQL fragment        |
| ------------------- | -------------------------- |
| `id`                | `UUID`                     |
| `organization_id`   | `UUID`                     |
| `user_id`           | `UUID`                     |
| `license_type`      | `TEXT`                     |
| `license_number`    | `TEXT`                     |
| `issuing_authority` | `TEXT`                     |
| `issuing_country`   | `TEXT`                     |
| `issued_at`         | `DATE`                     |
| `expires_at`        | `DATE`                     |
| `status`            | `TEXT`                     |
| `document_id`       | `UUID`                     |
| `verified`          | `BOOLEAN`                  |
| `verified_by`       | `UUID`                     |
| `verified_at`       | `TIMESTAMP WITH TIME ZONE` |
| `metadata`          | `JSONB`                    |
| `created_at`        | `TIMESTAMP WITH TIME ZONE` |
| `updated_at`        | `TIMESTAMP WITH TIME ZONE` |

### `financiers`

Public finance provider catalog.

| Column          | Type / SQL fragment        |
| --------------- | -------------------------- |
| `id`            | `UUID`                     |
| `name`          | `TEXT`                     |
| `type`          | `TEXT`                     |
| `product`       | `TEXT`                     |
| `interest_rate` | `NUMERIC(5,2)`             |
| `term`          | `TEXT`                     |
| `min_score`     | `INTEGER`                  |
| `logo_initial`  | `TEXT`                     |
| `country`       | `TEXT`                     |
| `description`   | `TEXT`                     |
| `is_active`     | `BOOLEAN`                  |
| `created_at`    | `TIMESTAMP WITH TIME ZONE` |

### `products`

Marketplace product listings.

| Column               | Type / SQL fragment        |
| -------------------- | -------------------------- |
| `id`                 | `UUID`                     |
| `organization_id`    | `UUID`                     |
| `name`               | `TEXT`                     |
| `description`        | `TEXT`                     |
| `hs_code`            | `TEXT`                     |
| `category`           | `TEXT`                     |
| `origin_country`     | `TEXT`                     |
| `price`              | `NUMERIC`                  |
| `currency`           | `TEXT`                     |
| `unit`               | `TEXT`                     |
| `min_order_quantity` | `NUMERIC`                  |
| `max_order_quantity` | `NUMERIC`                  |
| `lead_time_days`     | `INTEGER`                  |
| `images`             | `TEXT[]`                   |
| `specifications`     | `JSONB`                    |
| `certifications`     | `TEXT[]`                   |
| `is_active`          | `BOOLEAN`                  |
| `views_count`        | `INTEGER`                  |
| `inquiries_count`    | `INTEGER`                  |
| `created_at`         | `TIMESTAMP WITH TIME ZONE` |
| `updated_at`         | `TIMESTAMP WITH TIME ZONE` |

### `wishlist`

User saved products or organizations.

| Column            | Type / SQL fragment        |
| ----------------- | -------------------------- |
| `id`              | `UUID`                     |
| `user_id`         | `UUID`                     |
| `organization_id` | `UUID`                     |
| `product_id`      | `UUID`                     |
| `notes`           | `TEXT`                     |
| `created_at`      | `TIMESTAMP WITH TIME ZONE` |

### `tenders`

Marketplace tender/RFQ records.

| Column                | Type / SQL fragment        |
| --------------------- | -------------------------- |
| `id`                  | `UUID`                     |
| `organization_id`     | `UUID`                     |
| `created_by`          | `UUID`                     |
| `title`               | `TEXT`                     |
| `description`         | `TEXT`                     |
| `category`            | `TEXT`                     |
| `hs_codes`            | `TEXT[]`                   |
| `quantity`            | `NUMERIC`                  |
| `unit`                | `TEXT`                     |
| `budget_min`          | `NUMERIC`                  |
| `budget_max`          | `NUMERIC`                  |
| `currency`            | `TEXT`                     |
| `delivery_location`   | `TEXT`                     |
| `delivery_deadline`   | `DATE`                     |
| `submission_deadline` | `TIMESTAMP WITH TIME ZONE` |
| `requirements`        | `TEXT[]`                   |
| `documents`           | `UUID[]`                   |
| `status`              | `public.tender_status`     |
| `is_public`           | `BOOLEAN`                  |
| `views_count`         | `INTEGER`                  |
| `bids_count`          | `INTEGER`                  |
| `awarded_to`          | `UUID`                     |
| `awarded_at`          | `TIMESTAMP WITH TIME ZONE` |
| `metadata`            | `JSONB`                    |
| `created_at`          | `TIMESTAMP WITH TIME ZONE` |
| `updated_at`          | `TIMESTAMP WITH TIME ZONE` |

### `bids`

Tender bid submissions.

| Column             | Type / SQL fragment        |
| ------------------ | -------------------------- |
| `id`               | `UUID`                     |
| `tender_id`        | `UUID`                     |
| `organization_id`  | `UUID`                     |
| `submitted_by`     | `UUID`                     |
| `price`            | `NUMERIC`                  |
| `currency`         | `TEXT`                     |
| `delivery_days`    | `INTEGER`                  |
| `proposal`         | `TEXT`                     |
| `documents`        | `UUID[]`                   |
| `status`           | `TEXT`                     |
| `score`            | `NUMERIC`                  |
| `evaluation_notes` | `TEXT`                     |
| `submitted_at`     | `TIMESTAMP WITH TIME ZONE` |
| `created_at`       | `TIMESTAMP WITH TIME ZONE` |
| `updated_at`       | `TIMESTAMP WITH TIME ZONE` |

### `supplier_ratings`

Supplier performance ratings.

| Column                | Type / SQL fragment        |
| --------------------- | -------------------------- |
| `id`                  | `UUID`                     |
| `organization_id`     | `UUID`                     |
| `rated_by_org`        | `UUID`                     |
| `rated_by_user`       | `UUID`                     |
| `trade_id`            | `UUID`                     |
| `rating`              | `INTEGER`                  |
| `quality_score`       | `INTEGER`                  |
| `delivery_score`      | `INTEGER`                  |
| `communication_score` | `INTEGER`                  |
| `comment`             | `TEXT`                     |
| `is_verified`         | `BOOLEAN`                  |
| `created_at`          | `TIMESTAMP WITH TIME ZONE` |

### `contract_templates`

Reusable smart contract templates.

| Column            | Type / SQL fragment        |
| ----------------- | -------------------------- |
| `id`              | `UUID`                     |
| `name`            | `TEXT`                     |
| `description`     | `TEXT`                     |
| `category`        | `TEXT`                     |
| `content`         | `JSONB`                    |
| `terms_structure` | `JSONB`                    |
| `is_public`       | `BOOLEAN`                  |
| `created_by`      | `UUID`                     |
| `organization_id` | `UUID`                     |
| `usage_count`     | `INTEGER`                  |
| `created_at`      | `TIMESTAMP WITH TIME ZONE` |
| `updated_at`      | `TIMESTAMP WITH TIME ZONE` |

### `contracts`

Trade contract records.

| Column                  | Type / SQL fragment        |
| ----------------------- | -------------------------- |
| `id`                    | `UUID`                     |
| `contract_number`       | `TEXT`                     |
| `title`                 | `TEXT`                     |
| `description`           | `TEXT`                     |
| `template_id`           | `UUID`                     |
| `buyer_org_id`          | `UUID`                     |
| `seller_org_id`         | `UUID`                     |
| `buyer_user_id`         | `UUID`                     |
| `seller_user_id`        | `UUID`                     |
| `status`                | `public.contract_status`   |
| `category`              | `TEXT`                     |
| `commodity`             | `TEXT`                     |
| `hs_code`               | `TEXT`                     |
| `quantity`              | `NUMERIC`                  |
| `unit`                  | `TEXT`                     |
| `unit_price`            | `NUMERIC`                  |
| `total_value`           | `NUMERIC`                  |
| `currency`              | `TEXT`                     |
| `payment_terms`         | `JSONB`                    |
| `delivery_terms`        | `JSONB`                    |
| `incoterms`             | `TEXT`                     |
| `effective_date`        | `DATE`                     |
| `expiry_date`           | `DATE`                     |
| `delivery_deadline`     | `DATE`                     |
| `late_delivery_penalty` | `NUMERIC`                  |
| `quality_requirements`  | `JSONB`                    |
| `dispute_resolution`    | `TEXT`                     |
| `documents`             | `UUID[]`                   |
| `buyer_signed_at`       | `TIMESTAMP WITH TIME ZONE` |
| `seller_signed_at`      | `TIMESTAMP WITH TIME ZONE` |
| `buyer_signature`       | `TEXT`                     |
| `seller_signature`      | `TEXT`                     |
| `trade_id`              | `UUID`                     |
| `tender_id`             | `UUID`                     |
| `metadata`              | `JSONB`                    |
| `created_by`            | `UUID`                     |
| `created_at`            | `TIMESTAMP WITH TIME ZONE` |
| `updated_at`            | `TIMESTAMP WITH TIME ZONE` |

### `contract_milestones`

Contract payment, delivery, document, and inspection milestones.

| Column                    | Type / SQL fragment        |
| ------------------------- | -------------------------- |
| `id`                      | `UUID`                     |
| `contract_id`             | `UUID`                     |
| `title`                   | `TEXT`                     |
| `description`             | `TEXT`                     |
| `sequence_order`          | `INTEGER`                  |
| `milestone_type`          | `TEXT`                     |
| `due_date`                | `DATE`                     |
| `completed_at`            | `TIMESTAMP WITH TIME ZONE` |
| `payment_amount`          | `NUMERIC`                  |
| `payment_percentage`      | `NUMERIC`                  |
| `status`                  | `TEXT`                     |
| `verified_by`             | `UUID`                     |
| `verification_notes`      | `TEXT`                     |
| `evidence_documents`      | `UUID[]`                   |
| `auto_trigger_conditions` | `JSONB`                    |
| `created_at`              | `TIMESTAMP WITH TIME ZONE` |
| `updated_at`              | `TIMESTAMP WITH TIME ZONE` |

### `contract_amendments`

Contract change requests.

| Column               | Type / SQL fragment        |
| -------------------- | -------------------------- |
| `id`                 | `UUID`                     |
| `contract_id`        | `UUID`                     |
| `amendment_number`   | `INTEGER`                  |
| `title`              | `TEXT`                     |
| `description`        | `TEXT`                     |
| `changes`            | `JSONB`                    |
| `reason`             | `TEXT`                     |
| `status`             | `TEXT`                     |
| `proposed_by`        | `UUID`                     |
| `buyer_approved_at`  | `TIMESTAMP WITH TIME ZONE` |
| `seller_approved_at` | `TIMESTAMP WITH TIME ZONE` |
| `created_at`         | `TIMESTAMP WITH TIME ZONE` |
| `updated_at`         | `TIMESTAMP WITH TIME ZONE` |

### `contract_disputes`

Contract dispute records.

| Column               | Type / SQL fragment        |
| -------------------- | -------------------------- |
| `id`                 | `UUID`                     |
| `contract_id`        | `UUID`                     |
| `milestone_id`       | `UUID`                     |
| `title`              | `TEXT`                     |
| `description`        | `TEXT`                     |
| `dispute_type`       | `TEXT`                     |
| `raised_by`          | `UUID`                     |
| `raised_by_org`      | `UUID`                     |
| `status`             | `TEXT`                     |
| `resolution`         | `TEXT`                     |
| `resolved_at`        | `TIMESTAMP WITH TIME ZONE` |
| `resolved_by`        | `UUID`                     |
| `evidence_documents` | `UUID[]`                   |
| `escalation_level`   | `INTEGER`                  |
| `arbitrator_notes`   | `TEXT`                     |
| `created_at`         | `TIMESTAMP WITH TIME ZONE` |
| `updated_at`         | `TIMESTAMP WITH TIME ZONE` |

### `contract_activities`

Contract audit/activity stream.

| Column             | Type / SQL fragment        |
| ------------------ | -------------------------- |
| `id`               | `UUID`                     |
| `contract_id`      | `UUID`                     |
| `activity_type`    | `TEXT`                     |
| `description`      | `TEXT`                     |
| `performed_by`     | `UUID`                     |
| `performed_by_org` | `UUID`                     |
| `old_values`       | `JSONB`                    |
| `new_values`       | `JSONB`                    |
| `created_at`       | `TIMESTAMP WITH TIME ZONE` |

## `settings_tables.sql`

### `user_preferences`

Notification, display, and user preference settings.

| Column          | Type / SQL fragment        |
| --------------- | -------------------------- |
| `id`            | `UUID`                     |
| `user_id`       | `UUID`                     |
| `notifications` | `JSONB`                    |
| `language`      | `TEXT`                     |
| `currency`      | `TEXT`                     |
| `timezone`      | `TEXT`                     |
| `date_format`   | `TEXT`                     |
| `number_format` | `TEXT`                     |
| `privacy`       | `JSONB`                    |
| `ui`            | `JSONB`                    |
| `created_at`    | `TIMESTAMP WITH TIME ZONE` |
| `updated_at`    | `TIMESTAMP WITH TIME ZONE` |

### `user_security`

Security settings, MFA, trusted devices, and SSO state.

| Column                    | Type / SQL fragment        |
| ------------------------- | -------------------------- |
| `id`                      | `UUID`                     |
| `user_id`                 | `UUID`                     |
| `two_factor_enabled`      | `BOOLEAN`                  |
| `two_factor_method`       | `TEXT`                     |
| `two_factor_secret`       | `TEXT`                     |
| `two_factor_backup_codes` | `TEXT[]`                   |
| `last_password_change`    | `TIMESTAMP WITH TIME ZONE` |
| `password_expires_at`     | `TIMESTAMP WITH TIME ZONE` |
| `trusted_devices`         | `JSONB`                    |
| `sso_providers`           | `JSONB`                    |
| `security_questions`      | `JSONB`                    |
| `created_at`              | `TIMESTAMP WITH TIME ZONE` |
| `updated_at`              | `TIMESTAMP WITH TIME ZONE` |

### `user_sessions`

User session metadata.

| Column           | Type / SQL fragment        |
| ---------------- | -------------------------- |
| `id`             | `UUID`                     |
| `user_id`        | `UUID`                     |
| `device_info`    | `TEXT`                     |
| `browser`        | `TEXT`                     |
| `os`             | `TEXT`                     |
| `ip_address`     | `INET`                     |
| `location`       | `TEXT`                     |
| `is_current`     | `BOOLEAN`                  |
| `created_at`     | `TIMESTAMP WITH TIME ZONE` |
| `last_active_at` | `TIMESTAMP WITH TIME ZONE` |

### `integrations`

User or organization external integrations.

| Column            | Type / SQL fragment        |
| ----------------- | -------------------------- |
| `id`              | `UUID`                     |
| `user_id`         | `UUID`                     |
| `organization_id` | `UUID`                     |
| `type`            | `TEXT`                     |
| `provider`        | `TEXT`                     |
| `name`            | `TEXT`                     |
| `description`     | `TEXT`                     |
| `status`          | `TEXT`                     |
| `api_key`         | `TEXT`                     |
| `webhook_url`     | `TEXT`                     |
| `webhook_secret`  | `TEXT`                     |
| `credentials`     | `JSONB`                    |
| `config`          | `JSONB`                    |
| `last_sync_at`    | `TIMESTAMP WITH TIME ZONE` |
| `sync_status`     | `TEXT`                     |
| `error_message`   | `TEXT`                     |
| `created_at`      | `TIMESTAMP WITH TIME ZONE` |
| `updated_at`      | `TIMESTAMP WITH TIME ZONE` |

### `api_keys`

API key metadata and hashes.

| Column            | Type / SQL fragment        |
| ----------------- | -------------------------- |
| `id`              | `UUID`                     |
| `user_id`         | `UUID`                     |
| `organization_id` | `UUID`                     |
| `name`            | `TEXT`                     |
| `key_prefix`      | `TEXT`                     |
| `key_hash`        | `TEXT`                     |
| `permissions`     | `TEXT[]`                   |
| `expires_at`      | `TIMESTAMP WITH TIME ZONE` |
| `last_used_at`    | `TIMESTAMP WITH TIME ZONE` |
| `usage_count`     | `INTEGER`                  |
| `rate_limit`      | `INTEGER`                  |
| `is_active`       | `BOOLEAN`                  |
| `created_at`      | `TIMESTAMP WITH TIME ZONE` |

### `user_ai_settings`

User AI personalization and data-use controls.

| Column                         | Type / SQL fragment        |
| ------------------------------ | -------------------------- |
| `id`                           | `UUID`                     |
| `user_id`                      | `UUID`                     |
| `enable_ai_insights`           | `BOOLEAN`                  |
| `enable_predictions`           | `BOOLEAN`                  |
| `data_sharing_consent`         | `BOOLEAN`                  |
| `model_training_opt_in`        | `BOOLEAN`                  |
| `personalized_recommendations` | `BOOLEAN`                  |
| `anonymized_analytics`         | `BOOLEAN`                  |
| `data_retention_days`          | `INTEGER`                  |
| `last_data_export_at`          | `TIMESTAMP WITH TIME ZONE` |
| `delete_requested_at`          | `TIMESTAMP WITH TIME ZONE` |
| `created_at`                   | `TIMESTAMP WITH TIME ZONE` |
| `updated_at`                   | `TIMESTAMP WITH TIME ZONE` |

### `billing_info`

Subscription and billing state.

| Column                   | Type / SQL fragment        |
| ------------------------ | -------------------------- |
| `id`                     | `UUID`                     |
| `user_id`                | `UUID`                     |
| `organization_id`        | `UUID`                     |
| `plan_type`              | `TEXT`                     |
| `plan_name`              | `TEXT`                     |
| `billing_cycle`          | `TEXT`                     |
| `current_period_start`   | `TIMESTAMP WITH TIME ZONE` |
| `current_period_end`     | `TIMESTAMP WITH TIME ZONE` |
| `subscription_status`    | `TEXT`                     |
| `stripe_customer_id`     | `TEXT`                     |
| `stripe_subscription_id` | `TEXT`                     |
| `created_at`             | `TIMESTAMP WITH TIME ZONE` |
| `updated_at`             | `TIMESTAMP WITH TIME ZONE` |

### `usage_metrics`

Usage counters against plan limits.

| Column               | Type / SQL fragment        |
| -------------------- | -------------------------- |
| `id`                 | `UUID`                     |
| `user_id`            | `UUID`                     |
| `trades_created`     | `INTEGER`                  |
| `trades_limit`       | `INTEGER`                  |
| `documents_uploaded` | `INTEGER`                  |
| `documents_limit`    | `INTEGER`                  |
| `api_calls`          | `INTEGER`                  |
| `api_calls_limit`    | `INTEGER`                  |
| `storage_used_mb`    | `NUMERIC(10,2)`            |
| `storage_limit_mb`   | `NUMERIC(10,2)`            |
| `team_members`       | `INTEGER`                  |
| `team_members_limit` | `INTEGER`                  |
| `created_at`         | `TIMESTAMP WITH TIME ZONE` |
| `updated_at`         | `TIMESTAMP WITH TIME ZONE` |

### `payment_methods`

Payment method metadata.

| Column                     | Type / SQL fragment        |
| -------------------------- | -------------------------- |
| `id`                       | `UUID`                     |
| `user_id`                  | `UUID`                     |
| `type`                     | `TEXT`                     |
| `brand`                    | `TEXT`                     |
| `last4`                    | `TEXT`                     |
| `expiry_month`             | `INTEGER`                  |
| `expiry_year`              | `INTEGER`                  |
| `is_default`               | `BOOLEAN`                  |
| `is_active`                | `BOOLEAN`                  |
| `billing_address`          | `TEXT`                     |
| `stripe_payment_method_id` | `TEXT`                     |
| `created_at`               | `TIMESTAMP WITH TIME ZONE` |

### `invoices`

Billing invoice records.

| Column              | Type / SQL fragment        |
| ------------------- | -------------------------- |
| `id`                | `UUID`                     |
| `user_id`           | `UUID`                     |
| `organization_id`   | `UUID`                     |
| `invoice_number`    | `TEXT`                     |
| `amount`            | `NUMERIC(12,2)`            |
| `currency`          | `TEXT`                     |
| `status`            | `TEXT`                     |
| `issued_at`         | `TIMESTAMP WITH TIME ZONE` |
| `due_at`            | `TIMESTAMP WITH TIME ZONE` |
| `paid_at`           | `TIMESTAMP WITH TIME ZONE` |
| `download_url`      | `TEXT`                     |
| `stripe_invoice_id` | `TEXT`                     |
| `created_at`        | `TIMESTAMP WITH TIME ZONE` |

### `team_members`

Organization team membership.

| Column            | Type / SQL fragment        |
| ----------------- | -------------------------- |
| `id`              | `UUID`                     |
| `user_id`         | `UUID`                     |
| `organization_id` | `UUID`                     |
| `email`           | `TEXT`                     |
| `full_name`       | `TEXT`                     |
| `role`            | `TEXT`                     |
| `department`      | `TEXT`                     |
| `title`           | `TEXT`                     |
| `permissions`     | `TEXT[]`                   |
| `status`          | `TEXT`                     |
| `invited_by`      | `UUID`                     |
| `invited_at`      | `TIMESTAMP WITH TIME ZONE` |
| `joined_at`       | `TIMESTAMP WITH TIME ZONE` |
| `last_active_at`  | `TIMESTAMP WITH TIME ZONE` |
| `created_at`      | `TIMESTAMP WITH TIME ZONE` |

### `roles`

Organization role definitions.

| Column            | Type / SQL fragment        |
| ----------------- | -------------------------- |
| `id`              | `UUID`                     |
| `organization_id` | `UUID`                     |
| `name`            | `TEXT`                     |
| `description`     | `TEXT`                     |
| `permissions`     | `JSONB`                    |
| `is_default`      | `BOOLEAN`                  |
| `member_count`    | `INTEGER`                  |
| `created_at`      | `TIMESTAMP WITH TIME ZONE` |
| `updated_at`      | `TIMESTAMP WITH TIME ZONE` |

### `trade_associations`

Public trade association directory.

| Column        | Type / SQL fragment        |
| ------------- | -------------------------- |
| `id`          | `UUID`                     |
| `name`        | `TEXT`                     |
| `region`      | `TEXT`                     |
| `description` | `TEXT`                     |
| `benefits`    | `TEXT[]`                   |
| `website`     | `TEXT`                     |
| `is_active`   | `BOOLEAN`                  |
| `created_at`  | `TIMESTAMP WITH TIME ZONE` |

### `user_trade_associations`

User membership in trade associations.

| Column              | Type / SQL fragment        |
| ------------------- | -------------------------- |
| `id`                | `UUID`                     |
| `user_id`           | `UUID`                     |
| `association_id`    | `UUID`                     |
| `membership_status` | `TEXT`                     |
| `membership_id`     | `TEXT`                     |
| `connected_at`      | `TIMESTAMP WITH TIME ZONE` |
| `expires_at`        | `TIMESTAMP WITH TIME ZONE` |

## Review notes

- Some domain schemas define similarly named tables such as `fx_rates`; reconcile duplicates before applying to a single production database.
- Column descriptions should be expanded when business definitions are finalized.
- RLS policy behavior is documented separately in `docs/security/SECURITY_MODEL_AND_RLS.md`.
