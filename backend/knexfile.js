// Load .env file
require("dotenv").config();

module.exports = {
  client: "mysql2",
  connection: {
    host: "127.0.0.1",
    database: "movies",
    user: "root",
    password: process.env.DB_PASSWORD,
  },
};
