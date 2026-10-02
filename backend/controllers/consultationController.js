const Consultation = require("../models/consultation");

exports.createConsultation = async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone || !/^[0-9]{10}$/.test(phone)) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Số điện thoại không hợp lệ (10 chữ số)!",
        });
    }

    const newConsultation = new Consultation({ phone });
    await newConsultation.save();

    res
      .status(201)
      .json({ success: true, message: "Đăng ký tư vấn thành công!" });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Lỗi máy chủ!", error: error.message });
  }
};
