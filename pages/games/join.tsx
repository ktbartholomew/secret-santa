import { GetServerSideProps } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import Button from "../../components/button";
import { getUserFromCookies, redirectToLogin } from "../../lib/auth0";
import {
  findGameWithJoinKey,
  Game,
  getGameById,
  listPlayersInGame,
} from "../../lib/games";
import { User } from "../../lib/user";

export default function JoinPage({
  game,
  serverErrorMessage,
}: {
  game: Game;
  serverErrorMessage?: string;
}) {
  const router = useRouter();

  const joinGame = async () => {
    const resp = await fetch(`/api/games/${game.id}/join`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({ join_key: game.join_key }),
    });

    if (!resp.ok) {
      console.error("error joining game: " + (await resp.text()));
      return;
    }

    router.push("/games/[gameId]", `/games/${game.id}`);
  };

  if (serverErrorMessage) {
    return <div className="p-5">{serverErrorMessage}</div>;
  }

  return (
    <div className="p-5">
      <div className="prose text-center">
        <p className="text-xl">
          Do you want to join the game <strong>{game.name}</strong>?
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

export const getServerSideProps: GetServerSideProps = async ({
  req,
  res,
  query,
}) => {
  let user: User;
  try {
    user = await getUserFromCookies(req.cookies);
  } catch (e) {
    redirectToLogin(req, res);
    return { props: {} };
  }

  const joinKey = query.join_key as string;

  const game = await findGameWithJoinKey(joinKey || "");

  if (!game) {
    return {
      props: {
        serverErrorMessage:
          "Unable to find a matching game. It may no longer be open for new people to join.",
      },
    };
  }

  const players = await listPlayersInGame(game.id);
  if (players.filter((p) => p.id === user.id).length > 0) {
    res.statusCode = 302;
    res.setHeader("location", `/games/${game.id}`);
  }

  const createdAt = game.created_at as Date;
  game.created_at = createdAt.toISOString();

  return { props: { game } };
};
