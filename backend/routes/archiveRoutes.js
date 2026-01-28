const express = require('express');
const pool = require('../db');
const router = express.Router();

// ARCHIVE LOST REPORT
router.post('/lost/:lostId', async (req, res) => {
  const { lostId } = req.params;

  try {
    await pool.query(
      'CALL archive_lost_report($1)',
      [lostId]
    );

    res.json({ message: 'Lost report archived successfully' });
  } catch (err) {
    console.error('Error archiving lost report:', err);
    res.status(500).json({ error: err.message });
  }
});

// ARCHIVE FOUND REPORT
router.post('/found/:foundId', async (req, res) => {
  const { foundId } = req.params;

  try {
    await pool.query(
      'CALL archive_found_report($1)',
      [foundId]
    );

    res.json({ message: 'Found report archived successfully' });
  } catch (err) {
    console.error('Error archiving found report:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
