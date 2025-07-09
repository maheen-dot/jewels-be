const express = require('express');
const router = express.Router();
const { saveDesign, getDesignsByUser } = require('../controllers/designcontroller');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/save', authMiddleware, saveDesign);
router.get('/get', authMiddleware, getDesignsByUser);

module.exports = router;
