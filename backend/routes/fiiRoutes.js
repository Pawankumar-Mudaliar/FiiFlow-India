const express = require('express');
const router = express.Router();
const db = require('../config/db');

// 1. Get latest snapshot of all stocks
router.get('/latest', async (req, res) => {
  try {
    const query = `
      SELECT 
        id,
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
      FROM fii_screen_snapshots
      WHERE snapshot_date = (SELECT MAX(snapshot_date) FROM fii_screen_snapshots)
      ORDER BY chg_in_fii_pct DESC NULLS LAST;
    `;
    const { rows } = await db.query(query);
    res.json({ count: rows.length, data: rows });
  } catch (error) {
    console.error('Error fetching latest FII snapshot:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 2. Get institutional shift logs (Activity Feed)
router.get('/changes', async (req, res) => {
  const limit = parseInt(req.query.limit, 10) || 50;
  try {
    const query = `
      SELECT 
        id,
        company_name,
        old_fii_pct,
        new_fii_pct,
        difference,
        old_cmp,
        new_cmp,
        detected_at
      FROM fii_change_logs
      ORDER BY detected_at DESC
      LIMIT $1;
    `;
    const { rows } = await db.query(query, [limit]);
    res.json({ count: rows.length, data: rows });
  } catch (error) {
    console.error('Error fetching change logs:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 3. Get historical timeline for an individual company (for charts)
router.get('/history/:company', async (req, res) => {
  const { company } = req.params;
  try {
    const query = `
      SELECT 
        snapshot_date,
        cmp,
        fii_hold_pct,
        promoter_hold_pct,
        promoter_pledge_pct
      FROM fii_screen_snapshots
      WHERE LOWER(company_name) = LOWER($1)
      ORDER BY snapshot_date ASC;
    `;
    const { rows } = await db.query(query, [company]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Company not found or no historical records exist' });
    }
    res.json({ company, history: rows });
  } catch (error) {
    console.error(`Error fetching history for ${company}:`, error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

// 4. Get YTD Monthly Market Trend for the Dashboard Chart
router.get('/trend', async (req, res) => {
  try {
    const query = `
      SELECT 
        TO_CHAR(snapshot_date, 'Mon') AS month,
        SUM((market_cap * chg_in_fii_pct) / 100) AS value
      FROM fii_screen_snapshots
      WHERE EXTRACT(YEAR FROM snapshot_date) = EXTRACT(YEAR FROM CURRENT_DATE)
      GROUP BY TO_CHAR(snapshot_date, 'Mon'), EXTRACT(MONTH FROM snapshot_date)
      ORDER BY EXTRACT(MONTH FROM snapshot_date);
    `;
    const { rows } = await db.query(query);
    res.json({ data: rows });
  } catch (error) {
    console.error('Error fetching trend data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/fii/sector-treemap
router.get('/sector-treemap', async (req, res) => {
  try {
    const query = `
      SELECT 
        COALESCE(s.symbol, REGEXP_REPLACE(snap.company_name, '[^A-Za-z0-9]', '', 'g')) AS symbol,
        snap.company_name,
        COALESCE(NULLIF(s.sector, 'Equities'), 'Diversified Industrials') AS sector,
        COALESCE(snap.market_cap, 500) AS market_cap,
        COALESCE(snap.chg_in_fii_pct, 0) AS chg_in_fii_pct,
        COALESCE(snap.fii_hold_pct, 0) AS fii_hold_pct,
        snap.cmp
      FROM fii_screen_snapshots snap
      LEFT JOIN stocks s ON UPPER(TRIM(s.company_name)) = UPPER(TRIM(snap.company_name))
      WHERE snap.snapshot_date = (SELECT MAX(snapshot_date) FROM fii_screen_snapshots)
      ORDER BY snap.market_cap DESC NULLS LAST;
    `;

    const { rows } = await db.query(query);

    // Group stocks under their respective sectors
    const sectorMap = {};
    rows.forEach(stock => {
      const sector = stock.sector.trim();
      if (!sectorMap[sector]) {
        sectorMap[sector] = [];
      }

      sectorMap[sector].push({
        name: stock.symbol.toUpperCase(),
        company: stock.company_name,
        value: Math.max(parseFloat(stock.market_cap) || 100, 10), // Box area = Market Cap
        change: parseFloat(stock.chg_in_fii_pct) || 0,            // Color = FII % Change
        holding: parseFloat(stock.fii_hold_pct) || 0,
        cmp: parseFloat(stock.cmp) || 0
      });
    });

    const treemapData = {
      name: "NSE Universe",
      children: Object.keys(sectorMap).map(sectorName => ({
        name: sectorName,
        children: sectorMap[sectorName]
      }))
    };

    res.json({ success: true, data: treemapData });
  } catch (err) {
    console.error('Error fetching treemap data:', err);
    res.status(500).json({ success: false, error: 'Database query failed' });
  }
});