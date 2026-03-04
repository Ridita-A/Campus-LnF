const express = require('express');
const pool = require('../db');
const router = express.Router();

// DELETE FOUND REPORT (Moved to top for priority)
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  console.log(`[BACKEND] DELETE request received for found report ID: ${id}`);
  try {
    const result = await pool.query('DELETE FROM Found_Report WHERE found_id = $1', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Report not found in database' });
    }
    res.json({ message: 'Found report deleted successfully' });
  } catch (err) {
    console.error('Error deleting found report:', err);
    res.status(500).json({ error: err.message });
  }
});

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