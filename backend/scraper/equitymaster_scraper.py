import os
import time
import re
import random
import difflib
import requests
import io
from io import StringIO
import concurrent.futures
from datetime import date
import pandas as pd
import psycopg2
from psycopg2.extras import execute_batch
import yfinance as yf
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager

EQUITYMASTER_URL = "https://www.equitymaster.com/stock-screener/stocks-recently-bought-by-institutional-investors"

import os

def get_db_config():
    url = os.environ.get("DATABASE_URL")
    if url:
        return {"dsn": url, "sslmode": os.environ.get("FII_DB_SSLMODE", "require")}
    return {
        "dbname": os.environ.get("FII_DB_NAME", "fii_tracker_db"),
        "user": os.environ.get("FII_DB_USER", "fii_user"),
        "password": os.environ.get("FII_DB_PASSWORD", "your_password_here"),
        "host": os.environ.get("FII_DB_HOST", "localhost"),
        "port": os.environ.get("FII_DB_PORT", "5432"),
    }

DB_CONFIG = get_db_config()

def setup_driver():
    options = Options()

    # Required for Render/Linux server environment
    options.add_argument("--headless=new")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--disable-gpu")
    options.add_argument("--window-size=1920,1080")

    options.add_argument(
        "--user-agent=Mozilla/5.0 (X11; Linux x86_64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/120.0.0.0 Safari/537.36"
    )

    print("🚀 Initializing standard Chrome WebDriver...")
    
    # Modern Selenium handles driver management automatically
    driver = webdriver.Chrome(options=options)

    return driver

def clean_symbol(company_name):
    """Generates a fallback ticker symbol if the company isn't on the NSE master list."""
    clean = re.sub(r'[^A-Za-z0-9]', '', company_name).upper()
    return clean[:20]

def normalize_name(name):
    """Removes common corporate suffixes to maximize match rate between Equitymaster and NSE."""
    name = str(name).upper()
    name = re.sub(r'\b(LTD|LIMITED|CORP|CORPORATION|INC|PLC|CO|COMPANY)\b\.?', '', name)
    name = re.sub(r'[^A-Z0-9]', '', name)
    return name

def fetch_nse_master_list():
    """Downloads the official NSE list to get correct ticker symbols, preventing 404 errors."""
    print("📥 Downloading official NSE symbol master list...")
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
    try:
        url = "https://nsearchives.nseindia.com/content/equities/EQUITY_L.csv"
        response = requests.get(url, headers=headers, timeout=15)
        
        if response.status_code == 200:
            nse_df = pd.read_csv(io.StringIO(response.text))
            
            mapping = {}
            for _, row in nse_df.iterrows():
                raw_name = str(row.get('NAME OF COMPANY', ''))
                norm_name = normalize_name(raw_name)
                sym = str(row.get('SYMBOL', '')).strip()
                
                mapping[norm_name] = {"symbol": sym}
            
            print(f"✅ Successfully loaded {len(mapping)} official NSE symbols.")
            return mapping
        else:
            print(f"⚠️ NSE returned status code {response.status_code}. Using fallback symbols.")
            return {}
    except Exception as e:
        print(f"⚠️ Failed to fetch NSE list: {e}. Ensure you have an active internet connection.")
        return {}


def resolve_symbol(company, norm_company, nse_mapping, nse_names_cache, stats):
    """
    Resolves a company name to a real NSE ticker symbol.
    Tries an exact normalized match first, then a fuzzy match against the
    official NSE list (handles renamed companies / abbreviation differences
    like 'FEDERALBANK' -> 'FEDERALBNK'), and only falls back to the naive
    clean_symbol() guess -- which is very unlikely to be a real ticker --
    as a last resort.
    """
    if norm_company in nse_mapping:
        stats["exact"] += 1
        return nse_mapping[norm_company]["symbol"]

    # Fuzzy match against official NSE names. Cache the name list once.
    if nse_names_cache["names"] is None:
        nse_names_cache["names"] = list(nse_mapping.keys())

    close = difflib.get_close_matches(
        norm_company, nse_names_cache["names"], n=1, cutoff=0.87
    )
    if close:
        stats["fuzzy"] += 1
        return nse_mapping[close[0]]["symbol"]

    # Genuinely not on the NSE list (delisted, renamed beyond recognition,
    # or a typo in the source data). This symbol will very likely 404
    # against Yahoo Finance, which is expected, not a bug.
    stats["unmatched"] += 1
    return clean_symbol(company)

def fetch_single_sector(symbol, max_retries=2):
    """
    Fetches a symbol's sector from Yahoo Finance.
    Retries on transient 'Invalid Crumb' / 401 errors (Yahoo's anti-bot
    session handling occasionally invalidates a crumb under concurrent
    load), but gives up immediately on a genuine 404 -- that means the
    symbol just isn't on Yahoo, and retrying won't change that.
    """
    last_error = None
    for attempt in range(max_retries + 1):
        try:
            # Small jitter spreads out the burst of requests so Yahoo is
            # less likely to rate-limit / invalidate crumbs mid-batch.
            time.sleep(random.uniform(0.05, 0.25))
            ticker = yf.Ticker(f"{symbol}.NS")
            info = ticker.get_info()
            sector = info.get('sector')
            return symbol, (sector if sector else "Equities"), None
        except Exception as e:
            last_error = e
            msg = str(e)
            if "404" in msg or "Not Found" in msg:
                # Not a transient issue -- this symbol genuinely doesn't
                # exist on Yahoo (delisted, renamed, or a bad guess).
                return symbol, "Equities", "not_found"
            if attempt < max_retries:
                time.sleep(1.0 * (attempt + 1))  # back off and retry once/twice
                continue
    return symbol, "Equities", f"error: {last_error}"

def fetch_sectors_batch(symbols):
    """Concurrently fetches sectors from Yahoo Finance to reduce 15 min wait time to ~15 seconds."""
    print(f"📡 Fast-fetching accurate sectors for {len(symbols)} new companies from Yahoo Finance...")
    results = {}
    not_found = 0
    other_errors = 0
    # Lower concurrency than before (10 -> 5): Yahoo's crumb/session
    # handling is what was causing the 'Invalid Crumb' 401s, and it gets
    # noticeably worse the more concurrent requests you throw at it.
    with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
        future_to_sym = {executor.submit(fetch_single_sector, sym): sym for sym in symbols}
        for future in concurrent.futures.as_completed(future_to_sym):
            sym, sector, err = future.result()
            results[sym] = sector
            if err == "not_found":
                not_found += 1
            elif err is not None:
                other_errors += 1
            if len(results) > 0 and len(results) % 50 == 0:
                print(f"   ...fetched {len(results)} / {len(symbols)}")

    print(
        f"✅ Sector fetch complete: {len(symbols) - not_found - other_errors} matched, "
        f"{not_found} symbol(s) not found on Yahoo (likely delisted/renamed — "
        f"defaulted to 'Equities'), {other_errors} failed after retries."
    )
    return results

def fetch_equitymaster_data():
    print("🚀 Initializing browser to extract institutional holdings...")
    driver = setup_driver()
    all_pages_data = []
    page_num = 1
    
    try:
        driver.get(EQUITYMASTER_URL)
        time.sleep(4) 

        while True:
            print(f"Scraping page {page_num}...")
            html = driver.page_source
            
            try:
                tables = pd.read_html(StringIO(html))
            except ValueError:
                break
                
            current_df = None
            for table in tables:
                if 'Company' in table.columns or 'Company Name' in table.columns:
                    current_df = table
                    break
                    
            if current_df is None or current_df.empty:
                print("No table found on this page.")
                break

            if all_pages_data and current_df.equals(all_pages_data[-1]):
                print("Page content unchanged. Reached final page.")
                break

            all_pages_data.append(current_df)
            print(f"Captured {len(current_df)} rows from page {page_num}.")

            try:
                next_page_num = str(page_num + 1)
                next_xpath = (
                    f"//a[normalize-space()='{next_page_num}'] | "
                    "//a[normalize-space()='>'] | "
                    "//a[normalize-space()='≥'] | "
                    "//a[translate(normalize-space(), 'NEXT', 'next')='next']"
                )
                
                next_buttons = driver.find_elements(By.XPATH, next_xpath)
                if not next_buttons:
                    print("Reached the end of pagination.")
                    break
                    
                next_btn = next_buttons[0]
                driver.execute_script("arguments[0].scrollIntoView(true);", next_btn)
                time.sleep(1)
                driver.execute_script("arguments[0].click();", next_btn)
                
                page_num += 1
                time.sleep(4)
                
            except Exception as e:
                print(f"Pagination completed: {e}")
                break

    finally:
        driver.quit() 

    if not all_pages_data:
        print("Failed to extract any data.")
        return None
        
    master_df = pd.concat(all_pages_data, ignore_index=True)
    master_df.drop_duplicates(subset=['Company'], inplace=True)
    print(f"\n✅ Total unique companies collected: {len(master_df)}")
    return master_df

def ingest_to_db(df):
    today = date.today()
    conn = psycopg2.connect(**DB_CONFIG)
    cur = conn.cursor()

    try:
        # Load the official sector mappings into memory
        nse_mapping = fetch_nse_master_list()

        df.columns = df.columns.str.replace(r'\s+', ' ', regex=True).str.strip()

        def clean_number(val):
            if pd.isna(val) or val is None:
                return None
            val_str = str(val).replace(',', '').replace('%', '').strip()
            if val_str.upper() in ['NM', '-', 'NA', '']:
                return None
            try:
                return float(val_str)
            except ValueError:
                return None

        # 1. Load known stocks from your DB
        cur.execute("SELECT id, company_name FROM stocks;")
        existing_by_name = {row[1].strip().upper(): {"id": row[0]} for row in cur.fetchall()}

        # 2. Find missing stocks that need to be added
        new_stocks = []
        match_stats = {"exact": 0, "fuzzy": 0, "unmatched": 0}
        nse_names_cache = {"names": None}
        for _, row in df.iterrows():
            company = str(row.get("Company", "")).strip()
            if not company or company.lower() == 'nan':
                continue
                
            company_upper = company.upper()
            norm_company = normalize_name(company)

            if company_upper not in existing_by_name:
                symbol = resolve_symbol(
                    company, norm_company, nse_mapping, nse_names_cache, match_stats
                )
                
                if not any(s['company'] == company for s in new_stocks):
                    new_stocks.append({"company": company, "symbol": symbol})

        if new_stocks:
            print(
                f"🔎 Symbol matching: {match_stats['exact']} exact, "
                f"{match_stats['fuzzy']} fuzzy-matched, "
                f"{match_stats['unmatched']} unmatched (guessed symbol, likely to 404)."
            )

        # 3. Batch fetch sectors and insert new stocks
        if new_stocks:
            symbols_to_fetch = list(set(s["symbol"] for s in new_stocks))
            sector_results = fetch_sectors_batch(symbols_to_fetch)
            
            for ns in new_stocks:
                sym = ns["symbol"]
                comp = ns["company"]
                sector = sector_results.get(sym, "Equities")
                
                cur.execute("""
                    INSERT INTO stocks (symbol, company_name, sector)
                    VALUES (%s, %s, %s)
                    ON CONFLICT (company_name) DO UPDATE 
                        SET sector = COALESCE(stocks.sector, EXCLUDED.sector)
                    RETURNING id;
                """, (sym, comp, sector))
                stock_id = cur.fetchone()[0]
                existing_by_name[comp.upper()] = {"id": stock_id}

        # 4. Fetch previous FII records for change detection
        cur.execute("""
            SELECT DISTINCT ON (company_name) 
                company_name, 
                fii_hold_pct, 
                cmp, 
                snapshot_date
            FROM fii_screen_snapshots
            ORDER BY company_name, snapshot_date DESC;
        """)
        
        previous_records = {
            row[0]: {
                "fii": float(row[1]) if row[1] is not None else None,
                "cmp": float(row[2]) if row[2] is not None else None
            }
            for row in cur.fetchall()
        }

        snapshots_to_upsert = []
        change_logs = []
        holdings_to_upsert = []

        print("\n🔄 Processing records and populating normalized tables...")

        for _, row in df.iterrows():
            company = str(row.get("Company", "")).strip()
            if not company or company.lower() == 'nan':
                continue

            cmp_val = clean_number(row.get("CMP (Rs)"))
            mcap_val = clean_number(row.get("MCap (Rs m)"))
            fii_latest = clean_number(row.get("FII Holdings (Latest Qtr, %)"))
            fii_prev = clean_number(row.get("FII Holdings (Prev Qtr, %)"))
            chg_fii = clean_number(row.get("Chg in FII Holdings (%)"))
            prom_hold = clean_number(row.get("Promoter Holding (Latest Qtr, %)"))
            prom_pledge = clean_number(row.get("Promoter Pledge (Latest Qtr, %)"))
            pe_val = None

            company_upper = company.upper()
            stock_id = existing_by_name[company_upper]["id"]

            # --- POPULATE TABLE: fii_holdings ---
            if fii_latest is not None:
                holdings_to_upsert.append((
                    stock_id,
                    today,
                    fii_latest,
                    None,
                    prom_hold
                ))

            # --- POPULATE TABLE: fii_change_logs ---
            if company in previous_records and fii_latest is not None:
                old_fii = previous_records[company]["fii"]
                old_cmp = previous_records[company]["cmp"]

                if old_fii is not None and round(old_fii, 2) != round(fii_latest, 2):
                    diff = round(fii_latest - old_fii, 2)
                    change_logs.append((company, old_fii, fii_latest, diff, old_cmp, cmp_val))
                    icon = "🟢 INCREASED" if diff > 0 else "🔴 DECREASED"
                    print(f"[{icon}] {company}: FII {old_fii}% -> {fii_latest}% ({diff:+0.2f}%)")

            # --- POPULATE TABLE: fii_screen_snapshots ---
            snapshots_to_upsert.append((
                company, 
                cmp_val, 
                pe_val, 
                mcap_val, 
                chg_fii, 
                fii_latest, 
                fii_prev, 
                prom_hold, 
                prom_pledge, 
                today
            ))

        # Batch write fii_holdings
        if holdings_to_upsert:
            cur_holdings_query = """
            INSERT INTO fii_holdings (stock_id, record_date, fii_percentage, dii_percentage, promoter_percentage)
            VALUES (%s, %s, %s, %s, %s)
            ON CONFLICT (stock_id, record_date) 
            DO UPDATE SET
                fii_percentage = EXCLUDED.fii_percentage,
                dii_percentage = EXCLUDED.dii_percentage,
                promoter_percentage = EXCLUDED.promoter_percentage;
            """
            execute_batch(cur, cur_holdings_query, holdings_to_upsert)
            print(f"📦 Populated {len(holdings_to_upsert)} entries in 'fii_holdings'.")

        # Batch write fii_change_logs
        if change_logs:
            insert_changes_query = """
            INSERT INTO fii_change_logs 
                (company_name, old_fii_pct, new_fii_pct, difference, old_cmp, new_cmp)
            VALUES (%s, %s, %s, %s, %s, %s);
            """
            execute_batch(cur, insert_changes_query, change_logs)
            print(f"📊 Logged {len(change_logs)} shifts in 'fii_change_logs'.")

        # Batch write fii_screen_snapshots
        upsert_snapshots_query = """
        INSERT INTO fii_screen_snapshots (
            company_name, 
            cmp, 
            pe_ratio, 
            market_cap, 
            chg_in_fii_pct, 
            fii_hold_pct, 
            fii_prev_hold_pct, 
            promoter_hold_pct, 
            promoter_pledge_pct, 
            snapshot_date
        )
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        ON CONFLICT (company_name, snapshot_date)
        DO UPDATE SET
            cmp = EXCLUDED.cmp,
            pe_ratio = EXCLUDED.pe_ratio,
            market_cap = EXCLUDED.market_cap,
            chg_in_fii_pct = EXCLUDED.chg_in_fii_pct,
            fii_hold_pct = EXCLUDED.fii_hold_pct,
            fii_prev_hold_pct = EXCLUDED.fii_prev_hold_pct,
            promoter_hold_pct = EXCLUDED.promoter_hold_pct,
            promoter_pledge_pct = EXCLUDED.promoter_pledge_pct;
        """
        execute_batch(cur, upsert_snapshots_query, snapshots_to_upsert)
        
        conn.commit()
        print(f"✅ Successfully updated 'stocks', 'fii_holdings', and 'fii_screen_snapshots' for {today}.")

    except Exception as e:
        print(f"❌ Database error: {e}")
        conn.rollback()
    finally:
        cur.close()
        conn.close()

if __name__ == "__main__":
    data_frame = fetch_equitymaster_data()
    if data_frame is not None:
        ingest_to_db(data_frame)