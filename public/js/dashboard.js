document.addEventListener("DOMContentLoaded", async () => {
    
    // IDs for Numbers
    const totalCopiesEl = document.getElementById("total-copies");
    const activeIssuesEl = document.getElementById("active-issues");
    const totalMembersEl = document.getElementById("total-members");
    const totalTitlesEl = document.getElementById("total-titles");

    // Selectors for Lists (Using classes from your HTML)
    const activityList = document.querySelector(".activities");
    const dueList = document.querySelector(".assignments");

    try {
        const response = await fetch('/api/dashboard/stats');
        if (!response.ok) throw new Error("Failed to fetch stats");

        const data = await response.json();

        // 1. Update Numbers
        if(totalCopiesEl) totalCopiesEl.innerText = data.totalCopies;
        if(activeIssuesEl) activeIssuesEl.innerText = data.activeIssues;
        if(totalMembersEl) totalMembersEl.innerText = data.totalMembers;
        if(totalTitlesEl) totalTitlesEl.innerText = data.totalTitles;

        // 2. Update Recent Activities
        activityList.innerHTML = ""; // Clear fake data
        if (data.recentActivities.length === 0) {
            activityList.innerHTML = "<li style='color:#888'>No recent activity</li>";
        } else {
            data.recentActivities.forEach(item => {
                const bookTitle = item.BookCopy?.Book?.title || "Unknown Book";
                const action = item.status === 'Issued' ? 'issued' : 'returned';
                const color = item.status === 'Issued' ? '#007bff' : '#28a745'; // Blue for issue, Green for return
                
                // Create List Item
                const li = document.createElement("li");
                li.innerHTML = `Book ${action}: <strong style="color:${color}">'${bookTitle}'</strong> to ${item.member_id}`;
                activityList.appendChild(li);
            });
        }

        // 3. Update Due Soon
        // We keep the header <h4>Books Due Soon</h4>, so we manipulate the divs inside
        // First, clear everything except the header (a bit tricky, so let's just append)
        const header = dueList.querySelector("h4");
        dueList.innerHTML = ""; // Clear all
        dueList.appendChild(header); // Put header back

        if (data.dueSoon.length === 0) {
            const div = document.createElement("div");
            div.innerText = "No upcoming dues";
            div.style.color = "#888";
            div.style.padding = "10px 0";
            dueList.appendChild(div);
        } else {
            data.dueSoon.forEach(item => {
                const bookTitle = item.BookCopy?.Book?.title || "Unknown";
                const dueDate = new Date(item.due_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
                
                // Check if overdue
                const isOverdue = new Date(item.due_date) < new Date();
                const statusText = isOverdue ? "Overdue" : "Due";
                const statusColor = isOverdue ? "#dc3545" : "#ffc107"; // Red or Yellow

                const div = document.createElement("div");
                div.innerHTML = `'${bookTitle}' <span style="color:${statusColor}; font-weight:bold; font-size:12px;">${statusText}, ${dueDate}</span>`;
                dueList.appendChild(div);
            });
        }

    } catch (error) {
        console.error("Dashboard Error:", error);
    }
});