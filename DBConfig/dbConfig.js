require("dotenv").config();
let neo4j = require("neo4j-driver");
let mysql = require("mysql");
// const crmConnection = () => {
//   console.log("Connection initiated for CRM");
//   const driver = neo4j.driver(
//     process.env.CRM_CONNECTION,
//     neo4j.auth.basic(process.env.CRM_USER, process.env.CRM_PASSWORD)
//   );
//   console.log("Connection Stablish for CRM");

//   return driver.session();
// };
const jwtConnection = () => {
  console.log("Connection initiated for JWT");

  const driver = neo4j.driver(
    process.env.JWT_CONNECTION,
    neo4j.auth.basic(process.env.JWT_USER, process.env.JWT_PASSWORD)
  );
  console.log("Connection Stablish for JWT");
  return driver.session();
};

const mysqlClient = (
  host = "localhost",
  port = "3306",
  database = "jwtdb",
  user = "root",
  password = ""
) => {
  let connection = mysql.createConnection({
    host,
    port,
    database,
    user,
    password,
  });
  connection.connect(function (err) {
    if (err) throw err;
    console.log("Connected!");
  });
  return connection;
};
module.exports = { jwtConnection, mysqlClient };
