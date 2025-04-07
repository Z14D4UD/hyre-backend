const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const {
  getReminders,
  createReminder,
  updateReminder,
  deleteReminder
} = require('../controllers/remindersController');

// All routes require a business to be authenticated
router.get('/', authMiddleware, getReminders);
router.post('/', authMiddleware, createReminder);
router.put('/:reminderId', authMiddleware, updateReminder);
router.delete('/:reminderId', authMiddleware, deleteReminder);

module.exports = router;
