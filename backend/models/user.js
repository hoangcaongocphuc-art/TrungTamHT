const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Tên đăng nhập là bắt buộc"],
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Mật khẩu là bắt buộc"],
    },
    role: {
      type: String,
      enum: ["user", "admin"], // Chỉ cho phép 2 quyền này
      default: "user", // Mặc định tạo tài khoản là user
    },
  },
  {
    timestamps: true, // Tự động thêm createdAt và updatedAt
  },
);

// Middleware Mongoose: Mã hóa mật khẩu tự động trước khi lưu nếu mật khẩu thay đổi
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

module.exports = mongoose.model("User", userSchema);
