import { OkPacket } from "mysql2";
import { getConnection } from "../../db";

export default async function cleanupSessions(): Promise<void> {
  setInterval(async () => {
    const conn = await getConnection();
    console.log("deleting expired sessions...");
    const [result] = (await conn.query(
      `DELETE FROM sessions WHERE expires < NOW()`
    )) as [OkPacket, any];
    console.log(`deleted ${result.affectedRows} expired sessions`);
  }, 600000);
}
