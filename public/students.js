// Fetch students from backend and show in table
async function loadStudents() {
  try {
    const response = await fetch("/students"); // server API call
    const data = await response.json();

    const tbody = document.getElementById("tbody");
    tbody.innerHTML = "";

    if (data.length === 0) {
      tbody.innerHTML = "<tr><td colspan='4'>No Students Found</td></tr>";
      return;
    }

    data.forEach(student => {
      const tr = document.createElement("tr");
      

      tr.innerHTML = `
        <td>${student.id}</td>
        <td>${student.name}</td>
        <td>${student.email}</td>
        <td>${student.event || ""}</td>
      `;

      tbody.appendChild(tr);
    });

  } catch (error) {
    console.error("Error loading students:", error);
    document.getElementById("tbody").innerHTML =
      "<tr><td colspan='4' style='color:red'>Error loading data</td></tr>";
  }
}

// Run automatically when page loads
loadStudents();