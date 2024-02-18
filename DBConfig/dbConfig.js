require("dotenv").config();
let neo4j = require("neo4j-driver");
let mysql = require("mysql2");
let connection;
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
  connection = mysql.createPool({
    host: host,
    user: user,
    password: password,
    database: database,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });
  connection.query("SELECT 1 + 1 AS solution", (error, results, fields) => {
    if (error) {
      console.error("Error connecting to MySQL:", error);
    } else {
      console.log("Connection to MySQL established successfully!");
    }
  });
  return connection;
};
const getMySqlConnection = () => {
  return connection.promise();
};
module.exports = { jwtConnection, mysqlClient, getMySqlConnection };
