const express = require('express');
const router = express.Router();
const db = require('../db'); 
const nodemailer = require('nodemailer'); 
const PDFDocument = require('pdfkit');    

// --- 1. CONFIGURATION 
const MY_EMAIL = '-----------------------';  
const MY_PASSWORD = '---------------------';   

// --- 2. ADD STUDENT ---
router.post('/add', (req, res) => {
    const { name, email, event } = req.body;
    const sql = "INSERT INTO students (name, email, event) VALUES (?, ?, ?)";
    db.query(sql, [name, email, event], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Student added successfully!" });
    });
});

// --- 3. GET STUDENTS (FIXED LIST ROUTE) ---
router.get('/list', (req, res) => {
    const searchQuery = req.query.search; 
    const sortEvent = req.query.event;

    let sql = "SELECT * FROM students";
    let params = [];
    let conditions = [];

    if (searchQuery) {
        conditions.push("name LIKE ?");
        params.push(`%${searchQuery}%`);
    }

    if (sortEvent && sortEvent !== 'All') {
        conditions.push("event = ?");
        params.push(sortEvent);
    }

    if (conditions.length > 0) {
        sql += " WHERE " + conditions.join(" AND ");
    }

    sql += " ORDER BY id DESC";

    db.query(sql, params, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// --- 4. DELETE STUDENT ---
router.delete('/delete/:id', (req, res) => {
    const id = req.params.id;
    const sql = "DELETE FROM students WHERE id = ?";
    db.query(sql, [id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Student deleted successfully!" });
    });
});

// --- 5. UPDATE STUDENT ---
router.put('/update/:id', (req, res) => {
    const id = req.params.id;
    const { name, email, event } = req.body;
    const sql = "UPDATE students SET name = ?, email = ?, event = ? WHERE id = ?";
    db.query(sql, [name, email, event, id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Student updated successfully!" });
    });
});

// --- 6. SEND CERTIFICATE (NEW FEATURE) ---
router.post('/send-certificate/:id', (req, res) => {
    const id = req.params.id;

    // स्टूडेंट को ढूंढें
    db.query('SELECT * FROM students WHERE id = ?', [id], (err, results) => {
        if (err || results.length === 0) return res.status(404).json({ error: "Student not found" });

        const student = results[0];

        // PDF सर्टिफिकेट बनाएं
        const doc = new PDFDocument({ layout: 'landscape', size: 'A4' });
        let buffers = [];
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
            let pdfData = Buffer.concat(buffers);
            sendEmail(student, pdfData, res);
        });

        // डिजाइन (Design)
        doc.rect(0, 0, doc.page.width, doc.page.height).fill('#f0f0f0'); 
        doc.strokeColor('#2980b9').lineWidth(20).rect(20, 20, doc.page.width - 40, doc.page.height - 40).stroke(); 

        doc.fillColor('#2c3e50').fontSize(40).text('CERTIFICATE OF PARTICIPATION', 0, 150, { align: 'center' });
        doc.moveDown();
        doc.fillColor('#000').fontSize(20).text('This is presented to', { align: 'center' });
        doc.moveDown();
        doc.fillColor('#e74c3c').fontSize(50).text(student.name, { align: 'center' });
        doc.moveDown();
        doc.fillColor('#000').fontSize(20).text(`For successfully registering in:`, { align: 'center' });
        doc.fillColor('#2980b9').fontSize(30).text(student.event, { align: 'center' });

        doc.end(); 
    });
});

// ... (Send Certificate Route के बाद और module.exports से पहले यह पेस्ट करें) ...

// --- 7. PUBLIC FEEDBACK & AUTO CERTIFICATE ROUTE ---
router.post('/submit-feedback', (req, res) => {
    const { email, rating, comment } = req.body;

    // 1. चेक करें कि क्या स्टूडेंट इस ईमेल से रजिस्टर्ड है?
    const sql = "SELECT * FROM students WHERE email = ?";
    db.query(sql, [email], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        
        // अगर ईमेल नहीं मिला
        if (results.length === 0) {
            return res.status(404).json({ error: "Email not found! Please use registered email." });
        }

        const student = results[0];

        // (Optional) यहाँ आप Feedback को डेटाबेस में सेव करने का कोड भी लिख सकते हैं
        // अभी के लिए हम सीधे सर्टिफिकेट भेजेंगे
        
        // 2. PDF सर्टिफिकेट बनाएं
        const doc = new PDFDocument({ layout: 'landscape', size: 'A4' });
        let buffers = [];
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
            let pdfData = Buffer.concat(buffers);
            
            // 3. ईमेल भेजें
            sendEmail(student, pdfData, res);
        });

        // सर्टिफिकेट डिजाइन (Same Design)
        doc.rect(0, 0, doc.page.width, doc.page.height).fill('#f0f0f0');
        doc.strokeColor('#2980b9').lineWidth(20).rect(20, 20, doc.page.width - 40, doc.page.height - 40).stroke();
        
        doc.fillColor('#2c3e50').fontSize(40).text('CERTIFICATE OF PARTICIPATION', 0, 150, { align: 'center' });
        doc.moveDown();
        doc.fillColor('#000').fontSize(20).text('This is presented to', { align: 'center' });
        doc.moveDown();
        doc.fillColor('#e74c3c').fontSize(50).text(student.name, { align: 'center' });
        doc.moveDown();
        doc.fillColor('#000').fontSize(20).text(`For completing the event & feedback:`, { align: 'center' });
        doc.fillColor('#2980b9').fontSize(30).text(student.event, { align: 'center' });

        doc.end();
    });
});

// ईमेल भेजने का फंक्शन
function sendEmail(student, pdfBuffer, res) {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: MY_EMAIL,
            pass: MY_PASSWORD
        }
    });

    const mailOptions = {
        from: MY_EMAIL,
        to: student.email,
        subject: '🎉 Your Course Certificate',
        text: `Hello ${student.name},\n\nHere is your certificate for the ${student.event} event.\n\nBest,\nEvent Team`,
        attachments: [
            {
                filename: `${student.name}_Certificate.pdf`,
                content: pdfBuffer,
                contentType: 'application/pdf'
            }
        ]
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log("Email Error:", error);
            return res.status(500).json({ error: "Failed to send email" });
        }
        res.json({ message: "Certificate sent successfully!" });
    });
}

module.exports = router;