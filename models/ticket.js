// models/Ticket.js
const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    seatNumber: { type: Number, required: true }, // بدل seats
    qrCode: { type: String, required: true },
    bookedAt: { type: Date, default: Date.now },
    paymentStatus: { type: String, enum: ['paid', 'failed', 'pending'], default: 'paid' }
}, { timestamps: true });

module.exports = mongoose.model('Ticket', ticketSchema);
