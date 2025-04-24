document.addEventListener('DOMContentLoaded', function () {

    const API_BASE="http://127.0.0.1:8000/api/admin"
    // Sidebar Buttons
    const dashboardBtn = document.getElementById('sidebar-dashboard');
    const manageUserBtn = document.getElementById('sidebar-manage-user');
    const manageRouteBtn = document.getElementById('sidebar-manage-route');
    const logoutBtn = document.getElementById('sidebar-logout');

    // Search Bars
    const userSearchBar = document.getElementById('user-search');
    const routeSearchBar = document.getElementById('route-search');

    // Content Sections
    const dashboardSection = document.getElementById('dashboard-section');
    const manageUserSection = document.getElementById('manage-user-section');
    const manageRouteSection = document.getElementById('manage-route-section');

    // Form Sections
    const userFormSection = document.getElementById('user-form-section');
    const routeFormSection = document.getElementById('route-form-section');

    // Add Buttons
    const addUserBtn = document.getElementById("add-user-btn");
    const addRouteBtn = document.getElementById("add-route-btn");

    // Stat Cards
    const totalUsersCard = document.getElementById('totalUser');
    const totalRoutesCard = document.getElementById('totalRoute');

    // Event listener for sidebar navigation
    dashboardBtn.addEventListener('click', function () {
        navigateToSection(dashboardSection);
         // Get URL parameters
         const urlParams = new URLSearchParams(window.location.search);

         // Get total users and active routes from URL
         const totalUsers = urlParams.get('totalUsers');
         const totalRoutes = urlParams.get('totalRoutes');
        totalRoutesCard.textContent=totalRoutes;
        totalUsersCard.textContent=totalUsers;
    });

    manageUserBtn.addEventListener('click', async function () {
        navigateToSection(manageUserSection);
        // Fetch user data from the backend API
        const response = await fetch(`${API_BASE}/getAllUsers`, {
            method: 'GET',
            credentials: 'include', // Use 'include' to send cookies and credentials
            headers: {
                'Content-Type': 'application/json'
            }
        });
        console.log(response);
        
        // Check if the response is OK (status 200)
        if (!response.ok) {
            throw new Error('Failed to fetch users');
        }

        // Parse the response as JSON
        const users = await response.json();
        loadUserData(users);
    });

    manageRouteBtn.addEventListener('click', async function () {
        navigateToSection(manageRouteSection);
        // Fetch route data from the backend API
        const response = await fetch(`${API_BASE}/getAllRoutes`, {
            method: 'GET',
            credentials: 'include', // Send cookies and credentials
            headers: {
                'Content-Type': 'application/json'
            }
        });

        // Check if the response is OK (status 200)
        if (!response.ok) {
            throw new Error('Failed to fetch routes');
        }

        // Parse the response as JSON
        const routes = await response.json();
        console.log('Fetched routes:', routes);
        loadRouteData(routes);
    });

    logoutBtn.addEventListener('click', async function () {
        // Mockup function for logout (integrate backend logic for actual logout)
        try {
            await fetch(`http://127.0.0.1:8000/api/user/logout`, {
                method: 'POST',
                credentials: 'include'
            });
            window.location.href = 'index.html';
        } catch (err) {
            console.error('Logout error:', err);
            alert('Logout failed. Try again.');
        }
    });


    document.getElementById('user-search-icon').addEventListener('click', async () => {
        const query = document.getElementById('user-search').value.trim();
        console.log('Search user for:', query);
    
        try {
            const response = await fetch(`${API_BASE}/searchUser`, {
                method: 'POST',
                credentials: 'include', // Send cookies and credentials
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name: query }) // Correct format for POST body
            });
    
            if (!response.ok) {
                throw new Error('Failed to fetch users');
            }
    
            const users = await response.json();
            console.log('Fetched users:', users);
    
            loadUserData(users); // This should update the table with new data
        } catch (error) {
            console.error('Search failed:', error);
        }
    });
    
    document.getElementById('route-search-icon').addEventListener('click', async () => {
        const query = document.getElementById('route-search').value.trim();
        console.log('Search route for:', query);
        try {
            const response = await fetch(`${API_BASE}/searchRoute`, {
                method: 'POST',
                credentials: 'include', // Send cookies and credentials
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ location: query }) // Correct format for POST body
            });
    
            if (!response.ok) {
                throw new Error('Failed to fetch users');
            }
    
            const routes = await response.json();
            console.log('Fetched routes:', routes);
    
            loadRouteData(routes); // This should update the table with new data
        } catch (error) {
            console.error('Search failed:', error);
        }
    });
    // Event listener for the "Add User" button

    // Navigation function to show the appropriate section
    function navigateToSection(section) {
        // Hide all sections
        const sections = [dashboardSection, manageUserSection, manageRouteSection];
        sections.forEach(sec => sec.style.display = 'none');

        // Show the selected section
        section.style.display = 'block';
    }

    // Function to load user data (backend integration required)
    // Function to load user data from the backend and populate the table
async function loadUserData(users) {
    try {
        // Get the tbody element of the user table
        const tbody = document.querySelector('.user-table tbody');
        
        // Clear the existing table rows
        tbody.innerHTML = '';

        // Loop through the users and create a row for each
        users.forEach(user => {
            // Create a table row
            const row = document.createElement('tr');
            
            // Create table data cells for each property
            row.innerHTML = `
                <td>${user._id}</td>
                <td>${user.name}</td>
                <td>${user.email}</td>
                <td>Rs. ${user.dueAmount}</td>
                <td>${user.selectedRoute ? user.selectedRoute.name : 'N/A'}</td>
                <td>${user.role}</td>
                <td>
                    <i class='bx bx-edit' id="edit-icon-${user._id}"></i>
                    <i class='bx bx-trash' id="trash-icon-${user._id}"></i>
                </td>
            `;
            
            // Append the row to the table body
            tbody.appendChild(row);
        });

        console.log('Users loaded successfully');
    } catch (error) {
        console.error('Error loading user data:', error);
    }
}


    // Function to load route data (backend integration required)
    async function loadRouteData(routes) {
        try {
            console.log('Loading route data...');
    
            
    
            // Get the tbody element of the route table inside the manage-route-section
            const tbody = document.querySelector('#manage-route-section .user-table tbody');
    
            // Check if tbody is found
            if (!tbody) {
                console.error('Table body element not found!');
                return;
            }
    
            // Clear existing rows
            tbody.innerHTML = '';
    
            // Loop through each route and create table rows
            routes.forEach(route => {
                // Format the schedule as HTML
                const schedule = route.schedule.map(sch => {
                    return `<div>${sch.day}: ${sch.time}</div>`;
                }).join('');
    
                // Create a new table row
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${route._id}</td>
                    <td>${route.routeName}</td>
                    <td>${route.locations.join(', ')}</td>
                    <td>${schedule}</td>
                    <td>
                        <i class='bx bx-edit' id="edit-icon-${route._id}"></i>
                        <i class='bx bx-trash' id="trash-icon-${route._id}"></i>
                    </td>
                `;
    
                // Append the row to the table body
                tbody.appendChild(row);
            });
    
            console.log('Routes loaded successfully');
        } catch (error) {
            console.error('Error loading route data:', error);
        }
    }
  

    
    




let globalUserId;
let globalRouteId;

const userUpdateButton = document.getElementById('userUpdateButton');
const routeUpdateButton = document.getElementById('routeUpdateButton');
const userDeleteButton = document.getElementById('userDeleteButton');
const routeDeleteButton = document.getElementById('routeDeleteButton');

// Show user form
addUserBtn.addEventListener('click', function () {
    showUserForm('create');
});

// Show route form
addRouteBtn.addEventListener('click', function () {
    showRouteForm('create');
});

// Function to show user form
function showUserForm(mode, data = null) {
    userFormSection.style.display = 'block';
    userFormSection.style.position = 'fixed';
    userFormSection.style.left = '50%';
    userFormSection.style.top = '50%';
    userFormSection.style.transform = 'translate(-50%, -50%)';
    userFormSection.style.zIndex = 1000;

    document.getElementById("user-name").value = data?.name || '';
    document.getElementById("user-email").value = data?.email || '';
    document.getElementById("user-password").value = '';
    document.getElementById("user-due").value = data?.due || '';

    document.getElementById("userUpdateButton").dataset.mode = mode;
    document.querySelector("#user-form-section h3").textContent = mode === 'create' ? 'Add New User' : 'Update User';
}

// Function to show route form
function showRouteForm(mode, data = null) {
    routeFormSection.style.display = 'block';
    routeFormSection.style.position = 'fixed';
    routeFormSection.style.left = '50%';
    routeFormSection.style.top = '50%';
    routeFormSection.style.transform = 'translate(-50%, -50%)';
    routeFormSection.style.zIndex = 1000;

    document.getElementById("route-name").value = data?.routeName || '';
    document.getElementById("route-locations").value = data?.locations || '';
    document.getElementById("route-day1").value = data?.schedule?.[0]?.day || '';
    document.getElementById("route-time1").value = data?.schedule?.[0]?.time || '';
    document.getElementById("route-day2").value = data?.schedule?.[1]?.day || '';
    document.getElementById("route-time2").value = data?.schedule?.[1]?.time || '';

    document.getElementById("routeUpdateButton").dataset.mode = mode;
    document.querySelector("#route-form-section h3").textContent = mode === 'create' ? 'Add New Route' : 'Update Route';
}

// Close forms
userDeleteButton.addEventListener('click', () => {
    userFormSection.style.display = 'none';
});
routeDeleteButton.addEventListener('click', () => {
    routeFormSection.style.display = 'none';
});

// Update User
userUpdateButton.addEventListener('click', async () => {
    const mode = userUpdateButton.dataset.mode;

    const user = {
        name: document.getElementById("user-name").value,
        email: document.getElementById("user-email").value,
        password: document.getElementById("user-password").value,
        dueAmount: document.getElementById("user-due").value,
    };

    if (mode === 'create') {
        console.log("Creating user:", user);
        try {
            const response = await fetch(`${API_BASE}/addUser`, {
                method: 'POST',
                credentials: 'include', // Send cookies and credentials
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(user) // Correct format for POST body
            });
    
            if (!response.ok) {
                throw new Error('Failed to fetch users');
            }
            if (response.ok) {
                alert('User added sucessfully.');
            }
        }
            catch{
                console.log("ERROR");
                
            }
    } else {
        console.log("Updating user:", user);
        try {
            user.userID = globalUserId;
            const response = await fetch(`${API_BASE}/modifyUser`, {
                method: 'POST',
                credentials: 'include', // Send cookies and credentials
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(user) // Correct format for POST body
            });
    
            if (!response.ok) {
                throw new Error('Failed to fetch users');
            }
            if (response.ok) {
                alert('User added sucessfully.');
            }
        }
            catch{
                console.log("ERROR");
                
            }
    }

    userFormSection.style.display = 'none';
});

// Update Route
routeUpdateButton.addEventListener('click', async() => {
    const mode = routeUpdateButton.dataset.mode;

    const route = {
        routeName: document.getElementById("route-name").value,
        locations: document.getElementById("route-locations").value.split(','),
        schedule: [
            {
                day: document.getElementById("route-day1").value,
                time: document.getElementById("route-time1").value
            },
            {
                day: document.getElementById("route-day2").value,
                time: document.getElementById("route-time2").value
            }
        ]
    };

    if (mode === 'create') {
        
        console.log("Creating route:", route);
        try {
            const response = await fetch(`${API_BASE}/addRoute`, {
                method: 'POST',
                credentials: 'include', // Send cookies and credentials
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(route) // Correct format for POST body
            });
    
            if (!response.ok) {
                throw new Error('Failed to fetch users');
            }
            if (response.ok) {
                alert('User added sucessfully.');
            }
        }
            catch{
                console.log("ERROR");
                
            }
    } else {
        // TODO: Hit API endpoint to update route
        console.log("Updating route:", route);
        try {
            route.routeID = globalRouteId;
            const response = await fetch(`${API_BASE}/modifyRoute`, {
                method: 'POST',
                credentials: 'include', // Send cookies and credentials
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(route) // Correct format for POST body
            });
    
            if (!response.ok) {
                throw new Error('Failed to fetch users');
            }
            if (response.ok) {
                alert('User added sucessfully.');
            }
        }
            catch{
                console.log("ERROR");
                
            }
    }

    routeFormSection.style.display = 'none';
});



function attachUserEditListeners() {
    // Use event delegation on the table body of the user table
    const userTableBody = document.querySelector("#manage-user-section .user-table tbody");

    userTableBody.addEventListener("click", function (e) {
        if (e.target.classList.contains("edit-icon")) {
            const row = e.target.closest("tr");
            const cells = row.querySelectorAll("td");

            const id = cells[0].textContent.trim();
            const name = cells[1].textContent.trim();
            const email = cells[2].textContent.trim();
            const dueAmount = cells[3].textContent.trim();
            const route = cells[4].textContent.trim();
            const role = cells[5].textContent.trim();

            console.log("Edit Clicked for User:");
            console.log({ id, name, email, dueAmount, route, role });

            // Populate form fields
            document.getElementById("user-name").value = name;
            document.getElementById("user-email").value = email;
            document.getElementById("user-password").value = ""; // leave blank for security
            document.getElementById("user-due").value = parseFloat(dueAmount.replace("Rs.", "").trim());

            // Show the form section
            document.getElementById("user-form-section").style.display = "block";
        }
    });
}

// Call this function when the page loads or when data is updated
attachUserEditListeners();
    // Initialize the page with the default view (Dashboard)
    dashboardBtn.click();
});
