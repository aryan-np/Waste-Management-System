document.addEventListener('DOMContentLoaded', function () {
    console.log("content loaded");
    
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

    
// Track last known pending count
let lastPendingCount = 0;

// Check and update pending request count
async function checkForNewRequests() {
    try {
        const res = await fetch(`http://127.0.0.1:8000/api/pickup/pickup-requests`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const data = await res.json();
        // console.log(data);
        
        const pendingRequests = data.filter(req => req.status === 'PENDING');
        // console.log(pendingRequests);
        
        const currentPendingCount = pendingRequests.length;

        const badge = document.getElementById('request-notification-badge');

        if (currentPendingCount > 0) {
            badge.textContent = currentPendingCount;
            badge.style.display = 'flex';
        } else {
            badge.style.display = 'none';
        }

        lastPendingCount = currentPendingCount;
        // console.log(lastPendingCount);
        
    } catch (error) {
        console.error('Error checking for new requests:', error);
    }
}

// Clear badge when Manage Requests tab is clicked
document.getElementById('sidebar-manage-request').addEventListener('click', async () => {
    badgeCleared = true;
    document.getElementById('request-notification-badge').style.display = 'none';
    await loadPickupRequests(); // Load requests when viewing
});

// Start polling every 3 seconds
setInterval(()=>{
    // console.log("checking notification");
    
    checkForNewRequests();
}, 1000);

// Initial request count setup
(async () => {
    await checkForNewRequests(); // initialize count at start
})();

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
        const sections = [dashboardSection, manageUserSection, manageRouteSection,manageRequestSection];
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
            console.log(user);
            
            // Create a table row
            const row = document.createElement('tr');
            // <td>${user.selectedRoute ? user.selectedRoute.name : 'N/A'}</td> //removed from below table data entry 
            // Create table data cells for each property
            row.innerHTML = `
                <td>${user._id}</td>
                <td>${user.name}</td>
                <td>${user.email}</td>
                <td>Rs. ${user.dueAmount}</td>
                
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
    } 
    else {
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
            if(response.status===409){
                alert('Route name alredy exists');
            }
            if (!response.ok) {
                throw new Error('Failed to fetch users');
            }
            if (response.ok) {
                alert('Route added sucessfully.');
                manageRouteBtn.click();
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


// // Add this to your existing admin.js file

// // ===== PICKUP REQUEST MANAGEMENT =====
const manageRequestBtn = document.getElementById('sidebar-manage-request');
const manageRequestSection = document.getElementById('manage-request-section');

// // Event listener for manage request button
manageRequestBtn.addEventListener('click', async function() {
    navigateToSection(manageRequestSection);
    await loadPickupRequests();
});

// Function to load pickup requests
async function loadPickupRequests() {
    try {
        const response = await fetch(`http://127.0.0.1:8000/api/pickup/pickup-requests`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch pickup requests');
        }

        const requests = await response.json();
        console.log('Fetched requests:', requests);
        renderPickupRequests(requests);
    } catch (error) {
        console.error('Error loading pickup requests:', error);
        alert('Failed to load pickup requests');
    }
}

function renderPickupRequests(requests) {
    const tbody = document.querySelector('#manage-request-section tbody');
    tbody.innerHTML = ''; // Clear existing rows

    requests.forEach(request => {
        const row = document.createElement('tr');

        // Parse and format date and time
        const createdAt = new Date(request.createdAt);
        const requestDate = createdAt.toLocaleDateString();
        const requestTime = createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        // Format status with appropriate styling
        const statusCell = formatStatusCell(request.status);

        row.innerHTML = `
            <td>${request.user?.name || 'N/A'}</td>
            <td>${request.user?.email || 'N/A'}</td>
            <td>${request.time}</td>
            <td>${request.date}</td>
            <td>${request.address || 'N/A'}</td>
            <td>${statusCell}</td>
            <td>
                ${request.status === 'PENDING' ? 
                    `<i class='bx bx-check accept-icon' data-request-id="${request._id}" title="Accept"></i>
                     <i class='bx bx-x reject-icon' data-request-id="${request._id}" title="Reject"></i>`
                : 'Resolved'}
            </td>
        `;

        // Add event listener for row click to open the modal
        row.addEventListener('click', function(event) {
            // Ensure the row itself is clickable, not the action icons
            if (!event.target.classList.contains('accept-icon') && !event.target.classList.contains('reject-icon')) {
                openRequestModal(request);
            }
        });

        tbody.appendChild(row);
    });

    // Add event listeners to action buttons
    addRequestActionListeners();

    // Add search functionality
    addRequestSearchListener();
}

function openRequestModal(request) {
    // Set request data in the modal
    document.getElementById('detail-name').innerText = request.user?.name || 'N/A';
    document.getElementById('detail-email').innerText = request.user?.email || 'N/A';
    document.getElementById('detail-address').innerText = request.address || 'N/A';
    document.getElementById('detail-landmark').innerText = request.landmark || 'N/A';
    document.getElementById('detail-date').innerText = request.date || 'N/A';
    document.getElementById('detail-time').innerText = request.time || 'N/A';
    document.getElementById('detail-message').innerText = request.message || 'N/A';
    document.getElementById('detail-status').innerText = request.status || 'N/A';

    // Show the modal
    const modal = document.getElementById('request-detail-modal');
    modal.style.display = 'flex';
}

// Close the modal when the close button is clicked
document.getElementById('close-modal').addEventListener('click', function() {
    const modal = document.getElementById('request-detail-modal');
    modal.style.display = 'none';
});

// Optionally, close the modal if the user clicks outside the modal content
window.addEventListener('click', function(event) {
    const modal = document.getElementById('request-detail-modal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
});

// // Helper function to format status cell with appropriate styling
function formatStatusCell(status) {
    const statusText = status || 'PENDING';
    let statusClass = '';
    
    switch(statusText.toUpperCase()) {
        case 'ACCEPTED':
            statusClass = 'status-accepted';
            break;
        case 'REJECTED':
            statusClass = 'status-rejected';
            break;
        case 'PENDING':
        default:
            statusClass = 'status-pending';
    }
    
    return `<span class="status-badge ${statusClass}">${statusText}</span>`;
}

// Add event listeners to action buttons
function addRequestActionListeners() {
    document.querySelectorAll('.accept-icon').forEach(icon => {
        icon.addEventListener('click', async (e) => {
            const requestId = e.target.getAttribute('data-request-id');
            await updateRequestStatus(requestId, 'ACCEPTED');
        });
    });

    document.querySelectorAll('.reject-icon').forEach(icon => {
        icon.addEventListener('click', async (e) => {
            const requestId = e.target.getAttribute('data-request-id');
            await updateRequestStatus(requestId, 'REJECTED');
        });
    });
}

// Add search functionality for pickup requests
function addRequestSearchListener() {
    const searchButton = document.querySelector('#manage-request-section .search-wrapper button');
    const searchInput = document.getElementById('request-search');
    
    searchButton.addEventListener('click', async () => {
        await searchPickupRequests(searchInput.value.trim());
    });
    
    searchInput.addEventListener('keypress', async (e) => {
        if (e.key === 'Enter') {
            await searchPickupRequests(searchInput.value.trim());
        }
    });
}

async function searchPickupRequests(query) {
    try {
        const response = await fetch(`http://127.0.0.1:8000/api/pickup/pickup-requests/search`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ query })
        });

        if (!response.ok) {
            throw new Error('Search failed');
        }

        const requests = await response.json();
        renderPickupRequests(requests);
    } catch (error) {
        console.error('Search error:', error);
        alert('Search failed');
    }
}

// Function to update request status
async function updateRequestStatus(requestId, status) {
    if (!confirm(`Are you sure you want to ${status.toLowerCase()} this request?`)) {
        return;
    }

    const message = prompt("Enter a message to attach to this status (optional):") || '';

    try {
        const response = await fetch(`http://127.0.0.1:8000/api/pickup/pickup-request/${requestId}`, {
            method: 'PUT',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                status: status,
                message: message
            })
        });

        if (!response.ok) {
            throw new Error(`Failed to ${status.toLowerCase()} request`);
        }

        const result = await response.json();
        console.log('Update result:', result);
        
        alert(`Request ${status.toLowerCase()} successfully`);
        await loadPickupRequests(); // Refresh the list
    } catch (error) {
        console.error(`Error ${status.toLowerCase()}ing request:`, error);
        alert(`Failed to ${status.toLowerCase()} request`);
    }
}

// Initialize the request management section
document.getElementById('sidebar-manage-request').addEventListener('click', async function() {
    document.querySelectorAll('.content-section').forEach(section => section.style.display = 'none');
    document.getElementById('manage-request-section').style.display = 'block';
    document.querySelectorAll('.sidebar-menu li').forEach(li => li.classList.remove('active'));
    this.classList.add('active');
    
    await loadPickupRequests();
});

// Add search functionality for pickup requests
document.querySelector('#manage-request-section .search-wrapper button').addEventListener('click', async () => {
    const query = document.getElementById('request-search').value.trim();
    
    try {
        const response = await fetch(`${API_BASE}/pickup-requests/search`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ query })
        });

        if (!response.ok) {
            throw new Error('Search failed');
        }

        const requests = await response.json();
        renderPickupRequests(requests);
    } catch (error) {
        console.error('Search error:', error);
        alert('Search failed');
    }
});




    dashboardBtn.click();
});
