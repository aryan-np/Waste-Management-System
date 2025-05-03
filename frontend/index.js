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

    buttons.register.addEventListener("click", async (event) => {
        event.preventDefault();

        const registerName = forms.register.querySelector("input[name='full-name']").value;
        const registerEmail = forms.register.querySelector("input[name='email']").value;
        const registerPassword = forms.register.querySelector("input[name='password']").value;
        const confirmPassword = forms.register.querySelector("input[name='confirmPassword']").value;
        const contact = forms.register.querySelector("input[name='number']").value;

        const body = {
            name: registerName,
            email: registerEmail,
            password: registerPassword,
            number:contact
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
            alert("Registration failed. Please try again.");
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

    function showPopup(message, duration,color) {
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
