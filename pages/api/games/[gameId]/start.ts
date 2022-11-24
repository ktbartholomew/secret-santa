import { NextApiRequest, NextApiResponse } from "next";
import { getUserFromCookies } from "../../../../lib/auth0";
import { getConnection } from "../../../../lib/db";
import {
  getGameById,
  notifyUserOfAssignment,
  UserGameRow,
} from "../../../../lib/games";
import { setAssignees } from "../../../../lib/games/shuffle";

async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  const conn = await getConnection();

  const user = await getUserFromCookies(req.cookies);
  const game = await getGameById(
    user.id,
    parseInt(req.query.gameId as string, 10)
  );

  if (!game.creator) {
    res.status(403);
    res.end();
    return;
  }

  if (!game.join_key) {
    res.status(400);
    res.end();
    return;
  }

  const [rows] = (await conn.query(
    `SELECT * FROM user_games WHERE game_id = ?`,
    [game.id]
  )) as [UserGameRow[], any];

  const assigned = setAssignees(rows);

  await conn.beginTransaction();
  try {
    for (const a of assigned) {
      await conn.query(
        `UPDATE user_games SET assignee = ? WHERE id = ? LIMIT 1`,
        [a.assignee, a.id]
      );

      notifyUserOfAssignment(a.user_id, a.assignee);
    }

    await conn.query(`UPDATE games SET join_key = NULL WHERE id = ? LIMIT 1`, [
      game.id,
    ]);

    await conn.commit();
  } catch (e) {
    console.warn(e);
    await conn.rollback();
  }

  res.status(202);
  res.end();
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    return handlePost(req, res);
  }

  res.status(405);
  res.end();
}
