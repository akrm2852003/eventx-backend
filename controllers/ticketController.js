const QRCode = require('qrcode');
const Event = require('../models/event');
const Booking = require('../models/ticket');

// POST /api/bookings/:id { seatNumber }
exports.bookTicket = async (req, res, next) => {
  try {
    const eventId = req.params.id;
    const { seatNumber } = req.body;

    if (!eventId || !seatNumber) {
      return res.status(400).json({ message: 'Event ID and seat number are required' });
    }

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    if (seatNumber < 1 || seatNumber > event.totalSeats) {
      return res.status(400).json({ message: 'Invalid seat number' });
    }

    if (!event.reservedSeats) event.reservedSeats = [];
    if (event.reservedSeats.includes(seatNumber)) {
      return res.status(400).json({ message: 'Seat already reserved' });
    }

    // ✅ تحديث المقاعد المحجوزة
    event.reservedSeats.push(seatNumber);
    event.bookedSeats = (event.bookedSeats || 0) + 1;
    event.totalSeats = event.totalSeats - 1;
    event.popularity = Math.round((event.bookedSeats / event.totalSeats) * 100);
    await event.save();

    const qrCodeDataUrl = await QRCode.toDataURL(JSON.stringify({
      eventId: event._id,
      userId: req.user.id,
      seatNumber
    }));

    // إنشاء التذكرة
    const booking = await Booking.create({
      userId: req.user.id,
      eventId: event._id,
      seatNumber,
      qrCode: qrCodeDataUrl,
      paymentStatus: 'paid',
    });

    await booking.populate('eventId', 'title date venue price');

    return res.status(201).json({
      ...booking.toObject(),
      event: booking.eventId,
    });

  } catch (err) {
    next(err);
  }
};

// GET /api/bookings/my
exports.getMyTickets = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .populate('eventId', 'title date venue price');

    return res.json(bookings);
  } catch (err) {
    next(err);
  }
};
