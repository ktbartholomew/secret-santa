import { NextApiHandler } from "next";
import { exchangeCode, verify } from "../../lib/auth0";
import { createSession } from "../../lib/session";
import { upsertUser } from "../../lib/user";

const handler: NextApiHandler = async (req, res) => {
  try {
    const idToken = await exchangeCode(req.query.code as string);
    const parsedToken = await verify(idToken);

    const { user, created } = await upsertUser({
      sub: parsedToken.sub,
      name: parsedToken.name,
    });

    await createSession({
      sid: parsedToken.sid,
      expires: new Date(parsedToken.exp * 1000),
      user_id: user.id,
    });

    res.setHeader(
      "set-cookie",
      `auth0_id_token=${encodeURIComponent(idToken)}; path=/; HttpOnly; Secure;`
    );
    res.status(302);
    res.setHeader(
      "location",
      created
        ? "/preferences?return_to=" +
            encodeURIComponent((req.query.return_to as string) || "/")
        : req.query.return_to || "/"
    );
    res.end();
  } catch (e) {
    console.error(e);
    res.status(500);
    res.end();
  }
};

export default handler;
