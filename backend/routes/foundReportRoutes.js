const express = require('express');
const pool = require('../db');
const router = express.Router();

// GET ALL FOUND REPORTS
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM vw_found_reports');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching found reports:', err);
    res.status(500).json({ error: err.message });
  }
});

// CREATE FOUND REPORT
router.post('/create', async (req, res) => {
  const {
    creator_id,
    found_location_id,
    title,
    description,
    found_at,
    tags = [],
    image_urls = []
  } = req.body;

  try {
    // Call the stored procedure
    await pool.query(
      'CALL create_found_report($1,$2,$3,$4,$5,$6,$7)',
      [creator_id, found_location_id, title, description, found_at, tags, image_urls]
    );

    res.status(201).json({ message: 'Found report created successfully' });
  } catch (err) {
    console.error('Error creating found report:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;