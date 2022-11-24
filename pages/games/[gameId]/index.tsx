import { GetServerSideProps } from "next";
import Link from "next/link";
import { useEffect, useState } from "react";
import Button from "../../../components/button";
import { getUserFromCookies, redirectToLogin } from "../../../lib/auth0";
import {
  UserGame,
  getGameById,
  listPlayersInGame,
  getAssigneeById,
  Assignee,
} from "../../../lib/games";
import { User } from "../../../lib/user";

export default function GameDetailPage({
  game,
  playerCount,
  assignee,
}: {
  game: UserGame;
  playerCount: number;
  assignee: Assignee;
}) {
  const [origin, setOrigin] = useState("");
  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  async function startGame() {
    const resp = await fetch(`/api/games/${game.id}/start`, {
      method: "POST",
    });

    if (!resp.ok) {
      console.error("error starting game: " + (await resp.text()));
      return;
    }

    window.location.reload();
  }

  return (
    <>
      <div className="p-5 border-b border-slate-300">
        <div className="flex justify-between w-full">
          <div className="prose">
            <h2>{game.name}</h2>
          </div>
          <div></div>
        </div>
      </div>
      {game.creator && (
        <div className="p-5 border-b border-slate-300">
          <div className="border border-blue-200 bg-blue-100 p-5">
            <div className="text-xs text-blue-800 mb-3">
              You created this game on{" "}
              {new Date(game.created_at).toLocaleDateString()}
            </div>
            <div className="text-center my-5">
              <div className="text-8xl font-bold">{playerCount}</div>
              <div className="text-xs font-bold">PEOPLE JOINED</div>
            </div>
            {game.join_key && (
              <div className="prose">
                <p>
                  Invite more friends to join this game by sharing this link:
                </p>
                <pre>
                  {origin}/games/join?join_key={game.join_key}
                </pre>
                <p>
                  After everyone has joined, click <strong>Start Game</strong>{" "}
                  to randomly assign Secret Santas. No new players can join
                  after you start the game.
                </p>
                <Button design="blue" onClick={startGame}>
                  Start Game
                </Button>
                <Link
                  href="/games/[gameId]/players"
                  as={`/games/${game.id}/players`}
                >
                  <Button className="ml-3">Manage Players</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
      <div className="p-5 border-b border-slate-300">
        <div className="prose mx-auto text-center">
          <p className="text-xl">Be your Secret Santa’s helper!</p>
          <p>
            Help your Secret Santa by letting them know what kinds of things you
            like and dislike. Or maybe you just treated yourself to a lifetime
            supply of eggnog and don’t need any more. Let them know so you don’t
            end up disappointed!
          </p>
          <p>
            <Link
              href="/games/[gameId]/preferences"
              as={`/games/${game.id}/preferences`}
            >
              <Button design="blue">Set Likes &amp; Dislikes</Button>
            </Link>
          </p>
        </div>
      </div>
      {!game.assignee && (
        <div className="p-5">
          <div className="prose mx-auto text-center">
            <p className="text-xl">Secret Santas haven’t been assigned yet.</p>
            <p>
              Check back again later to find out who you’re the secret santa
              for!
            </p>
          </div>
        </div>
      )}
      {assignee && (
        <div className="p-5">
          <div className="prose">
            <p className="text-3xl">
              You’re the Secret Santa for <strong>{assignee.name}</strong>!
            </p>
            <h4>{assignee.name}’s Likes</h4>
            <p>{assignee.likes ? assignee.likes : <em>none</em>}</p>
            <h4>{assignee.name}’s Disikes</h4>
            <p>{assignee.dislikes ? assignee.dislikes : <em>none</em>}</p>
          </div>
        </div>
      )}
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async function ({
  req,
  res,
  query,
}) {
  let user: User;
  let game: UserGame;

  try {
    user = await getUserFromCookies(req.cookies);
  } catch (e) {
    console.warn(e);
    redirectToLogin(req, res);
    return { props: {} };
  }

  try {
    game = await getGameById(user.id, parseInt(query.gameId as string));
  } catch (e) {
    console.warn(e);
    return {
      props: {},
      redirect: "/",
    };
  }

  const players = await listPlayersInGame(parseInt(query.gameId as string));

  let assignee: Assignee = null;
  if (game.assignee) {
    assignee = await getAssigneeById(game.assignee, game.id);
  }

  let createdAt = game.created_at as Date;
  game.created_at = createdAt.toISOString();

  if (!game) {
    return {
      props: {
        user,
      },
      notFound: true,
    };
  }

  return {
    props: {
      user,
      game,
      playerCount: players.length,
      assignee,
    },
  };
};
