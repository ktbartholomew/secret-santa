import { getConnection } from "../db";
import { RowDataPacket } from "mysql2";

export interface Session {
  auth0_sid: string;
  expires: Date;
  user_id: number;
}

declare interface GetSessionInput {
  sid: string;
}

declare interface CreateSessionInput {
  sid: string;
  expires: Date;
  user_id: number;
}

export async function createSession({
  sid,
  expires,
  user_id,
}: CreateSessionInput) {
  const conn = await getConnection();

  await conn.query(
    `INSERT INTO sessions(auth0_sid, expires, user_id) VALUES(?, ?, ?)`,
    [sid, expires, user_id]
  );
}

export async function getSession({
  sid,
}: GetSessionInput): Promise<Session | undefined> {
  const conn = await getConnection();

  const [rows] = (await conn.query(
    `SELECT * FROM sessions WHERE auth0_sid = ? AND expires > ? LIMIT 1`,
    [sid, new Date()]
  )) as [Session[], any];

  if (rows.length !== 1) {
    return;
  }

  return rows[0];
}
