// server.js - FIX: Removed redundant app.listen() and added missing suggestions array

// 1. Install required packages:
// npm i express body-parser cors

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();

// --- Fix: Declare PORT here, and use process.env.PORT for deployment environments ---
// Hosting platforms like Netlify/Render/Railway assign their own port via process.env.PORT
// You MUST use process.env.PORT || 3000
const PORT = process.env.PORT || 3000; 

// DUMMY DATASTORE (इसे MongoDB/PostgreSQL से बदलें) ---
let queries = [];
// --- FIX: Missing array declared here ---
let suggestions = [];

// Middlewares
// CORS फ्रंटएंड को बैकएंड से बात करने की अनुमति देता है
app.use(cors()); 
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Utility to generate unique ID
const genId = () => {
  const s = Math.random().toString(36).slice(2, 9).toUpperCase();
  return 'Q-' + s;
};

// --- API Endpoints ---

// 1. नई शिकायत सबमिट करें (Citizen Side)
app.post('/api/queries', (req, res) => {
    const { name, mobile, village, subject, message } = req.body;
    const newQuery = {
        id: genId(),
        name, mobile, village, subject, message,
        status: 'Pending',
        createdAt: new Date().toISOString(),
        updates: []
    };
    queries.unshift(newQuery); // डेटाबेस में सेव करें
    console.log('New Query Submitted:', newQuery.id);
    res.status(201).json({ 
        message: 'Query submitted successfully. WhatsApp redirect pending.',
        query: newQuery 
    });
});

// 2. सभी शिकायतें लाओ (Admin View)
app.get('/api/queries', (req, res) => {
    // यहाँ Authentication/Admin check जोड़ा जाना चाहिए
    res.status(200).json(queries);
});

// 3. शिकायत स्टेटस अपडेट करें (Admin Action)
app.put('/api/queries/:id', (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const queryIndex = queries.findIndex(q => q.id === id);

    if (queryIndex > -1) {
        queries[queryIndex].status = status;
        queries[queryIndex].updates.push({ at: new Date().toISOString(), note: `Status set to ${status}` });
        // डेटाबेस में अपडेट करें
        res.status(200).json(queries[queryIndex]);
    } else {
        res.status(404).json({ message: 'Query not found' });
    }
});

// 4. सुझाव सबमिट करें
app.post('/api/suggestions', (req, res) => {
    const { name, village, subject, message } = req.body;
    const newSuggestion = {
        name: name || 'Anonymous',
        village: village || 'N/A',
        subject,
        message,
        createdAt: new Date().toISOString(),
    };
    suggestions.unshift(newSuggestion); // FIX: Now it saves to the declared array
    res.status(201).json({ message: 'Suggestion submitted successfully.' });
});

// 5. सभी सुझाव लाओ (Admin View)
app.get('/api/suggestions', (req, res) => {
    res.status(200).json(suggestions);
});


// Start the server (Only ONE app.listen call)
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});