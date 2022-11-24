import { GetServerSideProps } from "next";
import Link from "next/link";
import Button from "../components/button";
import { getUserFromCookies, redirectToLogin } from "../lib/auth0";
import { Game, listGamesForUser } from "../lib/games";
import { User } from "../lib/user";

declare interface IndexPageProps {
  user: User;
  games: Game[];
}

function IndexPage({ user, games }: IndexPageProps) {
  return (
    <>
      <div className="w-full p-5 flex justify-between border-b border-slate-300">
        <div>
          <div className="p-2 font-bold">
            Hey, {user.name}!{" "}
            <Link
              href="/preferences"
              className="text-xs text-blue-600 underline ml-2"
            >
              Change
            </Link>
          </div>
        </div>
        <div>
          <Link href="/games/new">
            <Button design="green">Start a New Game</Button>
          </Link>
        </div>
      </div>
      <div className="p-5">
        <h3 className="text-xl font-bold mb-3">My Games</h3>
        <ul>
          {games.map((g) => {
            return (
              <li key={g.id}>
                <Link
                  href={`/games/${g.id}`}
                  className="p-3 block mb-3 border bg-slate-100 border-slate-300 hover:bg-blue-100 hover:border-blue-300"
                >
                  <strong className="font-bold">{g.name}</strong>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async function ({
  req,
  res,
}) {
  let user;
  let games: Game[];
  try {
    user = await getUserFromCookies(req.cookies);
    games = await listGamesForUser(user);
  } catch (e) {
    console.warn(e);
    redirectToLogin(res);
    return { props: {} };
  }

  games = games.map((g) => {
    g.created_at = JSON.stringify(g.created_at);
    return g;
  });

  return {
    props: {
      user,
      games,
    },
  };
};

export default IndexPage;
