// --- 1. HANDLE LOGIN (For user-login.html) ---
const loginForm = document.getElementById('userLoginForm');

if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const member_id = document.getElementById('member_id').value;
        const password = document.getElementById('password').value;
        const errorMsg = document.getElementById('errorMsg');
        const btn = document.querySelector('button[type="submit"]');

        btn.innerText = "Verifying...";
        btn.disabled = true;
        errorMsg.style.display = 'none';

        try {
            const res = await fetch('/api/user-auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ member_id, password })
            });

            const data = await res.json();

            if (res.ok) {
                // Save info to browser
                localStorage.setItem('user_token', data.token);
                localStorage.setItem('user_name', data.name);
                localStorage.setItem('member_id', data.member_id);
                localStorage.setItem('user_role', data.role);
                // Redirect
                window.location.href = '/user-dashboard.html';
            } else {
                errorMsg.innerText = data.message;
                errorMsg.style.display = 'block';
                btn.innerText = "Login";
                btn.disabled = false;
            }
        } catch (err) {
            errorMsg.innerText = "Server Error. Check connection.";
            errorMsg.style.display = 'block';
            btn.innerText = "Login";
            btn.disabled = false;
        }
    });
}

// --- 2. HANDLE DASHBOARD (For user-dashboard.html) ---
async function loadUserDashboard() {
    const token = localStorage.getItem('user_token');
    const member_id = localStorage.getItem('member_id');
    const name = localStorage.getItem('user_name');
    const role = localStorage.getItem('user_role');

    // Security Check: If not logged in, go back to login
    if (!token || !member_id) {
        window.location.href = '/user-login.html';
        return;
    }

    // Set UI Names
    document.getElementById('userName').innerText = name;
    document.getElementById('userRole').innerText = role + " Member";

    try {
        // Fetch My Books API
        const res = await fetch(`/api/user-dashboard/my-books/${member_id}`);
        const books = await res.json();

        const tableBody = document.getElementById('my-books-list');
        const issuedCountEl = document.getElementById('issuedCount');
        const totalFineEl = document.getElementById('totalFine');

        tableBody.innerHTML = "";
        
        if (books.length === 0) {
            tableBody.innerHTML = "<tr><td colspan='5' style='text-align:center; padding: 20px; color: #777;'>No books issued yet.</td></tr>";
            return;
        }

        let activeCount = 0;
        let fineSum = 0;

        books.forEach(issue => {
            const row = tableBody.insertRow();
            const title = issue.BookCopy?.Book?.title || "Unknown Book";
            const accession = issue.BookCopy?.accession_number || "N/A";
            
            // Badge Logic
            let badge = `<span style="background:#ffc107; color:#fff; padding:4px 8px; border-radius:4px; font-size:12px;">Issued</span>`;
            
            if (issue.status === 'Returned') {
                badge = `<span style="background:#28a745; color:#fff; padding:4px 8px; border-radius:4px; font-size:12px;">Returned</span>`;
            } else if (issue.status === 'Overdue') {
                badge = `<span style="background:#dc3545; color:#fff; padding:4px 8px; border-radius:4px; font-size:12px;">Overdue</span>`;
            }

            // Calculations
            if (issue.status === 'Issued' || issue.status === 'Overdue') {
                activeCount++;
            }
            // Add fine if it exists
            if (issue.fine) {
                fineSum += issue.fine;
            }

            row.innerHTML = `
                <td>${title}</td>
                <td>${accession}</td>
                <td>${new Date(issue.issue_date).toLocaleDateString()}</td>
                <td>${new Date(issue.due_date).toLocaleDateString()}</td>
                <td>${badge}</td>
            `;
        });

        // Update Stats Cards
        issuedCountEl.innerText = activeCount;
        totalFineEl.innerText = `₹${fineSum}`;

    } catch (err) {
        console.error(err);
    }
}

// --- 3. LOGOUT ---
function userLogout() {
    localStorage.removeItem('user_token');
    localStorage.removeItem('user_name');
    localStorage.removeItem('member_id');
    localStorage.removeItem('user_role');
    window.location.href = '/user-login.html';
}

// --- 4. SETTINGS MODAL LOGIC ---
const settingsModal = document.getElementById("settingsModal");
const openSettingsBtn = document.getElementById("openSettingsBtn");
const closeSettingsX = document.querySelector(".close-settings-btn");
const closeSettingsBtn = document.getElementById("closeSettingsBtn");
const passForm = document.getElementById("changePasswordForm");

if (openSettingsBtn) {
    // Open Modal
    openSettingsBtn.addEventListener("click", () => {
        settingsModal.style.display = "block";
    });

    // Close Modal
    const closeSettings = () => {
        settingsModal.style.display = "none";
        passForm.reset();
    };

    if(closeSettingsX) closeSettingsX.addEventListener("click", closeSettings);
    if(closeSettingsBtn) closeSettingsBtn.addEventListener("click", closeSettings);

    // Handle Form Submit
    passForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        
        const member_id = localStorage.getItem('member_id');
        const oldPassword = document.getElementById("oldPass").value;
        const newPassword = document.getElementById("newPass").value;

        try {
            const res = await fetch('/api/user-auth/change-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ member_id, oldPassword, newPassword })
            });

            const data = await res.json();

            if (res.ok) {
                alert("Password Updated! Please login again.");
                userLogout(); // Force logout for security
            } else {
                alert("Error: " + data.message);
            }
        } catch (err) {
            console.error(err);
            alert("Server Error");
        }
    });
}