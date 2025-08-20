const express = require("express");
const router = express.Router();
const { createContact, getAllContacts } = require("../controllers/contactcontroller");

// @route POST /api/contact
router.post("/", createContact);

// @route GET /api/contact (admin can see all messages)
router.get("/", getAllContacts);

module.exports = router;
