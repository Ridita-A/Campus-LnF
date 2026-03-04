const express = require('express');
const pool = require('../db'); 
const router = express.Router();

// DELETE LOST REPORT (Moved to top for priority)
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  console.log(`[BACKEND] DELETE request received for lost report ID: ${id}`);
  try {
    const result = await pool.query('DELETE FROM Lost_Report WHERE lost_id = $1', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Report not found in database' });
    }
    res.json({ message: 'Lost report deleted successfully' });
  } catch (err) {
    console.error('Error deleting lost report:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET ALL LOST REPORTS
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM vw_lost_reports');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching lost reports:', err);
    res.status(500).json({ error: err.message });
  }
});

// CREATE LOST REPORT
router.post('/create', async (req, res) => {
  const {
    creator_id,
    last_location_id,
    title,
    description,
    lost_at,
    tags = [],
    image_urls = []
  } = req.body;

  try {
    await pool.query(
      'CALL create_lost_report($1,$2,$3,$4,$5,$6,$7)',
      [creator_id, last_location_id, title, description, lost_at, tags, image_urls]
    );
    res.status(201).json({ message: 'Lost report created successfully' });
  } catch (err) {
    console.error('Error creating lost report:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
