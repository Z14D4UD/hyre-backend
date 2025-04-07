// server/controllers/remindersController.js

const Business = require('../models/Business'); // or a separate Reminder model

// GET /api/reminders
exports.getReminders = async (req, res) => {
  try {
    const businessId = req.business.id; // from authMiddleware
    const business = await Business.findById(businessId);
    if (!business) {
      return res.status(404).json({ msg: 'Business not found' });
    }
    res.json(business.reminders || []);
  } catch (error) {
    console.error('Error fetching reminders:', error);
    res.status(500).json({ msg: 'Server error fetching reminders' });
  }
};

// POST /api/reminders
exports.createReminder = async (req, res) => {
  try {
    const businessId = req.business.id;
    const { title, description, dueDate } = req.body;

    const business = await Business.findById(businessId);
    if (!business) {
      return res.status(404).json({ msg: 'Business not found' });
    }

    // Create the new reminder
    const newReminder = {
      title,
      description,
      dueDate: dueDate ? new Date(dueDate) : null,
    };

    business.reminders.push(newReminder);
    await business.save();

    res.json({ msg: 'Reminder created successfully', reminders: business.reminders });
  } catch (error) {
    console.error('Error creating reminder:', error);
    res.status(500).json({ msg: 'Server error creating reminder' });
  }
};

// PUT /api/reminders/:reminderId
exports.updateReminder = async (req, res) => {
  try {
    const businessId = req.business.id;
    const { reminderId } = req.params;
    const { title, description, dueDate } = req.body;

    const business = await Business.findById(businessId);
    if (!business) {
      return res.status(404).json({ msg: 'Business not found' });
    }

    const reminder = business.reminders.id(reminderId);
    if (!reminder) {
      return res.status(404).json({ msg: 'Reminder not found' });
    }

    // Update fields if provided
    if (title !== undefined) reminder.title = title;
    if (description !== undefined) reminder.description = description;
    if (dueDate !== undefined) reminder.dueDate = new Date(dueDate);

    await business.save();

    res.json({ msg: 'Reminder updated successfully', reminders: business.reminders });
  } catch (error) {
    console.error('Error updating reminder:', error);
    res.status(500).json({ msg: 'Server error updating reminder' });
  }
};

// DELETE /api/reminders/:reminderId
exports.deleteReminder = async (req, res) => {
  try {
    const businessId = req.business.id;
    const { reminderId } = req.params;

    const business = await Business.findById(businessId);
    if (!business) {
      return res.status(404).json({ msg: 'Business not found' });
    }

    // Use Mongoose subdocument removal
    const reminder = business.reminders.id(reminderId);
    if (!reminder) {
      return res.status(404).json({ msg: 'Reminder not found' });
    }

    reminder.remove();
    await business.save();

    res.json({ msg: 'Reminder deleted successfully', reminders: business.reminders });
  } catch (error) {
    console.error('Error deleting reminder:', error);
    res.status(500).json({ msg: 'Server error deleting reminder' });
  }
};
