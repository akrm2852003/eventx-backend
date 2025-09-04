// models/Event.js
const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  date: { type: String, required: true },
  time: String,
  venue: String,
  price: { type: Number, required: true },
  totalSeats: { type: Number, required: true },
  bookedSeats: { type: Number, default: 0 },
  reservedSeats: { type: [Number], default: [] },
  status: {
    type: String,
    enum: ["upcoming", "pending", "closed"],
    default: "upcoming"
  },
  popularity: { type: Number, default: 0 } // ✅ نسبة الشعبية
}, { timestamps: true });

  
  // virtual: seatsAvailable
  eventSchema.virtual('seatsAvailable').get(function () {
      return this.totalSeats - (this.reservedSeats?.length || 0);
  });
  
  eventSchema.set('toJSON', { virtuals: true });
  module.exports = mongoose.model('Event', eventSchema);

