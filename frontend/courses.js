const API_URL = "http://localhost:5000/api";
let currentSearchKeyword = "";

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

// Vẽ nút phân trang
function renderPagination(totalPages, currentPage, elementId, fetchFunction) {
  const ul = document.getElementById(elementId);
  ul.innerHTML = "";
  if (totalPages <= 1) return;
  for (let i = 1; i <= totalPages; i++) {
    const li = document.createElement("li");
    li.className = `page-item ${i === currentPage ? "active" : ""}`;
    li.innerHTML = `<button class="page-link shadow-none">${i}</button>`;
    li.onclick = () => fetchFunction(i);
    ul.appendChild(li);
  }
}

// Lấy danh sách Khóa học
async function fetchCourses(page = 1) {
  try {
    const encodedSearch = encodeURIComponent(currentSearchKeyword);
    const response = await fetch(
      `${API_URL}/courses?page=${page}&limit=6&search=${encodedSearch}`,
    );
    const result = await response.json();
    const courseList = document.getElementById("course-list");
    courseList.innerHTML = "";

    if (result.data.length === 0) {
      courseList.innerHTML = `
        <div class="col-12 text-center py-5">
            <p class="fs-5 text-muted">Không tìm thấy khóa học nào phù hợp với từ khóa "${currentSearchKeyword}".</p>
        </div>`;
      document.getElementById("course-pagination").innerHTML = "";
      return;
    }

    result.data.forEach((course) => {
      const col = document.createElement("div");
      col.className = "col-md-6 col-lg-4 mb-4";
      col.innerHTML = `
        <div class="card h-100 shadow-sm border-0">
            <div class="card-body p-4">
                <span class="badge bg-primary-subtle text-primary mb-2">Khóa học</span>
                <h5 class="card-title text-primary fw-bold mb-3">${course.title}</h5>
                <p class="card-text text-secondary mb-4">${course.description}</p>
            </div>
            <div class="card-footer bg-white border-0 pt-0 pb-4 px-4">
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <small class="text-danger fw-bold">📅 ${course.schedule}</small>
                    <small class="text-success fw-bold">${formatCurrency(course.fee)}</small>
                </div>
                <a href="course-detail.html?id=${course._id}" class="btn btn-outline-primary w-100 fw-bold rounded-pill">Xem chi tiết</a>
            </div>
        </div>
      `;
      courseList.appendChild(col);
    });

    renderPagination(
      result.totalPages,
      result.currentPage,
      "course-pagination",
      fetchCourses,
    );
  } catch (error) {
    console.error("Lỗi khi tải khóa học:", error);
  }
}

// Sự kiện Tìm kiếm
document
  .getElementById("search-course-form")
  .addEventListener("submit", function (e) {
    e.preventDefault();
    currentSearchKeyword = document
      .getElementById("search-keyword")
      .value.trim();
    if (currentSearchKeyword) {
      document.getElementById("reset-search").classList.remove("d-none");
    }
    fetchCourses(1);
  });

// Sự kiện Nút Xóa Tìm kiếm
document.getElementById("reset-search").addEventListener("click", function () {
  document.getElementById("search-keyword").value = "";
  currentSearchKeyword = "";
  this.classList.add("d-none");
  fetchCourses(1);
});

// Đóng Menu Mobile khi click ra ngoài
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

// Khởi chạy
fetchCourses();
