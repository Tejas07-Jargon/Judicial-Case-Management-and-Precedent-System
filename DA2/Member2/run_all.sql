-- =============================================================================
-- MASTER SCRIPT: run_all.sql
-- PROJECT: Judicial Case Management and Precedent System
-- MODULE: DA2 Member 2 — Hearings, Judgments & Appeals
-- AUTHOR: Member 2 (Aryan)
-- COMPATIBILITY: Oracle Database 19c / 21c / 23ai / Oracle SQL Developer
-- =============================================================================
-- DESCRIPTION:
-- Master automated runner executing all Member 2 SQL scripts in exact
-- dependency order. Enables 1-click execution for testing, viva, and demonstration.
-- =============================================================================

SET ECHO OFF;
SET FEEDBACK ON;
SET SERVEROUTPUT ON SIZE UNLIMITED;
SET DEFINE OFF;
SET SQLBLANKLINES ON;
SET LINESIZE 220;
SET PAGESIZE 50;

PROMPT =====================================================================
PROMPT STEP 1/9: Initializing DA1 Baseline & Cross-Module Prerequisite Schema
PROMPT =====================================================================
@00_setup_da1_schema.sql

PROMPT =====================================================================
PROMPT STEP 2/9: Creating Member 2 Tables, Constraints, Sequences & Indexes
PROMPT =====================================================================
@01_create_tables.sql

PROMPT =====================================================================
PROMPT STEP 3/9: Inserting Interconnected Realistic Sample Data
PROMPT =====================================================================
@02_sample_data.sql

PROMPT =====================================================================
PROMPT STEP 4/9: Executing 15 Member 2 Operational & Analytical SQL Queries
PROMPT =====================================================================
@03_sql_queries.sql

PROMPT =====================================================================
PROMPT STEP 5/9: Compiling and Demonstrating PL/SQL Stored Procedures
PROMPT =====================================================================
@04_plsql_procedures.sql

PROMPT =====================================================================
PROMPT STEP 6/9: Compiling and Demonstrating Case Duration Function
PROMPT =====================================================================
@05_functions.sql

PROMPT =====================================================================
PROMPT STEP 7/9: Compiling and Demonstrating Business Rule Triggers
PROMPT =====================================================================
@06_triggers.sql

PROMPT =====================================================================
PROMPT STEP 8/9: Running Automated Test Suite & Exception Trapping
PROMPT =====================================================================
@07_test_cases.sql

PROMPT =====================================================================
PROMPT STEP 9/9: Executing Cross-Module Integration Queries (Members 1, 2, 3)
PROMPT =====================================================================
@08_integration_queries.sql

PROMPT =====================================================================
PROMPT MASTER RUN COMPLETE: ALL MEMBER 2 SCRIPTS EXECUTED SUCCESSFULLY!
PROMPT =====================================================================
