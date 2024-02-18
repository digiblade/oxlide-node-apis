const express = require("express");
const {
  registerUser,
  createRole,
  getRoles,
  updateRole,
  checkLogin,
} = require("../Controller/AuthController");
const router = express.Router();

router.post("/register", registerUser);
router.post("/add/role", createRole);
router.post("/get/roles", getRoles);
router.post("/edit/role", updateRole);
router.post("/login", checkLogin);

module.exports = router;
