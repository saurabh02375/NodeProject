const express = require('express');
const router = express.Router();

router.use(express.json());

router.post('/submit-form', (req, res) => {
    const formData = req.body;
    console.log('Form data received:', formData);

    res.json({ message: 'Form submitted successfully!' });
});


module.exports = router;
