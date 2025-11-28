document.addEventListener("DOMContentLoaded", () => {
    const issuedList = document.getElementById("issued-list");
    const modal = document.getElementById("issueBookModal");
    const form = document.getElementById("issueBookForm");
    
    // Inputs
    const memberSelect = document.getElementById("memberSelect");
    const bookSelect = document.getElementById("bookSelect");
    const copySelect = document.getElementById("copySelect");
    const dueDateInput = document.getElementById("dueDate");

    // --- 1. LOAD ISSUED TABLE (Updated with Fine Column) ---
    const loadIssuedBooks = async () => {
        try {
            const res = await fetch('/api/issued');
            const data = await res.json();
            issuedList.innerHTML = "";

            if(data.length === 0) {
                // Colspan increased to 7 because we added Fine column
                issuedList.innerHTML = "<tr><td colspan='7' style='text-align:center;'>No books currently issued</td></tr>";
                return;
            }

            data.forEach(issue => {
                const row = issuedList.insertRow();
                const bookTitle = issue.BookCopy?.Book?.title || "Unknown";
                const accessionNo = issue.BookCopy?.accession_number || "N/A";
                
                // Status Badge Color
                let statusColor = '#ffc107'; // Issued (Yellow)
                if(issue.status === 'Returned') statusColor = '#28a745'; // Green
                if(issue.status === 'Overdue') statusColor = '#dc3545'; // Red

                // Fine Display Logic
                let fineDisplay = '-';
                if (issue.fine > 0) {
                    fineDisplay = `<span style="color: #dc3545; font-weight: bold;">₹${issue.fine}</span>`;
                } else if (issue.status === 'Returned') {
                    fineDisplay = `<span style="color: #28a745;">₹0</span>`;
                }

                row.innerHTML = `
                    <td>${bookTitle} <br><small style="color:#888;">(${accessionNo})</small></td>
                    <td>${issue.member_id} <br><small style="color:#888;">${issue.member_type}</small></td>
                    <td>${new Date(issue.issue_date).toLocaleDateString()}</td>
                    <td>${new Date(issue.due_date).toLocaleDateString()}</td>
                    <td><span style="background:${statusColor}; color:white; padding:4px 8px; border-radius:4px; font-size:12px;">${issue.status}</span></td>
                    
                    <td>${fineDisplay}</td>

                    <td>
                        ${issue.status === 'Issued' || issue.status === 'Overdue' ? 
                            `<button class="btn return-btn" data-id="${issue.id}" style="padding:5px 10px; font-size:12px;">Return</button>` 
                            : '-'
                        }
                    </td>
                `;
            });
        } catch (e) { console.error(e); }
    };

    // --- 2. LOAD DROPDOWNS ---
    const loadDropdowns = async () => {
        try {
            const [facRes, stuRes, bookRes] = await Promise.all([
                fetch('/api/members/faculty'),
                fetch('/api/members/students'),
                fetch('/api/books')
            ]);

            const faculty = await facRes.json();
            const students = await stuRes.json();
            const books = await bookRes.json();

            memberSelect.innerHTML = '<option value="">Select Member</option>';
            faculty.forEach(f => memberSelect.innerHTML += `<option value="${f.member_id}|Faculty">${f.name} (Faculty)</option>`);
            students.forEach(s => memberSelect.innerHTML += `<option value="${s.member_id}|Student">${s.name} (Student)</option>`);

            bookSelect.innerHTML = '<option value="">Select Book</option>';
            books.forEach(b => bookSelect.innerHTML += `<option value="${b.id}">${b.title}</option>`);

        } catch (e) { console.error(e); }
    };

    // --- 3. LOAD AVAILABLE COPIES ---
    bookSelect.addEventListener("change", async (e) => {
        const bookId = e.target.value;
        copySelect.innerHTML = '<option value="">Loading...</option>';
        copySelect.disabled = true;

        if(!bookId) return;

        try {
            const res = await fetch(`/api/books/${bookId}/copies`);
            const copies = await res.json();

            if(copies.length === 0) {
                copySelect.innerHTML = '<option value="">No Copies Available</option>';
            } else {
                copySelect.innerHTML = '<option value="">Select Copy</option>';
                copies.forEach(c => {
                    copySelect.innerHTML += `<option value="${c.id}">${c.accession_number}</option>`;
                });
                copySelect.disabled = false;
            }
        } catch (e) { console.error(e); }
    });

    // --- 4. SUBMIT ISSUE ---
    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const [member_id, member_type] = memberSelect.value.split("|");

        const payload = {
            copy_id: copySelect.value,
            member_id: member_id,
            member_type: member_type,
            due_date: dueDateInput.value
        };

        try {
            const res = await fetch('/api/issued', {
                method: 'POST',
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if(res.ok) {
                alert("Book Issued!");
                modal.style.display = "none";
                form.reset();
                loadIssuedBooks();
            } else {
                const err = await res.json();
                alert("Error: " + err.message);
            }
        } catch (e) { console.error(e); }
    });

    // --- 5. RETURN BOOK (With Fine Alert) ---
    issuedList.addEventListener("click", async (e) => {
        if(e.target.classList.contains("return-btn")) {
            if(!confirm("Return this book?")) return;
            const id = e.target.dataset.id;
            
            try {
                const res = await fetch(`/api/issued/${id}/return`, { method: 'POST' });
                const data = await res.json();

                if(res.ok) {
                    if (data.fine > 0) {
                        alert(`⚠️ BOOK RETURNED LATE! \n\nDays Late: ${data.daysLate}\nFine Amount: ₹${data.fine}\n\nPlease collect fine.`);
                    } else {
                        alert("Book Returned. No Fine.");
                    }
                    loadIssuedBooks();
                } else {
                    alert("Error: " + data.message);
                }
            } catch (err) { console.error(err); }
        }
    });

    // Modal Controls
    document.getElementById("openIssueModalBtn").addEventListener("click", () => {
        modal.style.display = "block";
        const d = new Date();
        d.setDate(d.getDate() + 7);
        dueDateInput.value = d.toISOString().split('T')[0];
    });
    const close = () => modal.style.display = "none";
    document.querySelector(".close-btn").addEventListener("click", close);
    document.getElementById("cancelBtn").addEventListener("click", close);

    // Init
    loadIssuedBooks();
    loadDropdowns();
});