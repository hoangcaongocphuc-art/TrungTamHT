const News = require("../models/news"); // Giả định Model News Mongoose

// 🌐 Lấy danh sách tin tức (Có phân trang & Tìm kiếm)
exports.getAllNews = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 6;
    const search = req.query.search || "";

    // Điều kiện tìm kiếm theo tiêu đề
    const query = search ? { title: { $regex: search, $options: "i" } } : {};

    const total = await News.countDocuments(query);
    const newsList = await News.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({
      success: true,
      data: newsList,
      page,
      totalPages: Math.ceil(total / limit),
      total,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Không thể tải danh sách tin tức!",
      error: error.message,
    });
  }
};
// 🌐 Lấy chi tiết bài viết
exports.getNewsById = async (req, res) => {
  try {
    const newsItem = await News.findById(req.params.id);
    if (!newsItem) {
      return res
        .status(404)
        .json({ success: false, message: "Bài viết không tồn tại!" });
    }
    res.json(newsItem);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi khi đọc bài viết!",
      error: error.message,
    });
  }
};

// 🔒 [ADMIN] Đăng bài viết mới
exports.createNews = async (req, res) => {
  try {
    const { title, content, author, imageUrl } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: "Tiêu đề và nội dung bài viết không được để trống!",
      });
    }

    const newNews = new News({ title, content, author, imageUrl });
    await newNews.save();

    res.status(201).json({
      success: true,
      message: "Đăng tin tức thành công!",
      data: newNews,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi khi tạo tin tức!",
      error: error.message,
    });
  }
};

// 🔒 [ADMIN] Chỉnh sửa bài viết
exports.updateNews = async (req, res) => {
  try {
    const newsItem = await News.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!newsItem) {
      return res
        .status(404)
        .json({ success: false, message: "Bài viết không tồn tại!" });
    }
    res.json({
      success: true,
      message: "Cập nhật tin tức thành công!",
      data: newsItem,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi khi cập nhật bài viết!",
      error: error.message,
    });
  }
};

// 🔒 [ADMIN] Xóa bài viết
exports.deleteNews = async (req, res) => {
  try {
    const newsItem = await News.findByIdAndDelete(req.params.id);
    if (!newsItem) {
      return res
        .status(404)
        .json({ success: false, message: "Bài viết không tồn tại!" });
    }
    res.json({ success: true, message: "Đã xóa bài viết thành công!" });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi khi xóa bài viết!",
      error: error.message,
    });
  }
};
