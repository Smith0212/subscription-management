const mysql = require("mysql2");

const db = mysql.createPool({
    host: "mysql-subscribeox-subscribebox.l.aivencloud.com",
    user: "avnadmin",
    password: "AVNS_QlKfYBinDI46NgOIg2f@0212",
    database: "defaultdb",
    port: 26450,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  }, console.log("Database connected"));

module.exports = db;