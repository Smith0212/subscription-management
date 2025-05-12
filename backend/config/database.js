const mysql = require("mysql2");

const db = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "Smit@0212",
    database: "Test2_06_05_ekartWithSubAdmin",
    port: 3307,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  }, console.log("Database connected"));

module.exports = db;