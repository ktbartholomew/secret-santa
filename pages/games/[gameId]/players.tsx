import { GetServerSideProps } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import { useRef, useState } from "react";
import Button from "../../../components/button";
import { getUserFromCookies, redirectToLogin } from "../../../lib/auth0";
import { UserGame, getGameById, listPlayersInGame } from "../../../lib/games";
import { User } from "../../../lib/user";

export default function PlayersPage({
  user,
  game,
  players,
}: {
  user: User;
  game: UserGame;
  players: UserGame[];
}) {
  const form: { current: HTMLFormElement } = useRef();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  function getExclusions(form: HTMLFormElement, playerId: number): number[] {
    const element: HTMLSelectElement =
      form[`exclusions[${playerId.toString(10)}]`];

    if (!element) {
      return [];
    }

    return Array.from(element.selectedOptions).map((o) =>
      parseInt(o.value, 10)
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);

    const data = players.map((p) => {
      p.exclusions = getExclusions(form.current, p.id);
      return p;
    });

    const resp = await fetch(`/api/games/${game.id}/players`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        players: data,
      }),
    });

    setSubmitting(false);

    if (!resp.ok) {
      console.error("error updating players: " + (await resp.text()));
      return;
    }

    router.push("/games/[gameId]", `/games/${game.id}`);
  }

  return (
    <>
      <div className="p-5">
        <form ref={form} onSubmit={handleSubmit}>
          <div className="prose">
            <h2 className="mb-5">Manage Players</h2>
          </div>

          {players.map((p) => {
            return (
              <div
                key={p.id}
                className="pb-5 mb-5 flex flex-wrap border-b border-slate-200"
              >
                <div className="basis-full lg:basis-2/4 mb-2">
                  <div className="text-lg font-bold mb-1">{p.name}</div>
                  <div>
                    {!p.creator && (
                      <Button design="red" className="text-xs py-1 px-2">
                        Remove Player
                      </Button>
                    )}
                  </div>
                </div>
                <div className="basis-full lg:basis-2/4">
                  <label htmlFor={`exclusions[${p.id}]`} className="block">
                    Don’t allow to be Secret Santa for:
                  </label>
                  <select
                    className="w-full"
                    name={`exclusions[${p.id}]`}
                    id={`exclusions[${p.id}]`}
                    defaultValue={p.exclusions.map((p) => p.toString(10))}
                    multiple
                    style={{
                      height: Math.min(players.length * 1.25, 100) + "em",
                    }}
                  >
                    {players
                      .filter((q) => q.id !== p.id)
                      .map((q) => {
                        return (
                          <option key={q.id} value={q.id.toString(10)}>
                            {q.name}
                          </option>
                        );
                      })}
                  </select>
                </div>
              </div>
            );
          })}

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
  let game: UserGame;
  let players: UserGame[];

  try {
    user = await getUserFromCookies(req.cookies);
    game = await getGameById(user.id, parseInt(query.gameId as string, 10));

    if (!game.creator) {
      throw new Error("you are not the creator of this game");
    }

    players = await listPlayersInGame(parseInt(query.gameId as string, 10));

    const createdAt = game.created_at as Date;
    game.created_at = JSON.stringify(createdAt);

    return {
      props: { user, game, players },
    };
  } catch (e) {
    return { props: { serverError: e }, notFound: true };
  }
};
