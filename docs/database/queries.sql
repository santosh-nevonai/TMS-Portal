-- =====================================================================
-- TMS — Production query library. Tuned for the indexes in schema.sql.
-- Placeholders: $1 = organization_id, etc.
-- =====================================================================

-- =========================== DEVICE ===========================

-- Device by id (PK)
SELECT * FROM device.devices WHERE device_id = $1;

-- Device by serial within a tenant (unique index ux org+serial)
SELECT * FROM device.devices WHERE organization_id = $1 AND serial_number = $2;

-- Device by AWS Thing Name (unique partial index) -- O(1)
SELECT * FROM device.devices WHERE aws_thing_name = $1;

-- Device by IMEI (via identifiers, unique on type+value)
SELECT d.*
FROM device.device_identifiers i
JOIN device.devices d ON d.device_id = i.device_id
WHERE i.id_type = 'IMEI' AND i.id_value = $1;

-- All active devices for an org (composite index org+status)
SELECT device_id, serial_number, display_name, last_seen_at
FROM device.devices
WHERE organization_id = $1 AND status = 'ACTIVE' AND deleted_at IS NULL
ORDER BY last_seen_at DESC;

-- Offline devices for an org (join the small current-state table, not history)
SELECT d.device_id, d.serial_number, s.last_seen_at, s.error_status
FROM device.device_current_state s
JOIN device.devices d ON d.device_id = s.device_id
WHERE d.organization_id = $1 AND s.connection_status = 'OFFLINE';

-- Current state for one device (single-row PK lookup)
SELECT * FROM device.device_current_state WHERE device_id = $1;

-- Latest transaction per device for a tenant (DISTINCT ON + composite index)
SELECT DISTINCT ON (t.device_id)
       t.device_id, t.transaction_id, t.amount, t.status, t.created_at
FROM transaction.transactions t
WHERE t.organization_id = $1
  AND t.created_at >= now() - interval '30 days'   -- bound → partition pruning
ORDER BY t.device_id, t.created_at DESC;

-- Devices with recent transaction failures
SELECT d.device_id, d.serial_number, count(*) AS failures
FROM transaction.transaction_failures f
JOIN device.devices d ON d.device_id = f.device_id
WHERE f.first_failure_at >= now() - interval '24 hours' AND f.resolved_at IS NULL
GROUP BY d.device_id, d.serial_number
ORDER BY failures DESC;

-- ========================= TRANSACTIONS =========================

-- Latest N transactions for a tenant (index org+created_at DESC, prunes partitions)
SELECT transaction_id, device_id, amount, currency, status, created_at
FROM transaction.transactions
WHERE organization_id = $1
  AND created_at >= now() - interval '7 days'
ORDER BY created_at DESC
LIMIT 50;

-- Transactions by device + date window
SELECT transaction_id, amount, status, created_at
FROM transaction.transactions
WHERE device_id = $1 AND created_at >= $2 AND created_at < $3
ORDER BY created_at DESC;

-- Transactions by status (partial index on open states powers the worker queue)
SELECT transaction_id, organization_id, device_id, requested_at
FROM transaction.transactions
WHERE status IN ('INITIATED','PROCESSING','RETRY')
ORDER BY created_at
LIMIT 500;

-- Failed transactions in last 24h for a tenant (prunes to 1 partition)
SELECT t.transaction_id, t.amount, f.failure_code, f.error_message, t.created_at
FROM transaction.transactions t
LEFT JOIN transaction.transaction_failures f ON f.transaction_id = t.transaction_id
WHERE t.organization_id = $1 AND t.status = 'FAILED'
  AND t.created_at >= now() - interval '24 hours'
ORDER BY t.created_at DESC;

-- High-value transactions above a threshold
SELECT transaction_id, device_id, amount, created_at
FROM transaction.transactions
WHERE organization_id = $1 AND amount >= $2
  AND created_at >= now() - interval '30 days'
ORDER BY amount DESC;

-- Idempotent insert (the dedup guarantee) — workers use this exact shape
INSERT INTO transaction.transactions
   (organization_id, device_id, transaction_type_id, transaction_reference,
    device_transaction_id, idempotency_key, amount, currency, status,
    payment_provider_id, correlation_id, requested_at)
VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'INITIATED',$9,$10, now())
ON CONFLICT (organization_id, idempotency_key, created_at) DO NOTHING
RETURNING transaction_id;
-- If no row is returned, the message was a duplicate → ack & drop.

-- Optimistic status transition (prevents two workers double-advancing)
UPDATE transaction.transactions
SET status = 'SUCCESS', completed_at = now()
WHERE transaction_id = $1 AND created_at = $2 AND status = 'PROCESSING';
-- 0 rows affected → someone else already moved it.

-- Transaction success rate for a tenant over a window (from the ledger, bounded)
SELECT count(*)                                          AS total,
       count(*) FILTER (WHERE status='SUCCESS')          AS success,
       count(*) FILTER (WHERE status='FAILED')           AS failed,
       round(100.0*count(*) FILTER (WHERE status='SUCCESS')/nullif(count(*),0),2) AS success_rate
FROM transaction.transactions
WHERE organization_id = $1 AND created_at >= now() - interval '24 hours';

-- ========================== DASHBOARD ==========================
-- Serve these from reporting.* / Redis, NOT live scans of the ledger.

-- Fleet counts (small tables)
SELECT
  (SELECT count(*) FROM device.devices WHERE organization_id=$1 AND deleted_at IS NULL) AS total_devices,
  (SELECT count(*) FROM device.device_current_state s JOIN device.devices d ON d.device_id=s.device_id
     WHERE d.organization_id=$1 AND s.connection_status='ONLINE')  AS online_devices,
  (SELECT count(*) FROM device.device_current_state s JOIN device.devices d ON d.device_id=s.device_id
     WHERE d.organization_id=$1 AND s.connection_status='OFFLINE') AS offline_devices;

-- Today's numbers (pre-aggregated summary table)
SELECT sum(total_count) total, sum(success_count) success, sum(failed_count) failed,
       sum(pending_count) pending, sum(total_amount) amount,
       round(100.0*sum(success_count)/nullif(sum(total_count),0),2) success_rate
FROM reporting.txn_daily_stats
WHERE organization_id = $1 AND business_date = current_date;

-- Hourly trend (matview / continuous aggregate) — instant
SELECT bucket, total_count, success_count, failed_count, total_amount
FROM reporting.mv_txn_hourly
WHERE organization_id = $1 AND bucket >= now() - interval '24 hours'
ORDER BY bucket;

-- Provider breakdown for a day
SELECT p.name, s.total_count, s.success_count, s.failed_count, s.total_amount
FROM reporting.txn_daily_stats s
JOIN payment.payment_providers p ON p.provider_id = s.provider_id
WHERE s.organization_id = $1 AND s.business_date = current_date;

-- ======================= RECONCILIATION ========================

-- Unmatched records for a batch (partial index on match_status<>'MATCHED')
SELECT recon_record_id, transaction_id, provider_reference, provider_amount, tms_amount, match_status
FROM reconciliation.reconciliation_records
WHERE batch_id = $1 AND match_status <> 'MATCHED';

-- Amount mismatches across recent batches
SELECT r.recon_record_id, r.transaction_id, r.provider_amount, r.tms_amount,
       (r.provider_amount - r.tms_amount) AS delta
FROM reconciliation.reconciliation_records r
JOIN reconciliation.reconciliation_batches b ON b.batch_id = r.batch_id
WHERE b.organization_id = $1 AND r.match_status = 'AMOUNT_MISMATCH'
  AND b.business_date >= current_date - 7;

-- Transactions present in TMS but missing at provider
SELECT transaction_id, provider_reference
FROM reconciliation.reconciliation_records
WHERE match_status = 'MISSING_IN_PROVIDER' AND batch_id = $1;

-- Duplicate detections
SELECT provider_reference, count(*)
FROM reconciliation.reconciliation_records
WHERE batch_id = $1 AND match_status = 'DUPLICATE'
GROUP BY provider_reference HAVING count(*) > 1;

-- Open reconciliation exceptions needing action
SELECT e.exception_id, e.exception_type, e.description, e.created_at
FROM reconciliation.reconciliation_exceptions e
WHERE e.resolution_status = 'OPEN'
ORDER BY e.created_at;

-- Settlement mismatches: settled totals vs ledger totals per batch
SELECT sb.settlement_batch_id, sb.settlement_reference, sb.net_amount AS declared_net,
       sum(sr.net_amount) AS computed_net,
       sb.net_amount - sum(sr.net_amount) AS delta
FROM settlement.settlement_batches sb
JOIN settlement.settlement_records sr ON sr.settlement_batch_id = sb.settlement_batch_id
WHERE sb.organization_id = $1
GROUP BY sb.settlement_batch_id, sb.settlement_reference, sb.net_amount
HAVING sb.net_amount <> sum(sr.net_amount);

-- ============ RLS + attribution session setup (per request) ============
-- Set these once at the start of each request/transaction in the app:
--   SET app.current_org     = '<org uuid>';    -- powers RLS tenant filter
--   SET app.current_user    = '<user uuid>';   -- powers created_by/updated_by + audit
--   SET app.correlation_id  = '<trace uuid>';  -- optional, threaded into audit_logs
-- The triggers then stamp attribution automatically — code can't forget.

-- ===================== WHO CREATED / UPDATED =====================

-- Current owner/editor straight off the row (fast path)
SELECT d.device_id, d.serial_number,
       cu.email AS created_by, d.created_at,
       uu.email AS updated_by, d.updated_at
FROM device.devices d
LEFT JOIN core.users cu ON cu.user_id = d.created_by
LEFT JOIN core.users uu ON uu.user_id = d.updated_by
WHERE d.device_id = $1;

-- Full change history of any record (authoritative trail)
--   earliest INSERT  = who created it
--   each UPDATE row  = who changed it, and old_value -> new_value
--   user_id IS NULL  = a system/worker change (see correlation_id)
SELECT a.created_at,
       COALESCE(u.email, '(system)') AS changed_by,
       a.action, a.old_value, a.new_value, a.ip_address, a.correlation_id
FROM audit.audit_logs a
LEFT JOIN core.users u ON u.user_id = a.user_id
WHERE a.entity_type = $1   -- e.g. 'device.devices'
  AND a.entity_id   = $2   -- the record's PK as text
ORDER BY a.created_at DESC;

-- Everything a given user changed in a window (accountability)
SELECT created_at, entity_type, entity_id, action
FROM audit.audit_logs
WHERE user_id = $1 AND created_at >= now() - interval '30 days'
ORDER BY created_at DESC;

-- For device-driven records (transactions) the "who" is the device + trace,
-- not a person — read it from the status trail instead of audit_logs:
SELECT h.changed_at, h.old_status, h.new_status, h.source, h.correlation_id
FROM transaction.transaction_status_history h
WHERE h.transaction_id = $1
ORDER BY h.changed_at;
