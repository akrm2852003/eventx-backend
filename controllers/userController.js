const User = require("../models/user");
const bcrypt = require("bcryptjs");
// ✅ لازم function متصدرة صح
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
exports.updateUserProfile = async (req, res) => {
    try {
      const user = await User.findById(req.user.id);
      if (!user) return res.status(404).json({ message: "User not found" });
  
      // تحديث الاسم
      if (req.body.name) user.name = req.body.name;
  
      // تحديث الإيميل مع التحقق
      if (req.body.email && req.body.email !== user.email) {
        const emailExists = await User.findOne({ email: req.body.email });
        if (emailExists) return res.status(400).json({ message: "Email already in use" });
        user.email = req.body.email;
      }
  
      // تحديث الباسورد مع التشفير
      if (req.body.password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(req.body.password, salt);
      }
  
      // تحديث location و gender و age
      if (req.body.location) user.location = req.body.location;
      if (req.body.gender) user.gender = req.body.gender;
      if (req.body.age) user.age = req.body.age; // ← هنا أضفنا العمر
  
      // تحديث interests (array)
      if (req.body.interests && Array.isArray(req.body.interests)) {
        user.interests = req.body.interests;
      }
  
      await user.save();
  
      res.json({
        message: "Profile updated successfully",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          location: user.location,
          gender: user.gender,
          age: user.age,         // ← عرض العمر
          interests: user.interests,
        },
      });
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ message: "Server error" });
    }
};

  


