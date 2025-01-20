const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors'); // Import CORS
const app = express();
const PORT = process.env.PORT || 3000;
// Allow requests from all origins (or specify your GitHub Pages domain)
app.use(cors({ origin: '*' }));
app.use(express.json());
const HTML_FILE_PATH = path.join(__dirname, 'dashboard.html');
// Existing routes remain unchanged...
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
// Path to the HTML file
const HTML_FILE_PATH = path.join(__dirname, 'dashboard.html');
// Middleware to parse JSON data
app.use(express.json());
// Serve the HTML file (for debugging)
app.get('/', (req, res) => {
    res.sendFile(HTML_FILE_PATH);
});
// API to add a new bookmark
app.post('/add-bookmark', (req, res) => {
    const { description, link } = req.body;
    if (!description || !link) {
        return res.status(400).json({ error: 'Description and link are required' });
    }
    // Read the HTML file
    fs.readFile(HTML_FILE_PATH, 'utf-8', (err, data) => {
        if (err) {
            console.error('Error reading the file:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
        // Find the <tbody> tag and insert a new row
        const newRow = `
            <tr>
                <td>${description}</td>
                <td><a href="${link}" target="_blank">${link}</a></td>
            </tr>
        `;
        const updatedContent = data.replace('</tbody>', `${newRow}</tbody>`);
        // Write the updated content back to the file
        fs.writeFile(HTML_FILE_PATH, updatedContent, 'utf-8', (err) => {
            if (err) {
                console.error('Error writing to the file:', err);
                return res.status(500).json({ error: 'Internal Server Error' });
            }
            return res.json({ success: true, message: 'Bookmark added successfully!' });
        });
    });
});
// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
