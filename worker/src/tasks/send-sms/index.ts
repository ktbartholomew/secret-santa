import fetch from "node-fetch";
import { RowDataPacket } from "mysql2";
import { getConnection } from "../../db";

declare interface SendSmsTask {
  type: "SEND_SMS";
  data: {
    recipient: string;
    message: string;
  };
}

async function sendSms(task: SendSmsTask) {
  console.log("sending a message", task);
  const body = new URLSearchParams({
    MessagingServiceSid: process.env.TWILIO_MESSAGING_SID,
    To: "+1" + task.data.recipient, // hardcoded US intl code
    Body: task.data.message,
  });

  const resp = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Messages.json`,
    {
      method: "POST",
      headers: {
        "content-type": "application/x-www-form-urlencoded",
        Authorization:
          "Basic " +
          Buffer.from(
            `${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`
          ).toString("base64url"),
      },
      body: body.toString(),
    }
  );

  if (!resp.ok) {
    console.error("error sending message via Twilio: ", await resp.text());
  }

  console.log("sent message via Twilio: ", await resp.json());
}

export default function batchSendSMS() {
  setInterval(async () => {
    const conn = await getConnection();

    await conn.beginTransaction();
    const [rows] = (await conn.query(
      `SELECT * FROM tasks
       WHERE json_extract(task, '$.type') = 'SEND_SMS'
         AND locked != 1
         AND (expires_at IS NULL OR expires_at > NOW())
       ORDER BY created_at ASC
       LIMIT 10`
    )) as [RowDataPacket[], any];

    if (rows.length > 0) {
      console.log(`processing ${rows.length} SEND_SMS tasks`);
      await conn.query(
        `DELETE FROM tasks WHERE id IN (${rows.map((r) => r.id).join(", ")})`
      );
    }
    await conn.commit();

    for (const row of rows) {
      const task: SendSmsTask = row.task;
      sendSms(task);
    }
  }, 20000);
}
