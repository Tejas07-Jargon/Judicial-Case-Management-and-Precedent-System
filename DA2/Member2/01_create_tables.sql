-- =============================================================================
-- SCRIPT: 01_create_tables.sql
-- PROJECT: Judicial Case Management and Precedent System
-- MODULE: DA2 Member 2 — Hearings, Judgments & Appeals
-- AUTHOR: Member 2 (Aryan)
-- COMPATIBILITY: Oracle Database 19c / 21c / 23ai / Oracle SQL Developer
-- =============================================================================
-- DESCRIPTION:
-- Creates the four core tables assigned to Member 2:
--   1. HEARING        - Case proceedings, schedule, courtroom & hearing status
--   2. HEARING_BENCH  - Presiding judicial benches (M:N between Hearing & Judge)
--   3. JUDGMENT       - Verdicts, legal outcome & judgment documentation
--   4. APPEAL         - Appellate challenges across judicial tiers (Court -> Court)
--
-- Includes primary keys, foreign keys referencing DA1 tables (CASES, COURT, JUDGE),
-- NOT NULL constraints, CHECK constraints, sequences, and performance indexes.
-- =============================================================================

SET FEEDBACK ON;
SET SERVEROUTPUT ON;
SET DEFINE OFF;
SET SQLBLANKLINES ON;

-- -----------------------------------------------------------------------------
-- 1. DROP EXISTING MEMBER 2 OBJECTS IN SAFE DEPENDENCY ORDER
-- -----------------------------------------------------------------------------
BEGIN
    FOR t IN (SELECT table_name FROM user_tables WHERE table_name IN ('APPEAL', 'JUDGMENT', 'HEARING_BENCH', 'HEARING')) LOOP
        BEGIN
            EXECUTE IMMEDIATE 'DROP TABLE ' || t.table_name || ' CASCADE CONSTRAINTS';
        EXCEPTION
            WHEN OTHERS THEN NULL;
        END;
    END LOOP;
END;
/

BEGIN
    FOR s IN (SELECT sequence_name FROM user_sequences WHERE sequence_name IN ('HEARING_SEQ', 'JUDGMENT_SEQ', 'APPEAL_SEQ')) LOOP
        BEGIN
            EXECUTE IMMEDIATE 'DROP SEQUENCE ' || s.sequence_name;
        EXCEPTION
            WHEN OTHERS THEN NULL;
        END;
    END LOOP;
END;
/

-- -----------------------------------------------------------------------------
-- 2. SEQUENCES FOR AUTOMATED PRIMARY KEY GENERATION
-- Configured to start above pre-populated demonstration seed keys
-- -----------------------------------------------------------------------------
CREATE SEQUENCE HEARING_SEQ  START WITH 201 INCREMENT BY 1 NOCACHE NOCYCLE;
CREATE SEQUENCE JUDGMENT_SEQ START WITH 601 INCREMENT BY 1 NOCACHE NOCYCLE;
CREATE SEQUENCE APPEAL_SEQ   START WITH 801 INCREMENT BY 1 NOCACHE NOCYCLE;

-- -----------------------------------------------------------------------------
-- 3. TABLE A: HEARING
-- Stores individual courtroom proceedings, scheduling, and outcome statuses.
-- -----------------------------------------------------------------------------
CREATE TABLE HEARING (
    hearing_id      VARCHAR2(50)     NOT NULL,
    case_id         VARCHAR2(50)     NOT NULL,
    hearing_date    DATE             NOT NULL,
    courtroom       VARCHAR2(50)     NOT NULL,
    purpose         VARCHAR2(255)    NOT NULL,
    hearing_status  VARCHAR2(20)     DEFAULT 'SCHEDULED' NOT NULL,
    remarks         VARCHAR2(1000),
    CONSTRAINT PK_HEARING PRIMARY KEY (hearing_id),
    CONSTRAINT FK_HEARING_CASE FOREIGN KEY (case_id)
        REFERENCES CASES(Case_ID) ON DELETE CASCADE,
    CONSTRAINT CK_HEARING_STATUS CHECK (
        hearing_status IN ('SCHEDULED', 'COMPLETED', 'ADJOURNED', 'CANCELLED')
    )
);

COMMENT ON TABLE HEARING IS 'Stores hearing proceedings, dates, and courtroom schedules for judicial cases.';
COMMENT ON COLUMN HEARING.hearing_id IS 'Unique alphanumeric hearing identifier (PK).';
COMMENT ON COLUMN HEARING.case_id IS 'Case identifier referencing CASES(Case_ID) (FK).';
COMMENT ON COLUMN HEARING.hearing_date IS 'Scheduled date and time of the hearing session.';
COMMENT ON COLUMN HEARING.courtroom IS 'Physical or virtual courtroom designation (e.g., Court Hall 3, Chief Justice Court).';
COMMENT ON COLUMN HEARING.purpose IS 'Purpose of proceedings (e.g., Bail, Evidence, Final Arguments).';
COMMENT ON COLUMN HEARING.hearing_status IS 'Operational status: SCHEDULED, COMPLETED, ADJOURNED, or CANCELLED.';
COMMENT ON COLUMN HEARING.remarks IS 'Judicial observations, cause of adjournment, or bench notes.';

-- -----------------------------------------------------------------------------
-- 4. TABLE B: HEARING_BENCH
-- Stores judicial bench constitution per hearing (supports Single, Division, Full Bench).
-- -----------------------------------------------------------------------------
CREATE TABLE HEARING_BENCH (
    hearing_id      VARCHAR2(50)     NOT NULL,
    judge_id        VARCHAR2(50)     NOT NULL,
    bench_role      VARCHAR2(50)     DEFAULT 'Presiding Judge' NOT NULL,
    CONSTRAINT PK_HEARING_BENCH PRIMARY KEY (hearing_id, judge_id),
    CONSTRAINT FK_BENCH_HEARING FOREIGN KEY (hearing_id)
        REFERENCES HEARING(hearing_id) ON DELETE CASCADE,
    CONSTRAINT FK_BENCH_JUDGE FOREIGN KEY (judge_id)
        REFERENCES JUDGE(Entity_ID),
    CONSTRAINT CK_BENCH_ROLE CHECK (
        bench_role IN ('Presiding Judge', 'Associate Judge', 'Single Judge', 'Chief Justice', 'Division Bench Lead')
    )
);

COMMENT ON TABLE HEARING_BENCH IS 'Maps judges to hearings, modeling composite benches and judicial compositions.';
COMMENT ON COLUMN HEARING_BENCH.hearing_id IS 'Hearing identifier referencing HEARING(hearing_id) (FK).';
COMMENT ON COLUMN HEARING_BENCH.judge_id IS 'Judge entity identifier referencing JUDGE(Entity_ID) (FK).';
COMMENT ON COLUMN HEARING_BENCH.bench_role IS 'Role of the judge on the bench during the hearing session.';

-- -----------------------------------------------------------------------------
-- 5. TABLE C: JUDGMENT
-- Stores judicial verdicts, operative decrees, and detailed legal rulings.
-- Supports multiple judgment records per case (Interim, Final, Post-Remand).
-- -----------------------------------------------------------------------------
CREATE TABLE JUDGMENT (
    judgment_id      VARCHAR2(50)     NOT NULL,
    case_id          VARCHAR2(50)     NOT NULL,
    judgment_date    DATE             NOT NULL,
    outcome          VARCHAR2(100)    NOT NULL,
    judgment_text    CLOB             NOT NULL,
    judgment_status  VARCHAR2(20)     DEFAULT 'DELIVERED' NOT NULL,
    CONSTRAINT PK_JUDGMENT PRIMARY KEY (judgment_id),
    CONSTRAINT FK_JUDGMENT_CASE FOREIGN KEY (case_id)
        REFERENCES CASES(Case_ID) ON DELETE CASCADE,
    CONSTRAINT CK_JUDGMENT_STATUS CHECK (
        judgment_status IN ('DELIVERED', 'RESERVED', 'PRONOUNCED', 'STAYED', 'OVERRULED')
    )
);

COMMENT ON TABLE JUDGMENT IS 'Records judgments, verdicts, operative outcomes, and detailed legal rulings.';
COMMENT ON COLUMN JUDGMENT.judgment_id IS 'Unique alphanumeric judgment identifier (PK).';
COMMENT ON COLUMN JUDGMENT.case_id IS 'Case identifier referencing CASES(Case_ID) (FK).';
COMMENT ON COLUMN JUDGMENT.judgment_date IS 'Date on which the verdict was pronounced or delivered.';
COMMENT ON COLUMN JUDGMENT.outcome IS 'Operative legal outcome (e.g., Convicted, Acquitted, Suit Decreed, Petition Dismissed).';
COMMENT ON COLUMN JUDGMENT.judgment_text IS 'Full legal text, ratio decidendi, and findings of the court (CLOB).';
COMMENT ON COLUMN JUDGMENT.judgment_status IS 'Judicial status of the ruling: DELIVERED, RESERVED, PRONOUNCED, STAYED, or OVERRULED.';

-- -----------------------------------------------------------------------------
-- 6. TABLE D: APPEAL
-- Stores appellate petitions escalating judgments from lower to higher courts.
-- -----------------------------------------------------------------------------
CREATE TABLE APPEAL (
    appeal_id        VARCHAR2(50)     NOT NULL,
    case_id          VARCHAR2(50)     NOT NULL,
    judgment_id      VARCHAR2(50)     NOT NULL,
    lower_court_id   VARCHAR2(50)     NOT NULL,
    higher_court_id  VARCHAR2(50)     NOT NULL,
    filing_date      DATE             NOT NULL,
    appeal_status    VARCHAR2(20)     DEFAULT 'PENDING' NOT NULL,
    outcome          VARCHAR2(200),
    remarks          VARCHAR2(1000),
    CONSTRAINT PK_APPEAL PRIMARY KEY (appeal_id),
    CONSTRAINT FK_APPEAL_CASE FOREIGN KEY (case_id)
        REFERENCES CASES(Case_ID) ON DELETE CASCADE,
    CONSTRAINT FK_APPEAL_JUDGMENT FOREIGN KEY (judgment_id)
        REFERENCES JUDGMENT(judgment_id) ON DELETE CASCADE,
    CONSTRAINT FK_APPEAL_LOWER_COURT FOREIGN KEY (lower_court_id)
        REFERENCES COURT(Court_ID),
    CONSTRAINT FK_APPEAL_HIGHER_COURT FOREIGN KEY (higher_court_id)
        REFERENCES COURT(Court_ID),
    CONSTRAINT CK_APPEAL_DIFF_COURTS CHECK (lower_court_id <> higher_court_id),
    CONSTRAINT CK_APPEAL_STATUS CHECK (
        appeal_status IN ('PENDING', 'ADMITTED', 'DISPOSED', 'REJECTED')
    )
);

COMMENT ON TABLE APPEAL IS 'Tracks appellate challenges against judgments moving up the court hierarchy.';
COMMENT ON COLUMN APPEAL.appeal_id IS 'Unique alphanumeric appeal identifier (PK).';
COMMENT ON COLUMN APPEAL.case_id IS 'Original or appellate case identifier referencing CASES(Case_ID) (FK).';
COMMENT ON COLUMN APPEAL.judgment_id IS 'Challenged lower court judgment referencing JUDGMENT(judgment_id) (FK).';
COMMENT ON COLUMN APPEAL.lower_court_id IS 'Forum a quo: Court whose judgment is being challenged referencing COURT (FK).';
COMMENT ON COLUMN APPEAL.higher_court_id IS 'Forum ad quem: Appellate court hearing the challenge referencing COURT (FK).';
COMMENT ON COLUMN APPEAL.filing_date IS 'Date the memorandum of appeal was submitted.';
COMMENT ON COLUMN APPEAL.appeal_status IS 'Appellate stage: PENDING, ADMITTED, DISPOSED, or REJECTED.';
COMMENT ON COLUMN APPEAL.outcome IS 'Operative appellate outcome (e.g., Upheld, Remanded, Overturned, Stay Granted).';
COMMENT ON COLUMN APPEAL.remarks IS 'Grounds of appeal, condonation of delay, or appellate observations.';

-- -----------------------------------------------------------------------------
-- 7. PERFORMANCE INDEXES ON FOREIGN KEYS & CRITICAL FILTER COLUMNS
-- -----------------------------------------------------------------------------
CREATE INDEX IDX_HEARING_CASE      ON HEARING(case_id);
CREATE INDEX IDX_HEARING_DATE      ON HEARING(hearing_date);
CREATE INDEX IDX_HEARING_STATUS    ON HEARING(hearing_status);

CREATE INDEX IDX_BENCH_JUDGE       ON HEARING_BENCH(judge_id);

CREATE INDEX IDX_JUDGMENT_CASE     ON JUDGMENT(case_id);
CREATE INDEX IDX_JUDGMENT_DATE     ON JUDGMENT(judgment_date);
CREATE INDEX IDX_JUDGMENT_STATUS   ON JUDGMENT(judgment_status);

CREATE INDEX IDX_APPEAL_CASE       ON APPEAL(case_id);
CREATE INDEX IDX_APPEAL_JUDGMENT   ON APPEAL(judgment_id);
CREATE INDEX IDX_APPEAL_STATUS     ON APPEAL(appeal_status);
CREATE INDEX IDX_APPEAL_COURTS     ON APPEAL(lower_court_id, higher_court_id);

PROMPT =====================================================================
PROMPT Member 2 Tables, Constraints, Sequences & Indexes Created Successfully!
PROMPT =====================================================================
