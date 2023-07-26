const bcrypt = require("bcryptjs");
const { v4: uuid } = require("uuid");
const jwt = require("jsonwebtoken");
const { neo4jResponseToProperty } = require("../Common/Helper/helper");
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

const mySqlRegister = async (req, res, session) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    // Validate user input
    if (!(email && password && firstName && lastName)) {
      return res.status(400).send("All input is required");
    }

    // Check if user already exists
    const oldUser = await session.query(
      "SELECT * FROM login ",
      [email.toLowerCase()]
    );

    // Validate if user exists in our database
    if (oldUser._fields.length > 0) {
      return res.status(409).send("User Already Exists. Please Login");
    }

    // Encrypt user password
    const encryptedPassword = await bcrypt.hash(password, 10);

    let body = {
      userid: uuid(),
      username: email.toLowerCase(),
      useremail: email.toLowerCase(),
      userpassword: encryptedPassword,
      activeuser: 1,
      createdat: new Date().getTime(),
      updatedat: new Date().getTime(),
      firstname: firstName,
      lastname: lastName,
    };

    let query =
      "INSERT INTO login (" +
      Object.keys(body).join(",") +
      ") VALUES (" +
      Object.values(body)
        .map(() => "?")
        .join(",") +
      ")";

    // Create user in our database
    const result = await session.query(query, Object.values(body));

    let user = { userid: body.userid, email };

    // Create token
    const token = jwt.sign(user, process.env.JWT_KEY, {
      expiresIn: "8h",
    });

    // Save user token
    user.token = token;

    // Return new user
    res.status(201).json(user);
  } catch (error) {
    res.status(500).send("Internal Server Error");
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
    // Validate if user exist in our database+
    const neoRes = await session.run(
      `MATCH (c:${label} {email:$email}) RETURN c `,
      {
        email: email.toLowerCase(),
      }
    );
    let details = neo4jResponseToProperty(neoRes);
    if (
      details.length > 0 &&
      (await bcrypt.compare(password, details[0].password))
    ) {
      let user = details[0];
      delete user.password;

      // Create token
      const token = jwt.sign(user, process.env.JWT_KEY, {
        expiresIn: "8h",
      });
      user.token = token;
      return res.status(201).send(user);
    }
    return res.status(400).send("Invalid Credentials");
  } catch (error) {
    res.status(500);
    res.send({ error: error.stack });
  }
};
module.exports = { register, login, mySqlRegister };
