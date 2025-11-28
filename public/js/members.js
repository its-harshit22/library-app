document.addEventListener("DOMContentLoaded", () => {
    const facultyList = document.getElementById("faculty-list");
    const studentList = document.getElementById("student-list");
    
    // --- ADD/EDIT MODAL ELEMENTS ---
    const modal = document.getElementById("addMemberModal");
    const modalTitle = document.querySelector(".modal-header h4");
    const openModalBtn = document.querySelector(".btn"); 
    const closeBtn = document.querySelector(".close-btn");
    const cancelBtn = document.getElementById("cancelBtn");
    const memberForm = document.getElementById("addMemberForm");

    // --- DELETE MODAL ELEMENTS ---
    const deleteModal = document.getElementById("deleteMemberModal");
    const closeDeleteBtn = document.querySelector(".close-delete-btn");
    const cancelDeleteBtn = document.getElementById("cancelDeleteBtn");
    const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");

    // Form Fields
    const memberTypeSelect = document.getElementById("memberType");
    const dynamicLabel = document.getElementById("dynamicLabel");
    const dynamicInput = document.getElementById("dynamicInput");
    const memberIdInput = document.getElementById("member_id");
    const nameInput = document.getElementById("name");
    const emailInput = document.getElementById("email");

    // Variable to store ID to delete temporarily
    let memberToDelete = null; 

    // --- 1. LOAD DATA ---
    const loadFaculty = async () => {
        try {
            const res = await fetch('/api/members/faculty');
            const data = await res.json();
            facultyList.innerHTML = "";
            data.forEach(m => addRow(facultyList, m, 'faculty'));
        } catch (e) { console.error(e); }
    };

    const loadStudents = async () => {
        try {
            const res = await fetch('/api/members/students');
            const data = await res.json();
            studentList.innerHTML = "";
            data.forEach(m => addRow(studentList, m, 'student'));
        } catch (e) { console.error(e); }
    };

    const addRow = (table, member, type) => {
        const row = table.insertRow();
        const extraInfo = type === 'faculty' ? member.department : member.course_details;
        
        row.innerHTML = `
            <td>${member.member_id}</td>
            <td>${member.name}</td>
            <td>${extraInfo}</td>
            <td>${member.email}</td>
            <td>
                <a href="#" class="action-btn edit" data-id="${member.id}" data-type="${type}"><i class="fa fa-edit"></i></a>
                <a href="#" class="action-btn delete" data-id="${member.id}" data-type="${type}"><i class="fa fa-trash"></i></a>
            </td>
        `;
    };

    // --- 2. ADD/EDIT MODAL LOGIC ---
    const openModal = () => { modal.style.display = "block"; };
    
    const closeModal = () => {
        modal.style.display = "none";
        memberForm.reset();
        delete memberForm.dataset.editingId;
        delete memberForm.dataset.editingType;
        modalTitle.textContent = "Add New Member";
        memberTypeSelect.disabled = false;
        memberTypeSelect.value = "faculty";
        updateFormFields("faculty");
    };

    const updateFormFields = (type) => {
        if (type === "student") {
            dynamicLabel.innerText = "Course / Year";
            dynamicInput.placeholder = "e.g. B.Tech 3rd Year";
            if (!memberForm.dataset.editingId) memberIdInput.placeholder = "e.g. S001";
        } else {
            dynamicLabel.innerText = "Department";
            dynamicInput.placeholder = "e.g. Computer Science";
            if (!memberForm.dataset.editingId) memberIdInput.placeholder = "e.g. F001";
        }
    };

    openModalBtn.addEventListener("click", openModal);
    closeBtn.addEventListener("click", closeModal);
    cancelBtn.addEventListener("click", closeModal);
    
    // --- 3. DELETE MODAL LOGIC ---
    
    const closeDeleteModal = () => {
        deleteModal.style.display = "none";
        memberToDelete = null; // Reset stored ID
    };

    closeDeleteBtn.addEventListener("click", closeDeleteModal);
    cancelDeleteBtn.addEventListener("click", closeDeleteModal);

    // Handle Confirm Delete Click
    confirmDeleteBtn.addEventListener("click", async () => {
        if (!memberToDelete) return;

        const { id, type, row } = memberToDelete;
        const endpoint = type === 'faculty' ? `/api/members/faculty/${id}` : `/api/members/students/${id}`;

        try {
            const res = await fetch(endpoint, { method: 'DELETE' });
            if (res.ok) {
                row.remove(); // Remove from UI instantly
                closeDeleteModal();
            } else {
                alert("Failed to delete.");
            }
        } catch (err) { 
            console.error(err);
            alert("Error occurred while deleting.");
        }
    });

    // Click outside modals to close
    window.addEventListener("click", (e) => { 
        if(e.target == modal) closeModal(); 
        if(e.target == deleteModal) closeDeleteModal();
    });

    memberTypeSelect.addEventListener("change", (e) => updateFormFields(e.target.value));

    // --- 4. HANDLE TABLE CLICKS (EDIT & DELETE PREPARE) ---

    const handleTableActions = (e) => {
        const editBtn = e.target.closest('.edit');
        const deleteBtn = e.target.closest('.delete');

        // DELETE CLICK -> Open Confirmation Modal
        if (deleteBtn) {
            e.preventDefault();
            // Store details for later use in Confirm button
            memberToDelete = {
                id: deleteBtn.dataset.id,
                type: deleteBtn.dataset.type,
                row: deleteBtn.closest('tr')
            };
            // Show Modal
            deleteModal.style.display = "block";
        }

        // EDIT CLICK -> Open Edit Modal
        if (editBtn) {
            e.preventDefault();
            const id = editBtn.dataset.id;
            const type = editBtn.dataset.type;
            const row = editBtn.closest('tr');

            modalTitle.textContent = "Edit Member";
            memberTypeSelect.value = type;
            memberTypeSelect.disabled = true;
            updateFormFields(type);

            memberIdInput.value = row.cells[0].innerText;
            nameInput.value = row.cells[1].innerText;
            dynamicInput.value = row.cells[2].innerText;
            emailInput.value = row.cells[3].innerText;

            memberForm.dataset.editingId = id;
            memberForm.dataset.editingType = type;
            
            openModal();
        }
    };

    facultyList.addEventListener('click', handleTableActions);
    studentList.addEventListener('click', handleTableActions);

    // --- 5. SUBMIT FORM ---
    memberForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const type = memberTypeSelect.value;
        const id = memberForm.dataset.editingId;

        const payload = {
            member_id: memberIdInput.value,
            name: nameInput.value,
            email: emailInput.value
        };

        if (type === "faculty") payload.department = dynamicInput.value;
        else payload.course_details = dynamicInput.value;

        let url = type === "faculty" ? "/api/members/faculty" : "/api/members/students";
        let method = "POST";

        if (id) {
            url += `/${id}`;
            method = "PUT";
        }

        try {
            const response = await fetch(url, {
                method: method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (!response.ok) throw new Error("Failed to save");

            closeModal();
            if (type === "faculty") loadFaculty(); else loadStudents();

        } catch (error) {
            console.error(error);
            alert("Error saving member.");
        }
    });

    // Initial Load
    loadFaculty();
    loadStudents();
});