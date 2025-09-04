require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

// Import Routes
const eventsRoutes = require("./routes/eventRoutes");
const authRoutes = require("./routes/authRoutes");
const bookingRoutes = require("./routes/booking");
const adminRoutes = require("./routes/admin");
const userRoutes = require("./routes/userRoutes");

const app = express();

// ✅ Middleware
app.use(express.json());
app.use(cors());

// ✅ Routes
app.use("/api/auth", authRoutes);
app.use("/api/events", eventsRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/users", userRoutes);

// ✅ MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// Extra Mongoose Events
mongoose.connection.on("connected", () => {
  console.log("✅ Mongoose connected successfully");
});

mongoose.connection.on("error", (err) => {
  console.error("❌ Mongoose error:", err);
});

// ✅ Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
