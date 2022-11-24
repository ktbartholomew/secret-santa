import { Connection, RowDataPacket } from "mysql2/promise";
import { getConnection } from "../db";

export interface UpsertUserInput {
  sub: string;
  name?: string;
}

export interface User {
  id: number;
  auth0_sub: string;
  name: string;
  preferences: object;
}

async function createUser(
  conn: Connection,
  userInfo: UpsertUserInput
): Promise<User> {
  const [result] = (await conn.query(
    `INSERT INTO users(auth0_sub, name, preferences) VALUES(?, ?, ?)`,
    [userInfo.sub, userInfo.name || "", "{}"]
  )) as [RowDataPacket, any];

  return {
    id: result.insertId,
    auth0_sub: userInfo.sub,
    name: userInfo.name || "",
    preferences: {},
  };
}

export async function upsertUser(userInfo: UpsertUserInput): Promise<User> {
  const conn = await getConnection();

  const [rows] = (await conn.query(
    `SELECT * FROM users WHERE auth0_sub = ? LIMIT 1`,
    [userInfo.sub]
  )) as [User[], any];

  if (rows.length === 0) {
    return createUser(conn, userInfo);
  }

  const user: User = {
    ...rows[0],
    preferences: rows[0].preferences || {},
  };

  return user;
}

export async function getUserById(userId: number): Promise<User> {
  const conn = await getConnection();

  const [rows] = (await conn.query(`SELECT * FROM users WHERE id = ? LIMIT 1`, [
    userId,
  ])) as [User[], any];

  return rows[0];
}

export async function setUserName(userId: number, name: string): Promise<void> {
  const conn = await getConnection();

  return conn.query(`UPDATE users SET name = ? WHERE id = ? LIMIT 1`, [
    name,
    userId,
  ]);
}
