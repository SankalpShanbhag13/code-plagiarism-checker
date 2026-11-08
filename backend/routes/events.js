const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Event = require('../models/Event');

// @route   GET /api/events
// @desc    Get all coding events
// @access  Public
router.get('/', async (req, res) => {
  try {
    const events = await Event.find().populate('organizer', 'username email').sort({ date: 1 });
    res.json(events);
  } catch (err) {
    console.error('Fetch events error:', err.message);
    res.status(500).json({ message: 'Server error fetching events' });
  }
});

// @route   GET /api/events/:id
// @desc    Get single coding event by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate('organizer', 'username email');
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.json(event);
  } catch (err) {
    console.error('Fetch single event error:', err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.status(500).json({ message: 'Server error fetching event' });
  }
});

// @route   POST /api/events
// @desc    Create a new coding event
// @access  Private (Protected)
router.post('/', auth, async (req, res) => {
  const { title, description, date, difficulty, location, tags } = req.body;

  try {
    if (!title || !description || !date || !difficulty) {
      return res.status(400).json({ message: 'Please enter all required fields (title, description, date, difficulty)' });
    }

    const newEvent = new Event({
      title,
      description,
      date,
      difficulty,
      location: location || 'Virtual',
      tags: tags || [],
      organizer: req.user.id,
    });

    const event = await newEvent.save();
    
    // Populate organizer info for response
    const populatedEvent = await Event.findById(event._id).populate('organizer', 'username email');

    res.status(201).json(populatedEvent);
  } catch (err) {
    console.error('Create event error:', err.message);
    res.status(500).json({ message: 'Server error creating event' });
  }
});

// @route   PUT /api/events/:id
// @desc    Update an existing coding event
// @access  Private (Protected)
router.put('/:id', auth, async (req, res) => {
  const { title, description, date, difficulty, location, tags } = req.body;

  try {
    let event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check organizer authority (only the creator can edit)
    if (event.organizer && event.organizer.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized to update this event' });
    }

    if (title) event.title = title;
    if (description) event.description = description;
    if (date) event.date = date;
    if (difficulty) event.difficulty = difficulty;
    if (location !== undefined) event.location = location;
    if (tags !== undefined) event.tags = tags;

    await event.save();
    
    const populatedEvent = await Event.findById(event._id).populate('organizer', 'username email');

    res.json(populatedEvent);
  } catch (err) {
    console.error('Update event error:', err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.status(500).json({ message: 'Server error updating event' });
  }
});

// @route   DELETE /api/events/:id
// @desc    Delete a coding event
// @access  Private (Protected)
router.delete('/:id', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check organizer authority (only the creator can delete)
    if (event.organizer && event.organizer.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized to delete this event' });
    }

    await Event.findByIdAndDelete(req.params.id);

    res.json({ message: 'Event removed successfully' });
  } catch (err) {
    console.error('Delete event error:', err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.status(500).json({ message: 'Server error deleting event' });
  }
});

module.exports = router;
