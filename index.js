let express = require("express");
let bodyParser = require("body-parser");
require("dotenv").config();
let app = express();
// let routes = require("./Routers/routingEngine");
let { mysqlClient } = require("./DBConfig/dbConfig");
let users = require("./Routers/userRouter");
let inventory = require("./Routers/inventoryRouter");
const { UM_DB_HOST, UM_DB_PORT, UM_DB_DATABASE, UM_DB_USER, UM_DB_PASSWORD } =
  process.env;
mysqlClient(UM_DB_HOST, UM_DB_PORT, UM_DB_DATABASE, UM_DB_USER, UM_DB_PASSWORD);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Allow cross-origin requests
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Methods", "PUT, POST, PATCH, DELETE, GET");
    return res.status(200).json({});
  }
  next();
});
app.use("/user", users);
app.use("/inventory", inventory);
app.listen(4000, () => {
  console.log("Server has connected.... PORT 4000");
});
