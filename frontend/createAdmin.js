const isStrongPassword = (password) => {
  // At least 8 chars, one uppercase, one lowercase, one number, one special
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/.test(password);
};

document.addEventListener("DOMContentLoaded", () => {
  const adminForm = document.getElementById("admin-form");
  const otpForm = document.getElementById("otp-form");
  const message = document.getElementById("message");
  const otpMessage = document.getElementById("otp-message");

  let tempData = {};

  adminForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirm-password")?.value;

    message.textContent = "";

    if (!isStrongPassword(password)) {
      message.textContent =
        "Password must be at least 8 characters long, with uppercase, lowercase, number, and special character.";
      return;
    }

    if (confirmPassword && password !== confirmPassword) {
      message.textContent = "Passwords do not match.";
      return;
    }

    try {
      const res = await fetch("http://127.0.0.1:8000/api/admin/createAdmin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();
      console.log(data);
      

      if (!res.ok) {
        message.textContent = data.error || "Failed to send OTP.";
        return;
      }

      tempData = { name, email, password }; // Save for OTP step
      message.textContent = "OTP sent to your email.";
      otpForm.style.display = "block";
    } catch (err) {
      message.textContent = "Network/server error.";
    }
  });

  otpForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const otp = document.getElementById("otp").value.trim();
    otpMessage.textContent = "";

    if (!/^\d{6}$/.test(otp)) {
      otpMessage.textContent = "OTP must be 6 digits.";
      return;
    }

    try {
      const res = await fetch("http://127.0.0.1:8000/api/admin/createAdmin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...tempData, otp }),
      });

      const data = await res.json();

      if (!res.ok) {
        otpMessage.textContent = data.error || "OTP verification failed.";
        return;
      }

      otpMessage.textContent = "✅ Admin created successfully!";
      adminForm.reset();
      otpForm.reset();
    } catch (err) {
      otpMessage.textContent = "Server error.";
    }
  });
});
