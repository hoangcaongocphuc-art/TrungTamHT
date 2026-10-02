const API_URL = "/api";

document
  .getElementById("login-form")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const alertBox = document.getElementById("login-alert");

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Lưu token vào bộ nhớ trình duyệt
        localStorage.setItem("token", data.token);

        alertBox.innerHTML = `<div class="alert alert-success">Đăng nhập thành công! Đang chuyển hướng...</div>`;

        // Chuyển sang trang Admin sau 1 giây
        setTimeout(() => {
          window.location.href = "admin.html";
        }, 1000);
      } else {
        alertBox.innerHTML = `<div class="alert alert-danger">${data.message}</div>`;
      }
    } catch (error) {
      alertBox.innerHTML = `<div class="alert alert-danger">Lỗi kết nối đến máy chủ!</div>`;
    }
  });
