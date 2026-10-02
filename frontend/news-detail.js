const API_URL = "http://localhost:5000/api";

async function loadNewsDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  const newsId = urlParams.get("id");
  const container = document.getElementById("news-detail-container");

  if (!newsId) {
    container.innerHTML = `
            <div class="col-md-8">
                <div class="alert alert-danger text-center">Không tìm thấy mã bài viết!</div>
            </div>`;
    return;
  }

  try {
    const response = await fetch(`${API_URL}/news/${newsId}`);
    if (!response.ok) throw new Error("Không tìm thấy tin tức");

    const item = await response.json();
    const formattedDate = item.createdAt
      ? new Date(item.createdAt).toLocaleDateString("vi-VN")
      : "Mới cập nhật";
    const formattedContent = item.content
      ? item.content.replace(/\n/g, "<br><br>")
      : "";

    const imageHTML = item.imageUrl
      ? `<img src="${item.imageUrl}" class="article-img shadow-sm mb-4" alt="${item.title}">`
      : "";

    container.innerHTML = `
            <div class="col-lg-9">
                <article class="card border-0 shadow-sm p-4 p-md-5 bg-white rounded-3">
                    <div class="mb-3">
                        <span class="badge bg-success-subtle text-success px-3 py-2 rounded-pill fw-bold">Tin tức</span>
                    </div>
                    
                    <h1 class="fw-bold text-dark display-6 mb-3">${item.title}</h1>
                    
                    <div class="d-flex align-items-center text-muted mb-4 pb-3 border-bottom fs-6">
                        <span class="me-4">✍️ Tác giả: <strong class="text-dark">${item.author || "Ban Biên Tập"}</strong></span>
                        <span>📅 Ngày đăng: <strong class="text-dark">${formattedDate}</strong></span>
                    </div>

                    ${imageHTML}

                    <div class="article-content">
                        ${formattedContent}
                    </div>
                </article>
            </div>
        `;
  } catch (error) {
    container.innerHTML = `
            <div class="col-md-8">
                <div class="alert alert-danger text-center">Bài viết này không tồn tại hoặc đã bị gỡ bỏ.</div>
            </div>`;
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

loadNewsDetail();
