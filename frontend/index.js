document.addEventListener("DOMContentLoaded", () => {
    const BASE_URL = "http://127.0.0.1:8000";

    const forms = {
        login: document.querySelector(".form-box.login form"),
        register: document.querySelector(".form-box.register form"),
        otp: document.querySelector(".form-box.otp form"),
        forgotPassword: document.querySelector(".form-box.forgot-password form"),
        newPassword: document.querySelector(".form-box.new-password form")
    };

    const buttons = {
        login: forms.login.querySelector(".btn"),
        register: forms.register.querySelector(".sign-up-btn"),
        verifyOtp: forms.otp.querySelector(".verify-otp"),
        forgotPassword: forms.forgotPassword.querySelector(".send-reset-link"),
        setPassword: document.querySelector(".btn.set-password"),
        resendOtp: document.querySelector(".resend-otp")
    };

    const links = {
        login: document.querySelector(".login-link"),
        register: document.querySelector(".register-link"),
        forgotPassword: document.querySelector(".forgot-password-link"),
        backToLogin: document.querySelector(".back-to-login")
    };

    let otpRoute = "";
    let otpBody = {};
    let resetEmail = ""; // to store across steps

    // Form navigation
    links.register.addEventListener("click", () => showForm("register"));
    links.login.addEventListener("click", () => showForm("login"));
    links.forgotPassword.addEventListener("click", () => showForm("forgot-password"));
    links.backToLogin.addEventListener("click", () => showForm("login"));

    // Registration form handling
   buttons.register.addEventListener("click", async (event) => {
    event.preventDefault();

    // Fetch input values
    const registerName = forms.register.querySelector("input[name='full-name']").value.trim();
    const registerEmail = forms.register.querySelector("input[name='email']").value.trim();
    const registerPassword = forms.register.querySelector("input[name='password']").value;
    const confirmPassword = forms.register.querySelector("input[name='confirmPassword']").value;
    const contact = forms.register.querySelector("input[name='number']").value.trim();

    // Frontend validation
    if (!registerName || !registerEmail || !registerPassword || !confirmPassword || !contact) {
        showPopup("⚠️ All fields are required", 3000, "#ff9800");
        return;
    }

    const passwordValidation = validatePassword(registerPassword);
    if (!passwordValidation.isValid) {
        showPopup("⚠️ Please create a stronger password", 3000, "#ff9800");
        return;
    }

    if (registerPassword !== confirmPassword) {
        showPopup("⚠️ Passwords do not match", 3000, "#f44336");
        return;
    }

    const body = {
        name: registerName,
        email: registerEmail,
        password: registerPassword,
        number: contact
    };

    try {
        const response = await axios.post(`${BASE_URL}/api/user/signup`, body, {
            withCredentials: true
        });

        console.log("Registration successful:", response.data);
        otpRoute = `${BASE_URL}/api/user/validateSignupOtp`;
        otpBody = body;

        showPopup("✅ Registration successful! Proceeding to OTP verification...", 3000);
        setTimeout(() => showForm("otp"), 1000);

    } catch (error) {
        const msg = error.response?.data?.message || error.message || "Something went wrong";
        console.error("Registration failed:", error);
        showPopup(`❌ Registration failed. ${msg}`, 3000, "#f44336");
    }
});


    // OTP handling
    const otpInputs = document.querySelectorAll(".otp-box");
    otpInputs[0].focus();

    // Auto move and backspace logic for OTP
    otpInputs.forEach((input, idx) => {
        input.addEventListener("input", () => {
            if (input.value.length === 1 && idx < otpInputs.length - 1) {
                otpInputs[idx + 1].focus();
            }
        });

        input.addEventListener("keydown", (e) => {
            if (e.key === "Backspace" && !input.value && idx > 0) {
                otpInputs[idx - 1].focus();
            }
        });
    });

    // Login form handling
    buttons.login.addEventListener("click", async (event) => {
        event.preventDefault();
    
        const loginEmail = forms.login.querySelector("input[type='email']").value;
        const loginPassword = forms.login.querySelector("input[type='password']").value;
    
        const body = {
            email: loginEmail,
            password: loginPassword
        };
    
        try {
            // 1. User login
            const response = await axios.post(`${BASE_URL}/api/user/login`, body, {
                withCredentials: true
            });
    
            console.log("Login successful:", response.data);
            showPopup("✅ Login successful! Redirecting to Dashboard...", 1000);
    
            // 2. Fetch user profile
            const profileRes = await fetch(`${BASE_URL}/api/user/profile`, {
                credentials: 'include'
            });
    
            if (!profileRes.ok) throw new Error('Could not fetch profile');
    
            const profile = await profileRes.json();
            const userRoute = profile["user Route"];
    
            // 3. Check if admin (optional, non-fatal)
            let isAdmin = false;
            let adminData = null;
            try {
                const responseAdmin = await axios.get(`${BASE_URL}/api/admin/validateAdmin`, {
                    withCredentials: true
                });
                if (responseAdmin.status === 200) {
                    isAdmin = true;
                    adminData = responseAdmin.data;
                }
            } catch (adminError) {
                // Ignore admin validation failure
                console.warn("Admin validation failed:", adminError.response?.data || adminError.message);
            }
    
            // 4. Redirect based on role
            if (isAdmin && adminData) {
                window.location.href = `admin.html?totalUsers=${adminData.totalUsers}&totalRoutes=${adminData.totalRoutes}`;
            } else {
                if (!userRoute) {
                    setTimeout(() => {
                        window.location.href = "dashboard.html?firstTime=true";
                    }, 1000);
                } else {
                    setTimeout(() => {
                        window.location.href = "dashboard.html";
                    }, 1000);
                }
            }
    
        } catch (error) {
            console.error("Login failed:", error.response?.data || error.message);
            showPopup("❌ Login failed. Please try again.", 3000, "#f44336");
        }
    });

    // Forgot password handling
    let globalResetEmail;
    buttons.forgotPassword.addEventListener("click", async (event) => {
        event.preventDefault();
        resetEmail = forms.forgotPassword.querySelector("input[type='email']").value;
        globalResetEmail=resetEmail
        const body = {
            email: resetEmail,
        };
        try {
            const response = await axios.post(`${BASE_URL}/api/user/forgotPassword`, body, {
                withCredentials: true
            });

            console.log("OTP sent:", response.data);
            otpRoute = `${BASE_URL}/api/user/verifyOtp`
            otpBody=body;
            showPopup("✅ OTP sent! Check your email", 3000);
            showForm("otp")
        } catch (error) {
            console.error("Failed to send OTP:", error.response || error);
            showPopup("❌ Failed to send OTP. Please try again.", 3000, "#f44336");
        }
    });
    buttons.resendOtp.addEventListener("click", async (event) => {
        try {
            const response = await axios.post(`${BASE_URL}/api/user/forgotPassword`, { email: globalResetEmail }, {
                withCredentials: true
            });

            console.log("OTP sent:", response.data);
            showPopup("✅ OTP sent again! Check your email", 3000);
            showForm("otp");
        } catch (error) {
            console.error("Failed to send OTP:", error.response || error);
            showPopup("❌ Failed to send OTP. Please try again.", 3000, "#f44336");
        }
    });
    // OTP verification
    buttons.verifyOtp.addEventListener("click", async (event) => {
    event.preventDefault();

    const otpCode = Array.from(otpInputs).map(input => input.value).join("");
    otpBody.otp = otpCode;

    // try {
        const response = await axios.post(otpRoute, otpBody);

        console.log("OTP Verified:", response.data);

        if (otpRoute.includes("validateSignupOtp")) {
            showPopup("✅ Signup complete! Redirecting to login...", 3000);
            setTimeout(() => showForm("login"), 1000);
        } else if (otpRoute.includes("verifyOtp")) {
            showPopup("✅ OTP Verified! Now set new password", 3000);
            setTimeout(() => showForm("new-password"), 1000);
        } else {
            showPopup("✅ OTP Verified!", 3000);
        }

    // } catch (error) {
    //     console.log("OTP verification failed:", error.response || error);
    //     showPopup("❌ Invalid OTP. Please try again.", 3000, "#f44336");
    // }
});


    // Password strength validation setup for registration form
    const passwordInput = document.querySelector(".form-box.register input[name='password']");
    const confirmPasswordInput = document.querySelector(".form-box.register input[name='confirmPassword']");
    
    // Create password strength indicator for registration
    const strengthIndicator = document.createElement("div");
    strengthIndicator.className = "password-strength";
    
    // Create requirements feedback for registration
    const requirementsFeedback = document.createElement("div");
    requirementsFeedback.className = "password-requirements-feedback";
    
    // Create container for strength and feedback for registration
    const passwordFeedbackContainer = document.createElement("div");
    passwordFeedbackContainer.className = "password-feedback-container";
    passwordFeedbackContainer.appendChild(strengthIndicator);
    passwordFeedbackContainer.appendChild(requirementsFeedback);
    
    // Insert after password input for registration
    passwordInput.parentNode.insertAdjacentElement('afterend', passwordFeedbackContainer);
    
    // Create password match indicator for registration
    const matchIndicator = document.createElement("div");
    matchIndicator.className = "password-match";
    confirmPasswordInput.parentNode.insertAdjacentElement('afterend', matchIndicator);

    // New password form elements
    const newPasswordInput = document.querySelector("#new-password");
    const confirmNewPasswordInput = document.querySelector("#confirm-new-password");
    
    // Create password strength indicator for new password
    const newPasswordStrengthIndicator = document.createElement("div");
    newPasswordStrengthIndicator.className = "password-strength";
    
    // Create requirements feedback for new password
    const newPasswordRequirementsFeedback = document.createElement("div");
    newPasswordRequirementsFeedback.className = "password-requirements-feedback";
    
    // Create container for strength and feedback for new password
    const newPasswordFeedbackContainer = document.createElement("div");
    newPasswordFeedbackContainer.className = "password-feedback-container";
    newPasswordFeedbackContainer.appendChild(newPasswordStrengthIndicator);
    newPasswordFeedbackContainer.appendChild(newPasswordRequirementsFeedback);
    
    // Insert after new password input
    newPasswordInput.parentNode.insertAdjacentElement('afterend', newPasswordFeedbackContainer);
    
    // Create password match indicator for new password
    const newPasswordMatchIndicator = document.createElement("div");
    newPasswordMatchIndicator.className = "password-match";
    confirmNewPasswordInput.parentNode.insertAdjacentElement('afterend', newPasswordMatchIndicator);

    // Password validation function (used for both registration and new password)
    function validatePassword(password, isNewPassword = false) {
        // Initialize validation checks
        const minLength = password.length >= 8;
        const hasUppercase = /[A-Z]/.test(password);
        const hasLowercase = /[a-z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        const hasSpecial = /[^A-Za-z0-9]/.test(password);
        
        // Calculate score - start with 0
        let score = 0;
        
        // Add points for each criteria met
        if (minLength) score++;
        if (hasUppercase) score++;
        if (hasLowercase) score++;
        if (hasNumber) score++;
        if (hasSpecial) score++;
        
        // Get the correct elements based on context
        const currentStrengthIndicator = isNewPassword ? newPasswordStrengthIndicator : strengthIndicator;
        const currentRequirementsFeedback = isNewPassword ? newPasswordRequirementsFeedback : requirementsFeedback;
        
        // Update strength indicator
        if (password.length === 0) {
            currentStrengthIndicator.style.display = "none";
            currentRequirementsFeedback.style.display = "none";
            return {
                isValid: false,
                score: score
            };
        } else {
            currentStrengthIndicator.style.display = "block";
            currentRequirementsFeedback.style.display = "block";
        }
        
        // Show strength based on score
        let strengthText = "";
        if (score < 3) {
            strengthText = "Weak";
            currentStrengthIndicator.className = "password-strength weak";
        } else if (score < 5) {
            strengthText = "Medium";
            currentStrengthIndicator.className = "password-strength medium";
        } else {
            strengthText = "Strong";
            currentStrengthIndicator.className = "password-strength strong";
        }
        
        currentStrengthIndicator.textContent = strengthText;
        
        // Update requirements feedback - show only what's missing
        let feedbackText = "";
        
        if (!minLength) {
            feedbackText += "• At least 8 characters<br>";
        }
        if (!hasUppercase) {
            feedbackText += "• One uppercase letter<br>";
        }
        if (!hasLowercase) {
            feedbackText += "• One lowercase letter<br>";
        }
        if (!hasNumber) {
            feedbackText += "• One number<br>";
        }
        if (!hasSpecial) {
            feedbackText += "• One special character<br>";
        }
        
        currentRequirementsFeedback.innerHTML = feedbackText;
        
        // Password is valid if it meets all criteria
        const isValid = minLength && hasUppercase && hasLowercase && hasNumber && hasSpecial;
        
        return {
            isValid: isValid,
            score: score
        };
    }
    
    // Check password match for registration
    function checkPasswordsMatch() {
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;
        
        if (confirmPassword) {
            if (password !== confirmPassword) {
                matchIndicator.textContent = "Passwords don't match";
                matchIndicator.classList.add("mismatch");
                return false;
            } else {
                matchIndicator.textContent = "Passwords match";
                matchIndicator.classList.remove("mismatch");
                return true;
            }
        } else {
            matchIndicator.textContent = "";
            return false;
        }
    }
    
    // Check new password match
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
    
    // Event listeners for password validation in registration form
    passwordInput.addEventListener("input", () => {
        validatePassword(passwordInput.value);
        if (confirmPasswordInput.value) {
            checkPasswordsMatch();
        }
    });
    
    confirmPasswordInput.addEventListener("input", checkPasswordsMatch);

    // Event listeners for new password validation
    newPasswordInput.addEventListener("input", () => {
        validatePassword(newPasswordInput.value, true);
        if (confirmNewPasswordInput.value) {
            checkNewPasswordsMatch();
        }
    });
    
    confirmNewPasswordInput.addEventListener("input", checkNewPasswordsMatch);

    // Set new password handler
    buttons.setPassword.addEventListener("click", async (event) => {
        event.preventDefault();

        const newPassword = newPasswordInput.value;
        const confirmNewPassword = confirmNewPasswordInput.value;

        // Validate password strength
        const passwordValidation = validatePassword(newPassword, true);
        if (!passwordValidation.isValid) {
            showPopup("⚠️ Please create a stronger password", 3000, "#ff9800");
            return;
        }

        // Check if passwords match
        if (!checkNewPasswordsMatch()) {
            showPopup("⚠️ Passwords do not match", 3000, "#f44336");
            return;
        }

        try {
            const response = await axios.post(`${BASE_URL}/api/user/resetPassword`, {
                email: resetEmail,
                newPassword: newPassword
            });

            showPopup("✅ Password updated successfully!", 3000);
            setTimeout(() => showForm("login"), 1000);
        } catch (error) {
            console.error("Password reset failed:", error.response || error);
            showPopup("❌ Failed to update password.", 3000, "#f44336");
        }
    });

    // Enhanced showPopup function
    function showPopup(message, duration, color) {
        const popup = document.createElement("div");
        popup.textContent = message;
        popup.style.position = "fixed";
        popup.style.top = "20px";
        popup.style.left = "50%";
        popup.style.transform = "translateX(-50%)";
        popup.style.background = color || "#4CAF50";
        popup.style.color = "white";
        popup.style.padding = "10px 20px";
        popup.style.borderRadius = "5px";
        popup.style.zIndex = "1000";
        popup.style.fontSize = "16px";
        popup.style.boxShadow = "0 2px 10px rgba(0,0,0,0.2)";
        document.body.appendChild(popup);

        setTimeout(() => {
            popup.remove();
        }, duration);
    }

    function showForm(formType) {
        document.querySelector(".form-box.login").style.display = formType === "login" ? "block" : "none";
        document.querySelector(".form-box.register").style.display = formType === "register" ? "block" : "none";
        document.querySelector(".form-box.otp").style.display = formType === "otp" ? "block" : "none";
        document.querySelector(".form-box.forgot-password").style.display = formType === "forgot-password" ? "block" : "none";
        document.querySelector(".form-box.new-password").style.display = formType === "new-password" ? "block" : "none";
    }
});