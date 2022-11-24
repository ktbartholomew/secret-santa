import mysql from "mysql2/promise";

let conn;

try {
  conn = mysql.createConnection(process.env.DATABASE_CONNECTION_STRING);
} catch (e) {
  console.warn(e);
}

export async function getConnection(): Promise<mysql.Connection> {
  return conn;
}
