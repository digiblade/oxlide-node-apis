const express = require("express");
const {
  createProduct,
  updateProduct,
  getProduct,
} = require("../Controller/InventoryController");
const router = express.Router();

router.post("/addProduct", createProduct);
router.post("/editProduct", updateProduct);
router.get("/getProduct", getProduct);

module.exports = router;
