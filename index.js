let express = require("express");
let bodyParser = require("body-parser");
let app = express();
// let routes = require("./Routers/routingEngine");
let { jwtConnection, mysqlClient } = require("./DBConfig/dbConfig");
let { register, login, mySqlRegister } = require("./AuthHelpers/auth.helper");
let auth = require("./Middleware/auth");
let jwtSession = jwtConnection();
// let mysqlJWTConnection = mysqlClient();
// middleware for responses
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
// auth apis
app.post("/auth/register", (req, res) => {
  register(req, res, jwtSession);
});
app.post("/auth/mysql/register", (req, res) => {
  mySqlRegister(req, res, mysqlJWTConnection);
});

app.post("/auth/login", (req, res) => {
  login(req, res, jwtSession);
});



//mongo apis









// crm apis
// app.use("/api", auth, routes);

app.post("/const/", (req, res) => {
  let constData = { item: { ...process.env } };
  res.status(500).send(constData);
});

app.listen(4000, () => {
  console.log("Server has connected.... PORT 4000");
});
