import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import { useRef } from "react";
import Button from "../components/button";
import { getUserFromCookies } from "../lib/auth0";
import { User } from "../lib/user";

export default function UserPreferencesPage({ user }: { user: User }) {
  const form: { current: HTMLFormElement } = useRef();
  const router = useRouter();

  async function saveChanges(e) {
    e.preventDefault();

    const displayNameInput: HTMLSelectElement = form.current.display_name;

    const resp = await fetch(`/api/preferences`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        name: displayNameInput.value,
      }),
    });

    if (!resp.ok) {
      console.error("error saving user preferences: " + (await resp.text()));
      return;
    }

    router.push("/");
  }

  return (
    <div className="p-5">
      <form ref={form} onSubmit={saveChanges}>
        <div className="prose">
          <h2>Manage Preferences</h2>
        </div>
        <div className="mt-5">
          <label htmlFor="display_name" className="block text-sm">
            Display Name
          </label>
          <input
            type="text"
            className="w-full"
            name="display_name"
            id="display_name"
            defaultValue={user.name}
          />
          <div className="text-xs text-gray-500 mt-1">
            Your display name is shown to other players.
          </div>
        </div>
        <div className="mt-5">
          <Button design="blue" type="submit">
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const user = await getUserFromCookies(req.cookies);

  return {
    props: { user },
  };
};
