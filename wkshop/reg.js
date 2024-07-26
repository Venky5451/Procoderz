const mysql = require('mysql');
const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'workshop_management'
});

db.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('MySQL Connected as id ' + db.threadId);
});

app.get('/register', (req, res) => {
    res.render('register');
});

app.post('/register', (req, res) => {
    const { name, aadhar, pan, birthdate, email, role, accountNumber, ifsc, bankName, branch } = req.body;
    const username = generateUsername(name);

    const user = { name, aadhar, pan, birthdate, email, role, accountNumber, ifsc, bankName, branch, username };
    const query = 'INSERT INTO users SET ?';

    db.query(query, user, (err, result) => {
        if (err) {
            console.error('Error executing query:', err);
            res.status(500).send('Server Error');
            return;
        }
        sendEmail(email, username);
        res.redirect('/landing');
    });
});

function generateUsername(name) {
    const randomNum = Math.floor(Math.random() * 10000);
    return `${name.toLowerCase().replace(/ /g, '')}${randomNum}`;
}

function sendEmail(to, username) {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL,
            pass: process.env.PASSWORD
        }
    });

    const mailOptions = {
        from: process.env.EMAIL,
        to,
        subject: 'Your Username for Workshop Management System',
        text: `Hello, your username is: ${username}`
    };

    transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
            console.log('Error sending email:', err);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
}

app.get('/landing', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'landing', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
