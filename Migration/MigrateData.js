class ColumnModel {
  constructor(name, type, length, defaultValue, isNull = true) {
    this.name = name;
    this.type = type;
    this.isNull = isNull;
    this.default = defaultValue;
    this.length = length;
  }
}
class TableDetails {
  constructor(name) {
    this.tableName = name;
    this.columns = columns;
  }
}

const migrationScript = [
  new TableDetails("user", [
    new ColumnModel("userName", "varchar", 235),
    new ColumnModel("userEmail", "varchar", 235),
    new ColumnModel("userContact", "varchar", 235),
    new ColumnModel("userIsActive", "Boolean"),
  ]),
];

const executeMigrationScript = (tableConfig) => {
  let columns = tableConfig.columns.map((column) => {
    return `${column.name} ${column.type} ${
      column.length ? `(${column.length})` : ""
    }`;
  })`CREATE TABLE IF NOT EXISTS your_table_name (
        column1 datatype1,
        column2 datatype2,
        -- add more columns as needed
        PRIMARY KEY (column1)
    );`;
};

function createDataTable(tableDetails) {}
