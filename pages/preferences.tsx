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

    const displayNameInput: HTMLInputElement = form.current.display_name;
    const phoneInput: HTMLInputElement = form.current.phone_number;

    const resp = await fetch(`/api/preferences`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        name: displayNameInput.value,
        preferences: {
          smsPhone: phoneInput.value,
        },
      }),
    });

    if (!resp.ok) {
      console.error("error saving user preferences: " + (await resp.text()));
      return;
    }

    router.push((router.query.return_to as string) || "/");
  }

  return (
    <div className="p-5">
      <form ref={form} onSubmit={saveChanges}>
        <div className="prose">
          <h2>Manage Preferences</h2>
        </div>
        <div className="mt-5">
          <label htmlFor="display_name" className="block text-sm">
            Display Name<span className="text-red-700">*</span>
          </label>
          <input
            type="text"
            className="w-full"
            name="display_name"
            id="display_name"
            required
            defaultValue={user.name}
          />
          <div className="text-xs text-gray-500 mt-1">
            Your display name is shown to other players.
          </div>
        </div>
        <div className="mt-5">
          <label htmlFor="phone_number" className="block text-sm">
            SMS Phone Number
          </label>
          <input
            type="tel"
            className="w-full"
            name="phone_number"
            id="phone_number"
            defaultValue={user.preferences.smsPhone}
          />
          <div className="text-xs text-gray-500 mt-1">
            We’ll use this to notify you when Secret Santas are assigned or when
            your assignee updates their likes and dislikes. Standard messaging
            rates apply.
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
