const Event = require('../models/event');


function startOfDay(d) {
const x = new Date(d);
x.setHours(0, 0, 0, 0);
return x;
}
function endOfDay(d) {
const x = new Date(d);
x.setHours(23, 59, 59, 999);
return x;
}


// GET /api/events?status=upcoming|active|closed&search=foo
exports.getAllEvents = async (req, res, next) => {
try {
const { status, search } = req.query;
const now = new Date();
const filter = {};


if (search) {
filter.title = { $regex: search, $options: 'i' };
}


if (status === 'upcoming') {
filter.date = { $gt: now };
} else if (status === 'closed') {
filter.date = { $lt: now };
} else if (status === 'active') {
filter.date = { $gte: startOfDay(now), $lte: endOfDay(now) };
}


const events = await Event.find(filter).sort({ date: 1 });
return res.json(events);
} catch (err) {
next(err);
}
};


// GET /api/events/:id
exports.getEventById = async (req, res, next) => {
try {
const event = await Event.findById(req.params.id);
if (!event) return res.status(404).json({ message: 'Event not found' });
return res.json(event);
} catch (err) {
next(err);
}
};