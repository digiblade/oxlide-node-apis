require("dotenv").config();
let neo4j = require("neo4j-driver");
const crmConnection = () => {
  console.log("Connection initiated for CRM");
  const driver = neo4j.driver(
    process.env.CRM_CONNECTION,
    neo4j.auth.basic(process.env.CRM_USER, process.env.CRM_PASSWORD)
  );
  console.log("Connection Stablish for CRM");

  return driver.session();
};
const jwtConnection = () => {
  console.log("Connection initiated for JWT");

  const driver = neo4j.driver(
    process.env.JWT_CONNECTION,
    neo4j.auth.basic(process.env.JWT_USER, process.env.JWT_PASSWORD)
  );
  console.log("Connection Stablish for JWT");
  return driver.session();
};

module.exports = { crmConnection, jwtConnection };
