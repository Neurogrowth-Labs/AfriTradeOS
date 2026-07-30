-- =============================================================================
-- AFRITRADE OS - LOGISTICS MODULE SEED DATA
-- Run this after logistics_schema.sql to populate with demo data
-- =============================================================================

-- =============================================================================
-- 1. SEED SHIPMENT TRACKING DATA
-- =============================================================================
INSERT INTO public.shipment_tracking (
    tracking_number, cargo_description, cargo_type, weight_kg, package_count,
    declared_value, currency, origin_port, destination_port, origin_country,
    destination_country, current_location, transport_mode, carrier_name,
    vessel_name, container_number, status, departure_date, eta, timeline
) VALUES
    ('AFT-2024-001', 'Cocoa Beans (Premium Grade)', 'bulk', 15000, 1,
     245000, 'USD', 'Tema Port, Ghana', 'Rotterdam, Netherlands', 'Ghana',
     'Netherlands', 'Atlantic Ocean (En Route)', 'sea', 'Maersk Line',
     'MSC OSCAR', 'MSKU1234567', 'in_transit', NOW() - INTERVAL '5 days', NOW() + INTERVAL '12 days',
     '[{"date": "2024-01-15", "event": "Cargo Loaded", "location": "Tema Port", "status": "completed"},
       {"date": "2024-01-16", "event": "Vessel Departed", "location": "Tema Port", "status": "completed"},
       {"date": "2024-01-20", "event": "In Transit", "location": "Atlantic Ocean", "status": "active"},
       {"date": "2024-01-27", "event": "ETA Rotterdam", "location": "Rotterdam", "status": "pending"}]'::jsonb),

    ('AFT-2024-002', 'Shea Butter (Refined)', 'general', 8500, 425,
     156000, 'USD', 'Ouagadougou, Burkina Faso', 'Lagos, Nigeria', 'Burkina Faso',
     'Nigeria', 'Malanville Border', 'road', 'Bollore Transport',
     NULL, NULL, 'at_border', NOW() - INTERVAL '3 days', NOW() + INTERVAL '2 days',
     '[{"date": "2024-01-17", "event": "Pickup Complete", "location": "Ouagadougou", "status": "completed"},
       {"date": "2024-01-18", "event": "In Transit", "location": "Fada N Gourma", "status": "completed"},
       {"date": "2024-01-19", "event": "At Border", "location": "Malanville", "status": "active"},
       {"date": "2024-01-21", "event": "ETA Lagos", "location": "Lagos", "status": "pending"}]'::jsonb),

    ('AFT-2024-003', 'Coffee (Arabica AA)', 'perishable', 22000, 1100,
     380000, 'USD', 'Mombasa, Kenya', 'Hamburg, Germany', 'Kenya',
     'Germany', 'Mombasa Port (Loading)', 'sea', 'CMA CGM',
     'CMA CGM MARCO POLO', 'CMAU5678901', 'at_origin_port', NOW() - INTERVAL '1 day', NOW() + INTERVAL '21 days',
     '[{"date": "2024-01-19", "event": "Arrived at Port", "location": "Mombasa", "status": "completed"},
       {"date": "2024-01-20", "event": "Loading in Progress", "location": "Mombasa", "status": "active"},
       {"date": "2024-01-22", "event": "Vessel Departure", "location": "Mombasa", "status": "pending"},
       {"date": "2024-02-10", "event": "ETA Hamburg", "location": "Hamburg", "status": "pending"}]'::jsonb),

    ('AFT-2024-004', 'Textiles (Ankara Fabric)', 'general', 4200, 210,
     89000, 'USD', 'Kano, Nigeria', 'Accra, Ghana', 'Nigeria',
     'Ghana', 'Aflao Border', 'road', 'DHL Freight',
     NULL, NULL, 'customs_hold', NOW() - INTERVAL '4 days', NOW() + INTERVAL '1 day',
     '[{"date": "2024-01-16", "event": "Dispatch", "location": "Kano", "status": "completed"},
       {"date": "2024-01-17", "event": "Transit Lagos", "location": "Lagos", "status": "completed"},
       {"date": "2024-01-18", "event": "Customs Hold", "location": "Aflao Border", "status": "active", "issue": "Documentation review"},
       {"date": "2024-01-21", "event": "ETA Accra", "location": "Accra", "status": "pending"}]'::jsonb),

    ('AFT-2024-005', 'Cashew Nuts (Raw)', 'bulk', 18000, 1,
     312000, 'USD', 'Bissau, Guinea-Bissau', 'Mumbai, India', 'Guinea-Bissau',
     'India', 'Indian Ocean (En Route)', 'sea', 'Hapag-Lloyd',
     'HAMBURG EXPRESS', 'HLCU8901234', 'in_transit', NOW() - INTERVAL '8 days', NOW() + INTERVAL '18 days',
     '[{"date": "2024-01-12", "event": "Cargo Received", "location": "Bissau Port", "status": "completed"},
       {"date": "2024-01-14", "event": "Vessel Departed", "location": "Bissau", "status": "completed"},
       {"date": "2024-01-20", "event": "In Transit", "location": "Indian Ocean", "status": "active"},
       {"date": "2024-02-07", "event": "ETA Mumbai", "location": "Mumbai", "status": "pending"}]'::jsonb);

-- =============================================================================
-- 2. SEED FLEET VEHICLES DATA
-- =============================================================================
INSERT INTO public.logistics_fleet_vehicles (
    registration, type, make, model, year, capacity, status, current_location,
    fuel_level, mileage, health_score, last_maintenance, next_maintenance,
    insurance_expiry, permit_expiry
) VALUES
    ('GH-234-ABC', 'truck', 'Mercedes-Benz', 'Actros 2545', 2022, '25T', 'in_transit',
     'Accra-Tema Highway', 78, 45230, 95, NOW() - INTERVAL '30 days', NOW() + INTERVAL '60 days',
     '2025-06-15', '2025-03-31'),

    ('GH-567-DEF', 'refrigerated', 'Volvo', 'FH16', 2021, '20T', 'available',
     'Tema Port Depot', 92, 62100, 88, NOW() - INTERVAL '15 days', NOW() + INTERVAL '75 days',
     '2025-08-20', '2025-04-15'),

    ('NG-890-GHI', 'tanker', 'Scania', 'R500', 2023, '30000L', 'in_transit',
     'Lagos-Ibadan Expressway', 45, 28900, 97, NOW() - INTERVAL '45 days', NOW() + INTERVAL '45 days',
     '2025-05-10', '2025-02-28'),

    ('KE-123-JKL', 'flatbed', 'MAN', 'TGX 26.500', 2020, '35T', 'maintenance',
     'Mombasa Service Center', 100, 89500, 72, NOW() - INTERVAL '5 days', NOW() + INTERVAL '5 days',
     '2025-07-01', '2025-05-20'),

    ('GH-456-MNO', 'truck', 'DAF', 'XF 480', 2022, '22T', 'available',
     'Kumasi Depot', 85, 38700, 91, NOW() - INTERVAL '20 days', NOW() + INTERVAL '70 days',
     '2025-09-30', '2025-06-10'),

    ('ZA-789-PQR', 'trailer', 'Freightliner', 'Cascadia', 2021, '40T', 'idle',
     'Durban Port', 68, 75200, 85, NOW() - INTERVAL '60 days', NOW() + INTERVAL '30 days',
     '2025-04-25', '2025-03-15');

-- =============================================================================
-- 3. SEED FLEET DRIVERS DATA
-- =============================================================================
INSERT INTO public.logistics_fleet_drivers (
    name, phone, email, license_number, license_expiry, license_class,
    status, behavior_score, total_trips, total_distance_km, certifications, languages
) VALUES
    ('Kwame Asante', '+233 24 567 8901', 'k.asante@afritrade.com', 'GH-DL-2019-45678', '2026-05-15', 'C',
     'on_duty', 94, 245, 125000, '["ADR", "FMCG", "Cross-Border"]'::jsonb, '["English", "Twi", "French"]'::jsonb),

    ('Chidi Okonkwo', '+234 803 456 7890', 'c.okonkwo@afritrade.com', 'NG-DL-2018-78901', '2025-11-30', 'E',
     'available', 88, 312, 189000, '["Hazmat", "Cold Chain"]'::jsonb, '["English", "Igbo", "Pidgin"]'::jsonb),

    ('Joseph Mwangi', '+254 722 345 678', 'j.mwangi@afritrade.com', 'KE-DL-2020-12345', '2026-08-20', 'D',
     'on_duty', 96, 198, 98500, '["ADR", "Cross-Border", "EAC Permit"]'::jsonb, '["English", "Swahili"]'::jsonb),

    ('Fatou Diallo', '+221 77 890 1234', 'f.diallo@afritrade.com', 'SN-DL-2017-56789', '2025-03-10', 'C',
     'off_duty', 91, 276, 145200, '["FMCG", "ECOWAS Permit"]'::jsonb, '["French", "Wolof", "English"]'::jsonb),

    ('Thabo Molefe', '+27 82 567 8901', 't.molefe@afritrade.com', 'ZA-DL-2021-34567', '2027-02-28', 'EC',
     'available', 89, 156, 78900, '["Cold Chain", "SADC Permit"]'::jsonb, '["English", "Zulu", "Afrikaans"]'::jsonb);

-- =============================================================================
-- 4. SEED LOGISTICS SHIPMENTS DATA (For Provider Panel)
-- =============================================================================
INSERT INTO public.logistics_shipments (
    tracking_number, client_name, client_contact, cargo, cargo_type, weight, value, currency,
    origin, destination, current_location, transport_mode, vehicle_registration, driver_name,
    status, progress, risk_level, eta, timeline, profitability
) VALUES
    ('LSP-2024-001', 'GoldCoast Exports Ltd', '+233 20 123 4567', 'Palm Oil (Refined)', 'bulk',
     '12000 KG', 45000, 'USD', 'Tema, Ghana', 'Dakar, Senegal', 'Ouagadougou Transit',
     'road', 'GH-234-ABC', 'Kwame Asante', 'in_transit', 65, 'medium',
     NOW() + INTERVAL '3 days',
     '[{"milestone": "Pickup", "location": "Tema", "planned": "2024-01-15", "actual": "2024-01-15", "status": "completed"},
       {"milestone": "Transit Burkina", "location": "Ouagadougou", "planned": "2024-01-18", "status": "current"},
       {"milestone": "Delivery", "location": "Dakar", "planned": "2024-01-22", "status": "upcoming"}]'::jsonb,
     '{"revenue": 8500, "costs": 5200, "margin": 38.8}'::jsonb),

    ('LSP-2024-002', 'Nairobi Traders Inc', '+254 700 987 654', 'Flowers (Cut)', 'perishable',
     '800 KG', 28000, 'USD', 'Nairobi, Kenya', 'Amsterdam, Netherlands', 'JKIA Loading',
     'air', NULL, NULL, 'picked_up', 25, 'high',
     NOW() + INTERVAL '1 day',
     '[{"milestone": "Farm Pickup", "location": "Naivasha", "planned": "2024-01-19", "actual": "2024-01-19", "status": "completed"},
       {"milestone": "Airport Check-in", "location": "JKIA", "planned": "2024-01-20", "status": "current"},
       {"milestone": "Flight Departure", "location": "JKIA", "planned": "2024-01-20", "status": "upcoming"},
       {"milestone": "Delivery AMS", "location": "Amsterdam", "planned": "2024-01-21", "status": "upcoming"}]'::jsonb,
     '{"revenue": 4200, "costs": 3100, "margin": 26.2}'::jsonb),

    ('LSP-2024-003', 'Cape Trading Co', '+27 21 456 7890', 'Wine (Bottled)', 'fragile',
     '5500 KG', 125000, 'USD', 'Cape Town, South Africa', 'London, UK', 'Cape Town Port',
     'sea', NULL, NULL, 'booked', 5, 'low',
     NOW() + INTERVAL '25 days',
     '[{"milestone": "Warehouse Pickup", "location": "Stellenbosch", "planned": "2024-01-22", "status": "upcoming"},
       {"milestone": "Port Loading", "location": "Cape Town", "planned": "2024-01-24", "status": "upcoming"},
       {"milestone": "Vessel Departure", "location": "Cape Town", "planned": "2024-01-26", "status": "upcoming"},
       {"milestone": "Delivery London", "location": "Tilbury", "planned": "2024-02-14", "status": "upcoming"}]'::jsonb,
     '{"revenue": 15000, "costs": 9800, "margin": 34.7}'::jsonb),

    ('LSP-2024-004', 'Lagos Agro Ltd', '+234 805 234 5678', 'Cassava Starch', 'general',
     '20000 KG', 38000, 'USD', 'Lagos, Nigeria', 'Accra, Ghana', 'Seme Border Checkpoint',
     'road', 'NG-890-GHI', 'Chidi Okonkwo', 'at_border', 70, 'medium',
     NOW() + INTERVAL '1 day',
     '[{"milestone": "Loading", "location": "Apapa", "planned": "2024-01-17", "actual": "2024-01-17", "status": "completed"},
       {"milestone": "Border Crossing", "location": "Seme", "planned": "2024-01-19", "status": "current", "issue": "Customs verification"},
       {"milestone": "Delivery", "location": "Tema", "planned": "2024-01-21", "status": "upcoming"}]'::jsonb,
     '{"revenue": 6200, "costs": 4500, "margin": 27.4}'::jsonb);

-- =============================================================================
-- 5. SEED LOGISTICS INVOICES DATA
-- =============================================================================
INSERT INTO public.logistics_invoices (
    invoice_number, client_name, amount, currency, tax_amount, status,
    issue_date, due_date, line_items
) VALUES
    ('INV-2024-0001', 'GoldCoast Exports Ltd', 8500, 'USD', 425, 'sent',
     '2024-01-15', '2024-02-14',
     '[{"description": "Road Freight Tema-Dakar", "quantity": 1, "unit_price": 7500, "total": 7500},
       {"description": "Border Clearance Fees", "quantity": 1, "unit_price": 650, "total": 650},
       {"description": "Insurance Premium", "quantity": 1, "unit_price": 350, "total": 350}]'::jsonb),

    ('INV-2024-0002', 'Nairobi Traders Inc', 4200, 'USD', 210, 'paid',
     '2024-01-10', '2024-01-25', '2024-01-18',
     '[{"description": "Air Freight Nairobi-Amsterdam", "quantity": 800, "unit_price": 4.5, "total": 3600},
       {"description": "Cool Chain Handling", "quantity": 1, "unit_price": 450, "total": 450},
       {"description": "Documentation", "quantity": 1, "unit_price": 150, "total": 150}]'::jsonb),

    ('INV-2024-0003', 'Cape Trading Co', 15000, 'USD', 750, 'draft',
     '2024-01-20', '2024-03-05',
     '[{"description": "Sea Freight Cape Town-London (20ft)", "quantity": 2, "unit_price": 6500, "total": 13000},
       {"description": "Port Handling", "quantity": 1, "unit_price": 1200, "total": 1200},
       {"description": "Marine Insurance", "quantity": 1, "unit_price": 800, "total": 800}]'::jsonb),

    ('INV-2024-0004', 'Lagos Agro Ltd', 6200, 'USD', 310, 'overdue',
     '2024-01-05', '2024-01-19',
     '[{"description": "Road Freight Lagos-Accra", "quantity": 1, "unit_price": 5400, "total": 5400},
       {"description": "ECOWAS Transit Fees", "quantity": 1, "unit_price": 450, "total": 450},
       {"description": "Cargo Insurance", "quantity": 1, "unit_price": 350, "total": 350}]'::jsonb);

-- =============================================================================
-- 6. SEED LOGISTICS TENDERS DATA
-- =============================================================================
INSERT INTO public.logistics_tenders (
    title, issuer, issuer_type, corridor, cargo_type, volume, value, currency,
    deadline, status, match_score, win_probability, requirements
) VALUES
    ('AfCFTA Corridor Freight Contract - West Africa', 'African Union Trade Commission', 'afcfta',
     'Lagos-Dakar Corridor', 'General Cargo', '500 TEU/month', 2500000, 'USD',
     NOW() + INTERVAL '30 days', 'new', 85, 72,
     '["ECOWAS Operating License", "Min 10 trucks capacity", "3+ years corridor experience", "ISO 9001 certified"]'::jsonb),

    ('Government Food Aid Transport - East Africa', 'Kenya Ministry of Agriculture', 'government',
     'Mombasa-Kampala-Kigali', 'Food/Grain', '10000 MT', 450000, 'USD',
     NOW() + INTERVAL '15 days', 'preparing', 78, 65,
     '["EAC Carrier License", "Food-grade vehicles", "GPS tracking mandatory", "24-hour response capability"]'::jsonb),

    ('Mining Equipment Haulage - Southern Africa', 'AngloGold Ashanti', 'private',
     'Johannesburg-Accra', 'Heavy Machinery', '2500 MT', 380000, 'USD',
     NOW() + INTERVAL '45 days', 'new', 62, 45,
     '["Heavy haulage permit", "Abnormal load certification", "Min 5 flatbed trailers", "Project cargo insurance"]'::jsonb),

    ('Cold Chain Distribution - Pan-African', 'Unilever Africa', 'private',
     'Multiple (Regional)', 'Perishables', '200 MT/week', 1800000, 'USD',
     NOW() + INTERVAL '60 days', 'new', 91, 80,
     '["Refrigerated fleet (min 15 units)", "HACCP certified", "Real-time temperature monitoring", "Multi-country presence"]'::jsonb);

-- =============================================================================
-- 7. SEED BORDER ALERTS DATA
-- =============================================================================
INSERT INTO public.logistics_border_alerts (
    border_name, country_from, country_to, alert_type, severity, message,
    recommendation, affected_corridors, estimated_delay_hours, status, expires_at
) VALUES
    ('Aflao-Kodjoviakope', 'Ghana', 'Togo', 'congestion', 'high',
     'Heavy truck backlog due to customs system maintenance. Estimated 200+ trucks waiting.',
     'Consider Elubo-Noe alternative route via Cote d''Ivoire. Pre-clear documentation online.',
     '["Accra-Lome", "Tema-Cotonou"]'::jsonb, 48, 'active', NOW() + INTERVAL '3 days'),

    ('Malaba', 'Kenya', 'Uganda', 'inspection', 'medium',
     'Enhanced security checks following intelligence reports. All cargo subject to physical inspection.',
     'Ensure all documentation is complete. Allow extra 12-24 hours for crossing.',
     '["Mombasa-Kampala", "Northern Corridor"]'::jsonb, 18, 'active', NOW() + INTERVAL '7 days'),

    ('Kasumbalesa', 'DRC', 'Zambia', 'documentation', 'low',
     'New electronic customs declaration system going live. Training period may cause minor delays.',
     'Register for the new e-customs portal in advance. Carry printed backup copies.',
     '["Lubumbashi-Ndola", "Central African Corridor"]'::jsonb, 6, 'active', NOW() + INTERVAL '14 days'),

    ('Chirundu OSBP', 'Zambia', 'Zimbabwe', 'closure', 'critical',
     'Bridge maintenance closure 6AM-6PM daily. Only night crossings permitted.',
     'Schedule crossings for evening hours (6PM-6AM). Contact border authorities for permits.',
     '["Lusaka-Harare", "North-South Corridor"]'::jsonb, 12, 'active', NOW() + INTERVAL '21 days');

-- =============================================================================
-- 8. SEED LOGISTICS CLIENTS DATA
-- =============================================================================
INSERT INTO public.logistics_clients (
    name, company, email, phone, country, client_type, contract_status,
    credit_limit, total_shipments, total_revenue, rating
) VALUES
    ('Kofi Mensah', 'GoldCoast Exports Ltd', 'kofi@goldcoast.com', '+233 20 123 4567', 'Ghana',
     'vip', 'active', 100000, 45, 425000, 4.8),

    ('Grace Wanjiku', 'Nairobi Traders Inc', 'grace@nairobitraders.co.ke', '+254 700 987 654', 'Kenya',
     'regular', 'active', 50000, 28, 215000, 4.5),

    ('Pieter van der Berg', 'Cape Trading Co', 'pieter@capetrading.co.za', '+27 21 456 7890', 'South Africa',
     'vip', 'active', 150000, 62, 890000, 4.9),

    ('Emeka Okafor', 'Lagos Agro Ltd', 'emeka@lagosagro.com.ng', '+234 805 234 5678', 'Nigeria',
     'regular', 'active', 75000, 38, 312000, 4.2),

    ('Amadou Diop', 'Dakar Fresh Produce', 'amadou@dakarfresh.sn', '+221 77 345 6789', 'Senegal',
     'new', 'pending', 25000, 3, 18500, 0);

-- =============================================================================
-- 9. SEED COMPLIANCE DOCUMENTS DATA
-- =============================================================================
INSERT INTO public.logistics_compliance_docs (
    name, document_type, issuing_authority, reference_number, issue_date, expiry_date, status
) VALUES
    ('ECOWAS Road Transport License', 'license', 'ECOWAS Commission', 'ECOWAS-RTL-2024-001',
     '2024-01-01', '2026-12-31', 'valid'),

    ('Fleet Insurance Certificate', 'insurance', 'NSIA Insurance Ghana', 'NSIA-FLT-2024-GH-789',
     '2024-01-15', '2025-01-14', 'valid'),

    ('Dangerous Goods Handling Permit', 'permit', 'Ghana Standards Authority', 'GSA-DG-2024-456',
     '2023-06-01', '2025-05-31', 'valid'),

    ('ISO 9001:2015 Certification', 'certification', 'Bureau Veritas', 'BV-ISO9001-2024-AFT',
     '2024-01-10', '2027-01-09', 'valid'),

    ('Cross-Border Operator License', 'license', 'Ghana Revenue Authority', 'GRA-CBO-2024-123',
     '2023-03-15', '2024-03-14', 'expiring'),

    ('EAC Carrier Permit', 'permit', 'East African Community', 'EAC-CP-2024-KE-567',
     '2024-02-01', '2026-01-31', 'valid');

-- =============================================================================
-- 10. SEED BACKHAUL OPPORTUNITIES DATA
-- =============================================================================
INSERT INTO public.logistics_backhaul (
    origin, destination, corridor, cargo_type, weight, pickup_date, rate, currency, status
) VALUES
    ('Ouagadougou, Burkina Faso', 'Tema, Ghana', 'Sahel-Coast', 'Cotton Bales', '18000 KG',
     NOW() + INTERVAL '2 days', 4200, 'USD', 'available'),

    ('Kampala, Uganda', 'Mombasa, Kenya', 'Northern Corridor', 'Coffee (Bagged)', '15000 KG',
     NOW() + INTERVAL '5 days', 3800, 'USD', 'available'),

    ('Dakar, Senegal', 'Abidjan, Cote d''Ivoire', 'West Africa Coastal', 'Empty Containers', '20 TEU',
     NOW() + INTERVAL '3 days', 2500, 'USD', 'available'),

    ('Durban, South Africa', 'Lusaka, Zambia', 'North-South Corridor', 'Machinery Parts', '8500 KG',
     NOW() + INTERVAL '7 days', 5600, 'USD', 'available');
