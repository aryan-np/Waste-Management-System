document.addEventListener('DOMContentLoaded', async () => {
    const API_BASE = 'http://127.0.0.1:8000/api/user';
    

    const routeSection = document.getElementById('route-section');
    const paymentSection = document.getElementById('payment-section');
    const settingsSection = document.getElementById('settings-section');
    const routeDropdown = document.getElementById('route-dropdown');
    const routeStatusMessage = document.getElementById('route-status');
    const selectRouteButton = document.getElementById('select-route-btn');
    const logoutButton = document.getElementById('sidebar-logout');

    const changeRouteSidebarOption = document.getElementById('sidebar-change-route');
    const profileSidebarOption = document.getElementById('sidebar-profile');
    const settingsSidebarOption = document.getElementById('sidebar-settings');
    const dashboardSidebarOption = document.getElementById('sidebar-dashboard');

    const scheduleContainer = document.getElementById('schedule-container'); // NEW



    const profileDropdown = document.querySelector('.profile-dropdown');
    const profileTrigger = document.querySelector('.profile-trigger');
    const dropdownContent = document.querySelector('.dropdown-content');
    
    // Toggle dropdown on trigger click
    profileTrigger.addEventListener('click', function(e) {
        e.stopPropagation(); // Prevent event from bubbling up
        profileDropdown.classList.toggle('active'); // Show/hide dropdown
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', function() {
        profileDropdown.classList.remove('active');
    });
    
    // Prevent dropdown from closing when clicking inside
    dropdownContent.addEventListener('click', function(e) {
        e.stopPropagation();
    });


    
    
    // === Handle Sidebar Clicks ===
    document.querySelectorAll('.sidebar-menu li').forEach(li => {
        li.addEventListener('click', () => {
            document.querySelectorAll('.sidebar-menu li').forEach(item => item.classList.remove('active'));
            li.classList.add('active');

            document.querySelectorAll('.content-section').forEach(section => section.style.display = 'none');

            if (li.id === 'sidebar-dashboard') {
                document.getElementById('dashboard-section').style.display = 'block';
            } else if (li.id === 'sidebar-change-route') {
                routeSection.style.display = 'block';
            } else if (li.id === 'sidebar-profile') {
                paymentSection.style.display = 'block';
            } else if (li.id === 'sidebar-settings') {
                settingsSection.style.display = 'block';
            }
        });
    });









    const amount = 100; // Static amount for testing
    
    // Update payment display
    document.getElementById('payment-amount').textContent = amount;
    document.getElementById('payment-total').textContent = amount;

 document.getElementById('pay-with-esewa').addEventListener('click', async () => {
    const paymentData = {
        amount: '100',
        tax_amount: '0',
        transaction_uuid,
        product_code: 'EPAYTEST'
        // Let backend calculate total_amount and signature
    };
  try {
    const response = await fetch(`${API_BASE}/payment/esewa/pay`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json' // Explicitly request JSON
      },
      body: JSON.stringify(paymentData)
    });

    // First check if response is JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      throw new Error(`Server returned ${response.status}: ${text.substring(0, 100)}`);
    }

    // Now safely parse as JSON
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || `Payment failed (${response.status})`);
    }

    // Process successful payment
    submitToEsewa(data.formData);

  } catch (error) {
    console.error('Payment error:', error);
    showError(`Payment failed: ${error.message}`);
    
    // Additional debugging
    if (error.message.includes('<!DOCTYPE')) {
      console.error('Server returned HTML error page');
    }
  }
});

function submitToEsewa(formData) {
  const form = document.createElement('form');
  form.method = 'POST';
  form.action = 'https://rc-epay.esewa.com.np/api/epay/main/v2/form';
  
  Object.entries(formData).forEach(([name, value]) => {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = name;
    input.value = value;
    form.appendChild(input);
  });
  
  document.body.appendChild(form);
  form.submit();
}

function showError(message) {
  const statusEl = document.getElementById('payment-status');
  statusEl.textContent = message;
  statusEl.style.color = 'red';
}









    



    // === Change Route ===
    selectRouteButton.addEventListener('click', changeRoute);

    async function changeRoute() {
        const selectedRoute = routeDropdown.value;
        if (!selectedRoute) return showStatus('Please select a route.', 'red');

        showStatus('Updating route...', 'blue');
        selectRouteButton.disabled = true;

        try {
            const userEmail = await getUserEmail();
            const res = await fetch(`${API_BASE}/changeRoute`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ email: userEmail, newRouteName: selectedRoute })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Update failed');

            showStatus(data.message || 'Route successfully updated.', 'green');

            // Also load updated schedule
            loadSchedule(selectedRoute); // NEW
        } catch (err) {
            handleAuthError(err);
        } finally {
            selectRouteButton.disabled = false;
            init();
        }
    }

    // === Get User Profile & Email ===
    async function getUserProfile() {
        const res = await fetch(`${API_BASE}/profile`, { credentials: 'include' });
        if (!res.ok) throw new Error('Not authenticated');
        return await res.json();
    }

    async function getUserEmail() {
        const profile = await getUserProfile();
        return profile.userEmail;
    }

    // === Load Routes ===
    async function loadRoutes() {
        try {
            const res = await fetch(`${API_BASE}/getAllRoutes`, { credentials: 'include' });
            if (!res.ok) throw new Error('Failed to fetch routes');
            const routes = await res.json();
            renderRoutes(routes);
        } catch (err) {
            console.error('Route load failed:', err);
            routeDropdown.innerHTML = '<option disabled selected>Error loading routes</option>';
            handleAuthError(err);
        }
    }

    function renderRoutes(routes) {
        routeDropdown.innerHTML = '<option disabled selected>Select a route</option>';
        routes.forEach(route => {
            const option = document.createElement('option');
            option.value = route.routeName;
            option.textContent = `${route.routeName} - ${route.locations.join(' → ')}`;
            routeDropdown.appendChild(option);
        });
    }

    function showStatus(message, color) {
        routeStatusMessage.textContent = message;
        routeStatusMessage.style.color = color;
    }

    // === Load & Render Schedule (NEW) ===
    async function loadSchedule(routeName) {
        try {
            const res = await fetch(`${API_BASE}/schedules/${routeName}`);
            const data = await res.json();
    
            scheduleContainer.innerHTML = ''; // Clear previous content
    
            const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    
            const scheduleList = data.schedules.schedule;
            const locationList = data.schedules.locations;
    
            if (!Array.isArray(scheduleList)) {
                throw new Error('Schedule data is not an array');
            }
    
            scheduleList.forEach(schedule => {
                const div = document.createElement('div');
                div.className = 'schedule-box';
    
                // Highlight today's schedule
                if (schedule.day === today) {
                    div.style.background = 'linear-gradient(to right, #b9fbc0, #d9fbee)';
                }
    
                div.innerHTML = `
                    <h4 class="day">${schedule.day}</h4>
                    <p><strong>Time:</strong> ${schedule.time}</p>
                    <p><strong>Locations:</strong> ${locationList.join(' → ')}</p>
                `;
    
                scheduleContainer.appendChild(div);
            });
    
        } catch (err) {
            console.error('Failed to load schedule:', err);
            scheduleContainer.innerHTML = '<p style="color:red;">Failed to load schedule.</p>';
        }
    }
    
    
    

    // === Logout ===
    logoutButton?.addEventListener('click', handleLogout);
    async function handleLogout() {
        try {
            await fetch(`${API_BASE}/logout`, {
                method: 'POST',
                credentials: 'include'
            });
            window.location.href = 'index.html';
        } catch (err) {
            console.error('Logout error:', err);
            alert('Logout failed. Try again.');
        }
    }

    function handleAuthError(err) {
        console.error(err);
        showStatus(err.message || 'Something went wrong.', 'red');
        if (err.message.includes('Not authenticated')) {
            setTimeout(() => window.location.href = 'index.html', 1500);
        }
    }


    const form = document.getElementById("pickup-form");
    const addressInput = document.getElementById("pickup-address");
    const dateInput = document.getElementById("pickup-date");
    const statusMessage = document.getElementById("pickup-status");

    form.addEventListener("submit", async function (event) {
        event.preventDefault();

        const address = addressInput.value.trim();
        const date = dateInput.value;
        console.log(address+date);
        

        if (!address || !date) {
            statusMessage.textContent = "Please fill in all fields.";
            statusMessage.style.color = "red";
            return;
        }

        try {
            const response = await fetch("http://127.0.0.1:8000/api/pickup/pickup-request", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include", // Send cookies if user is logged in
                body: JSON.stringify({ address, date }),
            });

            const result = await response.json();
            alert(result)
            

            if (response.ok) {
                statusMessage.textContent = "Pickup request submitted successfully!";
                statusMessage.style.color = "green";
                form.reset();
            } else {
                statusMessage.textContent = result.message || "Failed to submit pickup request.";
                statusMessage.style.color = "red";
            }
        } catch (error) {
            // console.error("Error submitting pickup request:", error);
            statusMessage.textContent = "Server error. Please try again later.";
            statusMessage.style.color = "red";
        }
    });

    // const currentRouteDisplay = document.getElementById('current-route-display');
    const currentRouteDisplay1 = document.getElementById('current-route-display1');

    // === INIT ===
    const init = async () => {
        try {
            await loadRoutes();
            const profile = await getUserProfile();
            const userRoute = profile.userRoute;
    
            // === Update Dropdown Dynamically ===
            document.getElementById('dropdown-username').textContent = profile.userName || 'N/A';
            document.getElementById('dropdown-email').textContent = profile.userEmail || 'N/A';
            document.getElementById('dropdown-route').textContent = userRoute?.routeName || 'Not Assigned';
            document.getElementById('greet').textContent =`Welcome, ${profile.userName || 'N/A'}`;
    
            if (!userRoute) {
                changeRouteSidebarOption.click();
                showStatus('Please select a route to continue.', 'blue');
            } else {
                // currentRouteDisplay.textContent = `Your current route: ${userRoute.locations.join(" ---> ")}`;
                // currentRouteDisplay.style.color = 'green';
    
                currentRouteDisplay1.textContent = `Your current route: ${userRoute.locations.join(" ---> ")}`;
                currentRouteDisplay1.style.color = 'green';
    
                loadSchedule(userRoute.routeName); // Load schedule initially
            }
        } catch (err) {
            handleAuthError(err);
        }
    };
    
    init();
    loadRoutes();
});
