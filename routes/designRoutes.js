const express = require('express');
const router = express.Router();
const multer = require("multer");
const { saveDesign, getDesignsByUser, getDesignById, deleteDesign } = require('../controllers/designcontroller');
const {verifyToken} = require('../middleware/authMiddleware');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB guard
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) return cb(new Error('Only images allowed'));
    cb(null, true);
  }
});

router.post('/save', verifyToken, upload.single("screenshot"), saveDesign);
router.get('/get', verifyToken, getDesignsByUser);
router.get('/get/:id', verifyToken, getDesignById);
router.delete('/delete/:id', verifyToken, deleteDesign);

module.exports = router;
