const express = require("express");
const router = express.Router();
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// API: Đăng ký Admin (Bạn chỉ dùng 1 lần để tạo tài khoản)
router.post("/register", async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const newUser = new User({
      username: req.body.username,
      password: hashedPassword,
    });
    await newUser.save();
    res.status(201).json({ message: "Tạo tài khoản thành công" });
  } catch (err) {
    res.status(400).json({ message: "Lỗi tạo tài khoản" });
  }
});

// API: Đăng nhập (Đã bổ sung role vào Token)
router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ username: req.body.username });
    if (!user) return res.status(400).json({ message: "Sai tên đăng nhập" });

    const isMatch = await bcrypt.compare(req.body.password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Sai mật khẩu" });

    // 👉 ĐÃ THÊM role VÀ username VÀO TOKEN TẠI ĐÂY:
    const token = jwt.sign(
      {
        id: user._id,
        username: user.username,
        role: user.role,
      },
      process.env.JWT_SECRET || "super_secret_key_123",
      { expiresIn: "1d" },
    );

    res.json({
      token,
      message: "Đăng nhập thành công",
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
