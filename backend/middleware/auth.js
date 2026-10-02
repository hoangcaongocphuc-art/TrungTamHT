const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "super_secret_key_123";

/**
 * 1. Middleware Xác thực Token (Authentication)
 * Kiểm tra xem request có gửi kèm Bearer Token hợp lệ hay không.
 */
const verifyToken = (req, res, next) => {
  // Lấy token từ header Authorization (dạng: "Bearer <TOKEN>")
  const authHeader =
    req.headers["authorization"] || req.headers["Authorization"];
  const token =
    authHeader && authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : null;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Truy cập bị từ chối. Không tìm thấy Token xác thực!",
    });
  }

  try {
    // Giải mã và kiểm tra tính hợp lệ của Token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Gán thông tin user đã giải mã vào req.user để các middleware/route sau sử dụng
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: "Token không hợp lệ hoặc đã hết hạn!",
    });
  }
};

/**
 * 2. Middleware Phân quyền Admin (Authorization)
 * Đảm bảo user đã đăng nhập có vai trò là "admin".
 */
const requireAdmin = (req, res, next) => {
  // req.user được gán từ middleware verifyToken trước đó
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message:
        "Quyền truy cập bị từ chối. Yêu cầu quyền quản trị viên (Admin)!",
    });
  }
  next();
};

module.exports = {
  verifyToken,
  requireAdmin,
};
