const express = require('express');
const pool = require('../db'); 
const router = express.Router();

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
    // Call the stored procedure
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
