document.addEventListener("DOMContentLoaded", () => {
    const BASE_URL = "http://127.0.0.1:8000";

    const forms = {
        login: document.querySelector(".form-box.login form"),
        register: document.querySelector(".form-box.register form"),
        otp: document.querySelector(".form-box.otp form"),
        forgotPassword: document.querySelector(".form-box.forgot-password form")
    };

    const buttons = {
        login: forms.login.querySelector(".btn"),
        register: forms.register.querySelector(".sign-up-btn"),
        verifyOtp: forms.otp.querySelector(".verify-otp"),
        forgotPassword: forms.forgotPassword.querySelector(".send-reset-link")
    };

    const links = {
        login: document.querySelector(".login-link"),
        register: document.querySelector(".register-link"),
        forgotPassword: document.querySelector(".forgot-password-link"),
        backToLogin: document.querySelector(".back-to-login")
    };

    let otpRoute = "";
    let otpBody = {};

    links.register.addEventListener("click", () => showForm("register"));
    links.login.addEventListener("click", () => showForm("login"));
    links.forgotPassword.addEventListener("click", () => showForm("forgot-password"));
    links.backToLogin.addEventListener("click", () => showForm("login"));

    // Update the register button event listener to enforce password validation
    buttons.register.addEventListener("click", async (event) => {
        event.preventDefault();

        const registerName = forms.register.querySelector("input[name='full-name']").value;
        const registerEmail = forms.register.querySelector("input[name='email']").value;
        const registerPassword = forms.register.querySelector("input[name='password']").value;
        const confirmPassword = forms.register.querySelector("input[name='confirmPassword']").value;
        const contact = forms.register.querySelector("input[name='number']").value;

        // Validate password
        const passwordValidation = validatePassword(registerPassword);
        
        // Check if password meets all requirements
        if (!passwordValidation.isValid) {
            showPopup("⚠️ Please create a stronger password", 3000, "#ff9800");
            return;
        }
        
        // Check if passwords match
        if (registerPassword !== confirmPassword) {
            showPopup("⚠️ Passwords do not match", 3000, "#f44336");
            return;
        }

        // Continue with registration
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

            setTimeout(() => {
                showForm("otp");
            }, 3000);
        } catch (error) {
            console.error("Registration failed:", error.response || error);
            showPopup("❌ Registration failed. Please try again.", 3000, "#f44336");
        }
    });

    buttons.verifyOtp.addEventListener("click", async (event) => {
        event.preventDefault();

        const otpCode = forms.otp.querySelector("input#otp-input").value;

        if (otpCode.length === 6) {
            otpBody.otp = otpCode;

            try {
                const response = await axios.post(otpRoute, otpBody, {
                    withCredentials: true
                });

                console.log("OTP verification successful:", response.data);
                showPopup("✅ OTP Validation Success! Redirecting to Login...", 3000);

                setTimeout(() => {
                    showForm("login");
                }, 3000);
            } catch (error) {
                console.error("OTP verification failed:", error.response || error);
                alert("OTP verification failed. Please try again.");
            }
        } else {
            alert("Please enter a valid 6-digit OTP.");
        }
    });
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
            // Optionally show an alert or popup here
        }
    });
    

    buttons.forgotPassword.addEventListener("click", async (event) => {
        event.preventDefault();

        const forgotPasswordEmail = forms.forgotPassword.querySelector("input[type='email']").value;
        const newPassword = forms.forgotPassword.querySelector("input[type='password']").value;

        const body = {
            email: forgotPasswordEmail,
            newPassword: newPassword
        };

        try {
            const response = await axios.post(`${BASE_URL}/api/user/forgotPassword`, body, {
                withCredentials: true
            });

            console.log("Forgot password request successful:", response.data);
            otpRoute = `${BASE_URL}/api/user/resetPassword`;
            otpBody = body;

            showPopup("✅ Reset link sent! Proceeding to OTP verification...", 3000);
            setTimeout(() => {
                showForm("otp");
            }, 3000);
        } catch (error) {
            console.error("Forgot password failed:", error.response || error);
            alert("Failed to send reset link. Please try again.");
        }
    });

    // Password strength validation
    const passwordInput = document.querySelector(".form-box.register input[name='password']");
    const confirmPasswordInput = document.querySelector(".form-box.register input[name='confirmPassword']");
    
    // Create password strength indicator
    const strengthIndicator = document.createElement("div");
    strengthIndicator.className = "password-strength";
    
    // Create requirements feedback
    const requirementsFeedback = document.createElement("div");
    requirementsFeedback.className = "password-requirements-feedback";
    
    // Create container for strength and feedback
    const passwordFeedbackContainer = document.createElement("div");
    passwordFeedbackContainer.className = "password-feedback-container";
    passwordFeedbackContainer.appendChild(strengthIndicator);
    passwordFeedbackContainer.appendChild(requirementsFeedback);
    
    // Insert after password input
    passwordInput.parentNode.insertAdjacentElement('afterend', passwordFeedbackContainer);
    
    // Create password match indicator
    const matchIndicator = document.createElement("div");
    matchIndicator.className = "password-match";
    confirmPasswordInput.parentNode.insertAdjacentElement('afterend', matchIndicator);
    
    // Password validation function
    function validatePassword(password) {
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
        
        // Update strength indicator
        if (password.length === 0) {
            strengthIndicator.style.display = "none";
            requirementsFeedback.style.display = "none";
            return {
                isValid: false,
                score: score
            };
        } else {
            strengthIndicator.style.display = "block";
            requirementsFeedback.style.display = "block";
        }
        
        // Show strength based on score
        let strengthText = "";
        if (score < 3) {
            strengthText = "Weak";
            strengthIndicator.className = "password-strength weak";
        } else if (score < 5) {
            strengthText = "Medium";
            strengthIndicator.className = "password-strength medium";
        } else {
            strengthText = "Strong";
            strengthIndicator.className = "password-strength strong";
        }
        
        strengthIndicator.textContent = strengthText;
        
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
        
        requirementsFeedback.innerHTML = feedbackText;
        
        // Password is valid if it meets all criteria
        const isValid = minLength && hasUppercase && hasLowercase && hasNumber && hasSpecial;
        
        return {
            isValid: isValid,
            score: score
        };
    }
    
    // Check password match
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
    
    
    // Event listeners for password validation
    passwordInput.addEventListener("input", () => {
        validatePassword(passwordInput.value);
        if (confirmPasswordInput.value) {
            checkPasswordsMatch();
        }
    });
    
    confirmPasswordInput.addEventListener("input", checkPasswordsMatch);


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
    }


});
