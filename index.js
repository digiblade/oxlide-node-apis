let express = require("express");
let app = express();
let routes = require("./Routers/routingEngine");
let { jwtConnection } = require("./DBConfig/dbConfig");
let { register, login } = require("./AuthHelpers/auth.helper");
let auth = require("./Middleware/auth");
let jwtSession = jwtConnection();
// middleware for responses
app.use(express.json());
app.use(express.urlencoded());

// auth apis
app.post("/auth/register", (req, res) => {
  register(req, res, jwtSession);
});

app.post("/auth/login", (req, res) => {
  login(req, res, jwtSession);
});

// crm apis
app.use("/api", auth, routes);

app.listen(4000,()=>{
  console.log('Server has connected.... PORT 4000')
});
