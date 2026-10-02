const mongoose = require("mongoose");

const consultationSchema = new mongoose.Schema({
  phone: { type: String, required: true },
  status: { type: String, default: "pending" }, // pending: Chờ gọi, contacted: Đã tư vấn
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Consultation", consultationSchema);
