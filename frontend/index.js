document.addEventListener("DOMContentLoaded", () => {
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

    // Form data storage variables
    let loginEmail = '';
    let loginPassword = '';
    let registerName = '';
    let registerEmail = '';
    let registerPassword = '';
    let otpCode = '';
    let forgotPasswordEmail = '';

    // Show register form
    links.register.addEventListener("click", () => showForm("register"));
    
    // Show login form
    links.login.addEventListener("click", () => showForm("login"));
    
    // Show forgot password form
    links.forgotPassword.addEventListener("click", () => showForm("forgot-password"));
    
    // Back to login from forgot password
    links.backToLogin.addEventListener("click", () => showForm("login"));

    // Register button handler
    buttons.register.addEventListener("click", (event) => {
        event.preventDefault();
        // Storing register form data into variables
        registerName = forms.register.querySelector("input[name='full-name']").value;
        registerEmail = forms.register.querySelector("input[name='email']").value;
        registerPassword = forms.register.querySelector("input[name='password']").value;

        // Log data (For debugging or ready to hit the API)
        console.log({ registerName, registerEmail, registerPassword });

        // After registering, move to OTP form
        showForm("otp");
    });

    // OTP verification button handler
    buttons.verifyOtp.addEventListener("click", (event) => {
        event.preventDefault();
        // Storing OTP input into variable
        otpCode = forms.otp.querySelector("input#otp-input").value;

        if (otpCode.length === 6) {
            // Log OTP and proceed (ready for backend integration)
            console.log({ otpCode });

            // After OTP verification, move to login form
            alert("OTP Verified! You are now registered.");
            showForm("login");
        } else {
            alert("Please enter a valid 6-digit OTP.");
        }
    });

    // Login button handler
buttons.login.addEventListener("click", async (event) => {
    event.preventDefault();
    
    // Storing login form data into variables
    const loginEmail = forms.login.querySelector("input[type='email']").value;
    const loginPassword = forms.login.querySelector("input[type='password']").value;

    // Prepare the request body
    const body = {
        email: loginEmail,
        password: loginPassword
    };

    // Sending POST request to the backend API
    try {
        const response = await fetch('http://localhost:8000/api/user/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body)
        });

        // Check if the response is okay (status 200-299)
        if (response.ok) {
            const data = await response.json();
            console.log('Login successful:', data);
            
            // Store token in a cookie
            const token = data.token;
            document.cookie = `Authorization=Bearer ${token}; path=/; max-age=${60 * 60 * 24}`; // Expires in 1 day

            // Redirect to the dashboard page
            window.location.href = "dashboard.html";
        } else {
            console.error('Login failed:', response.status, response.statusText);
            // Handle login failure (e.g., show error message)
            alert('Login failed. Please check your credentials.');
        }
    } catch (error) {
        console.error('Error during login request:', error);
        // Handle request error (e.g., show network error message)
        alert('An error occurred. Please try again later.');
    }
});


    // Forgot Password button handler
    buttons.forgotPassword.addEventListener("click", (event) => {
        event.preventDefault();
        // Storing forgot password email into variable
        forgotPasswordEmail = forms.forgotPassword.querySelector("input[type='email']").value;

        // Log forgot password data (ready to hit the API)
        console.log({ forgotPasswordEmail });
    });

    // Show specific form
    function showForm(formType) {
        document.querySelector(".form-box.login").style.display = formType === "login" ? "block" : "none";
        document.querySelector(".form-box.register").style.display = formType === "register" ? "block" : "none";
        document.querySelector(".form-box.otp").style.display = formType === "otp" ? "block" : "none";
        document.querySelector(".form-box.forgot-password").style.display = formType === "forgot-password" ? "block" : "none";
    }
});
