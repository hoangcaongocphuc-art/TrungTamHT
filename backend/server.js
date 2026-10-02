require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // Cho phép đọc dữ liệu JSON gửi lên

// Kết nối Database
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Đã kết nối với Database"))
  .catch((err) => console.log("❌ Lỗi kết nối DB:", err));

// Khai báo các đường dẫn API
const courseRoutes = require("./routes/courseRoutes");
app.use("/api/courses", courseRoutes);

const newsRoutes = require("./routes/newsRoutes");
app.use("/api/news", newsRoutes);

const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authRoutes);

const consultationRoutes = require("./routes/consultationRoutes");

app.use("/api/consultations", consultationRoutes);

// --- THÊM ĐOẠN NÀY TRƯỚC PHẦN APP.LISTEN ---
// Trỏ ra thư mục frontend (dùng path.join để lùi ra ngoài rồi vào thư mục frontend)
// Ví dụ từ thư mục backend lùi ra 1 cấp (..) rồi vào thư mục frontend:
app.use(express.static(path.join(__dirname, "../frontend")));
// ------------------------------------------
// Chạy server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
});
