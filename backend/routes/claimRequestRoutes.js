const express = require('express');
const pool = require('../db');
const router = express.Router();

// CREATE CLAIM REQUEST FOR FOUND ITEMS
router.post('/create/found', async (req, res) => {
  const { requester_id, found_report_id, message, image_urls = [] } = req.body;

  try {
    await pool.query(
      'CALL create_claim_request_found($1, $2, $3, $4)',
      [requester_id, found_report_id, message, image_urls]
    );

    res.status(201).json({ message: 'Claim request created successfully' });
  } catch (err) {
    console.error('Error creating claim request for found item:', err);
    res.status(500).json({ error: err.message });
  }
});

// CREATE CLAIM REQUEST FOR LOST ITEMS (someone else found it)
router.post('/create/lost', async (req, res) => {
  const { requester_id, lost_report_id, message, image_urls = [] } = req.body;

  try {
    await pool.query(
      'CALL create_return_request_lost($1, $2, $3, $4)',
      [requester_id, lost_report_id, message, image_urls]
    );

    res.status(201).json({ message: 'Return report created successfully' });
  } catch (err) {
    console.error('Error creating return report for lost item:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET CLAIM REQUESTS FOR USER'S FOUND ITEMS
router.get('/user/claims/:userId', async (req, res) => {
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

// GET RETURN REQUESTS FOR USER'S LOST ITEMS
router.get('/user/returns/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const result = await pool.query(
      'SELECT * FROM get_user_return_requests($1)',
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching return requests:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
