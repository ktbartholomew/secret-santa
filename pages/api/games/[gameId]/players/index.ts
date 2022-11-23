import { NextApiRequest, NextApiResponse } from "next";
import { getUserFromCookies } from "../../../../../lib/auth0";
import { getConnection } from "../../../../../lib/db";
import { getGameById, UserGame } from "../../../../../lib/games";

async function handleGet(req: NextApiRequest, res: NextApiResponse) {
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

  const [rows] = await conn.query(
    `SELECT 
      users.id, users.name, user_games.exclusions, user_games.creator 
    FROM users 
    JOIN user_games ON users.id = user_games.user_id
    WHERE user_games.game_id = ?`,
    [req.query.gameId]
  );

  res.status(200);
  res.send(rows);
  res.end();
}

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

  try {
    await conn.beginTransaction();
    const players: UserGame[] = req.body.players;

    for (let player of players) {
      await conn.execute(
        `UPDATE user_games SET exclusions = ? WHERE user_id = ? AND game_id = ? LIMIT 1`,
        [
          JSON.stringify(player.exclusions),
          player.id,
          parseInt(req.query.gameId as string),
        ]
      );
    }

    await conn.commit();
  } catch (e) {
    console.error(e);
    await conn.rollback();
  }

  res.status(202);
  res.end();
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    return handleGet(req, res);
  }
  if (req.method === "POST") {
    return handlePost(req, res);
  }

  res.status(405);
  res.end();
}
