const express = require('express');
const router = express.Router();
const Event = require('../models/event');
const { authMiddleware, isAdmin } = require('../middleware/authMiddleware');
const { getAllEvents, getEventById } = require('../controllers/eventsController');

router.get('/', getAllEvents);
router.get('/:id', getEventById);
// CREATE Event (Admin only)
router.post('/', authMiddleware, isAdmin, async (req, res) => {
    try {
        const newEvent = new Event({
            title: req.body.title,
            description: req.body.description,
            date: req.body.date,       // متأكد إنها "YYYY-MM-DD"
            time: req.body.time,
            venue: req.body.venue,
            price: req.body.price,
            totalSeats: req.body.totalSeats
        });

        await newEvent.save();
        console.log('Saved Event:', newEvent);
        res.status(201).json(newEvent);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to create event' });
    }
});

// UPDATE Event (Admin only)
router.put('/:id', authMiddleware, isAdmin, async (req, res) => {
    try {
        const updatedEvent = await Event.findByIdAndUpdate(
            req.params.id,
            {
                title: req.body.title,
                description: req.body.description,
                date: req.body.date,   // "YYYY-MM-DD"
                time: req.body.time,
                venue: req.body.venue,
                price: req.body.price,
                totalSeats: req.body.totalSeats
            },
            { new: true }
        );

        if (!updatedEvent) return res.status(404).json({ message: 'Event not found' });
        res.json(updatedEvent);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to update event' });
    }
});


// ✅ DELETE Event
router.delete('/:id', authMiddleware, isAdmin, async (req, res) => {
    try {
        const deletedEvent = await Event.findByIdAndDelete(req.params.id);
        if (!deletedEvent) return res.status(404).json({ message: 'Event not found' });
        res.json({ message: 'Event deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to delete event' });
    }
});

module.exports = router;
