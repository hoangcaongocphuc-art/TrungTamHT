const express = require("express");
const router = express.Router();
const { verifyToken, requireAdmin } = require("../middleware/auth");
const {
  getAllNews,
  getNewsById,
  createNews,
  updateNews,
  deleteNews,
} = require("../controllers/newsController");

// Lấy danh sách tin tức (Công khai - Hỗ trợ phân trang & tìm kiếm)
router.get("/", getAllNews);

// Lấy chi tiết 1 bài viết (Công khai)
router.get("/:id", getNewsById);

// Các thao tác Quản trị (Yêu cầu Admin)
router.post("/", verifyToken, requireAdmin, createNews);
router.put("/:id", verifyToken, requireAdmin, updateNews);
router.delete("/:id", verifyToken, requireAdmin, deleteNews);

module.exports = router;
