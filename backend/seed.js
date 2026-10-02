require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/user");
const Course = require("./models/course");
const News = require("./models/news");

const MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/educenter";

const seedData = async () => {
  try {
    // 1. Kết nối MongoDB
    await mongoose.connect(MONGO_URI);
    console.log("✅ Đã kết nối cơ sở dữ liệu MongoDB thành công.");

    // 2. Làm sạch dữ liệu cũ
    await User.deleteMany({});
    await Course.deleteMany({});
    await News.deleteMany({});
    console.log("🗑️  Đã dọn dẹp dữ liệu cũ.");

    // 3. Tạo tài khoản Admin mặc định
    // Sử dụng .save() để kích hoạt middleware pre('save') tự động mã hóa mật khẩu trong User.js
    const adminUser = new User({
      username: "admin",
      password: "admin123",
      role: "admin",
    });
    await adminUser.save();
    console.log("👤 Đã tạo tài khoản Admin mặc định:");
    console.log("   - Username: admin");
    console.log("   - Password: admin123");

    // 4. Tạo dữ liệu mẫu Khóa học
    const courses = [
      {
        title: "Lập Trình Web Full-Stack MERN",
        description:
          "Học lập trình web từ cơ bản đến nâng cao với MongoDB, Express.js, React.js và Node.js.",
        fee: "3.500.000 VNĐ",
        schedule: "Thứ 2 - 4 - 6 (18:30 - 21:00)",
      },
      {
        title: "Thiết Kế Giao Diện UI/UX Chuyên Nghiệp",
        description:
          "Làm chủ Figma, thiết kế giao diện ứng dụng di động và website đáp ứng tiêu chuẩn trải nghiệm người dùng.",
        fee: "2.800.000 VNĐ",
        schedule: "Thứ 3 - 5 - 7 (19:00 - 21:00)",
      },
      {
        title: "Lập Trình Python & Phân Tích Dữ Liệu",
        description:
          "Trang bị kiến thức xử lý dữ liệu, phân tích cơ bản và trực quan hóa dữ liệu với Python và Pandas.",
        fee: "3.200.000 VNĐ",
        schedule: "Chủ Nhật (08:30 - 11:30)",
      },
      {
        title: "Khóa Học DevOps & Docker Cho Người Mới",
        description:
          "Nắm vững khái niệm CI/CD, đóng gói ứng dụng với Docker và triển khai hệ thống lên đám mây.",
        fee: "4.000.000 VNĐ",
        schedule: "Thứ 2 - 4 (19:30 - 21:30)",
      },
    ];
    await Course.insertMany(courses);
    console.log("📚 Đã thêm dữ liệu mẫu Khóa học.");

    // 5. Tạo dữ liệu mẫu Tin tức
    const newsList = [
      {
        title: "Lễ Khai Giảng Khóa Học Mới Tháng 10",
        content:
          "EduCenter vui mừng chào đón các tân học viên tham gia chuỗi chương trình đào tạo công nghệ chất lượng cao. Khóa học hứa hẹn mang đến nhiều trải nghiệm thực tế và cơ hội việc làm hấp dẫn.",
        author: "Ban Biên Tập EduCenter",
        imageUrl:
          "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=800&q=80",
      },
      {
        title: "Hội Thảo: Định Hướng Nghề Nghiệp Ngành IT 2026",
        content:
          "Buổi chia sẻ với các chuyên gia hàng đầu về xu hướng tuyển dụng, các kỹ năng quan trọng mà doanh nghiệp đang tìm kiếm ở ứng viên ngành phần mềm trong năm nay.",
        author: "CLB Hướng Nghiệp",
        imageUrl:
          "https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=800&q=80",
      },
      {
        title: 'Chương Trình Học Bổng "Ươm Mầm Tài Năng Công Nghệ"',
        content:
          "EduCenter chính thức mở cổng nhận hồ sơ xét duyệt 20 suất học bổng toàn phần dành cho sinh viên có thành tích học tập xuất sắc và niềm đam mê lập trình.",
        author: "Phòng Đào Tạo",
        imageUrl:
          "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80",
      },
    ];
    await News.insertMany(newsList);
    console.log("📰 Đã thêm dữ liệu mẫu Tin tức.");

    console.log("🎉 Khởi tạo dữ liệu seed thành công!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Lỗi khi khởi tạo dữ liệu:", error);
    process.exit(1);
  }
};

seedData();
