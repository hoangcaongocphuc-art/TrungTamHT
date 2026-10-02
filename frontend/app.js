const API_URL = "http://localhost:5000/api";

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

// 1. Tải 3 Khóa học mới nhất (Giao diện nâng cấp)
async function fetchLatestCourses() {
  const container = document.getElementById("latest-courses");
  if (!container) return;

  try {
    const response = await fetch(`${API_URL}/courses?page=1&limit=3`);
    const result = await response.json();

    container.innerHTML = "";

    if (!result.data || result.data.length === 0) {
      container.innerHTML =
        '<div class="col-12 text-muted text-center py-4">Chưa có khóa học nào được cập nhật.</div>';
      return;
    }

    result.data.forEach((course) => {
      const col = document.createElement("div");
      col.className = "col-md-4 mb-4";

      // Ảnh bìa mặc định nếu khóa học chưa có ảnh
      const imageSrc =
        course.imageUrl ||
        "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80";

      const formattedFee = formatCurrency(course.fee || "Miễn phí");

      col.innerHTML = `
        <div class="card h-100 border-0 shadow-sm rounded-4 overflow-hidden course-card hover-lift bg-white">
          <!-- Ảnh bìa + Thẻ Badge -->
          <div class="position-relative">
            <img src="${imageSrc}" class="card-img-top object-fit-cover" style="height: 190px;" alt="${course.title}">
            <span class="badge bg-success position-absolute top-0 end-0 m-3 px-3 py-2 rounded-pill shadow-sm">
              Đang mở lớp
            </span>
          </div>

          <!-- Nội dung khóa học -->
          <div class="card-body p-4 d-flex flex-column">
            <div class="d-flex align-items-center gap-2 mb-2">
              <span class="badge bg-primary-subtle text-primary fw-semibold px-2.5 py-1">
                ${course.category || "Khóa ngắn hạn"}
              </span>
              <small class="text-muted ms-auto">⏱️ ${course.duration || "Nhiều buổi"}</small>
            </div>

            <h5 class="card-title text-dark fw-bold mb-2 line-clamp-2">
              ${course.title}
            </h5>
            
            <p class="card-text text-secondary small line-clamp-2 mb-4">
              ${course.description || "Khóa học trang bị kiến thức thực tế và kỹ năng ứng dụng cao cho học viên."}
            </p>

            <!-- Lịch học & Học phí -->
            <div class="mt-auto pt-3 border-top d-flex justify-content-between align-items-center">
              <div>
                <small class="text-muted d-block" style="font-size: 0.75rem;">HỌC PHÍ</small>
                <span class="fw-bold text-danger fs-6">${formattedFee}</span>
              </div>
              <div class="text-end">
                <small class="text-muted d-block" style="font-size: 0.75rem;">LỊCH HỌC</small>
                <small class="fw-semibold text-dark">📅 ${course.schedule || "Linh hoạt"}</small>
              </div>
            </div>
          </div>

          <!-- Nút hành động -->
          <div class="card-footer bg-white border-0 p-4 pt-0">
            <div class="row g-2">
              <div class="col-12">
                <a href="course-detail.html?id=${course._id}" class="btn btn-primary w-100 fw-bold rounded-pill shadow-sm">
                  Xem chi tiết & Đăng ký
                </a>
              </div>
            </div>
          </div>
        </div>
      `;
      container.appendChild(col);
    });
  } catch (error) {
    console.error("Lỗi khi tải khóa học mới nhất:", error);
    container.innerHTML =
      '<div class="col-12 text-danger text-center py-4">Không thể kết nối đến máy chủ.</div>';
  }
}

// 2. Tải Tin tức mới nhất (Đổ vào Bố cục 2 Cột mới)
async function fetchLatestNews() {
  const featuredContainer = document.getElementById("featured-news");
  const sidebarContainer = document.getElementById("news-sidebar-list");

  // Nếu không thấy container mới thì dừng
  if (!featuredContainer && !sidebarContainer) return;

  try {
    // Lấy 4 bài tin mới nhất (1 bài tiêu điểm + 3 bài cột phải)
    const response = await fetch(`${API_URL}/news?page=1&limit=4`);
    const result = await response.json();

    const newsList = result.data || [];

    if (newsList.length === 0) {
      if (featuredContainer)
        featuredContainer.innerHTML =
          '<div class="text-muted p-4">Chưa có tin tức.</div>';
      if (sidebarContainer)
        sidebarContainer.innerHTML =
          '<div class="text-muted p-3">Chưa có tin tức.</div>';
      return;
    }

    // --- A. Bài tin tiêu điểm (Nằm bên trái - Item đầu tiên) ---
    const featured = newsList[0];
    if (featuredContainer && featured) {
      const formattedDate = featured.createdAt
        ? new Date(featured.createdAt).toLocaleDateString("vi-VN")
        : "Mới cập nhật";
      const imageSrc =
        featured.imageUrl ||
        "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=80";

      featuredContainer.innerHTML = `
        <div class="card border-0 shadow-sm rounded-4 overflow-hidden h-100 hover-lift bg-white">
          <div class="position-relative">
            <img src="${imageSrc}" class="card-img-top object-fit-cover" style="height: 280px;" alt="${featured.title}">
            <span class="badge bg-danger position-absolute top-0 start-0 m-3 px-3 py-2 rounded-pill">Sự kiện hot</span>
          </div>
          <div class="card-body p-4 d-flex flex-column">
            <div class="text-muted small mb-2">📅 ${formattedDate} • ✍️ ${featured.author || "Ban Biên Tập"}</div>
            <h4 class="card-title fw-bold text-dark mb-3">${featured.title}</h4>
            <p class="card-text text-muted line-clamp-2">${featured.content}</p>
            <div class="mt-auto pt-3 border-top d-flex justify-content-between align-items-center">
              <span class="badge bg-primary-subtle text-primary">Nổi bật</span>
              <a href="news-detail.html?id=${featured._id}" class="fw-bold text-primary text-decoration-none">Đọc chi tiết ➔</a>
            </div>
          </div>
        </div>
      `;
    }

    // --- B. Danh sách tin phụ (Nằm cột bên phải - Các items còn lại) ---
    if (sidebarContainer) {
      sidebarContainer.innerHTML = "";
      const sideItems = newsList.slice(1); // Lấy từ bài thứ 2 đến thứ 4

      if (sideItems.length === 0) {
        sidebarContainer.innerHTML =
          '<p class="text-muted small p-2">Chưa có tin tức khác.</p>';
      } else {
        sideItems.forEach((item) => {
          const formattedDate = item.createdAt
            ? new Date(item.createdAt).toLocaleDateString("vi-VN")
            : "Mới cập nhật";
          const imageSrc =
            item.imageUrl ||
            "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=200&q=80";

          const newsLink = document.createElement("a");
          newsLink.href = `news-detail.html?id=${item._id}`;
          newsLink.className =
            "news-sidebar-item text-decoration-none text-dark d-flex gap-3 align-items-center p-2 rounded-3";
          newsLink.innerHTML = `
            <img src="${imageSrc}" class="rounded-3 object-fit-cover flex-shrink-0" style="width: 85px; height: 75px;" alt="${item.title}">
            <div>
              <small class="text-muted d-block mb-1">📅 ${formattedDate}</small>
              <h6 class="fw-bold mb-0 text-dark line-clamp-2" style="font-size: 0.95rem; line-height: 1.4;">${item.title}</h6>
            </div>
          `;
          sidebarContainer.appendChild(newsLink);
        });
      }
    }
  } catch (error) {
    console.error("Lỗi khi tải tin tức mới nhất:", error);
  }
}

// 3. Xử lý Gửi Form Tư Vấn Nhanh (Section 5)
function setupConsultationForm() {
  const form = document.getElementById("formConsultation");
  if (!form) return;

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const phoneInput = document.getElementById("phoneInput");
    const phone = phoneInput ? phoneInput.value.trim() : "";
    const submitBtn = form.querySelector("button[type='submit']");

    if (!phone) return;

    submitBtn.disabled = true;
    const originalBtnText = submitBtn.innerHTML;
    submitBtn.innerHTML =
      '<span class="spinner-border spinner-border-sm" role="status"></span> Đang gửi...';

    try {
      const response = await fetch(`${API_URL}/consultations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        alert(
          "✅ Đã gửi yêu cầu thành công! Cán bộ trung tâm sẽ gọi điện tư vấn cho bạn sớm.",
        );
        form.reset();
      } else {
        alert("❌ " + (result.message || "Đã xảy ra lỗi, vui lòng thử lại!"));
      }
    } catch (err) {
      console.error("Lỗi kết nối tư vấn:", err);
      alert("❌ Không thể kết nối tới máy chủ!");
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnText;
    }
  });
}

// 4. Đóng Menu Mobile khi click ra ngoài
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

// Khởi chạy khi trang chủ tải xong
document.addEventListener("DOMContentLoaded", () => {
  fetchLatestCourses();
  fetchLatestNews();
  setupConsultationForm();
});
