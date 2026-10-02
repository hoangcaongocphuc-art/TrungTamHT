const API_URL = "http://localhost:5000/api";
let currentSearchKeyword = "";

// Vẽ thanh phân trang
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

// Lấy danh sách Tin tức (Hiển thị 6 bài viết / trang)
async function fetchNews(page = 1) {
  try {
    const encodedSearch = encodeURIComponent(currentSearchKeyword);
    const response = await fetch(
      `${API_URL}/news?page=${page}&limit=6&search=${encodedSearch}`,
    );
    const result = await response.json();

    const newsList = document.getElementById("news-list");
    newsList.innerHTML = "";

    if (!result.data || result.data.length === 0) {
      newsList.innerHTML = `
                <div class="col-12 text-center py-5">
                    <p class="fs-5 text-muted">Không tìm thấy bài viết nào phù hợp với từ khóa "${currentSearchKeyword}".</p>
                </div>`;
      document.getElementById("news-pagination").innerHTML = "";
      return;
    }

    result.data.forEach((item) => {
      const col = document.createElement("div");
      col.className = "col-md-6 col-lg-4";

      // Cắt ngắn nội dung hiển thị tóm tắt
      const shortContent =
        item.content.length > 100
          ? item.content.substring(0, 100) + "..."
          : item.content;
      const formattedDate = item.createdAt
        ? new Date(item.createdAt).toLocaleDateString("vi-VN")
        : "Mới cập nhật";

      // Hình ảnh mặc định nếu bài viết không có ảnh
      const imageHTML = item.imageUrl
        ? `<img src="${item.imageUrl}" class="card-img-top news-card-img" alt="${item.title}">`
        : `<div class="bg-secondary bg-opacity-10 news-card-img d-flex align-items-center justify-content-center text-secondary fs-4">📰 EduNews</div>`;

      col.innerHTML = `
                <div class="card h-100 shadow-sm border-0 news-card" onclick="window.location.href='news-detail.html?id=${item._id}'">
                    ${imageHTML}
                    <div class="card-body p-4">
                        <div class="d-flex justify-content-between align-items-center mb-2">
                            <span class="badge bg-success-subtle text-success">Tin tức</span>
                            <small class="text-muted">📅 ${formattedDate}</small>
                        </div>
                        <h5 class="card-title text-dark fw-bold mb-3">${item.title}</h5>
                        <p class="card-text text-secondary mb-0">${shortContent}</p>
                    </div>
                    <div class="card-footer bg-white border-0 pb-4 px-4 pt-0">
                        <small class="text-muted">✍️ Tác giả: <strong>${item.author || "Ban Biển Tập"}</strong></small>
                    </div>
                </div>
            `;
      newsList.appendChild(col);
    });

    renderPagination(
      result.totalPages,
      result.currentPage,
      "news-pagination",
      fetchNews,
    );
  } catch (error) {
    console.error("Lỗi khi tải danh sách tin tức:", error);
  }
}
// Xử lý sự kiện Tìm kiếm
document
  .getElementById("search-news-form")
  .addEventListener("submit", function (e) {
    e.preventDefault();
    currentSearchKeyword = document
      .getElementById("search-keyword")
      .value.trim();

    if (currentSearchKeyword) {
      document.getElementById("reset-search").classList.remove("d-none");
    }

    fetchNews(1);
  });

// Xử lý Nút Xóa Tìm kiếm
document.getElementById("reset-search").addEventListener("click", function () {
  document.getElementById("search-keyword").value = "";
  currentSearchKeyword = "";
  this.classList.add("d-none");
  fetchNews(1);
});

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

// Khởi chạy khi load trang
fetchNews();
