const express = require('express');
const router = express.Router();
const pool = require('../db');

// Get all stats
router.get('/', async (req, res) => {
    try {
        const [rollupResult, cubeResult, trendsResult, resolutionResult, topRankResult] = await Promise.all([
            pool.query('SELECT * FROM vw_requests_by_status_rollup'),
            pool.query('SELECT * FROM vw_global_activity_cube'),
            pool.query('SELECT * FROM vw_monthly_trends'),
            pool.query('SELECT * FROM vw_report_resolution_time'),
            pool.query('SELECT * FROM vw_top_locations')
        ]);

        res.json({
            rollup: rollupResult.rows,
            cube: cubeResult.rows,
            trends: trendsResult.rows,
            resolution: resolutionResult.rows,
            topRank: topRankResult.rows
        });
    } catch (err) {
        console.error('Error fetching stats:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
