const mongoose = require("mongoose");

const newsSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Tiêu đề tin tức không được để trống"],
      trim: true,
    },
    content: {
      type: String,
      required: [true, "Nội dung tin tức không được để trống"],
    },
    author: {
      type: String,
      default: "Ban Biên Tập",
    },
    imageUrl: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("News", newsSchema);
