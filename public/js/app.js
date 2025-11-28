document.addEventListener("DOMContentLoaded", () => {
    // 1. Create Overlay (Background ko dhundhla karne ke liye)
    const overlay = document.createElement("div");
    overlay.className = "overlay";
    document.body.appendChild(overlay);

    // 2. Elements dhoondo
    const menuBtn = document.getElementById("menu-btn");
    const sidebar = document.querySelector(".sidebar");
    const closeSidebarBtn = document.querySelector("#close-sidebar"); // Optional if you added it

    // 3. Button Click Logic
    if (menuBtn) {
        menuBtn.addEventListener("click", (e) => {
            e.stopPropagation(); // Click ko failne se roko
            sidebar.classList.toggle("show"); // Sidebar dikhao
            overlay.classList.toggle("active"); // Background dark karo
        });
    }

    // 4. Close jab bahar click karein
    overlay.addEventListener("click", () => {
        sidebar.classList.remove("show");
        overlay.classList.remove("active");
    });

    // 5. Close jab Sidebar ke andar kisi link par click karein (Optional)
    const sidebarLinks = document.querySelectorAll(".sidebar a");
    sidebarLinks.forEach(link => {
        link.addEventListener("click", () => {
            // Mobile par hi band karna hai
            if (window.innerWidth <= 768) {
                sidebar.classList.remove("show");
                overlay.classList.remove("active");
            }
        });
    });
});