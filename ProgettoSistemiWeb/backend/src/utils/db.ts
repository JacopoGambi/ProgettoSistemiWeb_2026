import mysql from "mysql2";

// connessione 
const conn = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "Hotel",
});

export const connection = conn;

export const db = conn.promise();
