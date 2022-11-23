import Link from "next/link";
import { useRef, useState } from "react";
import Button from "../../components/button";
import { Game } from "../../lib/games";

function CreatedGame({ game }: { game: Game }) {
  return (
    <div className="prose">
      <h2>Your game has been created!</h2>

      <p>Invite your friends to join this game by sharing this link:</p>
      <pre>
        https://localhost:8443/games/join?join_key=
        {encodeURIComponent(game.join_key)}
      </pre>
      <p>
        <Link href="/games/[gameId]" as={`/games/${game.id}`}>
          <Button design="blue">View Game</Button>
        </Link>
      </p>
    </div>
  );
}

function NewGameForm({ onCreate }: { onCreate: Function }) {
  const form: { current: HTMLFormElement } = useRef();
  const [error, setError] = useState(undefined) as [
    Error | undefined,
    React.SetStateAction<Error>
  ];
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.current) {
      return;
    }

    const resp = await fetch("/api/games", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        name: form.current.game_name.value,
        description: form.current.description.value,
        price_description: form.current.price_description.value,
      }),
    });

    if (!resp.ok) {
      console.error("error creating game: ", await resp.text());
      return;
    }

    const created = await resp.json();
    onCreate(created);
  };
  return (
    <>
      <div className="prose mb-5">
        <h2>New Game</h2>
      </div>
      <form onSubmit={handleSubmit} ref={form}>
        <div className="mt-3">
          <label htmlFor="game_name" className="block text-sm">
            Game Name
          </label>
          <input
            type="text"
            name="game_name"
            id="game_name"
            className="form-input block w-full"
            placeholder=""
          />
        </div>
        <div className="mt-3">
          <label htmlFor="description" className="block text-sm">
            Description
          </label>
          <textarea
            name="description"
            id="description"
            className="form-input block w-full"
            placeholder=""
          />
        </div>
        <div className="mt-3">
          <label htmlFor="price_description" className="block text-sm">
            Price Instructions
          </label>
          <input
            type="text"
            name="price_description"
            id="price_description"
            className="form-input block w-full"
            placeholder=""
          />
        </div>
        <div className="mt-3">
          <Button type="submit" design="blue">
            Create Game
          </Button>
          <Link href="/">
            <Button design="transparent" className="ml-3">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </>
  );
}

export default function NewGamePage() {
  const [created, setCreated] = useState(undefined) as [
    Game | undefined,
    React.SetStateAction<Game>
  ];

  return (
    <div className="p-5">
      {created ? (
        <CreatedGame game={created} />
      ) : (
        <NewGameForm onCreate={setCreated as Function} />
      )}
    </div>
  );
}
