-- =====================================================================
-- TMS — Seed (lookups) + Sample (demo rows). Run after schema.sql.
-- =====================================================================

-- ---------- SEED : lookups ----------
INSERT INTO device.device_status (status_code, description, is_active) VALUES
 ('INACTIVE','Registered, not activated', true),
 ('ACTIVE','Activated and in service', true),
 ('OFFLINE','No recent connection', true),
 ('SUSPENDED','Administratively suspended', true),
 ('DECOMMISSIONED','Retired', false)
ON CONFLICT DO NOTHING;

INSERT INTO device.device_types (code, name, category) VALUES
 ('POS_TERMINAL','Point of Sale Terminal','payment'),
 ('SMART_METER','Smart Utility Meter','metering'),
 ('VENDING','Vending Controller','retail'),
 ('KIOSK','Self-service Kiosk','retail')
ON CONFLICT DO NOTHING;

INSERT INTO transaction.transaction_types (code, name, direction) VALUES
 ('SALE','Sale',        'DEBIT'),
 ('REFUND','Refund',    'CREDIT'),
 ('REVERSAL','Reversal','CREDIT'),
 ('TOPUP','Top-up',     'DEBIT'),
 ('BALANCE','Balance Inquiry', NULL)
ON CONFLICT DO NOTHING;

INSERT INTO transaction.transaction_statuses (status_code, description, is_terminal, sort_order) VALUES
 ('INITIATED','Created', false, 1),
 ('PROCESSING','In flight', false, 2),
 ('RETRY','Awaiting retry', false, 3),
 ('SUCCESS','Completed successfully', true, 4),
 ('FAILED','Failed terminally', true, 5),
 ('REVERSED','Reversed', true, 6)
ON CONFLICT DO NOTHING;

INSERT INTO transaction.failure_codes (failure_code, category, description, is_retryable, severity) VALUES
 ('NETWORK_TIMEOUT','network','Provider network timeout', true,  'WARN'),
 ('INSUFFICIENT_FUNDS','business','Insufficient funds', false, 'INFO'),
 ('PROVIDER_DECLINED','provider','Declined by provider', false, 'WARN'),
 ('DEVICE_COMM_FAIL','device','Device communication failure', true, 'ERROR'),
 ('DUPLICATE','integrity','Duplicate transaction suppressed', false, 'INFO'),
 ('PROVIDER_OUTAGE','provider','Provider unavailable', true, 'CRITICAL')
ON CONFLICT DO NOTHING;

INSERT INTO payment.payment_providers (code, name, status) VALUES
 ('RAZORPAY','Razorpay','ACTIVE'),
 ('STRIPE','Stripe','ACTIVE'),
 ('PAYU','PayU','ACTIVE')
ON CONFLICT DO NOTHING;

INSERT INTO payment.payment_methods (code, name, provider_id, type) VALUES
 ('RP_CARD','Card via Razorpay',(SELECT provider_id FROM payment.payment_providers WHERE code='RAZORPAY'),'CARD'),
 ('RP_UPI','UPI via Razorpay',  (SELECT provider_id FROM payment.payment_providers WHERE code='RAZORPAY'),'QR'),
 ('ST_CARD','Card via Stripe',  (SELECT provider_id FROM payment.payment_providers WHERE code='STRIPE'),'CARD')
ON CONFLICT DO NOTHING;

INSERT INTO core.permissions (code, description, category) VALUES
 ('device.read','View devices','device'),
 ('device.write','Manage devices','device'),
 ('transaction.read','View transactions','transaction'),
 ('transaction.refund','Issue refunds','transaction'),
 ('settlement.read','View settlements','settlement'),
 ('reconciliation.manage','Manage reconciliation','reconciliation'),
 ('org.admin','Full org administration','core')
ON CONFLICT DO NOTHING;

-- ---------- SAMPLE : demo tenant, users, devices, transactions ----------
DO $$
DECLARE
  org_a uuid := gen_random_uuid();
  org_b uuid := gen_random_uuid();
  u_admin uuid := gen_random_uuid();
  admin_role integer;
  dtype integer := (SELECT device_type_id FROM device.device_types WHERE code='POS_TERMINAL');
  prov integer := (SELECT provider_id FROM payment.payment_providers WHERE code='RAZORPAY');
  d uuid;
  t uuid;
  i int;
  st text;
BEGIN
  INSERT INTO core.organizations (organization_id, name, slug, tier, country_code, timezone)
  VALUES (org_a,'Acme Retail','acme','PRO','IN','Asia/Kolkata'),
         (org_b,'Globex Utilities','globex','ENT','IN','Asia/Kolkata');

  INSERT INTO core.users (user_id, email, full_name, status, mfa_enabled)
  VALUES (u_admin,'admin@acme.example','Acme Admin','ACTIVE',true);

  INSERT INTO core.organization_users (organization_id, user_id, status, joined_at)
  VALUES (org_a, u_admin, 'ACTIVE', now());

  INSERT INTO core.roles (organization_id, name, description, is_system)
  VALUES (org_a,'Org Admin','Full access',false) RETURNING role_id INTO admin_role;

  INSERT INTO core.role_permissions (role_id, permission_id)
  SELECT admin_role, permission_id FROM core.permissions;

  INSERT INTO core.user_roles (user_id, role_id, organization_id, granted_by)
  VALUES (u_admin, admin_role, org_a, u_admin);

  -- 5 devices for Acme, with live state
  FOR i IN 1..5 LOOP
    d := gen_random_uuid();
    INSERT INTO device.devices (device_id, organization_id, device_type_id, serial_number,
                                display_name, aws_thing_name, status, activated_at, last_seen_at)
    VALUES (d, org_a, dtype, 'ACME-POS-'||lpad(i::text,4,'0'),
            'Acme POS #'||i, 'acme-pos-'||i, 'ACTIVE', now()-interval '30 days',
            now()-(i||' minutes')::interval);

    INSERT INTO device.device_current_state (device_id, connection_status, last_seen_at,
             last_transaction_at, firmware_version, signal_strength, network_status)
    VALUES (d, CASE WHEN i=5 THEN 'OFFLINE' ELSE 'ONLINE' END, now()-(i||' minutes')::interval,
            now()-(i||' minutes')::interval, 'v2.4.1', 70+i, '4G');

    INSERT INTO device.device_identifiers (device_id, id_type, id_value, is_primary)
    VALUES (d,'IMEI','35000000000'||lpad(i::text,4,'0'), true);

    -- 8 sample transactions per device
    FOR i IN 1..8 LOOP
      t := gen_random_uuid();
      st := (ARRAY['SUCCESS','SUCCESS','SUCCESS','FAILED','PROCESSING'])[1 + (i % 5)];
      INSERT INTO transaction.transactions
        (transaction_id, organization_id, device_id, transaction_type_id, transaction_reference,
         device_transaction_id, idempotency_key, amount, currency, status, payment_provider_id,
         provider_transaction_id, correlation_id, requested_at, completed_at, created_at)
      VALUES
        (t, org_a, d,
         (SELECT transaction_type_id FROM transaction.transaction_types WHERE code='SALE'),
         'REF-'||substr(t::text,1,8),
         'DTX-'||i, gen_random_uuid()::text,
         round((50 + random()*950)::numeric, 2), 'INR', st, prov,
         'PRV-'||substr(t::text,1,10), gen_random_uuid(),
         now()-(i||' hours')::interval,
         CASE WHEN st='SUCCESS' THEN now()-(i||' hours')::interval + interval '2 sec' END,
         now()-(i||' hours')::interval);

      INSERT INTO transaction.transaction_status_history (transaction_id, old_status, new_status, source)
      VALUES (t, 'INITIATED', st, 'sample');

      IF st='SUCCESS' THEN
        INSERT INTO payment.payments (transaction_id, organization_id, provider_id, amount, fee_amount,
                                      net_amount, currency, status, provider_transaction_id, captured_at)
        VALUES (t, org_a, prov, round((50 + random()*950)::numeric,2), 2.50, NULL, 'INR', 'CAPTURED',
                'PAY-'||substr(t::text,1,10), now());
      ELSIF st='FAILED' THEN
        INSERT INTO transaction.transaction_failures (transaction_id, device_id, failure_code,
                                                       error_message, retryable, retry_count)
        VALUES (t, d, 'PROVIDER_DECLINED','Declined by provider', false, 0);
      END IF;
    END LOOP;
  END LOOP;

  -- a settlement + reconciliation batch for context
  INSERT INTO settlement.settlement_batches (organization_id, provider_id, settlement_date, currency,
            total_amount, total_fee, net_amount, transaction_count, settlement_reference, status)
  VALUES (org_a, prov, current_date, 'INR', 12500.00, 250.00, 12250.00, 24, 'STL-'||to_char(now(),'YYYYMMDD')||'-01','SETTLED');

  INSERT INTO reconciliation.reconciliation_batches (organization_id, provider_id, business_date, status,
            total_records, matched_count, exception_count, started_at, completed_at)
  VALUES (org_a, prov, current_date, 'COMPLETED', 24, 22, 2, now()-interval '1 hour', now());

  -- an example alert
  INSERT INTO alert.alerts (organization_id, entity_type, entity_id, severity, status, title, details, triggered_at)
  VALUES (org_a, 'DEVICE', NULL, 'WARN', 'OPEN', 'Device offline',
          '{"device":"Acme POS #5"}'::jsonb, now());

  RAISE NOTICE 'Sample data loaded. Org A = %', org_a;
END $$;

-- refresh dashboard rollups from the sample rows
INSERT INTO reporting.txn_daily_stats (organization_id, business_date, provider_id,
        total_count, success_count, failed_count, pending_count, total_amount, success_rate)
SELECT organization_id, created_at::date, payment_provider_id,
       count(*),
       count(*) FILTER (WHERE status='SUCCESS'),
       count(*) FILTER (WHERE status='FAILED'),
       count(*) FILTER (WHERE status IN ('INITIATED','PROCESSING','RETRY')),
       sum(amount),
       round(100.0 * count(*) FILTER (WHERE status='SUCCESS') / nullif(count(*),0), 2)
FROM transaction.transactions
GROUP BY organization_id, created_at::date, payment_provider_id
ON CONFLICT (organization_id, business_date, provider_id) DO UPDATE
  SET total_count=EXCLUDED.total_count, success_count=EXCLUDED.success_count,
      failed_count=EXCLUDED.failed_count, total_amount=EXCLUDED.total_amount,
      success_rate=EXCLUDED.success_rate;
