const express = require('express');
const pool = require('../db');
const router = express.Router();

// GET USER NOTIFICATIONS
router.get('/user/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const result = await pool.query(
      'SELECT * FROM get_user_notifications($1)',
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching notifications:', err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE NOTIFICATION
router.delete('/:notificationId', async (req, res) => {
  const { notificationId } = req.params;

  try {
    await pool.query(
      'CALL delete_notification($1)',
      [notificationId]
    );
    res.json({ message: 'Notification deleted successfully' });
  } catch (err) {
    console.error('Error deleting notification:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
