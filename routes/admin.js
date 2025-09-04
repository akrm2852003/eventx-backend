// routes/admin.js
const express = require('express');
const { Parser } = require('json2csv');
const router = express.Router();
const Event = require('../models/event');
const Ticket = require('../models/ticket');
const User = require('../models/user');
const { authMiddleware, isAdmin } = require('../middleware/authMiddleware');

router.get("/age-vs-tickets", async (req, res) => {
    try {
      const data = await Ticket.aggregate([
        {
          $lookup: {
            from: "users", 
            localField: "userId",
            foreignField: "_id",
            as: "user"
          }
        },
        { $unwind: "$user" },
        {
          $group: {
            _id: "$user.age", 
            ticketsCount: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } } 
      ]);
  
      res.json(
        data.map(item => ({
          age: item._id,
          tickets: item.ticketsCount
        }))
      );
    } catch (err) {
      console.error("Error fetching age vs tickets:", err);
      res.status(500).json({ message: "Server error" });
    }
  });

router.get('/export-csv', authMiddleware, isAdmin, async (req, res) => {
    try {
      const tickets = await Ticket.find()
        .populate('userId', 'name email age gender location interests')
        .populate('eventId', 'title date venue price');
  
      const data = tickets.map(t => ({
        ticketId: t._id,
        eventTitle: t.eventId?.title || '',
        eventDate: t.eventId?.date instanceof Date ? t.eventId.date.toISOString().split('T')[0] : '',
        eventVenue: t.eventId?.venue || '',
        userName: t.userId?.name || '',
        userEmail: t.userId?.email || '',
        userAge: t.userId?.age || '',
        userGender: t.userId?.gender || '',
        userLocation: t.userId?.location || '',
        userInterests: Array.isArray(t.userId?.interests) ? t.userId.interests.join('; ') : '',
        price: t.eventId?.price || 0,
        bookedAt: t.bookedAt instanceof Date ? t.bookedAt.toISOString() : '',
      }));
  
      console.log("CSV Export Data Sample:", data[0]);
  
      const fields = ['ticketId', 'eventTitle', 'eventDate', 'eventVenue', 'userName', 'userEmail', 'userAge', 'userGender', 'userLocation', 'userInterests', 'price', 'bookedAt'];
      const json2csvParser = new Parser({ fields });
      const csv = json2csvParser.parse(data);
  
      res.header('Content-Type', 'text/csv');
      res.attachment('tickets_report.csv');
      return res.send(csv);
  
    } catch (err) {
      console.error('Export CSV Error:', err);
      res.status(500).json({ message: 'Failed to export CSV', error: err.message });
    }
  });
  
//  Admin Analytics Summary
router.get('/dashboard-summary', authMiddleware, isAdmin, async (req, res) => {
    try {
      const totalEvents = await Event.countDocuments();
      const totalTickets = await Ticket.countDocuments();
  
      const revenue = await Ticket.aggregate([
        {
          $lookup: {
            from: 'events',
            localField: 'eventId',
            foreignField: '_id',
            as: 'event',
          },
        },
        { $unwind: '$event' },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$event.price' }, 
          },
        },
      ]);
  
      res.json({
        totalEvents,
        totalTickets,
        totalRevenue: revenue[0]?.totalRevenue || 0,
      });
    } catch (err) {
      res.status(500).json({ message: 'Failed to load analytics', error: err.message });
    }
  });
  
  //  Audience Stats Route
  router.get('/audience-stats', authMiddleware, isAdmin, async (req, res) => {
    try {
      const tickets = await Ticket.find().populate('userId', 'age gender interests location');
  
      const stats = {
        ageGroups: {},
        gender: {},
        location: {},
        interests: {},
      };
  
      tickets.forEach(ticket => {
        const user = ticket.userId;
        if (!user) return; // safety
  
        //  Age Group
        if (user.age) {
          let group = '';
          if (user.age < 18) group = '<18';
          else if (user.age < 25) group = '18-24';
          else if (user.age < 35) group = '25-34';
          else if (user.age < 45) group = '35-44';
          else group = '45+';
          stats.ageGroups[group] = (stats.ageGroups[group] || 0) + 1;
        }
  
        // 👤 Gender
        if (user.gender) {
          stats.gender[user.gender] = (stats.gender[user.gender] || 0) + 1;
        }
  
        // 🌍 Location
        if (user.location) {
          stats.location[user.location] = (stats.location[user.location] || 0) + 1;
        }
  
        // 🎯 Interests
        if (user.interests && user.interests.length > 0) {
          user.interests.forEach(interest => {
            stats.interests[interest] = (stats.interests[interest] || 0) + 1;
          });
        }
      });
  
      res.json(stats);
    } catch (err) {
      res.status(500).json({ message: 'Failed to load audience stats', error: err.message });
    }
  });
  
module.exports = router;