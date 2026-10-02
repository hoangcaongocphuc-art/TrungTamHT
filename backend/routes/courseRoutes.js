const { verifyToken, requireAdmin } = require("../middleware/auth");
const express = require("express");
const router = express.Router();
const Course = require("../models/course");
const {
  getAllCourses,
  createCourse,
  updateCourse,
  deleteCourse,
} = require("../controllers/courseController");

// API: Lấy danh sách khóa học (Có Phân trang & Tìm kiếm)
router.get("/", getAllCourses, async (req, res) => {
  try {
    // Lấy các tham số từ URL (Mặc định: trang 1, 10 bài/trang)
    const { page = 1, limit = 10, search = "" } = req.query;

    // Tạo điều kiện tìm kiếm: Lọc tiêu đề có chứa từ khóa (không phân biệt hoa/thường)
    const query = search ? { title: { $regex: search, $options: "i" } } : {};

    // Tìm kiếm, bỏ qua các bài cũ, và giới hạn số lượng bài trả về
    const courses = await Course.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    // Đếm tổng số bài thỏa mãn điều kiện để tính tổng số trang
    const total = await Course.countDocuments(query);

    res.json({
      data: courses,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
      totalItems: total,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
// API 2: Đăng khóa học mới (Dành cho Admin)
router.post("/", verifyToken, requireAdmin, createCourse, async (req, res) => {
  const course = new Course({
    title: req.body.title,
    description: req.body.description,
    schedule: req.body.schedule,
  });
  try {
    const newCourse = await course.save();
    res.status(201).json(newCourse);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});
// API: Xóa khóa học theo ID
router.delete(
  "/:id",
  verifyToken,
  requireAdmin,
  deleteCourse,
  async (req, res) => {
    try {
      // Tìm và xóa dữ liệu dựa trên ID do MongoDB tự tạo
      await Course.findByIdAndDelete(req.params.id);
      res.json({ message: "Đã xóa khóa học thành công" });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },
);
// API: Cập nhật khóa học theo ID
router.put(
  "/:id",
  verifyToken,
  requireAdmin,
  updateCourse,
  async (req, res) => {
    try {
      // Tham số { new: true } giúp trả về dữ liệu mới sau khi đã cập nhật
      const updatedCourse = await Course.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true },
      );
      res.json(updatedCourse);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  },
);
// API: Lấy chi tiết 1 khóa học (Mọi người đều xem được)
router.get("/:id", async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course)
      return res.status(404).json({ message: "Không tìm thấy khóa học" });
    res.json(course);
  } catch (err) {
    res.status(500).json({ message: "Lỗi định dạng ID" });
  }
});
module.exports = router;
