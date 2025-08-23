const express = require("express");
const router = express.Router();
const { protect, admin } = require("../middleware/authMiddleware");
const { createContact, getAllContacts,getUnreadCount, markAsRead } = require("../controllers/contactcontroller");

// @route POST /api/contact
router.post("/post", createContact);

// @route GET /api/contact (admin can see all messages)
router.get("/get",protect, admin, getAllContacts);

// @route GET /api/contact/unread (admin can see unread messages count)
router.get("/unread", protect, admin, getUnreadCount);

// @route PUT /api/contact/:id (admin can mark messages as read)
router.patch("/read/:id", protect, admin, markAsRead);

module.exports = router;
