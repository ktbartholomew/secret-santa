import { GetServerSideProps } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import { join } from "path";
import { useEffect, useState } from "react";
import Button from "../../../components/button";
import { getUserFromCookies, redirectToLogin } from "../../../lib/auth0";
import {
  UserGame,
  getGameById,
  listPlayersInGame,
  getAssigneeById,
  Assignee,
  findGameWithJoinKey,
  Game,
} from "../../../lib/games";
import { User } from "../../../lib/user";

export default function GameDetailPage({
  game,
  gameToJoin,
  playerCount,
  assignee,
}: {
  game: UserGame;
  gameToJoin: Game;
  playerCount: number;
  assignee: Assignee;
}) {
  const router = useRouter();
  const [origin, setOrigin] = useState("");
  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const joinGame = async () => {
    const resp = await fetch(`/api/games/${gameToJoin.id}/join`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({ join_key: gameToJoin.join_key }),
    });

    if (!resp.ok) {
      console.error("error joining game: " + (await resp.text()));
      return;
    }

    router.push("/games/[gameId]", `/games/${gameToJoin.id}`);
  };

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

  if (gameToJoin) {
    return (
      <div className="p-5">
        <div className="prose text-center">
          <p className="text-xl">
            Do you want to join the game <strong>{gameToJoin.name}</strong>?
          </p>
          <p>
            <strong>Description:</strong> {gameToJoin.description}
          </p>
          <p>
            <strong>Price Instructions:</strong> {gameToJoin.price_description}
          </p>
          <Button design="blue" onClick={joinGame}>
            Join Game
          </Button>
          <Link href="/">
            <Button className="ml-3" design="transparent">
              Go Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="p-5 border-b border-slate-300">
        <div className="flex justify-between w-full">
          <div className="prose">
            <h2>{game.name}</h2>

            <p>
              <strong>Description:</strong> {game.description}
            </p>
            <p>
              <strong>Price Instructions:</strong> {game.price_description}
            </p>
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
                  {origin}/games/{game.id}?join_key={game.join_key}
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
      <div className="p-5 border-t border-slate-300">
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
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async function ({
  req,
  res,
  query,
}) {
  let user: User;
  let gameToJoin: Game;
  let game: UserGame;

  try {
    user = await getUserFromCookies(req.cookies);
  } catch (e) {
    console.warn(e);
    redirectToLogin(req, res);
    return { props: {} };
  }

  const joinKey = query.join_key as string;
  if (joinKey) {
    try {
      gameToJoin = await findGameWithJoinKey(joinKey);
      gameToJoin.created_at = (gameToJoin.created_at as Date).toISOString();
    } catch (e) {
      console.warn(e);
    }
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

  if (!game && !gameToJoin) {
    return {
      props: {
        user,
      },
      notFound: true,
    };
  }

  if (!game && gameToJoin) {
    return {
      props: {
        user,
        gameToJoin,
      },
      notFound: false,
    };
  }

  const players = await listPlayersInGame(parseInt(query.gameId as string));

  let assignee: Assignee = null;
  if (game.assignee) {
    assignee = await getAssigneeById(game.assignee, game.id);
  }

  game.created_at = (game.created_at as Date).toISOString();

  return {
    props: {
      user,
      game,
      playerCount: players.length,
      assignee,
    },
  };
};
