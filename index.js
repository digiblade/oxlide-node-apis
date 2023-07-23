let express = require("express");
let bodyParser = require("body-parser");
let app = express();
let routes = require("./Routers/routingEngine");
let { jwtConnection } = require("./DBConfig/dbConfig");
let { register, login } = require("./AuthHelpers/auth.helper");
let auth = require("./Middleware/auth");
let jwtSession = jwtConnection();
// middleware for responses
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// auth apis
app.post("/auth/register", (req, res) => {
  register(req, res, jwtSession);
});

app.post("/auth/login", (req, res) => {
  login(req, res, jwtSession);
});

// crm apis
app.use("/api", auth, routes);

app.post("/const/", (req, res) => {
  let constData = {
    CRM_DATABASE: "CRM db",
    CRM_USER: "neo4j",
    CRM_PASSWORD: "df8SzGQjdF8VAA9YUcEbh6pydif5QpShU3nrH6l8g8I",
    CRM_CONNECTION: "neo4j+s://92c11f48.databases.neo4j.io",
    JWT_KEY: "ttcF8Lap6ItTHXJWvtrSpodYtCRGRD3u",
    JWT_DATABASE: "JWT db",
    JWT_USER: "neo4j",
    JWT_PASSWORD: "1qaz!QAZ",
    JWT_CONNECTION: "neo4j+s://d2de0c61.databases.neo4j.io",
  };
  res.status(500).send(constData);
});

app.listen(4000, () => {
  console.log("Server has connected.... PORT 4000");
});
