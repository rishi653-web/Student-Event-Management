const API_URL = "http://localhost:3000/students";

// --- 1. ADD STUDENT LOGIC ---
const addForm = document.getElementById('addStudentForm');
if (addForm) {
    addForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const student = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            event: document.getElementById('event').value
        };

        const res = await fetch(`${API_URL}/add`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(student)
        });

        if (res.ok) {
            alert('Student Registered Successfully!');
            window.location.href = 'students.html'; // Go to list page
        } else {
            alert('Error adding student');
        }
    });
}

// --- 2. LIST, SEARCH, & FILTER LOGIC ---
const studentTable = document.getElementById('studentTableBody');
if (studentTable) {
    // Initial Load
    fetchStudents();

    // Search/Filter Event Listeners
    document.getElementById('searchInput').addEventListener('input', fetchStudents);
    document.getElementById('eventFilter').addEventListener('change', fetchStudents);
}

async function fetchStudents() {
    const search = document.getElementById('searchInput').value;
    const event = document.getElementById('eventFilter').value;

    // Call API with search & sort queries
    const res = await fetch(`${API_URL}/list?search=${search}&event=${event}`);
    const data = await res.json();

    const tbody = document.getElementById('studentTableBody');
    tbody.innerHTML = ''; // Clear table

    data.forEach(student => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${student.id}</td>
            <td><input type="text" value="${student.name}" id="name-${student.id}" disabled class="editable"></td>
            <td><input type="text" value="${student.email}" id="email-${student.id}" disabled class="editable"></td>
            <td>
                <select id="event-${student.id}" disabled class="editable">
                    <option value="Coding" ${student.event === 'Coding' ? 'selected' : ''}>Coding</option>
                    <option value="Sports" ${student.event === 'Sports' ? 'selected' : ''}>Sports</option>
                    <option value="Music" ${student.event === 'Music' ? 'selected' : ''}>Music</option>
                </select>
            </td>
            <td>
    <button onclick="enableEdit(${student.id})" ... >Edit</button>
    ...
    <button onclick="deleteStudent(${student.id})" ... >Delete</button>
</td>
            <td>
    <button onclick="enableEdit(${student.id})" class="btn-edit" id="edit-btn-${student.id}">Edit</button>
    <button onclick="saveEdit(${student.id})" class="btn-edit" id="save-btn-${student.id}" style="display:none; background-color:#28a745; color:white;">Save</button>
    
    <button onclick="deleteStudent(${student.id})" class="btn-delete">Delete</button>
    
    <button onclick="sendCertificate(${student.id})" style="background-color: #6f42c1; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; margin-left: 5px;">📩 Send Cert</button>
</td>
            <td>
                <button onclick="enableEdit(${student.id})" class="btn-edit" id="edit-btn-${student.id}">Edit</button>
                <button onclick="saveEdit(${student.id})" class="btn-edit" id="save-btn-${student.id}" style="display:none; background-color:#28a745; color:white;">Save</button>
                <button onclick="deleteStudent(${student.id})" class="btn-delete">Delete</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// --- 3. DELETE LOGIC ---
async function deleteStudent(id) {
    if(!confirm('Are you sure you want to delete this student?')) return;

    const res = await fetch(`${API_URL}/delete/${id}`, { method: 'DELETE' });
    if (res.ok) {
        fetchStudents(); // Refresh table
    } else {
        alert('Failed to delete');
    }
}

// --- 4. UPDATE (EDIT) LOGIC ---
function enableEdit(id) {
    // Enable inputs
    document.getElementById(`name-${id}`).disabled = false;
    document.getElementById(`email-${id}`).disabled = false;
    document.getElementById(`event-${id}`).disabled = false;
    
    // Toggle Buttons
    document.getElementById(`edit-btn-${id}`).style.display = 'none';
    document.getElementById(`save-btn-${id}`).style.display = 'inline-block';
}

async function saveEdit(id) {
    const updatedData = {
        name: document.getElementById(`name-${id}`).value,
        email: document.getElementById(`email-${id}`).value,
        event: document.getElementById(`event-${id}`).value
    };

    const res = await fetch(`${API_URL}/update/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData)
    });

    if (res.ok) {
        alert('Updated Successfully!');
        fetchStudents(); // Refresh to reset inputs to disabled state
    } else {
        alert('Update Failed');
    }
}
// --- 6. SEND CERTIFICATE LOGIC ---
async function sendCertificate(id) {
    if(!confirm('Send certificate to this student via email?')) return;

    alert('Sending email... please wait (this takes a few seconds)');

    const res = await fetch(`${API_URL}/send-certificate/${id}`, { method: 'POST' });
    
    if (res.ok) {
        alert('✅ Certificate Sent Successfully!');
    } else {
        alert('❌ Failed to send email. Check server logs.');
    }
}