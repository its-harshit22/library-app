// Current Page ka naam nikalo
const path = window.location.pathname;

// Agar hum pehle se Login Page par hain, toh checking mat karo
if (!path.includes("login.html")) {
    
    const token = localStorage.getItem('token');

    if (!token) {
        // Agar token nahi hai, toh Login par bhejo
        window.location.href = '/login.html';
    }
}

// Logout Function
function logout() {
    if(confirm("Are you sure you want to logout?")) {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        window.location.href = '/login.html';
    }
}