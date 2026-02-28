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

// MARK NOTIFICATION AS READ
router.patch('/:notificationId/read', async (req, res) => {
  const { notificationId } = req.params;
  const { user_id } = req.body;

  if (!user_id) {
    return res.status(400).json({ error: 'user_id is required' });
  }

  try {
    await pool.query(
      'CALL mark_notification_as_read($1, $2)',
      [notificationId, user_id]
    );
    res.json({ message: 'Notification marked as read' });
  } catch (err) {
    console.error('Error marking notification as read:', err);
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
