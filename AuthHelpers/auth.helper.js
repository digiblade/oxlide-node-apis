const bcrypt = require("bcryptjs");
const { v4: uuid } = require("uuid");
const jwt = require("jsonwebtoken");
const label = "CRMUser";
const register = async (req, res, session) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    // Validate user input
    if (!(email && password && firstName && lastName)) {
      return res.status(400).send("All input is required");
    }

    // check if user already exist
    const oldUser = await session.run(
      `MATCH (c:${label} {email:$email}) RETURN c`,
      {
        email: email,
      }
    );

    // Validate if user exist in our database
    if (oldUser.records.length > 0) {
      return res.status(409).send("User Already Exist. Please Login");
    }

    //Encrypt user password
    encryptedPassword = await bcrypt.hash(password, 10);

    let body = {
      uuid: uuid(),
      firstName,
      lastName,
      email: email.toLowerCase(), // sanitize: convert email to lowercase
      password: encryptedPassword,
      createdAt: new Date().getTime(),
    };

    let setOfProperties = [];
    for (let properties in body) {
      setOfProperties.push(`${properties}: $${properties}`);
    }

    let query = `MERGE  (p:${label} {${setOfProperties.join(
      ", "
    )}})   RETURN p;`;

    // Create user in our database
    const result = await session.run(query, body);
    properties = [];
    for (record of result.records) {
      properties.push(record["_fields"][0]);
    }

    let user = { uuid: body.uuid, email, useDetails: properties };

    // Create token
    const token = jwt.sign(user, process.env.JWT_KEY, {
      expiresIn: "8h",
    });

    // save user token
    user.token = token;

    // return new user
    res.status(201).json(user);
  } catch (error) {
    res.status(500);
    res.send({ ...error });
  }
};

const login = async (req, res, session) => {
  try {
    // Get user input
    let { email, password } = req.body;
    // Validate user input
    if (!(email && password)) {
      res.status(400).send("All input is required");
    }
    // Validate if user exist in our database
    const userDetails = await session.run(
      `MATCH (c:${label} {email:$email}) RETURN {userDetails:c , uuid:c.uuid, email:c.email, password:c.password}`,
      {
        email: email.toLowerCase(),
      }
    );

    if (
      userDetails.records.length > 0 &&
      (await bcrypt.compare(
        password,
        userDetails.records[0]["_fields"][0].password
      ))
    ) {
      delete userDetails.records[0]["_fields"][0].password;
      properties = [];
      for (record of userDetails.records) {
        properties.push(record["_fields"][0]);
      }

      let user = userDetails.records[0]["_fields"][0];

      // Create token
      const token = jwt.sign(user, process.env.JWT_KEY, {
        expiresIn: "8h",
      });
      user.token = token;

      // user
      return res.status(200).json(user);
    }
    return res.status(400).send("Invalid Credentials");
  } catch (error) {
    res.status(500);
    res.send({ ...error });
  }
};
module.exports = { register, login };
