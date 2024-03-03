const express = require("express");
const {
  createProduct,
  updateProduct,
  getProduct,
  createBatch,
  updateBatch,
  getBatch,
} = require("../Controller/InventoryController");
const router = express.Router();

router.post("/addProduct", createProduct);
router.post("/editProduct", updateProduct);
router.get("/getProduct", getProduct);

router.post("/addBatch", createBatch);
router.post("/editBatch", updateBatch);
router.get("/getBatch", getBatch);

module.exports = router;
