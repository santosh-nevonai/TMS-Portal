-- =====================================================================
-- TMS — Production Database Schema (PostgreSQL 16+)
-- System of record for 100K+ IoT devices, 3.5M+ transactions/day.
-- Money is numeric; timestamps are timestamptz (UTC); FKs protect the ledger.
-- Partitioned tables use native RANGE partitioning by created_at (pg_partman in prod).
-- =====================================================================

-- ---------- Extensions ----------
CREATE EXTENSION IF NOT EXISTS "pgcrypto";     -- gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "citext";       -- case-insensitive email/slug
CREATE EXTENSION IF NOT EXISTS "btree_gin";
-- CREATE EXTENSION IF NOT EXISTS "pg_partman";  -- partition automation (prod)
-- CREATE EXTENSION IF NOT EXISTS "timescaledb"; -- optional, reporting aggregates only

-- ---------- Schemas ----------
CREATE SCHEMA IF NOT EXISTS core;
CREATE SCHEMA IF NOT EXISTS device;
CREATE SCHEMA IF NOT EXISTS transaction;
CREATE SCHEMA IF NOT EXISTS payment;
CREATE SCHEMA IF NOT EXISTS reconciliation;
CREATE SCHEMA IF NOT EXISTS settlement;
CREATE SCHEMA IF NOT EXISTS configuration;
CREATE SCHEMA IF NOT EXISTS notification;
CREATE SCHEMA IF NOT EXISTS alert;
CREATE SCHEMA IF NOT EXISTS audit;
CREATE SCHEMA IF NOT EXISTS logging;
CREATE SCHEMA IF NOT EXISTS reporting;

-- =====================================================================
-- CORE : tenancy, identity, RBAC
-- =====================================================================
CREATE TABLE core.organizations (
    organization_id        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_organization_id uuid REFERENCES core.organizations(organization_id) ON DELETE RESTRICT,
    name                   text NOT NULL,
    slug                   citext NOT NULL UNIQUE,
    status                 text NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE','SUSPENDED','CLOSED')),
    tier                   text,
    country_code           char(2),
    timezone               text NOT NULL DEFAULT 'UTC',
    settings               jsonb NOT NULL DEFAULT '{}'::jsonb,
    created_at             timestamptz NOT NULL DEFAULT now(),
    updated_at             timestamptz NOT NULL DEFAULT now(),
    deleted_at             timestamptz
);

CREATE TABLE core.users (
    user_id        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    email          citext NOT NULL UNIQUE,
    full_name      text,
    phone          text,
    password_hash  text,
    status         text NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE','INVITED','DISABLED')),
    mfa_enabled    boolean NOT NULL DEFAULT false,
    last_login_at  timestamptz,
    created_at     timestamptz NOT NULL DEFAULT now(),
    updated_at     timestamptz NOT NULL DEFAULT now(),
    deleted_at     timestamptz
);

CREATE TABLE core.roles (
    role_id         integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    organization_id uuid REFERENCES core.organizations(organization_id) ON DELETE CASCADE,
    name            text NOT NULL,
    description     text,
    is_system       boolean NOT NULL DEFAULT false,
    created_at      timestamptz NOT NULL DEFAULT now(),
    UNIQUE (organization_id, name)
);

CREATE TABLE core.permissions (
    permission_id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    code          text NOT NULL UNIQUE,
    description   text,
    category      text
);

CREATE TABLE core.role_permissions (
    role_id       integer NOT NULL REFERENCES core.roles(role_id) ON DELETE CASCADE,
    permission_id integer NOT NULL REFERENCES core.permissions(permission_id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE core.organization_users (
    organization_id uuid NOT NULL REFERENCES core.organizations(organization_id) ON DELETE CASCADE,
    user_id         uuid NOT NULL REFERENCES core.users(user_id) ON DELETE CASCADE,
    status          text NOT NULL DEFAULT 'ACTIVE',
    invited_at      timestamptz,
    joined_at       timestamptz DEFAULT now(),
    PRIMARY KEY (organization_id, user_id)
);

CREATE TABLE core.user_roles (
    user_id         uuid NOT NULL REFERENCES core.users(user_id) ON DELETE CASCADE,
    role_id         integer NOT NULL REFERENCES core.roles(role_id) ON DELETE CASCADE,
    organization_id uuid NOT NULL REFERENCES core.organizations(organization_id) ON DELETE CASCADE,
    granted_by      uuid REFERENCES core.users(user_id) ON DELETE SET NULL,
    granted_at      timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id, role_id, organization_id)
);

-- =====================================================================
-- DEVICE
-- =====================================================================
CREATE TABLE device.device_types (
    device_type_id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    code           text NOT NULL UNIQUE,
    name           text NOT NULL,
    category       text,
    created_at     timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE device.device_models (
    device_model_id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    device_type_id  integer NOT NULL REFERENCES device.device_types(device_type_id) ON DELETE RESTRICT,
    manufacturer    text,
    model_name      text,
    model_code      text UNIQUE,
    specs           jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE device.device_status (
    status_code text PRIMARY KEY,
    description text,
    is_active   boolean NOT NULL DEFAULT true
);

CREATE TABLE device.devices (
    device_id       uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id uuid NOT NULL REFERENCES core.organizations(organization_id) ON DELETE RESTRICT,
    device_type_id  integer REFERENCES device.device_types(device_type_id) ON DELETE SET NULL,
    device_model_id integer REFERENCES device.device_models(device_model_id) ON DELETE SET NULL,
    serial_number   text NOT NULL,
    display_name    text,
    aws_thing_name  text,
    status          text NOT NULL DEFAULT 'INACTIVE' REFERENCES device.device_status(status_code),
    activated_at    timestamptz,
    last_seen_at    timestamptz,
    created_at      timestamptz NOT NULL DEFAULT now(),
    updated_at      timestamptz NOT NULL DEFAULT now(),
    deleted_at      timestamptz,
    UNIQUE (organization_id, serial_number)
);
CREATE UNIQUE INDEX ux_devices_thing ON device.devices (aws_thing_name) WHERE aws_thing_name IS NOT NULL;
CREATE INDEX ix_devices_org_status ON device.devices (organization_id, status);
CREATE INDEX ix_devices_lastseen ON device.devices (last_seen_at DESC);

CREATE TABLE device.device_identifiers (
    device_identifier_id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    device_id  uuid NOT NULL REFERENCES device.devices(device_id) ON DELETE CASCADE,
    id_type    text NOT NULL CHECK (id_type IN ('IMEI','SIM','ICCID','MAC','OTHER')),
    id_value   text NOT NULL,
    is_primary boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE (id_type, id_value)
);

CREATE TABLE device.device_current_state (
    device_id            uuid PRIMARY KEY REFERENCES device.devices(device_id) ON DELETE CASCADE,
    connection_status    text NOT NULL DEFAULT 'UNKNOWN' CHECK (connection_status IN ('ONLINE','OFFLINE','UNKNOWN')),
    last_seen_at         timestamptz,
    last_transaction_at  timestamptz,
    last_mqtt_message_at timestamptz,
    last_shadow_update_at timestamptz,
    firmware_version     text,
    signal_strength      integer,
    network_status       text,
    error_status         text,
    updated_at           timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ix_dcs_conn ON device.device_current_state (connection_status);

CREATE TABLE device.device_configuration (
    device_id      uuid PRIMARY KEY REFERENCES device.devices(device_id) ON DELETE CASCADE,
    config         jsonb NOT NULL DEFAULT '{}'::jsonb,
    config_version integer NOT NULL DEFAULT 1,
    applied_at     timestamptz,
    updated_at     timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE device.device_configuration_history (
    config_history_id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    device_id      uuid NOT NULL REFERENCES device.devices(device_id) ON DELETE CASCADE,
    config         jsonb NOT NULL,
    config_version integer NOT NULL,
    changed_by     uuid REFERENCES core.users(user_id) ON DELETE SET NULL,
    source         text,
    correlation_id uuid,
    created_at     timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ix_dch_device ON device.device_configuration_history (device_id, created_at DESC);

CREATE TABLE device.device_firmware (
    firmware_id    integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    device_type_id integer REFERENCES device.device_types(device_type_id) ON DELETE CASCADE,
    version        text NOT NULL,
    release_notes  text,
    s3_key         text,
    is_active      boolean NOT NULL DEFAULT true,
    created_at     timestamptz NOT NULL DEFAULT now(),
    UNIQUE (device_type_id, version)
);

CREATE TABLE device.device_firmware_history (
    fw_history_id  bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    device_id      uuid NOT NULL REFERENCES device.devices(device_id) ON DELETE CASCADE,
    firmware_id    integer REFERENCES device.device_firmware(firmware_id) ON DELETE SET NULL,
    from_version   text,
    to_version     text,
    status         text,
    correlation_id uuid,
    created_at     timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE device.device_assignments (
    assignment_id   bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    device_id       uuid NOT NULL REFERENCES device.devices(device_id) ON DELETE CASCADE,
    organization_id uuid NOT NULL REFERENCES core.organizations(organization_id) ON DELETE RESTRICT,
    assigned_by     uuid REFERENCES core.users(user_id) ON DELETE SET NULL,
    assigned_at     timestamptz NOT NULL DEFAULT now(),
    unassigned_at   timestamptz,
    reason          text
);

-- device_logs : operational events only. Native monthly partitions.
CREATE TABLE device.device_logs (
    log_id         bigint GENERATED ALWAYS AS IDENTITY,
    device_id      uuid NOT NULL,
    organization_id uuid,
    event_type     text NOT NULL,
    severity       text NOT NULL DEFAULT 'INFO' CHECK (severity IN ('DEBUG','INFO','WARN','ERROR','CRITICAL')),
    message        text,
    details        jsonb,
    correlation_id uuid,
    created_at     timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (log_id, created_at)
) PARTITION BY RANGE (created_at);
CREATE INDEX ix_devlogs_device ON device.device_logs (device_id, created_at DESC);
CREATE INDEX ix_devlogs_brin   ON device.device_logs USING brin (created_at);

-- =====================================================================
-- TRANSACTION : the financial ledger
-- =====================================================================
CREATE TABLE transaction.transaction_types (
    transaction_type_id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    code       text NOT NULL UNIQUE,
    name       text NOT NULL,
    direction  text CHECK (direction IN ('DEBIT','CREDIT')),
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE transaction.transaction_statuses (
    status_code text PRIMARY KEY,
    description text,
    is_terminal boolean NOT NULL DEFAULT false,
    sort_order  integer
);

CREATE TABLE transaction.failure_codes (
    failure_code text PRIMARY KEY,
    category     text,
    description  text,
    is_retryable boolean NOT NULL DEFAULT false,
    severity     text
);

-- transactions : native monthly partitions on created_at.
CREATE TABLE transaction.transactions (
    transaction_id        uuid NOT NULL DEFAULT gen_random_uuid(),
    organization_id       uuid NOT NULL,
    device_id             uuid,
    transaction_type_id   integer,
    transaction_reference text NOT NULL,
    device_transaction_id text,
    idempotency_key       text NOT NULL,
    amount                numeric(18,4) NOT NULL CHECK (amount >= 0),
    currency              char(3) NOT NULL,
    status                text NOT NULL DEFAULT 'INITIATED',
    payment_provider_id   integer,
    provider_transaction_id text,
    correlation_id        uuid,
    requested_at          timestamptz NOT NULL,
    completed_at          timestamptz,
    created_at            timestamptz NOT NULL DEFAULT now(),
    updated_at            timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (transaction_id, created_at),
    -- idempotency guarantee (partition key must be in unique constraint):
    UNIQUE (organization_id, idempotency_key, created_at),
    FOREIGN KEY (organization_id) REFERENCES core.organizations(organization_id) ON DELETE RESTRICT,
    FOREIGN KEY (device_id)       REFERENCES device.devices(device_id)           ON DELETE RESTRICT,
    FOREIGN KEY (status)          REFERENCES transaction.transaction_statuses(status_code),
    FOREIGN KEY (transaction_type_id) REFERENCES transaction.transaction_types(transaction_type_id)
) PARTITION BY RANGE (created_at);

CREATE INDEX ix_txn_org_created    ON transaction.transactions (organization_id, created_at DESC);
CREATE INDEX ix_txn_device_created ON transaction.transactions (device_id, created_at DESC);
CREATE INDEX ix_txn_status_created ON transaction.transactions (status, created_at DESC);
CREATE INDEX ix_txn_reference      ON transaction.transactions (transaction_reference);
CREATE INDEX ix_txn_provider_txn   ON transaction.transactions (provider_transaction_id) WHERE provider_transaction_id IS NOT NULL;
CREATE INDEX ix_txn_created_brin   ON transaction.transactions USING brin (created_at);
CREATE INDEX ix_txn_open           ON transaction.transactions (status) WHERE status IN ('INITIATED','PROCESSING','RETRY');

-- transaction_status_history : append-only, partitioned
CREATE TABLE transaction.transaction_status_history (
    id             bigint GENERATED ALWAYS AS IDENTITY,
    transaction_id uuid NOT NULL,
    old_status     text,
    new_status     text NOT NULL,
    changed_at     timestamptz NOT NULL DEFAULT now(),
    source         text,
    reason         text,
    correlation_id uuid,
    PRIMARY KEY (id, changed_at)
) PARTITION BY RANGE (changed_at);
CREATE INDEX ix_tsh_txn ON transaction.transaction_status_history (transaction_id, changed_at DESC);

CREATE TABLE transaction.transaction_attempts (
    attempt_id     bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    transaction_id uuid NOT NULL,
    attempt_number integer NOT NULL,
    started_at     timestamptz,
    ended_at       timestamptz,
    result         text,
    provider_id    integer,   -- FK to payment.payment_providers added at end (created later)
    correlation_id uuid
);
CREATE INDEX ix_txnattempt_txn ON transaction.transaction_attempts (transaction_id);

CREATE TABLE transaction.transaction_failures (
    failure_id        bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    transaction_id    uuid NOT NULL,
    device_id         uuid REFERENCES device.devices(device_id) ON DELETE SET NULL,
    failure_code      text REFERENCES transaction.failure_codes(failure_code),
    provider_error_code text,
    error_message     text,
    retryable         boolean NOT NULL DEFAULT false,
    retry_count       integer NOT NULL DEFAULT 0,
    first_failure_at  timestamptz NOT NULL DEFAULT now(),
    last_failure_at   timestamptz NOT NULL DEFAULT now(),
    resolved_at       timestamptz,
    correlation_id    uuid
);
CREATE INDEX ix_txnfail_txn ON transaction.transaction_failures (transaction_id);
CREATE INDEX ix_txnfail_open ON transaction.transaction_failures (failure_code) WHERE resolved_at IS NULL;

CREATE TABLE transaction.transaction_metadata (
    transaction_id uuid PRIMARY KEY,
    metadata       jsonb NOT NULL DEFAULT '{}'::jsonb,
    tags           text[],
    created_at     timestamptz NOT NULL DEFAULT now()
);

-- =====================================================================
-- PAYMENT
-- =====================================================================
CREATE TABLE payment.payment_providers (
    provider_id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    code        text NOT NULL UNIQUE,
    name        text NOT NULL,
    status      text NOT NULL DEFAULT 'ACTIVE',
    config      jsonb NOT NULL DEFAULT '{}'::jsonb,
    created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE payment.payment_methods (
    payment_method_id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    code        text NOT NULL UNIQUE,
    name        text NOT NULL,
    provider_id integer REFERENCES payment.payment_providers(provider_id) ON DELETE CASCADE,
    type        text CHECK (type IN ('CARD','WALLET','BANK','QR','OTHER')),
    is_active   boolean NOT NULL DEFAULT true
);

CREATE TABLE payment.payments (
    payment_id      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id  uuid NOT NULL,
    organization_id uuid REFERENCES core.organizations(organization_id) ON DELETE RESTRICT,
    provider_id     integer REFERENCES payment.payment_providers(provider_id) ON DELETE RESTRICT,
    payment_method_id integer REFERENCES payment.payment_methods(payment_method_id) ON DELETE SET NULL,
    amount          numeric(18,4) NOT NULL CHECK (amount >= 0),
    fee_amount      numeric(18,4) NOT NULL DEFAULT 0,
    net_amount      numeric(18,4),
    currency        char(3) NOT NULL,
    status          text NOT NULL DEFAULT 'PENDING',
    provider_transaction_id text,
    authorized_at   timestamptz,
    captured_at     timestamptz,
    created_at      timestamptz NOT NULL DEFAULT now(),
    updated_at      timestamptz NOT NULL DEFAULT now(),
    UNIQUE (provider_id, provider_transaction_id)
);
CREATE INDEX ix_pay_txn ON payment.payments (transaction_id);

CREATE TABLE payment.payment_attempts (
    attempt_id       bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    payment_id       uuid NOT NULL REFERENCES payment.payments(payment_id) ON DELETE CASCADE,
    attempt_number   integer NOT NULL,
    status           text,
    provider_request_ref text,
    provider_response_code text,
    error_message    text,
    started_at       timestamptz,
    ended_at         timestamptz,
    correlation_id   uuid
);

CREATE TABLE payment.payment_provider_responses (
    response_id    bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    payment_id     uuid NOT NULL REFERENCES payment.payments(payment_id) ON DELETE CASCADE,
    provider_id    integer REFERENCES payment.payment_providers(provider_id) ON DELETE SET NULL,
    http_status    integer,
    response_code  text,
    raw_response   jsonb,   -- sanitized: never store PAN/CVV/tokens
    received_at    timestamptz NOT NULL DEFAULT now(),
    correlation_id uuid
);

-- =====================================================================
-- RECONCILIATION
-- =====================================================================
CREATE TABLE reconciliation.reconciliation_batches (
    batch_id        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id uuid REFERENCES core.organizations(organization_id) ON DELETE RESTRICT,
    provider_id     integer REFERENCES payment.payment_providers(provider_id) ON DELETE RESTRICT,
    business_date   date NOT NULL,
    source_file_s3_key text,
    status          text NOT NULL DEFAULT 'PENDING',
    total_records   integer DEFAULT 0,
    matched_count   integer DEFAULT 0,
    exception_count integer DEFAULT 0,
    started_at      timestamptz,
    completed_at    timestamptz,
    created_by      uuid REFERENCES core.users(user_id) ON DELETE SET NULL,
    created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE reconciliation.reconciliation_records (
    recon_record_id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    batch_id        uuid NOT NULL REFERENCES reconciliation.reconciliation_batches(batch_id) ON DELETE CASCADE,
    transaction_id  uuid,
    payment_id      uuid REFERENCES payment.payments(payment_id) ON DELETE SET NULL,
    provider_reference text,
    provider_amount numeric(18,4),
    tms_amount      numeric(18,4),
    match_status    text NOT NULL DEFAULT 'PENDING'
        CHECK (match_status IN ('MATCHED','MISMATCHED','MISSING_IN_TMS','MISSING_IN_PROVIDER','AMOUNT_MISMATCH','DUPLICATE','PENDING')),
    settlement_id   uuid,   -- FK to settlement.settlement_batches added at end
    created_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ix_recrec_batch  ON reconciliation.reconciliation_records (batch_id);
CREATE INDEX ix_recrec_status ON reconciliation.reconciliation_records (match_status) WHERE match_status <> 'MATCHED';

CREATE TABLE reconciliation.reconciliation_exceptions (
    exception_id      bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    recon_record_id   bigint REFERENCES reconciliation.reconciliation_records(recon_record_id) ON DELETE CASCADE,
    batch_id          uuid REFERENCES reconciliation.reconciliation_batches(batch_id) ON DELETE CASCADE,
    exception_type    text,
    description       text,
    resolution_status text NOT NULL DEFAULT 'OPEN',
    resolved_by       uuid REFERENCES core.users(user_id) ON DELETE SET NULL,
    resolved_at       timestamptz,
    notes             text,
    created_at        timestamptz NOT NULL DEFAULT now()
);

-- =====================================================================
-- SETTLEMENT
-- =====================================================================
CREATE TABLE settlement.settlement_batches (
    settlement_batch_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id     uuid REFERENCES core.organizations(organization_id) ON DELETE RESTRICT,
    provider_id         integer REFERENCES payment.payment_providers(provider_id) ON DELETE RESTRICT,
    settlement_date     date NOT NULL,
    currency            char(3) NOT NULL,
    total_amount        numeric(18,4) NOT NULL DEFAULT 0,
    total_fee           numeric(18,4) NOT NULL DEFAULT 0,
    net_amount          numeric(18,4) NOT NULL DEFAULT 0,
    transaction_count   integer NOT NULL DEFAULT 0,
    settlement_reference text UNIQUE,
    status              text NOT NULL DEFAULT 'PENDING',
    created_at          timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE settlement.settlement_records (
    settlement_record_id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    settlement_batch_id  uuid NOT NULL REFERENCES settlement.settlement_batches(settlement_batch_id) ON DELETE RESTRICT,
    transaction_id       uuid NOT NULL,   -- references ledger, does not duplicate its amounts
    payment_id           uuid REFERENCES payment.payments(payment_id) ON DELETE SET NULL,
    gross_amount         numeric(18,4),
    fee_amount           numeric(18,4),
    net_amount           numeric(18,4),
    status               text,
    created_at           timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ix_setrec_batch ON settlement.settlement_records (settlement_batch_id);
CREATE INDEX ix_setrec_txn   ON settlement.settlement_records (transaction_id);

-- =====================================================================
-- CONFIGURATION / NOTIFICATION / ALERT
-- =====================================================================
CREATE TABLE configuration.business_configuration (
    config_id       integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    organization_id uuid REFERENCES core.organizations(organization_id) ON DELETE CASCADE,
    config_key      text NOT NULL,
    config_value    jsonb NOT NULL,
    description     text,
    effective_from  timestamptz,
    effective_to    timestamptz,
    created_by      uuid REFERENCES core.users(user_id) ON DELETE SET NULL,
    created_at      timestamptz NOT NULL DEFAULT now(),
    updated_at      timestamptz NOT NULL DEFAULT now(),
    UNIQUE (organization_id, config_key)
);

CREATE TABLE notification.notification_logs (
    notification_id     bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    organization_id     uuid REFERENCES core.organizations(organization_id) ON DELETE SET NULL,
    type                text,
    channel             text CHECK (channel IN ('SMS','EMAIL','PUSH','DASHBOARD')),
    recipient           text,
    related_entity_type text,
    related_entity_id   uuid,
    status              text NOT NULL DEFAULT 'PENDING',
    provider            text,
    provider_reference  text,
    sent_at             timestamptz,
    failed_at           timestamptz,
    retry_count         integer NOT NULL DEFAULT 0,
    error_message       text,
    correlation_id      uuid,
    created_at          timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ix_notif_org_created ON notification.notification_logs (organization_id, created_at DESC);

CREATE TABLE alert.alert_rules (
    alert_rule_id   integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    organization_id uuid REFERENCES core.organizations(organization_id) ON DELETE CASCADE,
    name            text NOT NULL,
    alert_type      text NOT NULL,
    condition       jsonb NOT NULL DEFAULT '{}'::jsonb,
    severity        text,
    channels        text[],
    is_active       boolean NOT NULL DEFAULT true,
    cooldown_seconds integer NOT NULL DEFAULT 300,
    created_by      uuid REFERENCES core.users(user_id) ON DELETE SET NULL,
    created_at      timestamptz NOT NULL DEFAULT now(),
    updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE alert.alerts (
    alert_id        bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    alert_rule_id   integer REFERENCES alert.alert_rules(alert_rule_id) ON DELETE SET NULL,
    organization_id uuid REFERENCES core.organizations(organization_id) ON DELETE CASCADE,
    entity_type     text,
    entity_id       uuid,
    severity        text,
    status          text NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN','ACKNOWLEDGED','RESOLVED')),
    title           text,
    details         jsonb,
    triggered_at    timestamptz NOT NULL DEFAULT now(),
    acknowledged_by uuid REFERENCES core.users(user_id) ON DELETE SET NULL,
    acknowledged_at timestamptz,
    resolved_at     timestamptz,
    correlation_id  uuid,
    created_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ix_alerts_open ON alert.alerts (organization_id, severity) WHERE status = 'OPEN';

CREATE TABLE alert.alert_history (
    alert_history_id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    alert_id    bigint NOT NULL REFERENCES alert.alerts(alert_id) ON DELETE CASCADE,
    old_status  text,
    new_status  text,
    changed_by  uuid REFERENCES core.users(user_id) ON DELETE SET NULL,
    note        text,
    changed_at  timestamptz NOT NULL DEFAULT now()
);

-- =====================================================================
-- AUDIT (partitioned, append-only) & LOGGING (partitioned)
-- =====================================================================
CREATE TABLE audit.audit_logs (
    audit_id        bigint GENERATED ALWAYS AS IDENTITY,
    organization_id uuid,
    user_id         uuid,
    action          text NOT NULL,           -- INSERT / UPDATE / DELETE / business action
    entity_type     text,                     -- e.g. 'device.devices'
    entity_id       text,                     -- text: holds uuid OR integer PKs
    old_value       jsonb,
    new_value       jsonb,
    ip_address      inet,
    user_agent      text,
    correlation_id  uuid,
    created_at      timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (audit_id, created_at)
) PARTITION BY RANGE (created_at);
CREATE INDEX ix_audit_org      ON audit.audit_logs (organization_id, created_at DESC);
CREATE INDEX ix_audit_entity   ON audit.audit_logs (entity_type, entity_id);
CREATE INDEX ix_audit_brin     ON audit.audit_logs USING brin (created_at);

CREATE TABLE logging.api_request_logs (
    request_log_id  bigint GENERATED ALWAYS AS IDENTITY,
    organization_id uuid,
    user_id         uuid,
    method          text,
    path            text,
    status_code     integer,
    duration_ms     integer,
    request_id      uuid,
    correlation_id  uuid,
    ip_address      inet,
    created_at      timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (request_log_id, created_at)
) PARTITION BY RANGE (created_at);
CREATE INDEX ix_apilog_brin ON logging.api_request_logs USING brin (created_at);

-- =====================================================================
-- PARTITION BOOTSTRAP (prod: pg_partman handles this automatically)
-- Create current + next month for each partitioned table.
-- =====================================================================
DO $$
DECLARE
    tbl text;
    m0 date := date_trunc('month', now())::date;
    m1 date := (date_trunc('month', now()) + interval '1 month')::date;
    m2 date := (date_trunc('month', now()) + interval '2 month')::date;
BEGIN
  FOREACH tbl IN ARRAY ARRAY[
      'transaction.transactions',
      'transaction.transaction_status_history',
      'device.device_logs',
      'audit.audit_logs',
      'logging.api_request_logs' ] LOOP
    EXECUTE format('CREATE TABLE IF NOT EXISTS %s_%s PARTITION OF %s FOR VALUES FROM (%L) TO (%L);',
                   tbl, to_char(m0,'YYYY_MM'), tbl, m0, m1);
    EXECUTE format('CREATE TABLE IF NOT EXISTS %s_%s PARTITION OF %s FOR VALUES FROM (%L) TO (%L);',
                   tbl, to_char(m1,'YYYY_MM'), tbl, m1, m2);
  END LOOP;
END $$;

-- =====================================================================
-- FUNCTIONS & TRIGGERS
-- =====================================================================
-- keep updated_at fresh
CREATE OR REPLACE FUNCTION core.touch_updated_at() RETURNS trigger AS $$
BEGIN NEW.updated_at := now(); RETURN NEW; END $$ LANGUAGE plpgsql;

CREATE TRIGGER trg_touch_org   BEFORE UPDATE ON core.organizations FOR EACH ROW EXECUTE FUNCTION core.touch_updated_at();
CREATE TRIGGER trg_touch_user  BEFORE UPDATE ON core.users         FOR EACH ROW EXECUTE FUNCTION core.touch_updated_at();
CREATE TRIGGER trg_touch_dev   BEFORE UPDATE ON device.devices     FOR EACH ROW EXECUTE FUNCTION core.touch_updated_at();

-- record every status change to the append-only history + update device_current_state
CREATE OR REPLACE FUNCTION transaction.on_txn_status_change() RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND NEW.status IS DISTINCT FROM OLD.status THEN
     INSERT INTO transaction.transaction_status_history
        (transaction_id, old_status, new_status, changed_at, source, correlation_id)
     VALUES (NEW.transaction_id, OLD.status, NEW.status, now(), 'db_trigger', NEW.correlation_id);
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END $$ LANGUAGE plpgsql;

CREATE TRIGGER trg_txn_status BEFORE UPDATE ON transaction.transactions
  FOR EACH ROW EXECUTE FUNCTION transaction.on_txn_status_change();

-- =====================================================================
-- REPORTING : summary tables + materialized view (dashboard source)
-- With TimescaleDB, replace the matview with a continuous aggregate.
-- =====================================================================
CREATE TABLE reporting.txn_daily_stats (
    organization_id uuid NOT NULL,
    business_date   date NOT NULL,
    provider_id     integer,
    total_count     bigint NOT NULL DEFAULT 0,
    success_count   bigint NOT NULL DEFAULT 0,
    failed_count    bigint NOT NULL DEFAULT 0,
    pending_count   bigint NOT NULL DEFAULT 0,
    total_amount    numeric(20,4) NOT NULL DEFAULT 0,
    success_rate    numeric(5,2),
    PRIMARY KEY (organization_id, business_date, provider_id)
);

CREATE TABLE reporting.device_txn_daily (
    device_id     uuid NOT NULL,
    business_date date NOT NULL,
    txn_count     bigint NOT NULL DEFAULT 0,
    success_count bigint NOT NULL DEFAULT 0,
    failed_count  bigint NOT NULL DEFAULT 0,
    amount        numeric(20,4) NOT NULL DEFAULT 0,
    PRIMARY KEY (device_id, business_date)
);

-- rolling 90-day dashboard matview (REFRESH CONCURRENTLY on a schedule)
CREATE MATERIALIZED VIEW reporting.mv_txn_hourly AS
SELECT organization_id,
       date_trunc('hour', created_at) AS bucket,
       count(*)                                          AS total_count,
       count(*) FILTER (WHERE status='SUCCESS')          AS success_count,
       count(*) FILTER (WHERE status='FAILED')           AS failed_count,
       sum(amount)                                       AS total_amount
FROM transaction.transactions
WHERE created_at >= now() - interval '90 days'
GROUP BY 1,2
WITH NO DATA;
CREATE UNIQUE INDEX ux_mvhourly ON reporting.mv_txn_hourly (organization_id, bucket);

-- =====================================================================
-- ROW-LEVEL SECURITY (tenant isolation backstop)
-- App sets:  SET app.current_org = '<uuid>';
-- =====================================================================
ALTER TABLE device.devices ENABLE ROW LEVEL SECURITY;
CREATE POLICY p_dev_tenant ON device.devices
  USING (organization_id = current_setting('app.current_org', true)::uuid);
-- Repeat the pattern for transactions, payments, etc. (see queries.sql notes).

-- =====================================================================
-- Deferred FKs (targets created later in the file)
-- =====================================================================
ALTER TABLE transaction.transaction_attempts
  ADD CONSTRAINT fk_txnattempt_provider
  FOREIGN KEY (provider_id) REFERENCES payment.payment_providers(provider_id) ON DELETE SET NULL;

ALTER TABLE reconciliation.reconciliation_records
  ADD CONSTRAINT fk_recrec_settlement
  FOREIGN KEY (settlement_id) REFERENCES settlement.settlement_batches(settlement_batch_id) ON DELETE SET NULL;

-- =====================================================================
-- ATTRIBUTION & AUDIT AUTOMATION
-- Human-editable tables carry created_by / updated_by (nullable = system).
-- Per request the app sets:
--     SET app.current_user   = '<user uuid>';   -- the acting human, if any
--     SET app.correlation_id = '<uuid>';         -- optional request/trace id
-- A BEFORE trigger stamps the actor + updated_at; an AFTER trigger writes
-- the full who/what/old->new trail into audit.audit_logs.
-- Device-driven / high-volume tables (transactions, *_logs, payments) are
-- deliberately excluded — their actor is device_id + correlation_id + source.
-- =====================================================================

-- current human actor from the session (null when a machine/worker acts)
CREATE OR REPLACE FUNCTION core.current_actor() RETURNS uuid
LANGUAGE sql STABLE AS $$
  SELECT nullif(current_setting('app.current_user', true), '')::uuid;
$$;

-- BEFORE INSERT/UPDATE : stamp created_by (once, immutable), updated_by, updated_at
CREATE OR REPLACE FUNCTION core.stamp_row() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.created_by IS NULL THEN NEW.created_by := core.current_actor(); END IF;
    NEW.updated_by := core.current_actor();
  ELSE
    NEW.created_by := OLD.created_by;          -- created_by never changes
    NEW.updated_by := core.current_actor();
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END $$;

-- AFTER INSERT/UPDATE/DELETE : append the change to the audit trail.
-- Attach with the row's PK column name as an argument, e.g. audit.log_change('device_id').
CREATE OR REPLACE FUNCTION audit.log_change() RETURNS trigger
LANGUAGE plpgsql AS $$
DECLARE
  pk_col text := TG_ARGV[0];
  rec    jsonb := CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE to_jsonb(NEW) END;
BEGIN
  INSERT INTO audit.audit_logs
    (organization_id, user_id, action, entity_type, entity_id, old_value, new_value, correlation_id, created_at)
  VALUES (
    (rec->>'organization_id')::uuid,                          -- null if the table has no org column
    core.current_actor(),
    TG_OP,
    TG_TABLE_SCHEMA||'.'||TG_TABLE_NAME,
    rec->>pk_col,
    CASE WHEN TG_OP <> 'INSERT' THEN to_jsonb(OLD) END,
    CASE WHEN TG_OP <> 'DELETE' THEN to_jsonb(NEW) END,
    nullif(current_setting('app.correlation_id', true), '')::uuid,
    now());
  RETURN NULL;   -- AFTER trigger, return value ignored
END $$;

-- Add attribution columns + both triggers to the human-editable tables.
-- ADD COLUMN IF NOT EXISTS keeps this idempotent and preserves any created_by already declared.
DO $$
DECLARE t record;
BEGIN
  FOR t IN
    SELECT * FROM (VALUES
      ('core','organizations','organization_id'),
      ('core','users','user_id'),
      ('core','roles','role_id'),
      ('device','device_types','device_type_id'),
      ('device','device_models','device_model_id'),
      ('device','devices','device_id'),
      ('device','device_configuration','device_id'),
      ('device','device_firmware','firmware_id'),
      ('payment','payment_providers','provider_id'),
      ('payment','payment_methods','payment_method_id'),
      ('settlement','settlement_batches','settlement_batch_id'),
      ('configuration','business_configuration','config_id'),
      ('alert','alert_rules','alert_rule_id'),
      ('reconciliation','reconciliation_batches','batch_id')
    ) AS v(sch, tbl, pk)
  LOOP
    EXECUTE format('ALTER TABLE %I.%I ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES core.users(user_id) ON DELETE SET NULL', t.sch, t.tbl);
    EXECUTE format('ALTER TABLE %I.%I ADD COLUMN IF NOT EXISTS updated_by uuid REFERENCES core.users(user_id) ON DELETE SET NULL', t.sch, t.tbl);
    EXECUTE format('ALTER TABLE %I.%I ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now()', t.sch, t.tbl);
    EXECUTE format('DROP TRIGGER IF EXISTS trg_stamp ON %I.%I', t.sch, t.tbl);
    EXECUTE format('CREATE TRIGGER trg_stamp BEFORE INSERT OR UPDATE ON %I.%I FOR EACH ROW EXECUTE FUNCTION core.stamp_row()', t.sch, t.tbl);
    EXECUTE format('DROP TRIGGER IF EXISTS trg_audit ON %I.%I', t.sch, t.tbl);
    EXECUTE format('CREATE TRIGGER trg_audit AFTER INSERT OR UPDATE OR DELETE ON %I.%I FOR EACH ROW EXECUTE FUNCTION audit.log_change(%L)', t.sch, t.tbl, t.pk);
  END LOOP;
END $$;

-- stamp_row now owns updated_at for these tables → drop the earlier single-purpose touch triggers.
DROP TRIGGER IF EXISTS trg_touch_org  ON core.organizations;
DROP TRIGGER IF EXISTS trg_touch_user ON core.users;
DROP TRIGGER IF EXISTS trg_touch_dev  ON device.devices;

-- done.
