import { NextApiRequest, NextApiResponse } from "next";
import { getUserFromCookies } from "../../../../lib/auth0";
import { getConnection } from "../../../../lib/db";
import { findGameWithJoinKey } from "../../../../lib/games";

async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  const conn = await getConnection();
  const user = await getUserFromCookies(req.cookies);
  const game = await findGameWithJoinKey(req.body.join_key);

  if (game.id !== parseInt(req.query.gameId as string, 10)) {
    res.status(400);
    res.end();
    return;
  }

  await conn.query(
    `INSERT INTO user_games(user_id, game_id, exclusions) VALUES(?, ?, [])`,
    [user.id, game.id]
  );

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
