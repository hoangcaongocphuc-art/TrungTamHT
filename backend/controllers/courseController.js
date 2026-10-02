const Course = require("../models/course"); // Giả định Model Course Mongoose

// 🌐 Lấy danh sách khóa học (Có phân trang & tìm kiếm)
exports.getAllCourses = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 6;
    const search = req.query.search || "";

    const query = search ? { title: { $regex: search, $options: "i" } } : {};

    const total = await Course.countDocuments(query);
    const courses = await Course.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({
      success: true,
      data: courses,
      page,
      totalPages: Math.ceil(total / limit),
      total,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Không thể tải danh sách khóa học!",
      error: error.message,
    });
  }
};

// 🌐 Lấy chi tiết 1 khóa học
exports.getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy khóa học!" });
    }
    res.json(course);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy dữ liệu khóa học!",
      error: error.message,
    });
  }
};

// 🔒 [ADMIN] Thêm khóa học mới
exports.createCourse = async (req, res) => {
  try {
    const {
      title,
      description,
      schedule,
      fee,
      instructor,
      duration,
      detailContent,
      startDate,
    } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: "Tên khóa học và mô tả là bắt buộc!",
      });
    }

    const newCourse = new Course({
      title,
      description,
      schedule,
      fee,
      instructor,
      duration,
      detailContent,
      startDate,
    });
    await newCourse.save();

    res.status(201).json({
      success: true,
      message: "Tạo khóa học thành công!",
      data: newCourse,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Không thể thêm khóa học!",
      error: error.message,
    });
  }
};

// 🔒 [ADMIN] Cập nhật khóa học
exports.updateCourse = async (req, res) => {
  try {
    const course = await Course.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!course) {
      return res
        .status(404)
        .json({ success: false, message: "Khóa học không tồn tại!" });
    }
    res.json({
      success: true,
      message: "Cập nhật khóa học thành công!",
      data: course,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi khi cập nhật khóa học!",
      error: error.message,
    });
  }
};

// 🔒 [ADMIN] Xóa khóa học
exports.deleteCourse = async (req, res) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);
    if (!course) {
      return res
        .status(404)
        .json({ success: false, message: "Khóa học không tồn tại!" });
    }
    res.json({ success: true, message: "Đã xóa khóa học thành công!" });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi khi xóa khóa học!",
      error: error.message,
    });
  }
};
