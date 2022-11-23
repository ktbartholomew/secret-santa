import { GetServerSideProps } from "next";
import { getUserFromCookies, redirectToLogout } from "../lib/auth0";

export default function LogoutPage() {
  return (
    <div className="p-5">
      <div className="prose">
        <p>You are now logged out.</p>
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async function ({
  req,
  res,
}) {
  let user;

  try {
    user = await getUserFromCookies(req.cookies);
  } catch (e) {
    return { props: {} };
  }

  res.setHeader("set-cookie", `auth0_id_token=; path=/; HttpOnly; Secure;`);
  redirectToLogout(res);
  return {
    props: {
      user,
    },
    redirect: {
      statusCode: 302,
      destination: res.getHeader("location"),
    },
  };
};
