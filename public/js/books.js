document.addEventListener("DOMContentLoaded", () => {
    const bookList = document.getElementById("book-list");
    const modal = document.getElementById("addBookModal");
    const addBookForm = document.getElementById("addBookForm");
    const openModalBtn = document.getElementById("openAddBookModalBtn");
    const closeBtn = document.querySelector(".close-btn");
    const cancelBtn = document.getElementById("cancelBtn");
    const modalTitle = document.querySelector(".modal-header h4");

    // --- 1. LOAD BOOKS ---
    const loadBooks = async () => {
        try {
            const res = await fetch('/api/books');
            const books = await res.json();
            bookList.innerHTML = "";
            books.forEach(book => addBookToTable(book));
        } catch (err) { console.error(err); }
    };

    const addBookToTable = (book) => {
        const row = bookList.insertRow();
        // Note: book.copyCount backend se aa raha hai
        const count = book.copyCount || 0; 
        
        row.innerHTML = `
            <td>${book.title}</td>
            <td>${book.author}</td>
            <td>${book.category}</td>
            <td>${book.isbn}</td>
            <td>
                <span class="badge" style="background: #e2e6ea; padding: 5px 10px; border-radius: 15px; font-weight: bold;">${count}</span>
            </td>
            <td>
                <button class="action-btn add-copy" data-id="${book.id}" title="Add 1 Copy" style="border:none; background:none; cursor:pointer; color: #28a745;">
                    <i class="fa fa-plus-circle" style="font-size: 18px;"></i>
                </button>
                <a href="#" class="action-btn edit" data-id="${book.id}" title="Edit"><i class="fa fa-edit"></i></a>
                <a href="#" class="action-btn delete" data-id="${book.id}" title="Delete"><i class="fa fa-trash"></i></a>
            </td>
        `;
    };

    // --- 2. ADD COPY LOGIC (New Feature) ---
    bookList.addEventListener("click", async (e) => {
        const addCopyBtn = e.target.closest(".add-copy");
        
        if (addCopyBtn) {
            const bookId = addCopyBtn.dataset.id;
            if(!confirm("Add 1 new physical copy to inventory?")) return;

            try {
                const res = await fetch(`/api/books/${bookId}/copy`, { method: 'POST' });
                if (res.ok) {
                    alert("Copy added! Accession Number generated.");
                    loadBooks(); // Refresh to see count increase
                }
            } catch (err) { console.error(err); }
        }
    });

    // --- 3. MODAL LOGIC ---
    // Note: Maine 'Copies' logic form se hata diya hai
    const openModal = () => { modal.style.display = "block"; };
    const closeModal = () => { 
        modal.style.display = "none"; 
        addBookForm.reset(); 
        delete addBookForm.dataset.editingId;
        modalTitle.textContent = "Add New Book";
    };

    openModalBtn.addEventListener("click", openModal);
    closeBtn.addEventListener("click", closeModal);
    cancelBtn.addEventListener("click", closeModal);
    window.addEventListener("click", (e) => { if (e.target == modal) closeModal(); });

    // --- 4. FORM SUBMIT (Add/Edit Title Only) ---
    addBookForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        
        const id = addBookForm.dataset.editingId;
        const payload = {
            title: document.getElementById("title").value,
            author: document.getElementById("author").value,
            category: document.getElementById("category").value,
            isbn: document.getElementById("isbn").value
        };

        let url = "/api/books";
        let method = "POST";

        if (id) {
            url += `/${id}`;
            method = "PUT";
        }

        try {
            const res = await fetch(url, {
                method: method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                closeModal();
                loadBooks();
            }
        } catch (err) { console.error(err); }
    });

    // Edit & Delete Handlers (Standard)
    bookList.addEventListener("click", async (e) => {
        const editBtn = e.target.closest(".edit");
        const deleteBtn = e.target.closest(".delete");

        if (deleteBtn) {
            if(!confirm("Delete this book and all its copies?")) return;
            const id = deleteBtn.dataset.id;
            await fetch(`/api/books/${id}`, { method: 'DELETE' });
            deleteBtn.closest("tr").remove();
        }

        if (editBtn) {
            const id = editBtn.dataset.id;
            const row = editBtn.closest("tr");
            document.getElementById("title").value = row.cells[0].innerText;
            document.getElementById("author").value = row.cells[1].innerText;
            document.getElementById("category").value = row.cells[2].innerText;
            document.getElementById("isbn").value = row.cells[3].innerText;
            
            addBookForm.dataset.editingId = id;
            modalTitle.textContent = "Edit Book Details";
            openModal();
        }
    });

    loadBooks();
});