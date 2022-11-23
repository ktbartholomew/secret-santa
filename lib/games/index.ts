import { Connection, RowDataPacket } from "mysql2/promise";
import { getConnection } from "../db";
import { User } from "../user";

export interface Assignee {
  name: string;
  likes: string;
  dislikes: string;
}

export interface Game {
  id: number;
  name: string;
  join_key: string;
  description: string;
  price_description: string;
  created_at: Date | string;
}

export interface UserGame extends Game {
  assignee: number;
  exclusions: number[];
  likes: string;
  dislikes: string;
  creator: boolean;
}

export interface UserGameRow {
  id: number;
  user_id: number;
  game_id: number;
  assignee: number;
  exclusions: number[];
  likes: string;
  dislikes: string;
  creator: boolean;
}

export type CreateGameInput = {
  name: string;
  join_key: string;
  description: string;
  price_description: string;
  user: User;
};

export type ListForUserInput = {
  id: number;
};

export async function listGamesForUser(
  input: ListForUserInput
): Promise<UserGame[]> {
  const conn = await getConnection();

  const [rows] = (await conn.query(
    `SELECT 
      games.*, 
      user_games.assignee, 
      user_games.likes, 
      user_games.dislikes,
      user_games.creator
    FROM games 
    JOIN user_games ON games.id = user_games.game_id 
    WHERE user_games.user_id = ? 
    ORDER BY games.created_at DESC`,
    [input.id]
  )) as [UserGame[], any];

  return rows;
}

export async function createGame(input: CreateGameInput): Promise<Game> {
  const conn = await getConnection();
  const [results] = (await conn.query(
    `INSERT INTO games(name, join_key, description, price_description) VALUES(?, ?, ?, ?)`,
    [input.name, input.join_key, input.description, input.price_description]
  )) as [RowDataPacket, any];

  await conn.execute(
    `INSERT INTO user_games(user_id, game_id, exclusions, creator) VALUES(?, ?, ?, ?)`,
    [input.user.id, results.insertId, "[]", true]
  );

  return {
    ...input,
    created_at: new Date(),
    id: results.insertId,
  };
}
export async function findGameWithJoinKey(joinKey: string): Promise<Game> {
  const conn = await getConnection();

  const [results] = (await conn.query(
    `SELECT * FROM games WHERE join_key = ? LIMIT 1`,
    [joinKey]
  )) as [Game[], any];

  return results[0];
}

export async function getAssigneeById(
  userId: number,
  gameId: number
): Promise<Assignee> {
  const conn = await getConnection();

  const [rows] = (await conn.query(
    `SELECT 
      users.name, user_games.likes, user_games.dislikes 
    FROM user_games 
    JOIN users ON user_games.user_id = users.id 
    WHERE user_games.user_id = ? AND user_games.game_id = ? LIMIT 1`,
    [userId, gameId]
  )) as [Assignee[], any];

  return rows[0];
}

export async function getGameById(
  userId: number,
  gameId: number
): Promise<UserGame> {
  const conn = await getConnection();

  const [results] = (await conn.query(
    `SELECT 
      games.*, 
      user_games.assignee, 
      user_games.likes, 
      user_games.dislikes,
      user_games.creator
    FROM games 
    JOIN user_games ON games.id = user_games.game_id WHERE user_games.user_id = ? AND games.id = ? LIMIT 1`,
    [userId, gameId]
  )) as [UserGame[], any];

  return results[0];
}

export async function listPlayersInGame(gameId: number): Promise<UserGame[]> {
  const conn = await getConnection();
  const [rows] = (await conn.query(
    `SELECT 
      users.id, users.name, user_games.exclusions, user_games.creator 
    FROM users 
    JOIN user_games ON users.id = user_games.user_id
    WHERE user_games.game_id = ?`,
    [gameId]
  )) as [UserGame[], any];

  return rows;
}
