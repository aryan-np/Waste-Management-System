// Select inputs and form
const oldPasswordInput = document.querySelector("#old-password");
const newPasswordInput = document.querySelector("#new-password");
const confirmNewPasswordInput = document.querySelector("#confirm-new-password");
const form = document.querySelector("#changePasswordForm");

// Create and insert feedback elements dynamically
const newPasswordStrengthIndicator = document.createElement("div");
newPasswordStrengthIndicator.className = "password-strength";
newPasswordInput.parentNode.insertBefore(newPasswordStrengthIndicator, newPasswordInput.nextSibling);

const newPasswordRequirementsFeedback = document.createElement("div");
newPasswordRequirementsFeedback.className = "password-requirements-feedback";
newPasswordInput.parentNode.insertBefore(newPasswordRequirementsFeedback, newPasswordStrengthIndicator.nextSibling);

const newPasswordMatchIndicator = document.createElement("div");
newPasswordMatchIndicator.className = "password-match";
confirmNewPasswordInput.parentNode.insertBefore(newPasswordMatchIndicator, confirmNewPasswordInput.nextSibling);

// Password validation function
function validatePassword(password) {
  const minLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  let score = 0;
  if (minLength) score++;
  if (hasUppercase) score++;
  if (hasLowercase) score++;
  if (hasNumber) score++;
  if (hasSpecial) score++;

  if (password.length === 0) {
    newPasswordStrengthIndicator.style.display = "none";
    newPasswordRequirementsFeedback.style.display = "none";
    return { isValid: false, score };
  } else {
    newPasswordStrengthIndicator.style.display = "block";
    newPasswordRequirementsFeedback.style.display = "block";
  }

  let strengthText = "";
  if (score < 3) {
    strengthText = "Weak";
    newPasswordStrengthIndicator.className = "password-strength weak";
  } else if (score < 5) {
    strengthText = "Medium";
    newPasswordStrengthIndicator.className = "password-strength medium";
  } else {
    strengthText = "Strong";
    newPasswordStrengthIndicator.className = "password-strength strong";
  }

  newPasswordStrengthIndicator.textContent = strengthText;

  let feedbackText = "";
  if (!minLength) feedbackText += "• At least 8 characters<br>";
  if (!hasUppercase) feedbackText += "• One uppercase letter<br>";
  if (!hasLowercase) feedbackText += "• One lowercase letter<br>";
  if (!hasNumber) feedbackText += "• One number<br>";
  if (!hasSpecial) feedbackText += "• One special character<br>";

  newPasswordRequirementsFeedback.innerHTML = feedbackText;

  const isValid = minLength && hasUppercase && hasLowercase && hasNumber && hasSpecial;
  return { isValid, score };
}

// Check passwords match
function checkNewPasswordsMatch() {
  const newPassword = newPasswordInput.value;
  const confirmNewPassword = confirmNewPasswordInput.value;

  if (confirmNewPassword) {
    if (newPassword !== confirmNewPassword) {
      newPasswordMatchIndicator.textContent = "Passwords don't match";
      newPasswordMatchIndicator.classList.add("mismatch");
      return false;
    } else {
      newPasswordMatchIndicator.textContent = "Passwords match";
      newPasswordMatchIndicator.classList.remove("mismatch");
      return true;
    }
  } else {
    newPasswordMatchIndicator.textContent = "";
    return false;
  }
}

// Event listeners for validation
newPasswordInput.addEventListener("input", () => {
  validatePassword(newPasswordInput.value);
  if (confirmNewPasswordInput.value) {
    checkNewPasswordsMatch();
  }
});

confirmNewPasswordInput.addEventListener("input", checkNewPasswordsMatch);

// Submit handler with real API call
form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const oldPassword = oldPasswordInput.value.trim();
  const newPassword = newPasswordInput.value;
  const confirmNewPassword = confirmNewPasswordInput.value;

  // New password validation
  const passwordValidation = validatePassword(newPassword);
  if (!passwordValidation.isValid) {
    alert("⚠️ Please create a stronger new password.");
    return;
  }

  // Check new passwords match
  if (!checkNewPasswordsMatch()) {
    alert("⚠️ New passwords do not match.");
    return;
  }

  try {
    const response = await fetch("http://127.0.0.1:8000/api/user/changePassword", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // send cookies (for JWT auth)
      body: JSON.stringify({ oldPassword: oldPassword || null, newPassword }),
    });

    const data = await response.json();

    if (response.ok) {
      alert("✅ Password updated successfully!");
      form.reset();
      newPasswordStrengthIndicator.style.display = "none";
      newPasswordRequirementsFeedback.style.display = "none";
      newPasswordMatchIndicator.textContent = "";
      window
    } else {
      alert(`❌ Failed to update password: ${data.message || "Unknown error"}`);
    }
  } catch (error) {
    alert("❌ Network error or server not responding.");
    console.error(error);
  }
});
