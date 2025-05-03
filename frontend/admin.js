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

    let globalUserId;
    let globalRouteId;

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
                    <i class='bx bx-edit' data-user-id="${user._id}"></i>
                    <i class='bx bx-trash' data-user-id="${user._id}"></i>
                </td>
            `;
            
            // Append the row to the table body
            tbody.appendChild(row);
        });

        // Add event listeners to all edit icons
        document.querySelectorAll('.bx-edit').forEach(icon => {
            icon.addEventListener('click', (e) => {
                const row = e.target.closest('tr');
                globalUserId = e.target.getAttribute('data-user-id');
                
                const data = {
                    name: row.cells[1].textContent,
                    email: row.cells[2].textContent,
                    due: parseFloat(row.cells[3].textContent.replace('Rs. ', '')),
                    role: row.cells[5].textContent,
                    selectedRoute: row.cells[4].textContent
                };
                
                console.log('Edit user clicked with data:', data);
                showUserForm("edit", data);
            });
        });

        // Add event listeners to all trash icons
        document.querySelectorAll('.bx-trash').forEach(icon => {
            icon.addEventListener('click', async (e) => {
                const userId = e.target.getAttribute('data-user-id');
                console.log('Delete user clicked for ID:', userId);
                
                if (confirm(`Are you sure you want to delete user ${userId}?`)) {
                    try {
                        const response = await fetch(`${API_BASE}/deleteUser`, {
                            method: 'POST',
                            credentials: 'include',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({ userId: userId })
                        });
                        
                        if (!response.ok) {
                            throw new Error('Failed to delete user');
                        }
                        
                        alert('User deleted successfully');
                        // Refresh the user list
                        manageUserBtn.click();
                    } catch (error) {
                        console.error("Error deleting user:", error);
                        alert('Failed to delete user');
                    }
                }
            });
        });

        console.log('Users loaded successfully');
    } catch (error) {
        console.error('Error loading user data:', error);
    }
}

// Function to load route data from the backend and populate the table
async function loadRouteData(routes) {
    try {
        // Get the tbody element of the route table
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
                    <i class='bx bx-edit' data-route-id="${route._id}"></i>
                    <i class='bx bx-trash' data-route-id="${route._id}"></i>
                </td>
            `;

            // Append the row to the table body
            tbody.appendChild(row);
        });

        // Add event listeners to all edit icons
        document.querySelectorAll('#manage-route-section .bx-edit').forEach(icon => {
            icon.addEventListener('click', (e) => {
                const row = e.target.closest('tr');
                globalRouteId = e.target.getAttribute('data-route-id');
                
                // Extract schedule data
                const scheduleDivs = row.cells[3].querySelectorAll('div');
                const schedule = [];
                if (scheduleDivs.length > 0) {
                    const [day1, time1] = scheduleDivs[0].textContent.split(': ');
                    schedule.push({ day: day1, time: time1 });
                }
                if (scheduleDivs.length > 1) {
                    const [day2, time2] = scheduleDivs[1].textContent.split(': ');
                    schedule.push({ day: day2, time: time2 });
                }
                
                const data = {
                    routeName: row.cells[1].textContent,
                    locations: row.cells[2].textContent.split(', '),
                    schedule: schedule
                };
                
                console.log('Edit route clicked with data:', data);
                showRouteForm("edit", data);
            });
        });

        // Add event listeners to all trash icons
        document.querySelectorAll('#manage-route-section .bx-trash').forEach(icon => {
            icon.addEventListener('click', async (e) => {
                const routeId = e.target.getAttribute('data-route-id');
                console.log('Delete route clicked for ID:', routeId);
                
                if (confirm(`Are you sure you want to delete route ${routeId}?`)) {
                    try {
                        const response = await fetch(`${API_BASE}/deleteRoute`, {
                            method: 'POST',
                            credentials: 'include',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({ routeId: routeId })
                        });
                        
                        if (!response.ok) {
                            throw new Error('Failed to delete route');
                        }
                        
                        alert('Route deleted successfully');
                        // Refresh the route list
                        manageRouteBtn.click();
                    } catch (error) {
                        console.error("Error deleting route:", error);
                        alert('Failed to delete route');
                    }
                }
            });
        });

        console.log('Routes loaded successfully');
    } catch (error) {
        console.error('Error loading route data:', error);
    }
}

    
    






const userUpdateButton = document.getElementById('userUpdateButton');
const routeUpdateButton = document.getElementById('routeUpdateButton');
const userDeleteButton = document.getElementById('userDeleteButton');
const routeDeleteButton = document.getElementById('routeDeleteButton');

// Show user form
addUserBtn.addEventListener('click', function () {
    // alert("CREATE FORM SHOWING>>>>>>")
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
    // console.log("DUE"+data.due);
    console.log("MODE"+mode);
    
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
    alert("CURRENT MODE :"+mode);
    

    const user = {
        userId:globalUserId,
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
                alert('User edited sucessfully.');
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
        routeId:globalRouteId,
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
                alert('Route added sucessfully.');
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
            alert(route)
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
                alert('Route edited sucessfully.');
            }
        }
            catch{
                console.log("ERROR");
                
            }
    }

    routeFormSection.style.display = 'none';
});



    dashboardBtn.click();
});
