const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const cheerio = require('cheerio');
const app = express();
const PORT = process.env.PORT || 3000;
const HTML_FILE_PATH = path.join(__dirname, 'dashboard.html');
app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(express.static(path.join(__dirname)));
// Fetch bookmarks
app.get('/bookmarks', (req, res) => {
    fs.readFile(HTML_FILE_PATH, 'utf-8', (err, data) => {
        if (err) return res.status(500).json({ error: 'Internal Server Error' });
        const $ = cheerio.load(data);
        const bookmarks = [];
        $('tbody tr').each((index, element) => {
            const description = $(element).find('td').eq(0).text();
            const link = $(element).find('td a').attr('href');
            const altText = $(element).find('td a').text();
            bookmarks.push({ description, link, altText });
        });
        res.json({ success: true, bookmarks });
    });
});
// Add bookmark
app.post('/add-bookmark', (req, res) => {
    const { description, link, altText } = req.body;
    if (!description || !link) {
        return res.status(400).json({ error: 'Description and link are required' });
    }
    fs.readFile(HTML_FILE_PATH, 'utf-8', (err, data) => {
        if (err) return res.status(500).json({ error: 'Internal Server Error' });
        const newRow = `
            <tr>
                <td>${description}</td>
                <td><a href="${link}" target="_blank">${altText || 'Visit Link'}</a></td>
            </tr>
        `;
        const updatedContent = data.replace('</tbody>', `${newRow}</tbody>`);
        fs.writeFile(HTML_FILE_PATH, updatedContent, 'utf-8', err => {
            if (err) return res.status(500).json({ error: 'Internal Server Error' });
            res.json({ success: true });
        });
    });
});
// Edit bookmark
app.put('/edit-bookmark', (req, res) => {
    const { index, description, link, altText } = req.body;
    fs.readFile(HTML_FILE_PATH, 'utf-8', (err, data) => {
        if (err) return res.status(500).json({ error: 'Internal Server Error' });
        const $ = cheerio.load(data);
        const row = $('tbody tr').eq(index);
        if (!row.length) return res.status(400).json({ error: 'Bookmark not found' });
        row.find('td').eq(0).text(description);
        row.find('td a').attr('href', link).text(altText || 'Visit Link');
        fs.writeFile(HTML_FILE_PATH, $.html(), 'utf-8', err => {
            if (err) return res.status(500).json({ error: 'Internal Server Error' });
            res.json({ success: true });
        });
    });
});
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
