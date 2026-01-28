const express = require('express');
const pool = require('../db');
const router = express.Router();

// CREATE CLAIM REQUEST FOR FOUND ITEMS
router.post('/create/found', async (req, res) => {
  const { requester_id, found_report_id, message } = req.body;

  try {
    await pool.query(
      'CALL create_claim_request_found($1, $2, $3)',
      [requester_id, found_report_id, message]
    );

    res.status(201).json({ message: 'Claim request created successfully' });
  } catch (err) {
    console.error('Error creating claim request for found item:', err);
    res.status(500).json({ error: err.message });
  }
});

// CREATE CLAIM REQUEST FOR LOST ITEMS
router.post('/create/lost', async (req, res) => {
  const { requester_id, lost_report_id, message } = req.body;

  try {
    await pool.query(
      'CALL create_claim_request_lost($1, $2, $3)',
      [requester_id, lost_report_id, message]
    );

    res.status(201).json({ message: 'Claim request created successfully' });
  } catch (err) {
    console.error('Error creating claim request for lost item:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET CLAIM REQUESTS FOR USER'S FOUND ITEMS
router.get('/user/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const result = await pool.query(
      'SELECT * FROM get_user_claim_requests($1)',
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching claim requests:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
