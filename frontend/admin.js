// ==========================================
// 1. KIỂM TRA ĐĂNG NHẬP, UI/UX & BẢO MẬT
// ==========================================
const token = localStorage.getItem("token");
if (!token) {
  alert("Vui lòng đăng nhập để truy cập trang quản trị!");
  window.location.href = "login.html";
}
const API_URL = "http://localhost:5000/api";

// [UX/UI MỚI]: Cấu hình SweetAlert2 thành dạng Toast (Góc trên bên phải)
const Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.addEventListener("mouseenter", Swal.stopTimer);
    toast.addEventListener("mouseleave", Swal.resumeTimer);
  },
});

// [UX/UI MỚI]: Hàm xử lý trạng thái Loading cho nút Submit
function toggleButtonLoading(formId, isLoading) {
  const form = document.getElementById(formId);
  if (!form) return;
  const btn = form.querySelector('button[type="submit"]');
  if (!btn) return;

  if (isLoading) {
    btn.dataset.originalText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Đang xử lý...`;
  } else {
    btn.disabled = false;
    btn.innerHTML = btn.dataset.originalText;
  }
}

function logout() {
  Swal.fire({
    title: "Bạn muốn đăng xuất?",
    icon: "question",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "Đăng xuất",
    cancelButtonText: "Hủy",
  }).then((result) => {
    if (result.isConfirmed) {
      localStorage.removeItem("token");
      window.location.href = "login.html";
    }
  });
}

function handleAuthError() {
  Swal.fire(
    "Hết phiên!",
    "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!",
    "error",
  ).then(() => {
    localStorage.removeItem("token");
    window.location.href = "login.html";
  });
}

// ==========================================
// 2. KHỞI TẠO QUILLJS (TRÌNH SOẠN THẢO)
// ==========================================
const toolbarOptions = [
  ["bold", "italic", "underline", "strike"],
  ["blockquote", "code-block"],
  [{ header: [1, 2, 3, false] }],
  [{ list: "ordered" }, { list: "bullet" }],
  [{ color: [] }, { background: [] }],
  ["link", "image"],
  ["clean"],
];

const quillCourseAdd = new Quill("#course-detail-editor", {
  theme: "snow",
  modules: { toolbar: toolbarOptions },
});
const quillCourseEdit = new Quill("#edit-course-detail-editor", {
  theme: "snow",
  modules: { toolbar: toolbarOptions },
});
const quillNewsAdd = new Quill("#news-editor", {
  theme: "snow",
  modules: { toolbar: toolbarOptions },
});
const quillNewsEdit = new Quill("#edit-news-editor", {
  theme: "snow",
  modules: { toolbar: toolbarOptions },
});

// ==========================================
// 2.1 HÀM TIỆN ÍCH CHUNG
// ==========================================
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

// Lọc chữ lấy số từ input form
function parseNumberFromInput(val) {
  if (!val || /miễn phí/i.test(val)) return 0;
  return parseInt(val.toString().replace(/\D/g, ""), 10) || 0;
}

// ==========================================
// 3. QUẢN LÝ KHÓA HỌC (API)
// ==========================================
let currentCourses = [];

// 3.1 Load danh sách khóa học
async function loadAdminCourses() {
  try {
    const response = await fetch(`${API_URL}/courses`);
    const result = await response.json();
    currentCourses = result.data;
    const tbody = document.getElementById("admin-course-list");
    tbody.innerHTML = "";

    // [UX/UI MỚI]: Báo Empty State nếu không có khóa học
    if (currentCourses.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted py-4">Chưa có khóa học nào trên hệ thống</td></tr>`;
      return;
    }

    currentCourses.forEach((course) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
          <td class="fw-bold">${course.title}</td>
          <td>${course.instructor || "Đang cập nhật"}</td>
          <td>${course.schedule}</td>
          <td class="fw-bold text-success">${formatCurrency(course.fee)}</td>
          <td class="text-center">
              <button class="btn btn-sm btn-warning me-1" onclick="openEditCourseModal('${course._id}')">✏️</button>
              <button class="btn btn-sm btn-danger" onclick="deleteCourse('${course._id}')">🗑️</button>
          </td>
      `;
      tbody.appendChild(tr);
    });
  } catch (error) {
    console.error("Lỗi khi tải danh sách khóa học:", error);
  }
}

// 3.2 KIỂM TRA TỪNG TRƯỜNG (Giữ nguyên 100% của bạn)
function validateTitle() {
  const input = document.getElementById("title");
  const errorDiv = document.getElementById("title-error");
  if (!input) return false;
  const isValid = input.value.trim().length >= 5;
  toggleError(input, errorDiv, isValid);
  return isValid;
}

function validateInstructor() {
  const input = document.getElementById("instructor");
  const errorDiv = document.getElementById("instructor-error");
  if (!input) return false;
  const isValid = input.value.trim().length > 0;
  toggleError(input, errorDiv, isValid);
  return isValid;
}

function validateDescription() {
  const input = document.getElementById("description");
  const errorDiv = document.getElementById("description-error");
  if (!input) return false;
  const isValid = input.value.trim().length >= 10;
  toggleError(input, errorDiv, isValid);
  return isValid;
}

function validateFee() {
  const input = document.getElementById("fee");
  const errorDiv = document.getElementById("fee-error");
  if (!input) return false;
  const val = input.value.trim();
  const regex = /^(miễn phí|[\d.,]+)$/i;
  const isValid = val !== "" && regex.test(val);
  toggleError(input, errorDiv, isValid);
  return isValid;
}

function validateDuration() {
  const input = document.getElementById("duration");
  const errorDiv = document.getElementById("duration-error");
  if (!input) return false;
  const isValid = input.value.trim().length > 0;
  toggleError(input, errorDiv, isValid);
  return isValid;
}

function validateSchedule() {
  const input = document.getElementById("schedule");
  const errorDiv = document.getElementById("schedule-error");
  if (!input) return false;
  const isValid = input.value.trim().length > 0;
  toggleError(input, errorDiv, isValid);
  return isValid;
}

function validateStartDate() {
  const input = document.getElementById("startDate");
  const errorDiv = document.getElementById("startDate-error");
  if (!input) return false;
  const val = input.value;
  if (!val) {
    toggleError(input, errorDiv, false);
    return false;
  }
  const selectedDate = new Date(val);
  selectedDate.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const isValid = selectedDate >= today;
  toggleError(input, errorDiv, isValid);
  return isValid;
}

function validateDetailContent() {
  const text = quillCourseAdd.getText().trim();
  const errorDiv = document.getElementById("editor-error");
  const qlContainer = quillCourseAdd.container;
  if (text.length === 0) {
    qlContainer.style.borderColor = "#dc3545";
    if (errorDiv) errorDiv.style.display = "block";
    return false;
  } else {
    qlContainer.style.borderColor = "#ccc";
    if (errorDiv) errorDiv.style.display = "none";
    return true;
  }
}

function toggleError(input, errorDiv, isValid) {
  if (!isValid) {
    input.classList.remove("is-valid");
    input.classList.add("is-invalid");
    if (errorDiv) errorDiv.style.display = "block";
  } else {
    input.classList.remove("is-invalid");
    input.classList.add("is-valid");
    if (errorDiv) errorDiv.style.display = "none";
  }
}

function updateScheduleInput() {
  const days = document.getElementById("schedule-preset-days").value;
  const time = document.getElementById("schedule-preset-time").value;
  const scheduleInput = document.getElementById("schedule");
  if (days && time) {
    scheduleInput.value = `${days} | ${time}`;
  } else if (days) {
    scheduleInput.value = days;
  } else if (time) {
    scheduleInput.value = time;
  } else {
    scheduleInput.value = "";
  }
  validateSchedule();
}

// Bắt sự kiện Gõ phím
document.getElementById("title").addEventListener("input", validateTitle);
document
  .getElementById("instructor")
  .addEventListener("input", validateInstructor);
document
  .getElementById("description")
  .addEventListener("input", validateDescription);
document.getElementById("duration").addEventListener("input", validateDuration);
document.getElementById("schedule").addEventListener("input", validateSchedule);
document
  .getElementById("startDate")
  .addEventListener("change", validateStartDate);
document
  .getElementById("schedule-preset-days")
  .addEventListener("change", updateScheduleInput);
document
  .getElementById("schedule-preset-time")
  .addEventListener("change", updateScheduleInput);

// Định dạng trực tiếp khi gõ học phí
document.getElementById("fee").addEventListener("input", function (e) {
  let value = e.target.value;
  if (/^[\d.,]+$/.test(value)) {
    let rawNumber = value.replace(/\D/g, "");
    if (rawNumber !== "") {
      e.target.value = new Intl.NumberFormat("vi-VN").format(rawNumber);
    } else {
      e.target.value = "";
    }
  }
  validateFee();
});

quillCourseAdd.on("text-change", function () {
  validateDetailContent();
});

// BẮT SỰ KIỆN SUBMIT THÊM KHÓA HỌC
document
  .getElementById("add-course-form")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    const isTitleValid = validateTitle();
    const isDescriptionValid = validateDescription();
    const isInstructorValid = validateInstructor();
    const isDurationValid = validateDuration();
    const isScheduleValid = validateSchedule();
    const isStartDateValid = validateStartDate();
    const isFeeValid = validateFee();
    const isDetailValid = validateDetailContent();

    if (
      !isTitleValid ||
      !isDescriptionValid ||
      !isInstructorValid ||
      !isDurationValid ||
      !isScheduleValid ||
      !isStartDateValid ||
      !isFeeValid ||
      !isDetailValid
    ) {
      if (!isTitleValid) document.getElementById("title").focus();
      else if (!isDescriptionValid)
        document.getElementById("description").focus();
      else if (!isInstructorValid)
        document.getElementById("instructor").focus();
      else if (!isStartDateValid) document.getElementById("startDate").focus();
      else if (!isDurationValid) document.getElementById("duration").focus();
      else if (!isScheduleValid) document.getElementById("schedule").focus();
      else if (!isFeeValid) document.getElementById("fee").focus();
      else if (!isDetailValid) quillCourseAdd.focus();
      return;
    }

    const addForm = document.getElementById("add-course-form");
    const rawFeeInput = addForm.querySelector("#fee").value;

    const courseData = {
      title: addForm.querySelector("#title").value,
      description: addForm.querySelector("#description").value,
      schedule: addForm.querySelector("#schedule").value,
      instructor: addForm.querySelector("#instructor").value,
      duration: addForm.querySelector("#duration").value,
      fee: parseNumberFromInput(rawFeeInput), // Chuyển thành SỐ trước khi lưu
      startDate: addForm.querySelector("#startDate").value,
      detailContent: quillCourseAdd.root.innerHTML,
    };

    toggleButtonLoading("add-course-form", true); // [UX MỚI] Bật hiệu ứng loading nút

    try {
      const response = await fetch(`${API_URL}/courses`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(courseData),
      });

      if (response.status === 401) return handleAuthError();
      if (response.ok) {
        Toast.fire({ icon: "success", title: "Đăng khóa học thành công!" }); // [UX MỚI] Thay popup bằng Toast

        addForm.reset();
        quillCourseAdd.root.innerHTML = "";
        const fieldsToReset = [
          "title",
          "description",
          "instructor",
          "duration",
          "schedule",
          "startDate",
          "fee",
        ];
        fieldsToReset.forEach((id) => {
          const inputEl = document.getElementById(id);
          const errorEl = document.getElementById(`${id}-error`);
          if (inputEl) inputEl.classList.remove("is-valid", "is-invalid");
          if (errorEl) errorEl.style.display = "none";
        });
        quillCourseAdd.container.style.borderColor = "#ccc";
        document.getElementById("editor-error").style.display = "none";

        loadAdminCourses();
      }
    } catch (error) {
      console.error("Lỗi:", error);
      Toast.fire({ icon: "error", title: "Có lỗi xảy ra khi đăng bài!" });
    } finally {
      toggleButtonLoading("add-course-form", false); // [UX MỚI] Tắt hiệu ứng loading
    }
  });

// 3.3 Mở form sửa khóa học (Giữ nguyên)
function openEditCourseModal(id) {
  const course = currentCourses.find((c) => c._id === id);
  if (!course) return;

  document.getElementById("edit-course-id").value = course._id;
  document.getElementById("edit-title").value = course.title;
  document.getElementById("edit-description").value = course.description;
  document.getElementById("edit-schedule").value = course.schedule;
  document.getElementById("edit-instructor").value = course.instructor || "";
  document.getElementById("edit-duration").value = course.duration || "";

  const editFeeInput = document.getElementById("edit-fee");
  if (editFeeInput) {
    if (course.fee === "miễn phí" || course.fee === 0) {
      editFeeInput.value = "miễn phí";
    } else if (course.fee) {
      editFeeInput.value = formatCurrency(course.fee);
    } else {
      editFeeInput.value = "";
    }
  }

  const editStartDate = document.getElementById("edit-startDate");
  if (editStartDate) editStartDate.value = course.startDate || "";
  quillCourseEdit.root.innerHTML = course.detailContent || "";

  const editModal = new bootstrap.Modal(
    document.getElementById("editCourseModal"),
  );
  editModal.show();
}

// 3.4 Lưu khóa học đã sửa
document
  .getElementById("edit-course-form")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    const id = document.getElementById("edit-course-id").value;
    let rawEditFee = "";
    if (document.getElementById("edit-fee")) {
      rawEditFee = document.getElementById("edit-fee").value;
    } else if (document.getElementById("fee")) {
      rawEditFee = document.getElementById("fee").value;
    }

    const updatedData = {
      title: document.getElementById("edit-title").value,
      description: document.getElementById("edit-description").value,
      schedule: document.getElementById("edit-schedule").value,
      instructor: document.getElementById("edit-instructor").value,
      duration: document.getElementById("edit-duration").value,
      fee: parseNumberFromInput(rawEditFee),
      startDate: document.getElementById("edit-startDate").value,
      detailContent: quillCourseEdit.root.innerHTML,
    };

    toggleButtonLoading("edit-course-form", true);

    try {
      const response = await fetch(`${API_URL}/courses/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedData),
      });

      if (response.status === 401) return handleAuthError();
      if (response.ok) {
        const modalElement = document.getElementById("editCourseModal");
        const modalInstance = bootstrap.Modal.getInstance(modalElement);
        modalInstance.hide();

        Toast.fire({ icon: "success", title: "Cập nhật khóa học thành công!" }); // [UX MỚI]
        loadAdminCourses();
      }
    } catch (error) {
      console.error("Lỗi khi sửa:", error);
      Toast.fire({ icon: "error", title: "Không thể cập nhật!" });
    } finally {
      toggleButtonLoading("edit-course-form", false);
    }
  });

// 3.5 Xóa khóa học
async function deleteCourse(id) {
  Swal.fire({
    title: "Bạn có chắc chắn muốn xóa?",
    text: "Hành động này sẽ xóa khóa học vĩnh viễn khỏi Database!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#6c757d",
    confirmButtonText: "Đồng ý xóa",
    cancelButtonText: "Hủy",
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        const response = await fetch(`${API_URL}/courses/${id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.status === 401) return handleAuthError();
        if (response.ok) {
          Toast.fire({ icon: "success", title: "Khóa học đã bị xóa!" }); // [UX MỚI]
          loadAdminCourses();
        }
      } catch (error) {
        console.error("Lỗi khi xóa:", error);
      }
    }
  });
}

// ==========================================
// 4. QUẢN LÝ TIN TỨC (API)
// ==========================================
let currentNews = [];

async function loadAdminNews() {
  try {
    const response = await fetch(`${API_URL}/news`);
    const result = await response.json();
    currentNews = result.data;
    const tbody = document.getElementById("admin-news-list");
    tbody.innerHTML = "";

    // [UX/UI MỚI]: Báo Empty State nếu không có tin tức
    if (currentNews.length === 0) {
      tbody.innerHTML = `<tr><td colspan="4" class="text-center text-muted py-4">Chưa có tin tức nào trên hệ thống</td></tr>`;
      return;
    }

    currentNews.forEach((news) => {
      const formattedDate = new Date(news.createdAt).toLocaleDateString(
        "vi-VN",
      );
      const tr = document.createElement("tr");
      tr.innerHTML = `
          <td class="fw-bold text-truncate" style="max-width: 200px;">${news.title}</td>
          <td>${news.author || "Admin"}</td>
          <td>${formattedDate}</td>
          <td class="text-center">
              <button class="btn btn-sm btn-info text-white me-1" onclick="openEditNewsModal('${news._id}')">✏️</button>
              <button class="btn btn-sm btn-danger" onclick="deleteNews('${news._id}')">🗑️</button>
          </td>
      `;
      tbody.appendChild(tr);
    });
  } catch (error) {
    console.error("Lỗi tải tin tức:", error);
  }
}

document
  .getElementById("add-news-form")
  .addEventListener("submit", async function (e) {
    e.preventDefault();
    const newsData = {
      title: document.getElementById("news-title").value,
      imageUrl: document.getElementById("news-image").value,
      author: document.getElementById("news-author").value || "Admin",
      content: quillNewsAdd.root.innerHTML,
    };

    toggleButtonLoading("add-news-form", true);
    try {
      const response = await fetch(`${API_URL}/news`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newsData),
      });
      if (response.status === 401) return handleAuthError();
      if (response.ok) {
        Toast.fire({ icon: "success", title: "Đăng tin bài thành công!" }); // [UX MỚI]
        document.getElementById("add-news-form").reset();
        quillNewsAdd.root.innerHTML = "";
        loadAdminNews();
      }
    } catch (error) {
      console.error("Lỗi đăng tin:", error);
      Toast.fire({ icon: "error", title: "Có lỗi xảy ra khi đăng tin!" });
    } finally {
      toggleButtonLoading("add-news-form", false);
    }
  });

function openEditNewsModal(id) {
  const newsItem = currentNews.find((n) => n._id === id);
  if (!newsItem) return;
  document.getElementById("edit-news-id").value = newsItem._id;
  document.getElementById("edit-news-title").value = newsItem.title;
  document.getElementById("edit-news-image").value = newsItem.imageUrl || "";
  document.getElementById("edit-news-author").value = newsItem.author;
  quillNewsEdit.root.innerHTML = newsItem.content || "";
  const editModal = new bootstrap.Modal(
    document.getElementById("editNewsModal"),
  );
  editModal.show();
}

document
  .getElementById("edit-news-form")
  .addEventListener("submit", async function (e) {
    e.preventDefault();
    const id = document.getElementById("edit-news-id").value;
    const updatedData = {
      title: document.getElementById("edit-news-title").value,
      imageUrl: document.getElementById("edit-news-image").value,
      author: document.getElementById("edit-news-author").value,
      content: quillNewsEdit.root.innerHTML,
    };

    toggleButtonLoading("edit-news-form", true);
    try {
      const response = await fetch(`${API_URL}/news/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedData),
      });
      if (response.status === 401) return handleAuthError();
      if (response.ok) {
        const modalElement = document.getElementById("editNewsModal");
        const modalInstance = bootstrap.Modal.getInstance(modalElement);
        modalInstance.hide();
        Toast.fire({ icon: "success", title: "Đã cập nhật tin tức!" }); // [UX MỚI]
        loadAdminNews();
      }
    } catch (error) {
      console.error("Lỗi khi sửa tin tức:", error);
    } finally {
      toggleButtonLoading("edit-news-form", false);
    }
  });

async function deleteNews(id) {
  Swal.fire({
    title: "Xóa bài viết này?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#6c757d",
    confirmButtonText: "Xóa",
    cancelButtonText: "Hủy",
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        const response = await fetch(`${API_URL}/news/${id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.status === 401) return handleAuthError();
        if (response.ok) {
          Toast.fire({ icon: "success", title: "Bài viết đã bị xóa!" }); // [UX MỚI]
          loadAdminNews();
        }
      } catch (error) {
        console.error("Lỗi khi xóa:", error);
      }
    }
  });
}

// ==========================================
// 6. KHỞI CHẠY KHI TẢI TRANG
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
  loadAdminCourses();
  loadAdminNews();
});
