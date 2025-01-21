const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const cheerio = require('cheerio');
const app = express();
const PORT = process.env.PORT || 3000;
// Path to the HTML file
const HTML_FILE_PATH = path.join(__dirname, 'dashboard.html');
// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(express.static(path.join(__dirname)));
// Serve the static HTML file
app.get('/', (req, res) => {
    res.sendFile(HTML_FILE_PATH);
});
// API to fetch bookmarks
app.get('/bookmarks', (req, res) => {
    fs.readFile(HTML_FILE_PATH, 'utf-8', (err, data) => {
        if (err) return res.status(500).json({ error: 'Internal Server Error' });
        const $ = cheerio.load(data);
        const bookmarks = [];
        $('tbody tr').each((index, element) => {
            const description = $(element).find('td').eq(0).text();
            const link = $(element).find('td a').attr('href');
            bookmarks.push({ description, link });
        });
        res.json({ success: true, bookmarks });
    });
});
// API to add a bookmark
app.post('/add-bookmark', (req, res) => {
    const { description, link } = req.body;
    if (!description || !link) return res.status(400).json({ error: 'Description and link are required' });
    fs.readFile(HTML_FILE_PATH, 'utf-8', (err, data) => {
        if (err) return res.status(500).json({ error: 'Internal Server Error' });
        const newRow = `
            <tr>
                <td>${description}</td>
                <td><a href="${link}" target="_blank">${link}</a></td>
            </tr>
        `;
        const updatedContent = data.replace('</tbody>', `${newRow}</tbody>`);
        fs.writeFile(HTML_FILE_PATH, updatedContent, 'utf-8', err => {
            if (err) return res.status(500).json({ error: 'Internal Server Error' });
            res.json({ success: true });
        });
    });
});
// API to edit a bookmark
app.put('/edit-bookmark', (req, res) => {
    const { index, newDescription, newLink } = req.body;
    fs.readFile(HTML_FILE_PATH, 'utf-8', (err, data) => {
        if (err) return res.status(500).json({ error: 'Internal Server Error' });
        const $ = cheerio.load(data);
        const row = $('tbody tr').eq(index);
        if (!row.length) return res.status(400).json({ error: 'Bookmark not found' });
        row.find('td').eq(0).text(newDescription);
        row.find('td a').attr('href', newLink).text(newLink);
        fs.writeFile(HTML_FILE_PATH, $.html(), 'utf-8', err => {
            if (err) return res.status(500).json({ error: 'Internal Server Error' });
            res.json({ success: true });
        });
    });
});
// API to delete a bookmark
app.delete('/delete-bookmark', (req, res) => {
    const { index } = req.body;
    fs.readFile(HTML_FILE_PATH, 'utf-8', (err, data) => {
        if (err) return res.status(500).json({ error: 'Internal Server Error' });
        const $ = cheerio.load(data);
        const row = $('tbody tr').eq(index);
        if (!row.length) return res.status(400).json({ error: 'Bookmark not found' });
        row.remove();
        fs.writeFile(HTML_FILE_PATH, $.html(), 'utf-8', err => {
            if (err) return res.status(500).json({ error: 'Internal Server Error' });
            res.json({ success: true });
        });
    });
});
// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
