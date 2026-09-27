const express = require("express");

const {
  globalSearch,
} = require("../controllers/searchController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get(
  "/",
  authMiddleware,
  globalSearch
);

module.exports = router;