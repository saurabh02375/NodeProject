// approute.js
const express = require('express');
const router = express.Router();

// Middleware to parse JSON bodies
router.use(express.json());

router.post('/submit-form', (req, res) => {
    const formData = req.body;
    
    console.log("custom")
    // Process formData as needed
    console.log('Form data received:', formData);

    // Send a response back to the client
    res.json({ message: 'Form submitted successfully!' });
});


module.exports = router;
