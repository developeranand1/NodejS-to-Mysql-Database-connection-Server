const express = require('express');
const app = express();
const pool = require('./db'); // Import the connection pool

// Middleware to parse JSON bodies
app.use(express.json());

// Route to handle user registration
app.post('/register', async (req, res) => {
    try {
        const { username, email } = req.body;

        // Check if username or email already exists
        const [existingUsers] = await pool.query('SELECT * FROM users WHERE username = ? OR email = ?', [username, email]);
        if (existingUsers.length > 0) {
            return res.status(400).json({ error: 'Username or email already exists' });
        }

        // Insert the new user into the database
        const [result] = await pool.query('INSERT INTO users (username, email) VALUES (?, ?)', [username, email]);
        const newUser = {
            id: result.insertId,
            username,
            email,
            created_at: new Date().toISOString()
        };
        res.status(201).json(newUser);
    } catch (err) {
        console.error('Error registering user:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


// Route to handle user login
app.post('/login', async (req, res) => {
    try {
        const { username, email } = req.body;

        // Check if the user exists in the database
        const [existingUsers] = await pool.query('SELECT * FROM users WHERE username = ? AND email = ?', [username, email]);
        if (existingUsers.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json({ message: 'Login successful', user: existingUsers[0] });
    } catch (err) {
        console.error('Error logging in user:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


// Route to get all user data
app.get('/users', async (req, res) => {
    try {
        // Retrieve all users from the database
        const [users] = await pool.query('SELECT * FROM users');
        res.status(200).json(users);
    } catch (err) {
        console.error('Error getting users:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

