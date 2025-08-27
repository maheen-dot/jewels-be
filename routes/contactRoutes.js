const express = require("express");
const router = express.Router();
const { verifyToken, admin } = require("../middleware/authMiddleware");
const { createContact, getAllContacts,getUnreadCount, markAsRead } = require("../controllers/contactcontroller");

router.post("/post", createContact);
router.get("/get",verifyToken, admin, getAllContacts);
router.get("/unread", verifyToken, admin, getUnreadCount);
router.patch("/read/:id", verifyToken, admin, markAsRead);

module.exports = router;
