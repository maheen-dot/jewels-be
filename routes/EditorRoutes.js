const express = require('express');
const router = express.Router();
const editorController = require('../controllers/editorcontroller');
const authMiddleware = require('../middleware/auth');

// Public endpoints
router.get('/models/:category', editorController.getProductModels);

// Protected endpoints
router.use(authMiddleware.protect);
router.post('/save', editorController.saveDesign);
router.post('/:designId/add-to-cart', editorController.addToCart);

module.exports = router;