const { v4: uuidv4 } = require("uuid");
const { getMySqlConnection } = require("../DBConfig/dbConfig");

class SQLMaster {
  constructor(baseClass) {
    this.tableName = baseClass.constructor.name;
    this.properties = baseClass;
    this.connection = getMySqlConnection();
    this.query = `SELECT * FROM ${baseClass.constructor.name} WHERE is_active = TRUE`;
  }

  async create(callback) {
    const query = `INSERT INTO ${this.tableName} SET ? `;
    await this.executeQuery(query, this.properties, callback);
  }

  getById(userId, callback) {
    const query = "SELECT * FROM users WHERE id = ?";
    this.executeQuery(query, [userId], callback);
  }

  update(userId, userData, callback) {
    const query = "UPDATE users SET ? WHERE id = ?";
    this.executeQuery(query, [userData, userId], callback);
  }

  delete(userId, callback) {
    const query = "DELETE FROM users WHERE id = ?";
    this.executeQuery(query, [userId], callback);
  }
  async executeQuery(query, params, callback = () => {}) {
    this.connection.query(query, params, (err, result) => {
      if (err) {
        console.error("Error executing database query: " + err.message);
        callback(err, null);
        throw err;
      }

      callback(null, result);
    });
  }
  select = () => {
    return this.query;
  };
  where = (column, opt, value, logicalOpt = "AND") => {
    this.query = `${this.query} ${logicalOpt} ${column} ${opt || "="} ${
      typeof value === "string" ? `"${value}"` : value
    }`;
    return this.query;
  };
  getInsertQuery = () => {
    let currentDate = new Date().getTime() / 1000;
    return [
      `INSERT INTO ${this.tableName} (created_at, modified_at, ${Object.keys(
        this.properties
      ).join(",")}) Values (  ${currentDate}, ${currentDate}, ${Object.keys(
        this.properties
      )
        .map(() => "?")
        .join(",")})`,
      [...Object.values(this.properties)],
    ];
  };
  getUpdateQuery = (properties, id, value) => {
    let currentDate = new Date().getTime() / 1000;
    return [
      `UPDATE ${
        this.tableName
      } SET modified_at = ${currentDate} , ${Object.keys(properties)
        .map((key) => `${key} = ?`)
        .join(",")} WHERE ${id} = ?`,
      [...Object.values(properties), value],
    ];
  };
  getDeleteQuery = () => {};
}

module.exports = { SQLMaster };
