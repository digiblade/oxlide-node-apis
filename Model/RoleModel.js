const { v4: uuid } = require("uuid");
class roles {
  constructor(role_name) {
    this.guid = uuid();
    this.role_name = role_name;
  }
}
class tbl_user {
  constructor(email, password) {
    this.user_email = email;
    this.user_password = password;
  }
}
module.exports = {
  roles,
  tbl_user,
};
