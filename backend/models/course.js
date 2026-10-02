const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Tên khóa học không được để trống"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Mô tả khóa học không được để trống"],
    },
    fee: {
      type: Number, // Đảm bảo kiểu dữ liệu là Number thay vì String
      default: 0,
    },
    schedule: {
      type: String,
      default: "Linh hoạt",
    },
    // --- 3 TRƯỜNG BỔ SUNG NẰM Ở ĐÂY ---
    instructor: {
      type: String,
      default: "Đang cập nhật",
    },
    duration: {
      type: String,
      default: "Đang cập nhật",
    },
    detailContent: {
      type: String,
      default: "",
    },
    startDate: {
      type: String, // Lưu dưới dạng chuỗi YYYY-MM-DD để dễ tương thích với thẻ <input type="date">
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Course", courseSchema);
