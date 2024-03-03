const { getMySqlConnection } = require("../DBConfig/dbConfig");
let properties = [
  "id",
  "product_name",
  "product_description",
  "product_sku",
  "product_mrp",
  "product_selling_price",
  "created_at",
  "updated_at",
  "product_expiry",
  "product_purchase_date",
  "is_active",
];
let batchProperties = [
  "batch_id",
  "batch_expiry",
  "batch_name",
  "product_id",
  "product_qty",
  "product_sell",
  "product_buyprice",
  "is_active",
];
const createProduct = async (req, res) => {
  let {
    product_name,
    product_description,
    product_sku,
    product_mrp,
    product_selling_price,
    product_expiry,
    product_purchase_date,
  } = req.body;

  try {
    let sqlCursor = getMySqlConnection();
    let date = new Date() / 1000;
    let [rows] = await sqlCursor.execute(
      "INSERT INTO inventory (product_name,product_description,product_sku, product_mrp, product_selling_price, created_at, updated_at,product_expiry,product_purchase_date) VALUES(?,?,?,?,?,?,?,?,?)",
      [
        product_name,
        product_description,
        product_sku,
        product_mrp,
        product_selling_price,
        date,
        date,
        product_expiry,
        product_purchase_date,
      ]
    );
    if (rows.length === 0) {
      res.status(500).send({ msg: "Product is not created" });
    } else {
      res.status(201).send({ msg: "Product has been added" });
    }
  } catch (error) {
    res.status(500).send({ msg: "Something went wrong", error });
  }
};
const updateProduct = async (req, res) => {
  let propertyList = req.body;
  let date = new Date() / 1000;
  propertyList["updated_at"] = date;
  if (!propertyList["id"]) {
    res.status(400).send({ msg: "Product id is required" });
    return;
  }
  try {
    Object.keys({ ...propertyList }).forEach((key) => {
      if (!properties.includes(key)) {
        delete propertyList[key];
      }
    });

    let sqlCursor = getMySqlConnection();

    let [rows] = await sqlCursor.execute(
      `UPDATE inventory SET ${Object.keys(propertyList)
        .map((key) => `${key} = ?`)
        .join(", ")} WHERE id = ${propertyList["id"]}`,
      [...Object.values(propertyList)]
    );
    if (rows.length === 0) {
      res.status(500).send({ msg: "Product is not updated" });
    } else {
      res.status(200).send({ msg: "Product has been updated" });
    }
  } catch (error) {
    res.status(500).send({ msg: "Something went wrong", error: error });
  }
};
const getProduct = async (req, res) => {
  try {
    let sqlCursor = getMySqlConnection();
    let [rows] = await sqlCursor.execute(
      "SELECT * FROM inventory WHERE is_active = 1"
    );
    res.status(200).send(rows);
  } catch (error) {
    res.status(500).send({ msg: "Something went wrong", error });
  }
};

const createBatch = async (req, res) => {
  let { batch_expiry, product_id, product_qty, product_buyprice } = req.body;

  try {
    let sqlCursor = getMySqlConnection();
    let date = new Date() / 1000;
    let [rows] = await sqlCursor.execute(
      "INSERT INTO batch (batch_expiry,product_id,product_qty, product_buyprice, created_at, updated_at) VALUES(?,?,?,?,?,?)",
      [batch_expiry, product_id, product_qty, product_buyprice, date, date]
    );
    if (rows.length === 0) {
      res.status(500).send({ msg: "Batch is not created" });
    } else {
      res.status(201).send({ msg: "Batch has been added" });
    }
  } catch (error) {
    res.status(500).send({ msg: "Something went wrong", error });
  }
};
const updateBatch = async (req, res) => {
  let propertyList = req.body;
  let date = new Date() / 1000;
  propertyList["updated_at"] = date;
  if (!propertyList["batch_id"]) {
    res.status(400).send({ msg: "Batch id is required" });
    return;
  }
  try {
    Object.keys({ ...propertyList }).forEach((key) => {
      if (!batchProperties.includes(key)) {
        delete propertyList[key];
      }
    });

    let sqlCursor = getMySqlConnection();

    let [rows] = await sqlCursor.execute(
      `UPDATE batch SET ${Object.keys(propertyList)
        .map((key) => `${key} = ?`)
        .join(", ")} WHERE batch_id = ${propertyList["batch_id"]}`,
      [...Object.values(propertyList)]
    );
    if (rows.length === 0) {
      res.status(500).send({ msg: "Batch is not updated" });
    } else {
      res.status(200).send({ msg: "Batch has been updated" });
    }
  } catch (error) {
    res.status(500).send({ msg: "Something went wrong", error: error });
  }
};
const getBatch = async (req, res) => {
  try {
    let sqlCursor = getMySqlConnection();
    let [rows] = await sqlCursor.execute(
      "SELECT * FROM batch JOIN inventory on batch.product_id = inventory.id WHERE batch.is_active = 1"
    );
    res.status(200).send(rows);
  } catch (error) {
    res.status(500).send({ msg: "Something went wrong", error });
  }
};

module.exports = {
  createProduct,
  updateProduct,
  getProduct,
  createBatch,
  updateBatch,
  getBatch,
};
