const express = require('express');
const router = express.Router();
const Event = require('../models/event');
const { authMiddleware } = require('../middleware/authMiddleware');
const QRCode = require('qrcode');
const { bookTicket, getMyTickets } = require('../controllers/ticketController');
const Ticket = require("../models/ticket"); // ← استخدمنا نفس الاسم مثل schema

// حجز تذكرة
router.post('/:id', authMiddleware, bookTicket);

// عرض تذاكر المستخدم
router.get('/my', authMiddleware, getMyTickets);

// حذف تذكرة
router.delete("/:id", authMiddleware, async (req, res) => {
    try {
        // نحذف التذكرة
        const ticket = await Ticket.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
        if (!ticket) {
            return res.status(404).json({ message: "Ticket not found or you are not authorized" });
        }

        // تحديث عدد التذاكر المحجوزة في الحدث
        const event = await Event.findById(ticket.eventId);
        if (event) {
            event.bookedSeats = Math.max(0, (event.bookedSeats || 0) - 1); // نقص bookedTickets
            event.totalTickets = (event.totalSeats || 0) + 1; //
            await event.save();
        }

        res.json({ message: "Ticket deleted successfully" });
    } catch (err) {
        console.error("DELETE TICKET ERROR:", err);
        res.status(500).json({ message: err.message });
    }
});



module.exports = router;
