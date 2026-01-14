document.getElementById("studentForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const data = {
        name: document.getElementById("name").value,
        email: document.getElementById("email").value,
        event: document.getElementById("event").value
    };

    const res = await fetch("/students/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });

    const result = await res.json();

    document.getElementById("msg").innerText = result.message;
});