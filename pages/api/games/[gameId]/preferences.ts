import { NextApiRequest, NextApiResponse } from "next";
import { getUserFromCookies } from "../../../../lib/auth0";
import { getConnection } from "../../../../lib/db";
import { getAssigneeById, notifyOfUserLikes } from "../../../../lib/games";

async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  const conn = await getConnection();
  const user = await getUserFromCookies(req.cookies);

  await conn.query(
    `UPDATE user_games SET likes = ?, dislikes = ? WHERE user_id = ? AND game_id = ?`,
    [req.body.likes, req.body.dislikes, user.id, req.query.gameId]
  );

  const assignee = await getAssigneeById(
    user.id,
    parseInt(req.query.gameId as string, 10)
  );

  notifyOfUserLikes(user.id, assignee.id);

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
