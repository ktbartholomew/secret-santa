import { GetServerSideProps } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import { useRef, useState } from "react";
import Button from "../../../components/button";
import { getUserFromCookies, redirectToLogin } from "../../../lib/auth0";
import { UserGame, listGamesForUser } from "../../../lib/games";
import { User } from "../../../lib/user";

export default function GamePreferencesPage({ game }: { game: UserGame }) {
  const form: { current: HTMLFormElement } = useRef();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);

    const likes = form.current.likes.value;
    const dislikes = form.current.dislikes.value;

    const resp = await fetch(`/api/games/${game.id}/preferences`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({ likes, dislikes }),
    });

    if (!resp.ok) {
      setSubmitting(false);
      console.error("request no OK: " + (await resp.text()));
      return;
    }

    router.push("/games/[gameId]", `/games/${game.id}`);
  }

  return (
    <>
      <div className="p-5">
        <form ref={form} onSubmit={handleSubmit}>
          <div className="prose">
            <h2 className="mb-5">Likes &amp; Dislikes</h2>
          </div>
          <div className="mb-5">
            <label className="block font-bold" htmlFor="likes">
              Likes
            </label>
            <textarea
              className="block w-full"
              name="likes"
              id="likes"
              defaultValue={game.likes}
            ></textarea>
            <span className="block text-xs text-gray-500 mt-1">
              Describe the things you would like your Secret Santa to buy you.
              Keep the prices limit in mind!
            </span>
          </div>
          <div className="mb-5">
            <label className="block font-bold" htmlFor="dislikes">
              Dislikes
            </label>
            <textarea
              className="block w-full"
              name="dislikes"
              id="dislikes"
              defaultValue={game.dislikes}
            ></textarea>
            <span className="block text-xs text-gray-500 mt-1">
              Describe the things you don’t want. You might include things that
              you already have too much of or that you’re very particular about
              and would rather pick out yourself.
            </span>
          </div>
          <div>
            <Button type="submit" design="blue" inProgress={submitting}>
              Save Changes
            </Button>
            <Link href="/games/[gameId]" as={`/games/${game.id}`}>
              <Button type="submit" design="transparent" className="ml-3">
                Cancel
              </Button>
            </Link>
          </div>
        </form>
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
  let games: UserGame[];

  try {
    user = await getUserFromCookies(req.cookies);
  } catch (e) {
    console.warn(e);
    redirectToLogin(res);
    return { props: {} };
  }

  try {
    games = await listGamesForUser(user);
  } catch (e) {
    console.warn(e);
    return {
      props: {},
      redirect: "/",
    };
  }

  const game = games.find((g) => g.id.toString() === query.gameId);
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
    },
  };
};
