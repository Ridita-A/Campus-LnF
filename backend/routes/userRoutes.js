const express = require('express');
const pool = require('../db');
const router = express.Router();

// GET USER PROFILE
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'SELECT * FROM get_user_profile($1)',
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching user profile:', err);
    res.status(500).json({ error: err.message });
  }
});

// UPDATE USER PROFILE (name + contact_number)
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, contact_number } = req.body;
  try {
    await pool.query(
      'SELECT update_user_profile($1, $2, $3)',
      [id, name || null, contact_number || null]
    );
    res.json({ message: 'Profile updated successfully' });
  } catch (err) {
    console.error('Error updating user profile:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET USER REPORT HISTORY (lost/found/claim/return)
router.get('/:id/history', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'SELECT * FROM get_user_report_history($1)',
      [id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching user history:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
