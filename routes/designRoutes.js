const express = require('express');
const router = express.Router();
const { saveDesign, getDesignsByUser, getDesignById, deleteDesign } = require('../controllers/designcontroller');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/save', authMiddleware, saveDesign);
router.get('/get', authMiddleware, getDesignsByUser);
router.get('/get/:id', authMiddleware, getDesignById);
router.delete('/delete/:id', authMiddleware, deleteDesign);

module.exports = router;
