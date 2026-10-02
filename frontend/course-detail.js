const API_URL = "http://localhost:5000/api";

// Hàm định dạng tiền VNĐ
function formatCurrency(amount) {
  if (
    amount === "miễn phí" ||
    (!amount && amount !== 0) ||
    amount === 0 ||
    amount === "0"
  ) {
    return "Miễn phí";
  }
  const numericValue = parseInt(amount.toString().replace(/\D/g, ""), 10);
  return isNaN(numericValue)
    ? "Miễn phí"
    : numericValue.toLocaleString("vi-VN") + " VNĐ";
}

async function loadCourseDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  const courseId = urlParams.get("id");
  const container = document.getElementById("course-detail-container");

  if (!courseId) {
    container.innerHTML = `<div class="alert alert-danger text-center">Không tìm thấy mã khóa học!</div>`;
    return;
  }

  try {
    const response = await fetch(`${API_URL}/courses/${courseId}`);
    if (!response.ok) throw new Error("Không tìm thấy dữ liệu");
    const course = await response.json();

    container.innerHTML = `
      <div class="col-lg-8 mb-4">
          <div class="card shadow-sm border-0">
              <div class="card-body p-4 p-md-5">
                  <a href="courses.html" class="text-decoration-none fw-bold text-primary mb-3 d-inline-block">⬅ Quay lại danh sách khóa học</a>
                  <h1 class="text-primary fw-bold mb-3">${course.title}</h1>
                  <p class="lead text-secondary mb-4">${course.description}</p>
                  <h4 class="border-bottom pb-2 mb-3 fw-bold">Nội dung chương trình học</h4>
                  <div class="text-dark" style="line-height: 1.8;">
                      ${course.detailContent ? course.detailContent.replace(/\n/g, "<br>") : "Chương trình học đang được cập nhật..."} 
                  </div>
              </div>
          </div>
      </div>
      <div class="col-lg-4">
          <div class="card shadow-sm border-0 border-top border-primary border-4 sticky-top" style="top: 90px;">
              <div class="card-body p-4">
                  <h4 class="mb-4 fw-bold">Thông tin khóa học</h4>
                  <div class="d-flex mb-3 align-items-center">
                      <span class="fs-4 me-3">👨‍🏫</span>
                      <div>
                          <small class="text-muted d-block">Giảng viên</small>
                          <strong class="text-dark">${course.instructor || "Đang cập nhật"}</strong>
                      </div>
                  </div>
                  <div class="d-flex mb-3 align-items-center">
                      <span class="fs-4 me-3">⏳</span>
                      <div>
                          <small class="text-muted d-block">Thời lượng</small>
                          <strong class="text-dark">${course.duration || "Đang cập nhật"}</strong>
                      </div>
                  </div>
                  <div class="d-flex mb-3 align-items-center">
                      <span class="fs-4 me-3">📅</span>
                      <div>
                          <small class="text-muted d-block">Lịch học</small>
                          <strong class="text-dark">${course.schedule}</strong>
                      </div>
                  </div>
                  <div class="d-flex mb-4 align-items-center">
                      <span class="fs-4 me-3">💰</span>
                      <div>
                          <small class="text-muted d-block">Học phí</small>
                          <strong class="text-success fs-5">${formatCurrency(course.fee)}</strong>
                      </div>
                  </div>
                  <button class="btn btn-primary w-100 py-2 fw-bold fs-5 shadow-sm rounded-pill">Đăng ký học ngay</button>
              </div>
          </div>
      </div>
    `;
  } catch (error) {
    container.innerHTML = `<div class="alert alert-danger text-center">Khóa học này không tồn tại hoặc đã bị xóa.</div>`;
  }
}

// Tự động đóng Menu Mobile khi click ra ngoài
document.addEventListener("click", function (event) {
  const navbarCollapse = document.getElementById("navbarNav");
  const navbarToggler = document.querySelector(".navbar-toggler");
  if (navbarCollapse && navbarCollapse.classList.contains("show")) {
    if (
      !navbarCollapse.contains(event.target) &&
      !navbarToggler.contains(event.target)
    ) {
      const bsCollapse =
        bootstrap.Collapse.getInstance(navbarCollapse) ||
        new bootstrap.Collapse(navbarCollapse);
      bsCollapse.hide();
    }
  }
});

loadCourseDetail();
