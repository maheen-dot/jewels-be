const express = require('express');
const router = express.Router();
const { saveDesign, getDesignsByUser, getDesignById, deleteDesign } = require('../controllers/designcontroller');
const {verifyToken} = require('../middleware/authMiddleware');
const { verify } = require('jsonwebtoken');

router.post('/save', verifyToken, saveDesign);
router.get('/get', verifyToken, getDesignsByUser);
router.get('/get/:id', verifyToken, getDesignById);
router.delete('/delete/:id', verifyToken, deleteDesign);

module.exports = router;
