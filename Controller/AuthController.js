const { getMySqlConnection } = require("../DBConfig/dbConfig");
const { roles, tbl_user } = require("../Model/RoleModel");
const { SQLMaster } = require("../SQLHelper/SQLMaster");
const jwt = require("jsonwebtoken");
let secretKey =
  "c8e0f59205a8dc2e258e4f34a20b3c1e791e787b075fe3a0428b01f5d3f689d7";
const options = {
  expiresIn: "1d", // Token will expire in 1 hour
};
// User Model Please don't modify
class UserModel {
  constructor(userName, email, password, contactNumber) {
    this.userName = userName;
    this.email = email;
    this.password = password;
    this.contactNumber = contactNumber;
  }
}

function registerUser(req, res) {
  try {
    let userDetails = new UserModel(
      req.body.userName,
      req.body.email,
      req.body.password,
      req.body.contactNumber
    );
    let sqlCursor = new SQLMaster(userDetails);
    sqlCursor.create();
  } catch (error) {
    res.status().send({ msg: "Something Went Wrong", stack: error.stack });
  }
}
async function createRole(req, res) {
  try {
    let userDetails = new roles(req.body.role);
    let sqlCursor = getMySqlConnection();
    let sqlMaster = new SQLMaster(userDetails);
    let [query, params] = sqlMaster.getInsertQuery();
    let [selectedRole] = await sqlCursor.execute(
      sqlMaster.where("role_name", "=", userDetails.role_name)
    );
    if (selectedRole.length > 0) {
      res.status(409).send({ msg: "Role is already present" });
      return;
    }
    const [results] = await sqlCursor.execute(query, params, () => {});
    // Check if the insert was successful
    if (results && results.affectedRows > 0) {
      res.status(201).send({ msg: "Role created successfully" });
    } else {
      res.status(500).send({ msg: "Role creation failed" });
    }
  } catch (error) {
    res.status(500).send({ msg: "Something Went Wrong", stack: error.stack });
  }
}
async function getRoles(req, res) {
  try {
    let userDetails = new roles(req.body.role);
    let sqlCursor = getMySqlConnection();
    let sqlMaster = new SQLMaster(userDetails);
    let [selectedRole] = await sqlCursor.execute(sqlMaster.select());
    res.status(200).send(selectedRole);
  } catch (error) {
    res.status(500).send({ msg: "Something Went Wrong", stack: error.stack });
  }
}
async function updateRole(req, res) {
  try {
    let userDetails = new roles(req.body.role);
    let { guid, role } = req.body;
    let sqlCursor = getMySqlConnection();
    let sqlMaster = new SQLMaster(userDetails);
    let [query, params] = sqlMaster.getUpdateQuery(
      { role_name: role },
      "guid",
      guid
    );
    let [selectedRole] = await sqlCursor.execute(
      sqlMaster.where("guid", "=", guid)
    );
    if (selectedRole.length === 0) {
      res.status(404).send({ msg: "Role id not found" });
      return;
    }
    const [results] = await sqlCursor.execute(query, params, () => {});
    // Check if the update was successful
    if (results && results.affectedRows > 0) {
      res.status(201).send({ msg: "Role updated successfully" });
    } else {
      res.status(500).send({ msg: "Role updating failed" });
    }
  } catch (error) {
    res.status(500).send({ msg: "Something Went Wrong", stack: error.stack });
  }
}
async function checkLogin(req, res) {
  try {
    let { email, password } = req.body;
    if (!email || !password) {
      res.send(403).send({ msg: "Invalid Credentials" });
      return;
    }
    let userDetails = new tbl_user(email, password);
    let sqlCursor = getMySqlConnection();
    let sqlMaster = new SQLMaster(userDetails);
    let [selectedUser] = await sqlCursor.execute(
      sqlMaster.where("user_email", "=", email)
    );
    if (selectedUser.length === 0) {
      res.status(403).send({ msg: "Email Not Registered" });
      return;
    }
    let payload = selectedUser[0];
    if (payload.user_password === password) {
      delete payload.user_password;
      const token = jwt.sign(payload, secretKey, options);
      res.status(200).send({ token: token, msg: "Login Successfully" });
      return;
    }
    res.status(403).send({ msg: "Invalid Password" });
  } catch (error) {
    res.status(500).send({ msg: "Something Went Wrong", stack: error.stack });
  }
}

module.exports = {
  registerUser,
  createRole,
  getRoles,
  updateRole,
  checkLogin,
};
