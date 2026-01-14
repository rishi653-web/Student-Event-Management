const express = require('express');
const app = express();
const path = require('path');

// 1. Connect to Database
// Ensure db.js is in the same folder as server.js
const db = require('./db'); 

// 2. Import Routes
// Ensure you have the file: routes/students.js
const studentRoutes = require('./routes/students'); 

// 3. Middleware (Settings)
app.use(express.json()); // Allows backend to read JSON data
app.use(express.urlencoded({ extended: true })); // Allows backend to read form data

// --- IMPORTANT: SERVE FRONTEND FILES ---
// This makes the 'public' folder accessible so index.html works
app.use(express.static(path.join(__dirname, 'public'))); 
// ---------------------------------------

// 4. Use Routes
// All URLs starting with /students will go to the students.js file
app.use('/students', studentRoutes);

// 5. Start Server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`✅ Server is running on port ${PORT}`);
    console.log(`👉 Go to: http://localhost:${PORT}/students.html`);
});