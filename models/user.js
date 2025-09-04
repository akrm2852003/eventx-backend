const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },

    // ✅ للـ Dashboard Analytics
    age: { type: Number },  // العمر
    gender: { type: String, enum: ['male', 'female'] },
    location: { type: String }, // المدينة أو البلد
    interests: {type: [String], default: []} // اهتمامات (array of strings)
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);

