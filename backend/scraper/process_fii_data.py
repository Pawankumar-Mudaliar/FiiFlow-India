import os
from datetime import date
import pandas as pd
import psycopg2
from psycopg2.extras import execute_batch

DB_CONFIG = {
    "dbname": "fii_tracker_db",
    "user": "fii_user",
    "password": "your_password_here",
    "host": "localhost",
    "port": "5432"
}

def load_sheet_to_df(file_path):
    if file_path.endswith(".csv"):
        df = pd.read_csv(file_path)
    else:
        df = pd.read_excel(file_path)
    
    # Strip whitespace from column names
    df.columns = df.columns.str.strip()
    return df

def ingest_and_compare(file_path):
    df = load_sheet_to_df(file_path)
    today = date.today()

    conn = psycopg2.connect(**DB_CONFIG)
    cur = conn.cursor()

    try:
        # Prepare records for insertion
        records = []
        for _, row in df.iterrows():
            company = str(row.get("Name", row.get("Company", ""))).strip()
            if not company:
                continue

            cmp_val = pd.to_numeric(row.get("CMP Rs.", row.get("CMP", None)), errors='coerce')
            pe_val = pd.to_numeric(row.get("P/E", None), errors='coerce')
            mcap_val = pd.to_numeric(row.get("Mar Cap Rs.Cr.", row.get("Mar Cap", None)), errors='coerce')
            chg_fii = pd.to_numeric(row.get("Chg in FII Hold %", None), errors='coerce')
            fii_hold = pd.to_numeric(row.get("FII Hold %", None), errors='coerce')

            records.append((company, cmp_val, pe_val, mcap_val, chg_fii, fii_hold, today))

        # Upsert today's snapshot
        upsert_query = """
        INSERT INTO fii_screen_snapshots 
            (company_name, cmp, pe_ratio, market_cap, chg_in_fii_pct, fii_hold_pct, snapshot_date)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
        ON CONFLICT (company_name, snapshot_date)
        DO UPDATE SET
            cmp = EXCLUDED.cmp,
            pe_ratio = EXCLUDED.pe_ratio,
            market_cap = EXCLUDED.market_cap,
            chg_in_fii_pct = EXCLUDED.chg_in_fii_pct,
            fii_hold_pct = EXCLUDED.fii_hold_pct;
        """
        execute_batch(cur, upsert_query, records)
        conn.commit()
        print(f"Saved {len(records)} records for date: {today}")

        # Run comparison against the most recent prior snapshot
        comparison_query = """
        WITH latest AS (
            SELECT company_name, fii_hold_pct, snapshot_date
            FROM fii_screen_snapshots
            WHERE snapshot_date = %s
        ),
        previous AS (
            SELECT DISTINCT ON (company_name) company_name, fii_hold_pct, snapshot_date
            FROM fii_screen_snapshots
            WHERE snapshot_date < %s
            ORDER BY company_name, snapshot_date DESC
        )
        SELECT 
            l.company_name,
            p.fii_hold_pct AS prev_fii,
            l.fii_hold_pct AS curr_fii,
            ROUND(l.fii_hold_pct - p.fii_hold_pct, 2) AS diff
        FROM latest l
        JOIN previous p ON l.company_name = p.company_name
        WHERE l.fii_hold_pct <> p.fii_hold_pct;
        """
        cur.execute(comparison_query, (today, today))
        diffs = cur.fetchall()

        print("\n--- FII Movement Detected Since Last Record ---")
        if not diffs:
            print("No changes found between this snapshot and the previous snapshot.")
        for name, prev, curr, diff in diffs:
            icon = "🟢 INCREASE" if diff > 0 else "🔴 DECREASE"
            print(f"{icon} | {name}: Previous: {prev}% -> Current: {curr}% (Diff: {diff:+0.2f}%)")

    finally:
        cur.close()
        conn.close()

if __name__ == "__main__":
    import glob
    files = glob.glob("downloads/*.*")
    if files:
        latest_file = max(files, key=os.path.getmtime)
        ingest_and_compare(latest_file)
    else:
        print("No downloaded files found in downloads/ directory.")