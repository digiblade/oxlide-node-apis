const jwt = require("jsonwebtoken");
const neo4jResponseToProperty = function (response, key = "c") {
  let properties = [];
  try {
    properties = response.records.map((record) => {
      let details = record.toObject();
      details = details[key];
      return { ...details.properties, labels: details.labels };
    });
  } catch (error) {
    console.log("please check your query");
  }
  return properties;
};

const getDataFromToken = function (req, res) {
  try {
    let token = req.headers["x-access-token"];
    decoded = jwt.verify(token, process.env.JWT_KEY);
    return decoded;
  } catch (error) {
    console.log(error.message);
    res.status(401).send({
      msg: "Invalid User",
    });
  }
};
module.exports = {
  neo4jResponseToProperty,
  getDataFromToken,
};
