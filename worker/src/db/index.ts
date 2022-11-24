import mysql from "mysql2/promise";

let conn: mysql.Connection;

mysql
  .createConnection(process.env.DATABASE_CONNECTION_STRING)
  .then((c) => {
    conn = c;
  })
  .catch((e) => {
    console.warn(e);
  });

export async function getConnection(): Promise<mysql.Connection> {
  return conn;
}
